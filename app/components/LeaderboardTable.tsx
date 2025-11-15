'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Trophy, Medal, Award, Star, TrendingUp, TrendingDown, Clock, RefreshCw } from 'lucide-react'
import { Agent, ApiError } from '../types'

interface LeaderboardTableProps {
  agents: Agent[]
  loading: boolean
  error: ApiError | null
  highlightedAgentId?: string
  onAgentSelect?: (agentId: string) => void
  updatedAt?: Date
  isRefreshing?: boolean
}

interface RankBadgeProps {
  rank: number
  size?: 'sm' | 'md' | 'lg'
}

function RankBadge({ rank, size = 'md' }: RankBadgeProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rank-badge-gold'
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white rank-badge-silver'
    if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white rank-badge-bronze'
    if (rank <= 5) return 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
    if (rank <= 10) return 'bg-gradient-to-br from-secondary-400 to-secondary-600 text-white'
    return 'bg-secondary-200 text-secondary-700'
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4" />
    if (rank === 2) return <Medal className="h-4 w-4" />
    if (rank === 3) return <Award className="h-4 w-4" />
    return null
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold ${getRankStyle(rank)}`}>
      {rank <= 3 ? getRankIcon(rank) : rank}
    </div>
  )
}

interface MovementIndicatorProps {
  rankDelta: number
  movement?: 'up' | 'down' | 'same'
}

function MovementIndicator({ rankDelta, movement }: MovementIndicatorProps) {
  if (!rankDelta || rankDelta === 0) return null

  const isUp = rankDelta > 0
  const isDown = rankDelta < 0

  return (
    <div className={`flex items-center space-x-1 text-xs font-medium ${
      isUp ? 'text-success-600' : isDown ? 'text-danger-600' : 'text-secondary-500'
    }`}>
      {isUp && <TrendingUp className="h-3 w-3" />}
      {isDown && <TrendingDown className="h-3 w-3" />}
      <span>{isUp ? '+' : ''}{rankDelta}</span>
    </div>
  )
}

interface BadgeDisplayProps {
  badge?: string
  trophies: number
}

function BadgeDisplay({ badge, trophies }: BadgeDisplayProps) {
  const getBadgeColor = (badge: string) => {
    if (badge?.includes('Gold')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (badge?.includes('Silver')) return 'bg-gray-100 text-gray-800 border-gray-200'
    if (badge?.includes('Bronze')) return 'bg-amber-100 text-amber-800 border-amber-200'
    if (badge?.includes('Platinum')) return 'bg-purple-100 text-purple-800 border-purple-200'
    return 'bg-secondary-100 text-secondary-800 border-secondary-200'
  }

  return (
    <div className="flex items-center space-x-2">
      {badge && (
        <span className={`px-2 py-1 text-xs font-medium rounded border ${getBadgeColor(badge)}`}>
          {badge}
        </span>
      )}
      {trophies > 0 && (
        <div className="flex items-center space-x-1">
          <Star className="h-3 w-3 text-yellow-500" />
          <span className="text-xs font-medium text-yellow-600">{trophies}</span>
        </div>
      )}
    </div>
  )
}

export default function LeaderboardTable({ 
  agents, 
  loading, 
  error, 
  highlightedAgentId, 
  onAgentSelect,
  updatedAt,
  isRefreshing,
}: LeaderboardTableProps) {
  const [sortField, setSortField] = useState<keyof Agent>('rank')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (field: keyof Agent) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedAgents = [...agents].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    const aStr = String(aValue || '').toLowerCase()
    const bStr = String(bValue || '').toLowerCase()
    
    if (sortDirection === 'asc') {
      return aStr.localeCompare(bStr)
    } else {
      return bStr.localeCompare(aStr)
    }
  })

  const SortIcon = ({ field }: { field: keyof Agent }) => {
    if (sortField !== field) return <ChevronUp className="h-4 w-4 text-secondary-400" />
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-secondary-600" />
      : <ChevronDown className="h-4 w-4 text-secondary-600" />
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <h2 className="text-xl font-bold text-secondary-900">Live Leaderboard</h2>
            <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">{agents.length} Agents</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-secondary-600">
            <Clock className="h-4 w-4" />
            <span suppressHydrationWarning className="text-xs px-2 py-1 rounded bg-blue-100 text-secondary-700">Updated {updatedAt ? (new Date(updatedAt)).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'text-orange-600 animate-spin' : 'text-orange-500'}`} />
          </div>
        </div>
        {/* Loading rows */}
        <div className="space-y-4 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4 p-4">
                <div className="w-8 h-8 bg-secondary-200 rounded-full" />
                <div className="w-10 h-10 bg-secondary-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary-200 rounded w-32" />
                  <div className="h-3 bg-secondary-200 rounded w-24" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-secondary-200 rounded w-16" />
                  <div className="h-3 bg-secondary-200 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-danger-600 mb-2">Failed to load leaderboard</div>
        <div className="text-sm text-secondary-600">{error.message}</div>
      </div>
    )
  }

  if (!agents.length) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <h2 className="text-xl font-bold text-secondary-900">Live Leaderboard</h2>
            <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">0 Agents</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-secondary-600">
            <Clock className="h-4 w-4" />
            <span suppressHydrationWarning className="text-xs px-2 py-1 rounded bg-blue-100 text-secondary-700">Updated {updatedAt ? (new Date(updatedAt)).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'text-orange-600 animate-spin' : 'text-orange-500'}`} />
          </div>
        </div>
        <div className="text-center py-8 text-secondary-600">No agents found</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-secondary-200 overflow-hidden">
      {/* Heading bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-secondary-200">
        <div className="flex items-center space-x-3">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <h2 className="text-xl font-bold text-secondary-900">Live Leaderboard</h2>
          <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">{agents.length} Agents</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-secondary-600">
          <Clock className="h-4 w-4" />
          <span suppressHydrationWarning className="text-xs px-2 py-1 rounded bg-blue-100 text-secondary-700">Updated {updatedAt ? (new Date(updatedAt)).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'text-orange-600 animate-spin' : 'text-orange-500'}`} />
        </div>
      </div>
      {/* Table Header */}
      <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 border-b-2 border-secondary-300 px-6 py-4">
        <div className="grid grid-cols-12 gap-4 items-center text-sm font-semibold text-secondary-700 uppercase tracking-wide">
          <div className="col-span-1">
            <button 
              onClick={() => handleSort('rank')}
              className="flex items-center space-x-1 hover:text-secondary-900 transition-colors duration-200"
            >
              <span>Rank</span>
              <SortIcon field="rank" />
            </button>
          </div>
          <div className="col-span-3">
            <button 
              onClick={() => handleSort('name')}
              className="flex items-center space-x-1 hover:text-secondary-900 transition-colors duration-200"
            >
              <span>Agent</span>
              <SortIcon field="name" />
            </button>
          </div>
          <div className="col-span-2">
            <button 
              onClick={() => handleSort('sales')}
              className="flex items-center space-x-1 hover:text-secondary-900 transition-colors duration-200"
            >
              <span>Sales</span>
              <SortIcon field="sales" />
            </button>
          </div>
          <div className="col-span-2">
            <span>Weekly Bonus</span>
          </div>
          <div className="col-span-2">
            <span>Monthly Bonus</span>
          </div>
          <div className="col-span-2">
            <button 
              onClick={() => handleSort('satisfaction')}
              className="flex items-center space-x-1 hover:text-secondary-900 transition-colors duration-200"
            >
              <span>Rating</span>
              <SortIcon field="satisfaction" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-secondary-200">
        {sortedAgents.map((agent, index) => {
          const isHighlighted = agent.agent_id === highlightedAgentId
          const isTopThree = agent.rank <= 3
          
          return (
            <div
              key={agent.agent_id}
              onClick={() => onAgentSelect?.(agent.agent_id)}
              className={`leaderboard-row grid grid-cols-12 gap-4 items-center p-6 transition-all duration-200 ${
                isHighlighted 
                  ? 'bg-primary-50 border-l-4 border-primary-500' 
                  : 'hover:bg-secondary-50'
              } ${
                isTopThree ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''
              } ${
                onAgentSelect ? 'cursor-pointer' : ''
              }`}
            >
              {/* Rank */}
              <div className="col-span-1">
                <RankBadge rank={agent.rank} />
              </div>

              {/* Agent Info */}
              <div className="col-span-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={agent.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=ed7420&color=fff`}
                    alt={agent.name}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  />
                  <div>
                    <div className="font-semibold text-secondary-900">{agent.name}</div>
                    <div className="text-sm text-secondary-600">
                      {agent.site || 'phoenix'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales */}
              <div className="col-span-2">
                <div className="font-semibold text-secondary-900">{agent.sales}</div>
                <div className="text-sm text-secondary-600">
                  ${agent.revenue?.toFixed(0) || 0} revenue
                </div>
              </div>

              {/* Weekly Bonus */}
              <div className="col-span-2">
                <div className="font-semibold text-green-600">
                  ${agent.weekly_bonus || 0}
                </div>
                <div className="text-sm text-secondary-600">
                  {agent.weekly_sales || 0} sales
                </div>
              </div>

              {/* Monthly Bonus */}
              <div className="col-span-2">
                <div className="font-semibold text-blue-600">
                  ${agent.monthly_bonus || 0}
                </div>
                <div className="text-sm text-secondary-600">
                  {agent.monthly_daily_avg?.toFixed(1) || '0.0'} avg/day
                </div>
              </div>

              {/* Rating */}
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <div>
                    <div className="font-semibold text-secondary-900">
                      {agent.satisfaction?.toFixed(1) || '0.0'}
                    </div>
                    <div className="text-sm text-secondary-600">
                      customer rating
                    </div>
                  </div>
                  <MovementIndicator 
                    rankDelta={agent.delta || 0} 
                    movement={agent.movement}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}