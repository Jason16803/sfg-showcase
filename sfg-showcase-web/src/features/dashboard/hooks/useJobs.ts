/**
 * useJobs.ts
 *
 * Fetches job list from GET /api/v1/jobs.
 * Available to all authenticated roles (employee+).
 * Falls back to mock data when API is unavailable.
 */

import { useState, useEffect } from 'react'
import { fetchJobs } from '../dashboard.api'
import { MOCK_JOBS, MOCK_JOBS_PAGINATION } from '../dashboard.mock'
import type { DashboardJob, PaginationMeta, UseListResult } from '../dashboard.types'

interface UseJobsParams {
  page?: number
  limit?: number
  status?: string
}

export function useJobs(params?: UseJobsParams): UseListResult<DashboardJob> {
  const [items, setItems]           = useState<DashboardJob[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setLoading]     = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [isMock, setIsMock]         = useState(false)

  const paramsKey = JSON.stringify(params ?? {})

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchJobs(params)
        if (!cancelled) {
          setItems(result.jobs)
          setPagination(result.pagination)
          setIsMock(false)
        }
      } catch {
        if (!cancelled) {
          setItems(MOCK_JOBS)
          setPagination(MOCK_JOBS_PAGINATION)
          setIsMock(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey])

  return { items, pagination, isLoading, error, isMock }
}
