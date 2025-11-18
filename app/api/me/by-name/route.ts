import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const base = process.env.NEXT_PUBLIC_API_URL || ''
  const u = new URL(req.url)
  const url = `${base}/me/by-name?${u.searchParams.toString()}`
  const r = await fetch(url, { headers: { 'Content-Type': 'application/json' } })
  const data = await r.json()
  return NextResponse.json(data, { status: r.status })
}