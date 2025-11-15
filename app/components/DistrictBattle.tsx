'use client'

import { Users, Trophy, Target, TrendingUp, Award, Star } from 'lucide-react'
import { DistrictsResponse, DistrictStats } from '../types'

interface DistrictBattleProps {
  data: DistrictsResponse | null
  loading: boolean
}

interface DistrictCardProps {
  district: DistrictStats
  rank: number
  isTopPerformer: boolean
}

function PerformanceGrade({ grade }: { grade: string }) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-success-100 text-success-800 border-success-300'
      case 'B+':
      case 'B':
        return 'bg-primary-100 text-primary-800 border-primary-300'
      case 'C+':
      case 'C':
        return 'bg-warning-100 text-warning-800 border-warning-300'
      case 'D':
        return 'bg-danger-100 text-danger-800 border-danger-300'
      default:
        return 'bg-secondary-100 text-secondary-800 border-secondary-300'
    }
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${getGradeColor(grade)}`}>
      {grade}
    </div>
  )
}

function DistrictCard({ district, rank, isTopPerformer }: DistrictCardProps) {
  const participationRate = (district.current_stats.active_agents / district.current_stats.total_agents) * 100
  
  return (
    <div className={`card transition-all duration-200 hover:shadow-lg ${
      isTopPerformer ? 'ring-2 ring-primary-500 bg-gradient-to-br from-primary-50 to-white' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
            rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
            rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
            rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
            'bg-gradient-to-br from-secondary-400 to-secondary-600'
          }`}>
            {rank === 1 && <Trophy className="h-5 w-5" />}
            {rank === 2 && <Award className="h-5 w-5" />}
            {rank === 3 && <Star className="h-5 w-5" />}
            {rank > 3 && rank}
          </div>
          <div>
            <h3 className="font-bold text-lg text-secondary-900">
              {district.site}
            </h3>
            <p className="text-sm text-secondary-600">
              {district.agent_count} agents • Rank #{rank}
            </p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          Score: {district.current_stats.total_score.toFixed(1)}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="metric-card">
          <div className="flex items-center space-x-2 mb-1">
            <Target className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium text-secondary-600">Total Sales</span>
          </div>
          <div className="text-2xl font-bold text-secondary-900">
            {district.current_stats.total_sales}
          </div>
          <div className="text-xs text-secondary-500">
            {district.current_stats.avg_sales_per_agent?.toFixed(1) || '0.0'} avg per agent
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="h-4 w-4 text-success-600" />
            <span className="text-sm font-medium text-secondary-600">Score</span>
          </div>
          <div className="text-2xl font-bold text-primary-600">
            {district.current_stats.total_score?.toFixed(1) || '0.0'}
          </div>
          <div className="text-xs text-secondary-500">
            {district.current_stats.average_score?.toFixed(1) || '0.0'} avg per agent
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-2 mb-1">
            <Users className="h-4 w-4 text-secondary-600" />
            <span className="text-sm font-medium text-secondary-600">Team Size</span>
          </div>
          <div className="text-xl font-bold text-secondary-900">
            {district.current_stats.active_agents}/{district.current_stats.total_agents}
          </div>
          <div className="text-xs text-secondary-500">
            {participationRate.toFixed(0)}% active
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center space-x-2 mb-1">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-secondary-600">Revenue</span>
          </div>
          <div className="text-xl font-bold text-secondary-900">
            ${district.current_stats.total_revenue?.toFixed(0) || '0'}
          </div>
          <div className="text-xs text-secondary-500">
            Avg Score: {district.current_stats.average_score?.toFixed(1) || '0.0'}
          </div>
        </div>
      </div>

      {/* Top Performer */}
      {district.top_performers && district.top_performers.length > 0 && (
        <div className="border-t border-secondary-200 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-secondary-600 mb-1">
                Top Performer
              </div>
              <div className="font-semibold text-secondary-900">
                {district.top_performers[0].agent_name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary-600">
                {district.top_performers[0].score.toFixed(1)}
              </div>
              <div className="text-xs text-secondary-500">
                {district.top_performers[0].team}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Indicators */}
      <div className="mt-4 pt-4 border-t border-secondary-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-secondary-600 mb-1">SPCC</div>
            <div className="font-semibold text-secondary-900">
              {(district.current_stats?.avg_spcc || 0).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-secondary-600 mb-1">Connect %</div>
            <div className="font-semibold text-secondary-900">
              {((district.current_stats?.avg_connect_rate || 0) * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-secondary-600 mb-1">Efficiency</div>
            <div className={`font-semibold ${
              district.performance_grade?.startsWith('A') ? 'text-success-600' :
              district.performance_grade?.startsWith('B') ? 'text-primary-600' :
              district.performance_grade?.startsWith('C') ? 'text-warning-600' :
              'text-danger-600'
            }`}>
              {district.performance_grade?.startsWith('A') ? 'High' :
               district.performance_grade?.startsWith('B') ? 'Good' :
               district.performance_grade?.startsWith('C') ? 'Fair' : 'Low'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-secondary-200 rounded-lg" />
            <div className="space-y-2">
              <div className="h-5 bg-secondary-200 rounded w-24" />
              <div className="h-4 bg-secondary-200 rounded w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="h-4 bg-secondary-200 rounded w-20" />
                <div className="h-6 bg-secondary-200 rounded w-16" />
                <div className="h-3 bg-secondary-200 rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DistrictBattle({ data, loading }: DistrictBattleProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-200 p-6">
        <LoadingSkeleton />
      </div>
    )
  }

  if (!data || !data.districts || data.districts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-secondary-200 p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
          <Users className="h-8 w-8 text-secondary-400" />
        </div>
        <div className="text-lg font-medium text-secondary-900 mb-2">
          No District Data Available
        </div>
        <div className="text-sm text-secondary-600">
          District performance data will appear here once agents start logging activity.
        </div>
      </div>
    )
  }

  // Sort districts by total score (descending)
  const sortedDistricts = [...data.districts].sort((a, b) => 
    b.current_stats.total_score - a.current_stats.total_score
  )

  const topPerformingDistrict = sortedDistricts[0]

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-secondary-200 p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Users className="h-5 w-5 text-orange-600" />
        <h2 className="text-xl font-bold text-secondary-900">District Battle</h2>
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-secondary-900">
            {data.districts.length}
          </div>
          <div className="text-sm text-secondary-600">Active Districts</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">
            {data.districts.reduce((sum, d) => sum + d.current_stats.total_sales, 0)}
          </div>
          <div className="text-sm text-secondary-600">Total Sales</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-success-600">
            {data.districts.reduce((sum, d) => sum + d.current_stats.active_agents, 0)}
          </div>
          <div className="text-sm text-secondary-600">Active Agents</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {topPerformingDistrict?.site || 'N/A'}
          </div>
          <div className="text-sm text-secondary-600">Leading District</div>
        </div>
      </div>

      {/* District Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedDistricts.map((district, index) => (
          <DistrictCard
            key={district.site}
            district={district}
            rank={index + 1}
            isTopPerformer={index === 0}
          />
        ))}
      </div>
    </div>
  )
}