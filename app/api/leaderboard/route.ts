import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL
    if (!API_URL) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_API_URL is not set' }, { status: 500 })
    }

    const cookieStore = cookies()
    const idToken = cookieStore.get('idToken')?.value

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`
    }

    const upstream = await fetch(`${API_URL}/leaderboard`, {
      headers,
      cache: 'no-store',
    })

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: upstream.status })
    }

    const raw = await upstream.json()

    const leaders: any[] = Array.isArray(raw?.leaders)
      ? raw.leaders
      : Array.isArray(raw?.agents)
        ? raw.agents
        : Array.isArray(raw?.data?.leaders)
          ? raw.data.leaders
          : Array.isArray(raw)
            ? raw
            : []

    const totalCalls = leaders.reduce((sum, a) => sum + (Number(a?.calls) || 0), 0)
    const totalSales = leaders.reduce((sum, a) => sum + (Number(a?.sales) || 0), 0)
    const conversion = totalCalls > 0 ? (totalSales / totalCalls) * 100 : 0

    const response = {
      as_of: raw?.as_of || new Date().toISOString(),
      site: raw?.site || 'phoenix',
      total_agents: leaders.length,
      leaders,
      summary: {
        total_calls: totalCalls,
        total_calls_change: 0,
        active_agents: leaders.length,
        active_agents_change: 0,
        avg_talk_time: 0,
        avg_talk_time_change: 0,
        conversion_rate: conversion,
        conversion_rate_change: 0,
      },
    }

    return NextResponse.json(response)
  } catch (err: any) {
    const message = err?.message || 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}