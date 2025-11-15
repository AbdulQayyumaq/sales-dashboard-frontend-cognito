import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CognitoIdentityProviderClient, GlobalSignOutCommand } from '@aws-sdk/client-cognito-identity-provider'

export async function POST() {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('accessToken')?.value || ''

    const region = process.env.COGNITO_REGION
    if (region && accessToken) {
      const client = new CognitoIdentityProviderClient({ region })
      try {
        await client.send(new GlobalSignOutCommand({ AccessToken: accessToken }))
      } catch {}
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set('accessToken', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
    res.cookies.set('idToken', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
    res.cookies.set('refreshToken', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
    return res
  } catch {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('accessToken', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
    res.cookies.set('idToken', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
    res.cookies.set('refreshToken', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
    return res
  }
}