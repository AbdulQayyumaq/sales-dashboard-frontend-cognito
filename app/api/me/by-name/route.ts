import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function nameToBaseId(name: string) {
  const lower = name.toLowerCase().trim()
  const replaced = lower.replace(/[^a-z0-9]/g, '_')
  const collapsed = replaced.replace(/_+/g, '_').replace(/^_+|_+$/g, '')
  return collapsed
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const name = (url.searchParams.get('name') || '').trim()
    const email = (url.searchParams.get('email') || '').trim()
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    if (!API_URL) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_API_URL is not set' }, { status: 500 })
    }
    if (!name && !email) {
      return NextResponse.json({ error: 'name or email is required' }, { status: 400 })
    }

    const cookieStore = cookies()
    const idToken = cookieStore.get('idToken')?.value
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (idToken) headers['Authorization'] = `Bearer ${idToken}`

    const base = name ? nameToBaseId(name) : nameToBaseId(email.split('@')[0] || '')
    for (let i = 1; i <= 10; i++) {
      const agentId = `${base}_${String(i).padStart(3, '0')}`
      const res = await fetch(`${API_URL}/me/${encodeURIComponent(agentId)}`, {
        headers,
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        return NextResponse.json(data)
      }
    }

    return NextResponse.json({ error: 'agent not found' }, { status: 404 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}