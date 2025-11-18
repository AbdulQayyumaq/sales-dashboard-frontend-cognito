'use client'

import { useEffect } from 'react'
import { TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react'
import { BigMoversResponse } from '../types'
import { useApi } from '../hooks/useApi'

interface MoverCardProps {
  agent: {
    agent_id: string
    agent_name: string
    score_change: number
    score_change_percent: number
    current_score: number
    previous_score: number
    sales_change: number
    trend_direction: 'up' | 'down'
    avatar_url?: string
  }
}

function MoverCard({ agent }: MoverCardProps) {
  const isPositive = agent.trend_direction === 'up'
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex items-center mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-orange-600 font-semibold text-sm">
              {agent.agent_name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-gray-900 truncate">{agent.agent_name}</h4>
            <p className="text-sm text-gray-500 truncate">
              {agent.agent_id.includes('@') 
                ? agent.agent_id.split('@')[0] 
                : agent.agent_id
              }
            </p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ml-2 ${
          isPositive 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{agent.score_change_percent > 0 ? '+' : ''}{Math.abs(agent.score_change_percent) >= 100 ? agent.score_change_percent.toFixed(0) : agent.score_change_percent.toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Current Score</p>
          <p className="font-semibold text-gray-900">{agent.current_score.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-gray-500">Score Change</p>
          <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {agent.score_change > 0 ? '+' : ''}{agent.score_change.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Previous Score</p>
          <p className="font-semibold text-gray-900">{agent.previous_score.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-gray-500">Sales Change</p>
          <p className={`font-semibold ${agent.sales_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {agent.sales_change > 0 ? '+' : ''}{agent.sales_change}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function BigMovers() {
  const { data, loading, error } = useApi<BigMoversResponse>('/big-movers')

  // Debug logging for BigMovers
  useEffect(() => {
    console.log('🎯 BigMovers Component State:', {
      data,
      loading,
      error,
      dataType: typeof data,
      dataKeys: data && typeof data === 'object' ? Object.keys(data) : 'N/A'
    })
  }, [data, loading, error])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-secondary-900">Big Movers</h2>
          </div>
          <div className="animate-pulse h-4 w-20 bg-secondary-200 rounded"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    const code = error?.code || ''
    const friendly = code === '504'
      ? 'Endpoint request timed out. Please try again later.'
      : code?.startsWith('5')
        ? 'Server error. Please try again shortly.'
        : 'Failed to load big movers data.'
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-bold text-secondary-900">Big Movers</h2>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-500">{friendly}</p>
        </div>
      </div>
    )
  }

  const positiveMovers = data?.positive_movers || []
  const negativeMovers = data?.negative_movers || []
  
  // Combine and sort all movers by absolute score change, then limit to top 3
  const allMovers = [...positiveMovers, ...negativeMovers]
    .sort((a, b) => Math.abs(b.score_change) - Math.abs(a.score_change))
    .slice(0, 3) // Limit to top 3 movers

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-secondary-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-bold text-secondary-900">Big Movers</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Last {data?.period_days || 7} days</span>
        </div>
      </div>

      {allMovers.length === 0 ? (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No significant rank changes yet</p>
          <p className="text-sm text-gray-400 mt-1">Check back later for performance updates</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              Top 3 Big Movers
            </h3>
            <div className="space-y-3">
              {allMovers.map((agent) => (
                <MoverCard key={agent.agent_id} agent={agent} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}