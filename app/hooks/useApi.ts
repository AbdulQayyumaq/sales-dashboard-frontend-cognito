'use client'

import { useState, useEffect, useCallback } from 'react'
import { UseApiReturn } from '../types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-api-gateway-url.amazonaws.com/prod'

export function useApi<T>(endpoint: string, options?: {
  autoFetch?: boolean
  dependencies?: any[]
}): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const fetchData = useCallback(async () => {
    if (!endpoint) {
      console.log('⚠️ useApi: No endpoint provided')
      return
    }

    const startTime = Date.now()
    setLoading(true)
    setError(null)

    try {
      const url = endpoint.startsWith('/api/')
        ? endpoint
        : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
      console.log('🔄 API Request Started:', {
        endpoint,
        url,
        timestamp: new Date().toISOString(),
        apiBaseUrl: API_BASE_URL
      })
      
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('access_token') || '' : ''
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        mode: endpoint.startsWith('/api/') ? 'same-origin' : 'cors',
      })

      const duration = Date.now() - startTime
      console.log('📡 API Response Received:', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ API Error Response:', {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status.toString(),
          errorData
        )
      }

      const result = await response.json()
      console.log('✅ API Success:', {
        endpoint,
        dataType: typeof result,
        dataKeys: result && typeof result === 'object' ? Object.keys(result) : 'N/A',
        dataLength: Array.isArray(result) ? result.length : 'N/A',
        duration: `${duration}ms`,
        result
      })
      
      // Transform API response to match frontend expectations
      const transformedData = transformApiResponse(endpoint, result)
      console.log('🔄 Transformed Data:', {
        endpoint,
        originalKeys: Object.keys(result),
        transformedKeys: transformedData && typeof transformedData === 'object' ? Object.keys(transformedData) : 'N/A',
        transformedData
      })
      
      // Handle different response formats
      if (transformedData.data !== undefined) {
        console.log('📦 Setting data from transformedData.data:', transformedData.data)
        setData(transformedData.data)
      } else {
        console.log('📦 Setting data directly from transformedData:', transformedData)
        setData(transformedData)
      }
    } catch (err) {
      const duration = Date.now() - startTime
      console.error(`❌ API Error for ${endpoint}:`, {
        error: err,
        duration: `${duration}ms`,
        errorType: err instanceof Error ? err.constructor.name : typeof err,
        errorMessage: err instanceof Error ? err.message : String(err)
      })
      
      if (err instanceof ApiError) {
        setError(err)
      } else if (err instanceof Error) {
        setError(new ApiError(err.message, 'FETCH_ERROR'))
      } else {
        setError(new ApiError('An unknown error occurred', 'UNKNOWN_ERROR'))
      }
    } finally {
      setLoading(false)
      console.log(`🏁 API Call Complete for ${endpoint}`)
    }
  }, [endpoint])

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetchData()
    }
  }, [fetchData, ...(options?.dependencies || [])])

  return { data, loading, error, refetch }
}

// Custom API Error class
class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Transform API response to match frontend expectations
function transformApiResponse(endpoint: string, data: any): any {
  if (!data || typeof data !== 'object') return data
  
  switch (endpoint) {
    case '/leaderboard':
      // Transform leaderboard response: agents -> leaders
      if (data.agents && Array.isArray(data.agents)) {
        return {
          ...data,
          leaders: data.agents.map((agent: any) => ({
            ...agent,
            // Add any missing properties or rename properties here
            weekly_sales: agent.sales || 0 // Map sales to weekly_sales if needed
          }))
        }
      }
      break
      
    case '/districts':
      // Transform districts response if needed
      if (data.districts && Array.isArray(data.districts)) {
        return {
          ...data,
          districts: data.districts
        }
      }
      break
      
    case '/big-movers':
      // Transform big-movers response if needed
      return data
      
    default:
      return data
  }
  
  return data
}