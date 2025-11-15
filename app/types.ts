// API Response wrapper
export interface ApiResponse<T> {
  data: T
  status: 'success' | 'error'
  message?: string
}

export interface User {
  id: string
  name: string
  email: string
}

// Agent data structure
export interface Agent {
  agent_id: string
  name: string
  site: string
  rank: number
  score: number
  sales: number
  calls: number
  revenue: number
  satisfaction: number
  delta: number
  avatar_url?: string
  movement?: 'up' | 'down' | 'same'
  weekly_sales?: number
  weekly_bonus?: number
  monthly_daily_avg?: number
  monthly_bonus?: number
  next_bonus_tier?: {
    weekly?: {
      sales_needed: number
      bonus_amount: number
      description: string
    }
    monthly?: {
      daily_avg_needed: number
      bonus_amount: number
      description: string
    }
  }
}

// Agent detailed stats (for /me endpoint)
export interface AgentStats {
  agent_id: string
  agent_name: string
  site: string
  team: string
  current_stats: {
    score: number
    sales_count: number
    calls_handled: number
    calls_offered: number
    talk_time_minutes: number
    revenue_generated: number
    customer_satisfaction: number
    conversion_rate: number
    average_handle_time: number
    timestamp: string
  }
  trends: {
    sales_trend: number
    calls_trend: number
    revenue_trend: number
    satisfaction_trend?: number
  }
  advancement?: {
    next_badge: string
    sales_needed: number
    progress_percent: number
  }
  bonus_info?: {
    weekly_sales: number
    weekly_bonus: number
    monthly_daily_avg: number
    monthly_bonus: number
    next_bonus_tier: {
      weekly?: {
        sales_needed: number
        bonus_amount: number
        description: string
      }
      monthly?: {
        daily_avg_needed: number
        bonus_amount: number
        description: string
      }
    }
  }
  historical_data: any[]
  last_updated: string
}

// Big movers data (consolidated interface)
export interface BigMover {
  agent_id: string
  agent_name: string
  name?: string // Legacy field for backward compatibility
  site: string
  team: string
  current_rank?: number
  previous_rank?: number
  rank_change?: number
  movement_type?: 'climber' | 'faller'
  score: number
  score_change: number
  score_change_percent: number
  current_score: number
  previous_score: number
  sales: number
  sales_change: number
  calls_change: number
  revenue_change: number
  satisfaction_change: number
  trend_direction: 'up' | 'down'
  analysis_period: string
  avatar_url?: string
}

// District/Team performance
export interface DistrictStats {
  site: string
  agent_count: number
  performance_grade?: string
  current_stats: {
    total_score: number
    average_score: number
    total_sales: number
    total_revenue: number
    active_agents: number
    total_agents: number
    avg_sales_per_agent?: number
    avg_points_per_agent?: number
    avg_sph?: number
    avg_spcc?: number
    avg_connect_rate?: number
  }
  historical_stats?: any
  trends?: any
  top_performers: Array<{
    agent_id: string
    agent_name: string
    team: string
    score: number
  }>
  team_breakdown: Array<{
    team_name: string
    agent_count: number
    total_score: number
    average_score: number
    total_sales: number
    total_revenue: number
  }>
}

// Leaderboard response
export interface LeaderboardResponse {
  as_of: string
  site: string
  total_agents: number
  leaders: Agent[]
  summary: {
    total_calls: number
    total_calls_change: number
    active_agents: number
    active_agents_change: number
    avg_talk_time: number
    avg_talk_time_change: number
    conversion_rate: number
    conversion_rate_change: number
  }
}

// Big movers response
export interface BigMoversResponse {
  period_days: number
  site: string
  as_of: string
  positive_movers: BigMover[]
  negative_movers: BigMover[]
  total_agents_analyzed: number
}



// Districts response
export interface DistrictsResponse {
  as_of: string
  include_historical: boolean
  historical_days: number
  districts: DistrictStats[]
  total_districts: number
}

// Settings/Configuration
export interface DashboardSettings {
  refresh_interval: number // seconds
  auto_refresh: boolean
  sound_notifications: boolean
  theme: 'light' | 'dark' | 'auto'
  default_site: string
  leaderboard_limit: number
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

// Badge definitions
export interface Badge {
  name: string
  description: string
  icon: string
  color: string
  requirements: {
    sales?: number
    points?: number
    streak?: number
  }
}

// Site/Location data
export interface Site {
  code: string
  name: string
  timezone: string
  active: boolean
}

// API Error
export interface ApiError {
  message: string
  code?: string
  details?: any
}

// Hook return types
export interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
  refetch: () => Promise<void>
}

// Chart data types
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface TimeSeriesPoint {
  timestamp: string
  value: number
  label?: string
}

// Filter options
export interface FilterOptions {
  site?: string
  district?: string
  dateRange?: {
    start: Date
    end: Date
  }
  limit?: number
  sortBy?: 'rank' | 'sales' | 'points' | 'sph' | 'spcc'
  sortOrder?: 'asc' | 'desc'
}

// Real-time update types
export interface RealtimeUpdate {
  type: 'rank_change' | 'new_sale' | 'badge_earned' | 'leaderboard_update'
  agent_id?: string
  data: any
  timestamp: string
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  loading?: boolean
  error?: ApiError | null
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: any) => React.ReactNode
}