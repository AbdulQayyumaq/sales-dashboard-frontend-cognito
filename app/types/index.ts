export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Agent {
  agent_id: string;
  name: string;
  site: string;
  total_sales: number;
  total_revenue: number;
  cr: string;
  avg_revenue_per_sale: string;
  calls_answered: number;
  aht: string;
}

export interface AgentStats {
  agent_id: string;
  name: string;
  site: string;
  current_stats: {
    sales_count: number;
    revenue_generated: number;
    customer_satisfaction: number;
  };
  bonus_info: {
    weekly_bonus: number;
    weekly_sales: number;
    monthly_bonus: number;
    monthly_daily_avg: number;
  };
}

export interface LeaderboardResponse {
  as_of: string;
  site: string;
  total_agents: number;
  leaders: Agent[];
}

export interface ApiError {
  message: string;
}