/**
 * dashboard.types.ts
 *
 * Types matching verified SFO Core API response shapes.
 * All endpoint shapes confirmed by direct source inspection of:
 *   /mnt/d/sfg-api/apps/sfo-core-api/src/routes/
 */

// ---------------------------------------------------------------------------
// Envelope
// ---------------------------------------------------------------------------

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

// ---------------------------------------------------------------------------
// Dashboard overview  (GET /api/v1/dashboard/overview)
// ---------------------------------------------------------------------------

export interface DashboardOverview {
  customers: { total: number; active: number }
  jobs: { total: number; open: number; scheduledToday: number; byStatus: Record<string, number> }
  intake: { new: number }
}

// ---------------------------------------------------------------------------
// Recent activity  (GET /api/v1/dashboard/recent-activity)
// ---------------------------------------------------------------------------

export interface RawActivityItem {
  type: 'customer' | 'job' | 'intake'
  id: string
  description: string
  customer?: { firstName: string; lastName: string }
  status?: string
  createdAt: string
}

export interface DashboardActivity {
  id: string
  type: 'job' | 'customer' | 'team' | 'system'
  title: string
  description: string
  timestamp: Date
  icon: string
  color: 'primary' | 'success' | 'warning' | 'error'
}

// ---------------------------------------------------------------------------
// Customers  (GET /api/v1/customers — assistant_manager+)
// ---------------------------------------------------------------------------

export interface DashboardCustomer {
  id: string
  name: string       // firstName + lastName (backend stores separately)
  email: string
  status: string
  joinDate: string   // formatted from createdAt
}

// ---------------------------------------------------------------------------
// Jobs  (GET /api/v1/jobs — all roles)
// SFO Core job status values: 'New' | 'Scheduled' | 'InProgress' | 'Completed' | 'Closed' | 'Canceled' | 'Archived'
// ---------------------------------------------------------------------------

export interface DashboardJob {
  id: string
  title: string
  status: string
  customer: string        // derived: customerId.firstName + lastName
  assignee: string        // derived: assignedTo?.firstName + lastName | 'Unassigned'
  scheduledDate: string | null
}

// ---------------------------------------------------------------------------
// Jobs stats  (GET /api/v1/jobs/stats — all roles)
// Keys match JOB_STATUS constants in sfo-core-api/src/constants/statuses.js
// ---------------------------------------------------------------------------

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
// Team  (GET /api/v1/team — general_manager+)
// Returns plain array (not paginated).
// Backend selects: _id firstName lastName email role status lastLogin createdAt
// ---------------------------------------------------------------------------

export interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'owner' | 'general_manager' | 'assistant_manager' | 'employee'
  status: 'active' | 'invited' | 'suspended'
  lastLogin: string | null
  joinDate: string   // formatted from createdAt
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

/** Single-value hook result. isMock: true when fallback mock data is active. */
export interface UseDataResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  isMock: boolean
}

/** Paginated list hook result. */
export interface UseListResult<T> {
  items: T[]
  pagination: PaginationMeta | null
  isLoading: boolean
  error: string | null
  isMock: boolean
}
