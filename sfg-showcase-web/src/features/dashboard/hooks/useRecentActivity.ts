/**
 * useRecentActivity.ts
 *
 * Fetches recent activity from GET /api/v1/dashboard/recent-activity.
 * Transforms raw API items into DashboardActivity (matching ActivityFeed component type).
 * Falls back to mock data when API is unavailable.
 */

import { useState, useEffect } from 'react'
import { fetchRecentActivity } from '../dashboard.api'
import { getMockActivities } from '../dashboard.mock'
import type { DashboardActivity, RawActivityItem, UseDataResult } from '../dashboard.types'

// ---------------------------------------------------------------------------
// Transform raw API activity → DashboardActivity (ActivityFeed-compatible)
// ---------------------------------------------------------------------------

function transformActivity(raw: RawActivityItem): DashboardActivity {
  const typeMap: Record<
    string,
    { type: DashboardActivity['type']; title: string; icon: string; color: DashboardActivity['color'] }
  > = {
    customer: { type: 'customer', title: 'New Customer',  icon: '★', color: 'primary' },
    job:      { type: 'job',      title: 'Job Update',    icon: '▶', color: 'primary' },
    intake:   { type: 'system',   title: 'New Inquiry',   icon: '📥', color: 'primary' },
  }

  const meta = typeMap[raw.type] ?? { type: 'system', title: 'Activity', icon: '•', color: 'primary' as const }

  // Refine job colour based on status text
  let color = meta.color
  if (raw.type === 'job' && raw.status) {
    if (raw.status === 'Completed') color = 'success'
  }

  return {
    id: String(raw.id),
    type: meta.type,
    title: meta.title,
    description: raw.description,
    timestamp: new Date(raw.createdAt),
    icon: meta.icon,
    color,
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRecentActivity(limit = 10): UseDataResult<DashboardActivity[]> {
  const [data, setData]         = useState<DashboardActivity[] | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [isMock, setIsMock]     = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const raw = await fetchRecentActivity(limit)
        if (!cancelled) {
          setData(raw.map(transformActivity))
          setIsMock(false)
        }
      } catch {
        if (!cancelled) {
          setData(getMockActivities())
          setIsMock(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [limit])

  return { data, isLoading, error, isMock }
}
