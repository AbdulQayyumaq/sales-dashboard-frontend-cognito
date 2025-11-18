'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types'
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || ''
const COGNITO_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || ''
const COGNITO_USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || ''
const COGNITO_REDIRECT_URI = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI || ''
const COGNITO_LOGOUT_URI = process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URI || ''
const COGNITO_SCOPE = process.env.NEXT_PUBLIC_COGNITO_SCOPE || 'openid email profile'

function decodeJwt(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

async function sha256Base64Url(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const bytes = new Uint8Array(hash)
  let str = ''
  bytes.forEach(b => { str += String.fromCharCode(b) })
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  let str = ''
  array.forEach(b => { str += ('0' + b.toString(16)).slice(-2) })
  return str
}

interface AuthContextType {
  user: User | null
  login: () => Promise<void>
  loginWithCredentials: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  error: string | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      const accessToken = typeof window !== 'undefined' ? window.localStorage.getItem('access_token') || '' : ''
      const idToken = typeof window !== 'undefined' ? window.localStorage.getItem('id_token') || '' : ''
      if (!accessToken && !idToken) {
        setUser(null)
        return
      }
      const claims = idToken ? decodeJwt(idToken) : decodeJwt(accessToken)
      if (claims) {
        const u: User = {
          id: String(claims['sub'] || claims['username'] || ''),
          name: String(claims['name'] || claims['email'] || ''),
          email: String(claims['email'] || '')
        }
        setUser(u)
        const exp = Number(claims['exp'] || 0)
        if (exp) {
          const now = Math.floor(Date.now() / 1000)
          const secondsToExpiry = exp - now
          const refreshIn = Math.max((secondsToExpiry - 60) * 1000, 5_000)
          setTimeout(() => refreshToken(), refreshIn)
        }
      } else {
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshToken = async () => {
    const refresh = typeof window !== 'undefined' ? window.localStorage.getItem('refresh_token') || '' : ''
    if (!refresh) return
    const domain = COGNITO_DOMAIN.replace(/\/$/, '')
    const tokenUrl = `${domain}/oauth2/token`
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: COGNITO_CLIENT_ID,
      refresh_token: refresh
    })
    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })
    if (res.ok) {
      const t = await res.json()
      const accessToken = t.access_token || ''
      const idToken = t.id_token || ''
      if (accessToken) window.localStorage.setItem('access_token', accessToken)
      if (idToken) window.localStorage.setItem('id_token', idToken)
      checkAuthStatus()
    }
  }

  const login = async () => {
    setError(null)
    const domain = COGNITO_DOMAIN.replace(/\/$/, '')
    const verifier = generateCodeVerifier()
    const challenge = await sha256Base64Url(verifier)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('pkce_verifier', verifier)
      const authorizeUrl = `${domain}/oauth2/authorize?client_id=${encodeURIComponent(COGNITO_CLIENT_ID)}&redirect_uri=${encodeURIComponent(COGNITO_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(COGNITO_SCOPE)}&code_challenge_method=S256&code_challenge=${challenge}`
      window.location.assign(authorizeUrl)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('access_token')
      window.localStorage.removeItem('id_token')
      window.localStorage.removeItem('refresh_token')
      window.localStorage.removeItem('pkce_verifier')
      setUser(null)
      const domain = COGNITO_DOMAIN.replace(/\/$/, '')
      const logoutUrl = `${domain}/logout?client_id=${encodeURIComponent(COGNITO_CLIENT_ID)}&logout_uri=${encodeURIComponent(COGNITO_LOGOUT_URI)}`
      window.location.assign(logoutUrl)
    }
    setIsLoading(false)
  }

  const value = {
    user,
    login,
    loginWithCredentials: async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const pool = new CognitoUserPool({ UserPoolId: COGNITO_USER_POOL_ID, ClientId: COGNITO_CLIENT_ID })
        const userData = { Username: email, Pool: pool }
        const cognitoUser = new CognitoUser(userData)
        const authDetails = new AuthenticationDetails({ Username: email, Password: password })
        await new Promise<void>((resolve, reject) => {
          cognitoUser.authenticateUser(authDetails, {
            onSuccess: (session) => {
              const accessToken = session.getAccessToken().getJwtToken()
              const idToken = session.getIdToken().getJwtToken()
              const refreshToken = session.getRefreshToken()?.getToken() || ''
              if (accessToken) window.localStorage.setItem('access_token', accessToken)
              if (idToken) window.localStorage.setItem('id_token', idToken)
              if (refreshToken) window.localStorage.setItem('refresh_token', refreshToken)
              resolve()
            },
            onFailure: (err) => reject(err),
            newPasswordRequired: () => reject(new Error('New password required'))
          })
        })
        await checkAuthStatus()
      } catch (err: any) {
        setError(err?.message || 'Login failed')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    logout,
    isLoading,
    error
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}