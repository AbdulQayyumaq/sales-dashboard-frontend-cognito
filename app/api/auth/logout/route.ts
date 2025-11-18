import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set('accessToken', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', expires: new Date(0) })
  res.cookies.set('idToken', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', expires: new Date(0) })
  res.cookies.set('refreshToken', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', expires: new Date(0) })
  return res
}