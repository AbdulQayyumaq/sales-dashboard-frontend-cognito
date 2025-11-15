'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Users, Phone, Clock, Award } from 'lucide-react'
import { LeaderboardResponse } from '../types'

interface StatsCardsProps {
  data: LeaderboardResponse
  isLoading: boolean
}

export default function StatsCards({ data, isLoading }: StatsCardsProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('total_calls')

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-secondary-200 rounded-lg" />
              <div className="w-8 h-8 bg-secondary-200 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-secondary-200 rounded w-24" />
              <div className="h-8 bg-secondary-200 rounded w-32" />
              <div className="h-4 bg-secondary-200 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const metrics = [
    {
      id: 'total_calls',
      title: 'Total Calls',
      value: data.summary.total_calls.toLocaleString(),
      change: data.summary.total_calls_change,
      icon: Phone,
      color: 'primary',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-700',
      borderColor: 'border-primary-200'
    },
    {
      id: 'active_agents',
      title: 'Active Agents',
      value: data.summary.active_agents.toLocaleString(),
      change: data.summary.active_agents_change,
      icon: Users,
      color: 'success',
      bgColor: 'bg-success-50',
      textColor: 'text-success-700',
      borderColor: 'border-success-200'
    },
    {
      id: 'avg_talk_time',
      title: 'Avg Talk Time',
      value: `${Math.floor(data.summary.avg_talk_time / 60)}:${Math.floor(data.summary.avg_talk_time % 60).toString().padStart(2, '0')}`,
      change: data.summary.avg_talk_time_change,
      icon: Clock,
      color: 'warning',
      bgColor: 'bg-warning-50',
      textColor: 'text-warning-700',
      borderColor: 'border-warning-200'
    },
    {
      id: 'conversion_rate',
      title: 'Conversion Rate',
      value: `${data.summary.conversion_rate.toFixed(1)}%`,
      change: data.summary.conversion_rate_change,
      icon: Award,
      color: 'danger',
      bgColor: 'bg-danger-50',
      textColor: 'text-danger-700',
      borderColor: 'border-danger-200'
    }
  ]

  const selectedMetricData = metrics.find(m => m.id === selectedMetric) || metrics[0]

  return (
    <div className="space-y-6">
      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2">
        {metrics.map((metric) => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${
              selectedMetric === metric.id
                ? `${metric.bgColor} ${metric.textColor} ${metric.borderColor} shadow-md`
                : 'bg-white text-secondary-600 hover:bg-secondary-50 border-secondary-200'
            }`}
          >
            <metric.icon className="h-4 w-4 inline mr-2" />
            {metric.title}
          </button>
        ))}
      </div>

      {/* Main Stats Card */}
      <div className={`bg-white rounded-xl shadow-lg border ${selectedMetricData.borderColor} overflow-hidden`}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 ${selectedMetricData.bgColor} rounded-xl flex items-center justify-center`}>
                <selectedMetricData.icon className={`h-8 w-8 ${selectedMetricData.textColor}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-900">
                  {selectedMetricData.title}
                </h3>
                <p className="text-sm text-secondary-600">
                  Current Performance
                </p>
              </div>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              selectedMetricData.change >= 0 
                ? 'bg-success-100 text-success-700' 
                : 'bg-danger-100 text-danger-700'
            }`}>
              {selectedMetricData.change >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {selectedMetricData.change >= 0 ? '+' : ''}{selectedMetricData.change.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-5xl font-bold text-secondary-900 mb-2">
              {selectedMetricData.value}
            </div>
            <p className="text-secondary-600">
              {selectedMetricData.change >= 0 ? 'Increased' : 'Decreased'} by {Math.abs(selectedMetricData.change).toFixed(1)}% from last period
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`h-2 ${selectedMetricData.bgColor}`}>
          <div 
            className={`h-full ${selectedMetricData.textColor.replace('text-', 'bg-')} transition-all duration-1000 ease-out`}
            style={{ width: `${Math.min(Math.abs(selectedMetricData.change) * 2, 100)}%` }}
          />
        </div>
      </div>

      {/* All Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className={`bg-white rounded-xl shadow-lg border ${metric.borderColor} p-6 hover:shadow-xl transition-all duration-200 cursor-pointer ${
              selectedMetric === metric.id ? 'ring-2 ring-offset-2 ' + metric.textColor.replace('text-', 'ring-') : ''
            }`}
            onClick={() => setSelectedMetric(metric.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                <metric.icon className={`h-6 w-6 ${metric.textColor}`} />
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded ${
                metric.change >= 0 
                  ? 'bg-success-100 text-success-700' 
                  : 'bg-danger-100 text-danger-700'
              }`}>
                {metric.change >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span className="text-xs font-medium">
                  {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-secondary-600">
                {metric.title}
              </h4>
              <div className="text-2xl font-bold text-secondary-900">
                {metric.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
