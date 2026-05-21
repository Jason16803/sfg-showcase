/**
 * useTeam.ts
 *
 * Fetches the tenant team roster from GET /api/v1/team.
 * Requires general_manager+ role — employees and assistant_managers receive
 * a 403 from the backend, which triggers the mock fallback.
 *
 * Returns UseDataResult<TeamMember[]> (not paginated — backend returns flat array).
 */

import { useState, useEffect } from 'react'
import { fetchTeam } from '../dashboard.api'
import { MOCK_TEAM } from '../dashboard.mock'
import type { TeamMember, UseDataResult } from '../dashboard.types'

export function useTeam(): UseDataResult<TeamMember[]> {
  const [data, setData]     = useState<TeamMember[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const members = await fetchTeam()
        if (!cancelled) { setData(members); setIsMock(false) }
      } catch {
        // 403 (insufficient role), 401, or network error → mock fallback
        if (!cancelled) { setData(MOCK_TEAM); setIsMock(true) }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { data, isLoading, error, isMock }
}
