/**
 * useCustomers.ts
 *
 * Fetches customer list from GET /api/v1/customers.
 * Requires assistant_manager+ role — falls back to mock for lower roles or
 * when the API is unavailable.
 */

import { useState, useEffect } from 'react'
import { fetchCustomers } from '../dashboard.api'
import { MOCK_CUSTOMERS, MOCK_CUSTOMERS_PAGINATION } from '../dashboard.mock'
import type { DashboardCustomer, PaginationMeta, UseListResult } from '../dashboard.types'

interface UseCustomersParams {
  page?: number
  limit?: number
  status?: string
  search?: string
}

export function useCustomers(params?: UseCustomersParams): UseListResult<DashboardCustomer> {
  const [items, setItems]           = useState<DashboardCustomer[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setLoading]     = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [isMock, setIsMock]         = useState(false)

  // Stable key so the effect only re-fires when params meaningfully change
  const paramsKey = JSON.stringify(params ?? {})

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchCustomers(params)
        if (!cancelled) {
          setItems(result.customers)
          setPagination(result.pagination)
          setIsMock(false)
        }
      } catch {
        // 401/403 (unauthenticated or insufficient role) or network error → mock
        if (!cancelled) {
          setItems(MOCK_CUSTOMERS)
          setPagination(MOCK_CUSTOMERS_PAGINATION)
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
