import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL
    if (!API_URL) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_API_URL is not set' }, { status: 500 })
    }

    const upstream = await fetch(`${API_URL}/districts`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Failed to fetch districts' }, { status: upstream.status })
    }

    const raw = await upstream.json()
    const districts = Array.isArray(raw?.districts)
      ? raw.districts
      : Array.isArray(raw?.data?.districts)
        ? raw.data.districts
        : []

    const response = {
      as_of: raw?.as_of || new Date().toISOString(),
      include_historical: false,
      historical_days: 0,
      districts,
      total_districts: districts.length,
    }

    return NextResponse.json(response)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}