'use client'

import { Zap, Clock, Calendar, History } from 'lucide-react'

interface Props {
  value: 'today' | 'yesterday' | '7d' | '30d'
  onChange: (v: 'today' | 'yesterday' | '7d' | '30d') => void
}

export default function PeriodSelector({ value, onChange }: Props) {
  const items: Array<{ key: 'today' | 'yesterday' | '7d' | '30d'; label: string; icon: any }> = [
    { key: 'today', label: 'Today', icon: Zap },
    { key: 'yesterday', label: 'Yesterday', icon: Clock },
    { key: '7d', label: 'Last 7 Days', icon: Calendar },
    { key: '30d', label: 'Last 30 Days', icon: History }
  ]
  return (
    <div className="inline-flex items-center rounded-xl border border-secondary-200 bg-secondary-50 p-1">
      {items.map((it) => {
        const Icon = it.icon
        const active = value === it.key
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={`px-3 py-2 text-sm rounded-lg transition-all flex items-center gap-2 ${
              active ? 'bg-white shadow-sm text-secondary-900' : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
            }`}
            aria-pressed={active}
          >
            <Icon className={`w-4 h-4 ${active ? 'text-orange-600' : 'text-secondary-500'}`} />
            {it.label}
          </button>
        )
      })}
    </div>
  )
}