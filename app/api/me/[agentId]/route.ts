import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: { agentId: string } }) {
  const base = process.env.NEXT_PUBLIC_API_URL || ''
  const url = `${base}/me/${params.agentId}`
  const r = await fetch(url, { headers: { 'Content-Type': 'application/json' } })
  const data = await r.json()
  return NextResponse.json(data, { status: r.status })
}