'use client'

import { useMemo } from 'react'
import { useApi } from '../hooks/useApi'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

interface Props {
  site: string
  agentId?: string
  period: 'yesterday' | '7d' | '30d'
}

export default function HistoricalPanel({ site, agentId, period }: Props) {
  const endpoint = useMemo(() => {
    if (!agentId) return ''
    return `/history/agent/${encodeURIComponent(agentId)}?period=${period}`
  }, [agentId, period])
  const { data, loading, error, refetch } = useApi<any>(endpoint, { dependencies: [endpoint] })
  const summary = data?.summary || {}
  const deltas = data?.deltas || {}
  const series = data?.series || []

  const Card = ({ title, value, delta, color }: { title: string; value: string | number; delta?: number; color: string }) => (
    <div className="bg-white rounded-2xl shadow-md border border-secondary-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-secondary-600 mb-2">{title}</div>
          <div className="text-3xl font-bold text-secondary-900">{value}</div>
          {typeof delta === 'number' ? (
            <div className={`text-xs mt-1 ${delta >= 0 ? 'text-success-700' : 'text-danger-700'}`}>
              {delta >= 0 ? '+' : ''}{delta}% vs prev
            </div>
          ) : null}
        </div>
        <div className={`w-10 h-10 rounded-xl ${color} border border-secondary-200`} />
      </div>
    </div>
  )

  const Spark = ({ dataKey }: { dataKey: string }) => (
    <div className="h-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
          <Tooltip formatter={(v) => [String(v), dataKey]} />
          <Area type="monotone" dataKey={dataKey} stroke="#f97316" fill="#fde68a" fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-secondary-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="text-xl font-bold text-secondary-900">Historical Performance</div>
      </div>

      {!agentId ? (
        <div className="text-center py-8 text-secondary-600">No agent selected for historical view</div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-secondary-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-secondary-600 mb-2">Failed to load historical data</div>
          <button onClick={() => refetch()} className="px-3 py-2 bg-secondary-100 rounded-lg border border-secondary-200">Retry</button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Sales" value={Number(summary.sales_count || 0).toFixed(0)} delta={deltas.sales_pct} color="bg-orange-50" />
            <Card title="Calls" value={Number(summary.calls_handled || 0).toFixed(0)} delta={deltas.calls_pct} color="bg-primary-50" />
            <Card title="Revenue" value={`$${Number(summary.revenue || 0).toFixed(0)}`} delta={deltas.revenue_pct} color="bg-yellow-50" />
            <Card title="Score" value={Number(summary.score_avg || 0).toFixed(1)} delta={deltas.score_pct} color="bg-secondary-50" />
            <Card title="Customer Rating" value={Number(summary.csat_avg || 0).toFixed(1)} delta={deltas.csat_pct} color="bg-gray-100" />
            <Card title="Efficiency" value={`${Number(summary.efficiency || 0).toFixed(1)}%`} delta={deltas.efficiency_pct} color="bg-green-50" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-secondary-200 p-4"><Spark dataKey="sales_count" /></div>
            <div className="bg-white rounded-xl border border-secondary-200 p-4"><Spark dataKey="calls_handled" /></div>
            <div className="bg-white rounded-xl border border-secondary-200 p-4"><Spark dataKey="revenue" /></div>
            <div className="bg-white rounded-xl border border-secondary-200 p-4"><Spark dataKey="score" /></div>
            <div className="bg-white rounded-xl border border-secondary-200 p-4"><Spark dataKey="csat" /></div>
            <div className="bg-white rounded-xl border border-secondary-200 p-4"><Spark dataKey="efficiency" /></div>
          </div>
        </div>
      )}
    </div>
  )
}