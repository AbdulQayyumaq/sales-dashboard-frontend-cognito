import { NextResponse } from 'next/server'
import { CognitoIdentityProviderClient, InitiateAuthCommand, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body.email || '').trim()
    const password = String(body.password || '')

    const region = process.env.COGNITO_REGION
    const clientId = process.env.COGNITO_CLIENT_ID

    if (!region || !clientId) {
      return NextResponse.json({ error: 'Cognito is not configured' }, { status: 500 })
    }

    const client = new CognitoIdentityProviderClient({ region })

    const auth = await client.send(new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    }))

    const authResult = auth.AuthenticationResult
    const accessToken = authResult?.AccessToken || ''
    const idToken = authResult?.IdToken || ''
    const refreshToken = authResult?.RefreshToken || ''

    if (!accessToken || !idToken) {
      return NextResponse.json({ error: 'Login failed' }, { status: 401 })
    }

    const userRes = await client.send(new GetUserCommand({ AccessToken: accessToken }))
    const attrs = Object.fromEntries((userRes.UserAttributes || []).map(a => [String(a.Name), String(a.Value)]))
    const user = {
      id: attrs['sub'] || '',
      name: attrs['name'] || attrs['email'] || '',
      email: attrs['email'] || '',
    }

    const res = NextResponse.json({ user })
    res.cookies.set('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
    res.cookies.set('idToken', idToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
    if (refreshToken) {
      res.cookies.set('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
    }
    return res
  } catch (err: any) {
    const message = err?.message || 'Login failed'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}