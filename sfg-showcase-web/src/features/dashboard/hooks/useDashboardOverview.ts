/**
 * useDashboardOverview.ts
 *
 * Fetches dashboard overview stats from GET /api/v1/dashboard/overview.
 * Falls back to mock data when the API is unavailable (no token, network error,
 * or unauthenticated showcase mode).
 */

import { useState, useEffect } from 'react'
import { fetchDashboardOverview } from '../dashboard.api'
import { getMockOverview } from '../dashboard.mock'
import type { DashboardOverview, UseDataResult } from '../dashboard.types'

export function useDashboardOverview(): UseDataResult<DashboardOverview> {
  const [data, setData]         = useState<DashboardOverview | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [isMock, setIsMock]     = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchDashboardOverview()
        if (!cancelled) {
          setData(result)
          setIsMock(false)
        }
      } catch {
        // API unavailable (no token, network error, 401, 403) → use mock
        if (!cancelled) {
          setData(getMockOverview())
          setIsMock(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { data, isLoading, error, isMock }
}
