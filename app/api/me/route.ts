import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'

export async function GET() {
  try {
    const accessToken = cookies().get('accessToken')?.value || ''
    const region = process.env.COGNITO_REGION
    if (!accessToken || !region) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const client = new CognitoIdentityProviderClient({ region })
    const userRes = await client.send(new GetUserCommand({ AccessToken: accessToken }))
    const attrs = Object.fromEntries((userRes.UserAttributes || []).map(a => [String(a.Name), String(a.Value)]))
    const user = {
      id: attrs['sub'] || '',
      name: attrs['name'] || attrs['email'] || '',
      email: attrs['email'] || '',
    }
    return NextResponse.json({ user })
  } catch (err: any) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}