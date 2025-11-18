'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || ''
const COGNITO_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || ''
const COGNITO_REDIRECT_URI = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI || ''

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    const search = typeof window !== 'undefined' ? window.location.search : ''
    const hashParams = new URLSearchParams(hash.replace(/^#/, ''))
    const queryParams = new URLSearchParams(search.replace(/^[?]/, ''))
    const code = queryParams.get('code') || ''
    const domain = COGNITO_DOMAIN.replace(/\/$/, '')
    const tokenUrl = `${domain}/oauth2/token`
    if (code) {
      const verifier = window.localStorage.getItem('pkce_verifier') || ''
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: COGNITO_CLIENT_ID,
        code,
        redirect_uri: COGNITO_REDIRECT_URI,
        code_verifier: verifier
      })
      fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      }).then(async (res) => {
        const t = await res.json()
        const accessToken = t.access_token || ''
        const idToken = t.id_token || ''
        const refreshToken = t.refresh_token || ''
        if (accessToken) window.localStorage.setItem('access_token', accessToken)
        if (idToken) window.localStorage.setItem('id_token', idToken)
        if (refreshToken) window.localStorage.setItem('refresh_token', refreshToken)
        router.replace('/')
      }).catch(() => router.replace('/'))
    } else {
      const accessToken = hashParams.get('access_token') || ''
      const idToken = hashParams.get('id_token') || ''
      const refreshToken = hashParams.get('refresh_token') || ''
      if (accessToken) window.localStorage.setItem('access_token', accessToken)
      if (idToken) window.localStorage.setItem('id_token', idToken)
      if (refreshToken) window.localStorage.setItem('refresh_token', refreshToken)
      router.replace('/')
    }
  }, [router])

  return null
}
