/**
 * dashboard.api.ts
 *
 * API functions for the dashboard feature.
 * All endpoints verified against SFO Core routes — no invented paths.
 *
 * Confirmed routes (sfo-core-contract-agent):
 *   GET /api/v1/dashboard/overview          — auth + tenant, any role
 *   GET /api/v1/dashboard/recent-activity   — auth + tenant, any role
 *   GET /api/v1/customers                   — auth + tenant, assistant_manager+
 *   GET /api/v1/jobs                        — auth + tenant, all roles
 *   GET /api/v1/jobs/stats                  — auth + tenant, all roles
 *   GET /api/v1/team                        — auth + tenant, general_manager+
 *
 * Each function throws on failure so hooks can catch and fall back to mock.
 */

import apiClient from '@/api/client'
import type {
  ApiEnvelope,
  DashboardOverview,
  RawActivityItem,
  DashboardCustomer,
  DashboardJob,
  JobStats,
  TeamMember,
  PaginationMeta,
} from './dashboard.types'

// ---------------------------------------------------------------------------
// Raw type helpers (before normalisation)
// ---------------------------------------------------------------------------

interface RawCustomer {
  _id?: string; id?: string
  firstName: string; lastName: string; email: string; status: string; createdAt: string
}

interface RawJobAssignee { firstName: string; lastName: string }
interface RawJobCustomer { firstName: string; lastName: string }

interface RawJob {
  _id?: string; id?: string
  title: string; status: string
  customerId: RawJobCustomer | null
  assignedTo: RawJobAssignee | null
  scheduledDate?: string | null
}

interface RawTeamMember {
  _id?: string; id?: string
  firstName: string; lastName: string; email: string
  role: TeamMember['role']
  status: TeamMember['status']
  lastLogin?: string | null
  createdAt: string
}

// ---------------------------------------------------------------------------
// Normalisers
// ---------------------------------------------------------------------------

function normaliseCustomer(raw: RawCustomer): DashboardCustomer {
  return {
    id: String(raw._id ?? raw.id ?? ''),
    name: `${raw.firstName} ${raw.lastName}`.trim(),
    email: raw.email,
    status: raw.status,
    joinDate: raw.createdAt
      ? new Date(raw.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : '—',
  }
}

function normaliseJob(raw: RawJob): DashboardJob {
  return {
    id: String(raw._id ?? raw.id ?? ''),
    title: raw.title,
    status: raw.status,
    customer: raw.customerId
      ? `${raw.customerId.firstName} ${raw.customerId.lastName}`.trim()
      : 'Unknown',
    assignee: raw.assignedTo
      ? `${raw.assignedTo.firstName} ${raw.assignedTo.lastName}`.trim()
      : 'Unassigned',
    scheduledDate: raw.scheduledDate ?? null,
  }
}

function normaliseTeamMember(raw: RawTeamMember): TeamMember {
  return {
    id: String(raw._id ?? raw.id ?? ''),
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    role: raw.role,
    status: raw.status,
    lastLogin: raw.lastLogin ?? null,
    joinDate: raw.createdAt
      ? new Date(raw.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : '—',
  }
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** GET /api/v1/dashboard/overview */
export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const res = await apiClient.get<ApiEnvelope<DashboardOverview>>('/dashboard/overview')
  return res.data.data
}

/** GET /api/v1/dashboard/recent-activity */
export async function fetchRecentActivity(limit = 10): Promise<RawActivityItem[]> {
  const res = await apiClient.get<ApiEnvelope<{ activities: RawActivityItem[] }>>(
    `/dashboard/recent-activity?limit=${limit}`
  )
  return res.data.data.activities
}

/** GET /api/v1/customers — assistant_manager+ */
export async function fetchCustomers(params?: {
  page?: number; limit?: number; status?: string; search?: string
}): Promise<{ customers: DashboardCustomer[]; pagination: PaginationMeta }> {
  const q = new URLSearchParams()
  if (params?.page)   q.set('page',   String(params.page))
  if (params?.limit)  q.set('limit',  String(params.limit))
  if (params?.status) q.set('status', params.status)
  if (params?.search) q.set('search', params.search)
  const res = await apiClient.get<ApiEnvelope<{ customers: RawCustomer[]; pagination: PaginationMeta }>>(
    `/customers${q.toString() ? `?${q}` : ''}`
  )
  return { customers: res.data.data.customers.map(normaliseCustomer), pagination: res.data.data.pagination }
}

/** GET /api/v1/jobs — all roles */
export async function fetchJobs(params?: {
  page?: number; limit?: number; status?: string
}): Promise<{ jobs: DashboardJob[]; pagination: PaginationMeta }> {
  const q = new URLSearchParams()
  if (params?.page)   q.set('page',   String(params.page))
  if (params?.limit)  q.set('limit',  String(params.limit))
  if (params?.status) q.set('status', params.status)
  const res = await apiClient.get<ApiEnvelope<{ jobs: RawJob[]; pagination: PaginationMeta }>>(
    `/jobs${q.toString() ? `?${q}` : ''}`
  )
  return { jobs: res.data.data.jobs.map(normaliseJob), pagination: res.data.data.pagination }
}

/** GET /api/v1/jobs/stats — all roles */
export async function fetchJobStats(): Promise<JobStats> {
  const res = await apiClient.get<ApiEnvelope<JobStats>>('/jobs/stats')
  return res.data.data
}

/**
 * GET /api/v1/team — general_manager+
 * Returns a flat array (not paginated — backend does not paginate this endpoint).
 */
export async function fetchTeam(): Promise<TeamMember[]> {
  const res = await apiClient.get<ApiEnvelope<RawTeamMember[]>>('/team')
  return res.data.data.map(normaliseTeamMember)
}
