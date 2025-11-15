import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL
    if (!API_URL) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_API_URL is not set' }, { status: 500 })
    }

    const cookieStore = cookies()
    const idToken = cookieStore.get('idToken')?.value
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (idToken) headers['Authorization'] = `Bearer ${idToken}`

    const upstream = await fetch(`${API_URL}/big-movers`, {
      headers,
      cache: 'no-store',
    })

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Failed to fetch big movers' }, { status: upstream.status })
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}