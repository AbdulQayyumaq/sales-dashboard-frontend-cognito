import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: { agentId: string } }) {
  try {
    const agentId = params.agentId
    const API_URL = process.env.NEXT_PUBLIC_API_URL
    if (!API_URL) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_API_URL is not set' }, { status: 500 })
    }
    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 })
    }

    const upstream = await fetch(`${API_URL}/me/${encodeURIComponent(agentId)}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Failed to fetch agent stats' }, { status: upstream.status })
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}