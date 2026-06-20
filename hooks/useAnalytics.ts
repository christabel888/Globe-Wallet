'use client'

import { useState, useCallback, useEffect } from 'react'
import type { AnalyticsDashboard, ChartInterval } from '@/lib/types'

interface UseAnalyticsState {
  dashboard: AnalyticsDashboard | null
  loading: boolean
  error: string | null
  interval: ChartInterval
}

interface UseAnalyticsResult extends UseAnalyticsState {
  setInterval: (interval: ChartInterval) => void
  refresh: () => Promise<void>
}

export function useAnalytics(initialInterval: ChartInterval = 'week'): UseAnalyticsResult {
  const [state, setState] = useState<UseAnalyticsState>({
    dashboard: null,
    loading: true,
    error: null,
    interval: initialInterval,
  })

  const fetchDashboard = useCallback(async (interval: ChartInterval) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const res = await fetch(`/api/analytics?interval=${interval}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? `Request failed with status ${res.status}`)
      }
      const json = await res.json()
      if (!json.success || !json.data) {
        throw new Error(json.error ?? 'Unexpected response from analytics API')
      }
      setState((prev) => ({ ...prev, dashboard: json.data as AnalyticsDashboard, loading: false }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load analytics'
      setState((prev) => ({ ...prev, error: message, loading: false }))
    }
  }, [])

  useEffect(() => {
    fetchDashboard(state.interval)
  }, [fetchDashboard, state.interval])

  const setInterval = useCallback(
    (interval: ChartInterval) => {
      setState((prev) => ({ ...prev, interval }))
    },
    [],
  )

  const refresh = useCallback(
    () => fetchDashboard(state.interval),
    [fetchDashboard, state.interval],
  )

  return { ...state, setInterval, refresh }
}
