'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import LeaderboardTable from './components/LeaderboardTable'
import BigMovers from './components/BigMovers'
import DistrictBattle from './components/DistrictBattle'
import { Trophy, Target, DollarSign, Zap } from 'lucide-react'
import { LeaderboardResponse, AgentStats, DistrictsResponse } from './types'

export default function Home() {
  const [selectedSite, setSelectedSite] = useState('phoenix')
  const [data, setData] = useState<LeaderboardResponse | null>(null)
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null)
  const [districts, setDistricts] = useState<DistrictsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const { user } = useAuth()

  const fetchData = async (site: string) => {
    try {
      const agentName = user?.name || ''
      const apiBase = process.env.NEXT_PUBLIC_API_URL || ''
      const [leaderboardRes, districtsRes] = await Promise.all([
        fetch(`${apiBase}/leaderboard`),
        fetch(`${apiBase}/districts`)
      ])

      if (!leaderboardRes.ok) {
        throw new Error('Failed to fetch leaderboard')
      }
      if (districtsRes.ok) {
        setDistricts(await districtsRes.json())
      } else {
        setDistricts(null)
      }
      setAgentStats(null)

      const response = leaderboardRes
      const result = await response.json()
      const leaders = Array.isArray(result.leaders)
        ? result.leaders
        : Array.isArray(result.agents)
          ? result.agents.map((agent: any) => ({
              ...agent,
              weekly_sales: agent.sales || 0
            }))
          : []
      const normalized = {
        ...result,
        leaders,
        total_agents: typeof result.total_agents === 'number' ? result.total_agents : leaders.length
      }
      setData(normalized)
      if (agentName) {
        const me = (normalized.leaders || []).find((a: any) => (
          String((a.name || a.agent_name || '')).toLowerCase() === String(agentName).toLowerCase()
        ))
        const meId = me?.agent_id || ''
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('access_token') || '' : ''
        const apiBase = process.env.NEXT_PUBLIC_API_URL || ''
        if (meId && apiBase && token) {
          const meRes = await fetch(`${apiBase}/me/${meId}`, {
            headers: { Authorization: `Bearer ${token}`, 'Accept': 'application/json' }
          })
          if (meRes.ok) {
            setAgentStats(await meRes.json())
          }
        } else {
          setAgentStats(null)
        }
      }
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData(selectedSite)
  }, [selectedSite])

  useEffect(() => {
    if (!user) return
    // Re-fetch agent stats when user becomes available or changes
    fetchData(selectedSite)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchData(selectedSite)
  }

  const handleSiteChange = (site: string) => {
    setSelectedSite(site)
  }

  if (isLoading || !data) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100">
          <Header
            selectedSite={selectedSite}
            onSiteChange={handleSiteChange}
            lastUpdated={lastUpdated}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse" />
                </div>
                <p className="text-secondary-600">Loading dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100">
        <Header
          selectedSite={selectedSite}
          onSiteChange={handleSiteChange}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
        
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Individual Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-md border border-secondary-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-secondary-600 mb-2">Your Rank</div>
                    <div className="text-3xl font-bold text-secondary-900">
                      {(() => {
                        const meId = agentStats?.agent_id
                        const rank = (data?.leaders || []).find(a => a.agent_id === meId)?.rank
                        return rank ? `#${rank}` : '#--'
                      })()}
                    </div>
                    <div className="text-xs text-secondary-500">of {data.total_agents} agents</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-300 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-secondary-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-secondary-600 mb-2">Your Sales</div>
                    <div className="text-3xl font-bold text-secondary-900">{agentStats?.current_stats.sales_count || 0}</div>
                    <div className="text-xs text-secondary-500">{agentStats?.current_stats.calls_handled || 0} calls</div>
                    <div className="text-xs text-secondary-500">${Number(agentStats?.current_stats.revenue_generated || 0).toFixed(0)}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-300 flex items-center justify-center">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-secondary-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-secondary-600 mb-2">Your Bonuses</div>
                    <div className="text-3xl font-bold text-secondary-900 mb-1">${Number((agentStats?.bonus_info?.weekly_bonus || 0) + (agentStats?.bonus_info?.monthly_bonus || 0)).toFixed(0)}</div>
                    <div className="text-xs text-secondary-600">${agentStats?.bonus_info?.weekly_bonus || 0} weekly + ${agentStats?.bonus_info?.monthly_bonus || 0} monthly</div>
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="h-4 w-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 17l6-6 4 4 7-7"/></svg>
                      <span className="text-xs text-success-600 font-medium">{agentStats?.bonus_info?.next_bonus_tier ? 'Next bonus tier available' : 'No bonus tier available'}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-300 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-secondary-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-secondary-600 mb-2">Your Performance</div>
                    <div className="text-3xl font-bold text-secondary-900">{Number(agentStats?.current_stats.customer_satisfaction || 0).toFixed(1)}</div>
                    <div className="text-xs text-secondary-500">Customer Rating</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-300 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Grid: Leaderboard and Big Movers */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <LeaderboardTable agents={data.leaders.slice(0, 20)} loading={isLoading} error={null} updatedAt={lastUpdated} isRefreshing={isRefreshing} />
              </div>
              <div>
                <BigMovers site={selectedSite} />
              </div>
            </div>

            {/* District Battle */}
            <div>
              <DistrictBattle data={districts} loading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}