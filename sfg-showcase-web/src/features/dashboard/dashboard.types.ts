/**
 * dashboard.types.ts
 *
 * Types matching the verified SFO Core API response shapes.
 * All endpoint shapes confirmed by inspection of:
 *   /mnt/d/sfg-api/apps/sfo-core-api/src/routes/
 *     dashboard.routes.js
 *     customers.routes.js
 *     jobs.routes.js
 */

// ---------------------------------------------------------------------------
// API response types
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/dashboard/overview
 * Wrapped in { success, message, data: DashboardOverview }
 */
export interface DashboardOverview {
  customers: {
    total: number
    active: number
  }
  jobs: {
    total: number
    open: number          // New + Scheduled + InProgress
    scheduledToday: number
    byStatus: Record<string, number>
  }
  intake: {
    new: number
  }
}

/**
 * Raw activity item from GET /api/v1/dashboard/recent-activity
 * Wrapped in { success, message, data: { activities: RawActivityItem[] } }
 */
export interface RawActivityItem {
  type: 'customer' | 'job' | 'intake'
  id: string
  description: string
  customer?: { firstName: string; lastName: string }
  status?: string
  createdAt: string
}

/**
 * Normalised activity item — matches ActivityFeed component's Activity type.
 * Derived from RawActivityItem with title, icon, color added.
 */
export interface DashboardActivity {
  id: string
  type: 'job' | 'customer' | 'team' | 'system'
  title: string
  description: string
  timestamp: Date
  icon: string
  color: 'primary' | 'success' | 'warning' | 'error'
}

/**
 * Normalised customer row for DataTable.
 * Derived from GET /api/v1/customers list items.
 * `name` = firstName + lastName (backend stores them separately).
 * `joinDate` = createdAt (formatted for display).
 *
 * NOTE: totalSpent is NOT available — Floe owns financial data.
 * The revenue column is omitted from the real-data table.
 */
export interface DashboardCustomer {
  id: string
  name: string
  email: string
  status: string
  joinDate: string
}

/**
 * Normalised job row for DataTable.
 * Derived from GET /api/v1/jobs list items (with populated customerId + assignedTo).
 *
 * Real status values from SFO Core (JOB_STATUS constants):
 *   'New' | 'Scheduled' | 'InProgress' | 'Completed' | 'Closed' | 'Canceled' | 'Archived'
 */
export interface DashboardJob {
  id: string
  title: string
  status: string
  customer: string   // derived: customerId.firstName + lastName
  assignee: string   // derived: assignedTo?.firstName + lastName or 'Unassigned'
  scheduledDate: string | null
}

/**
 * GET /api/v1/jobs/stats
 * Wrapped in { success, message, data: JobStats }
 *
 * NOTE: status keys use SFO Core naming conventions (mixed case / hyphenated).
 */
export interface JobStats {
  created: number
  estimate: number
  scheduled: number
  'in-progress': number
  completed: number
  closed: number
  canceled: number
  archived: number
  total: number
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

// ---------------------------------------------------------------------------
// Hook return shapes
// ---------------------------------------------------------------------------

/**
 * Generic single-value hook result.
 * isMock: true when API is unavailable and fallback mock data is active.
 */
export interface UseDataResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  isMock: boolean
}

/**
 * Generic list hook result with pagination.
 */
export interface UseListResult<T> {
  items: T[]
  pagination: PaginationMeta | null
  isLoading: boolean
  error: string | null
  isMock: boolean
}
