/**
 * dashboard.api.ts
 *
 * API functions for the dashboard feature.
 * All endpoints verified against SFO Core routes — no invented paths.
 *
 * Each function throws on failure so hooks can catch and fall back to mock.
 * The apiClient automatically attaches Bearer token and handles 401 logout.
 */

import apiClient from '@/api/client'
import type {
  DashboardOverview,
  RawActivityItem,
  DashboardCustomer,
  DashboardJob,
  JobStats,
  PaginationMeta,
} from './dashboard.types'

// ---------------------------------------------------------------------------
// Envelope wrapper (matches all SFO Core responses)
// ---------------------------------------------------------------------------

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

// ---------------------------------------------------------------------------
// Type helpers for raw API shapes before normalisation
// ---------------------------------------------------------------------------

interface RawCustomer {
  _id?: string
  id?: string
  firstName: string
  lastName: string
  email: string
  status: string
  createdAt: string
}

interface RawJobAssignee {
  firstName: string
  lastName: string
}

interface RawJobCustomer {
  firstName: string
  lastName: string
}

interface RawJob {
  _id?: string
  id?: string
  title: string
  status: string
  customerId: RawJobCustomer | null
  assignedTo: RawJobAssignee | null
  scheduledDate?: string | null
}

// ---------------------------------------------------------------------------
// Normalisers — convert raw API shapes to DashboardX types
// ---------------------------------------------------------------------------

function normaliseCustomer(raw: RawCustomer): DashboardCustomer {
  return {
    id: String(raw._id ?? raw.id ?? ''),
    name: `${raw.firstName} ${raw.lastName}`.trim(),
    email: raw.email,
    status: raw.status,
    joinDate: raw.createdAt
      ? new Date(raw.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '—',
  }
}

function normaliseJob(raw: RawJob): DashboardJob {
  const customerName = raw.customerId
    ? `${raw.customerId.firstName} ${raw.customerId.lastName}`.trim()
    : 'Unknown'

  const assigneeName = raw.assignedTo
    ? `${raw.assignedTo.firstName} ${raw.assignedTo.lastName}`.trim()
    : 'Unassigned'

  return {
    id: String(raw._id ?? raw.id ?? ''),
    title: raw.title,
    status: raw.status,
    customer: customerName,
    assignee: assigneeName,
    scheduledDate: raw.scheduledDate ?? null,
  }
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/dashboard/overview
 * Requires: auth + tenant
 */
export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const res = await apiClient.get<ApiEnvelope<DashboardOverview>>('/dashboard/overview')
  return res.data.data
}

/**
 * GET /api/v1/dashboard/recent-activity
 * Requires: auth + tenant
 */
export async function fetchRecentActivity(limit = 10): Promise<RawActivityItem[]> {
  const res = await apiClient.get<ApiEnvelope<{ activities: RawActivityItem[] }>>(
    `/dashboard/recent-activity?limit=${limit}`
  )
  return res.data.data.activities
}

/**
 * GET /api/v1/customers
 * Requires: auth + tenant + assistant_manager role
 */
export async function fetchCustomers(params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
}): Promise<{ customers: DashboardCustomer[]; pagination: PaginationMeta }> {
  const query = new URLSearchParams()
  if (params?.page)   query.set('page',   String(params.page))
  if (params?.limit)  query.set('limit',  String(params.limit))
  if (params?.status) query.set('status', params.status)
  if (params?.search) query.set('search', params.search)

  const res = await apiClient.get<
    ApiEnvelope<{ customers: RawCustomer[]; pagination: PaginationMeta }>
  >(`/customers${query.toString() ? `?${query}` : ''}`)

  return {
    customers: res.data.data.customers.map(normaliseCustomer),
    pagination: res.data.data.pagination,
  }
}

/**
 * GET /api/v1/jobs
 * Requires: auth + tenant (employee+ — all roles)
 */
export async function fetchJobs(params?: {
  page?: number
  limit?: number
  status?: string
}): Promise<{ jobs: DashboardJob[]; pagination: PaginationMeta }> {
  const query = new URLSearchParams()
  if (params?.page)   query.set('page',   String(params.page))
  if (params?.limit)  query.set('limit',  String(params.limit))
  if (params?.status) query.set('status', params.status)

  const res = await apiClient.get<
    ApiEnvelope<{ jobs: RawJob[]; pagination: PaginationMeta }>
  >(`/jobs${query.toString() ? `?${query}` : ''}`)

  return {
    jobs: res.data.data.jobs.map(normaliseJob),
    pagination: res.data.data.pagination,
  }
}

/**
 * GET /api/v1/jobs/stats
 * Requires: auth + tenant (employee+ — all roles)
 */
export async function fetchJobStats(): Promise<JobStats> {
  const res = await apiClient.get<ApiEnvelope<JobStats>>('/jobs/stats')
  return res.data.data
}
