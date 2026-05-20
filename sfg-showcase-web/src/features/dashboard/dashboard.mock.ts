/**
 * dashboard.mock.ts
 *
 * Mock data in DashboardX type shapes.
 * Used as fallback when SFO Core API is unavailable (network down, no token,
 * unauthenticated showcase mode, local dev without backend running).
 *
 * All mock values use real API type shapes so hooks return consistent data
 * regardless of whether the API or fallback is active.
 *
 * NOTE: revenue data is not in any SFO Core dashboard endpoint —
 * financial data is owned by Floe. Revenue mock values are for display only.
 */

import type {
  DashboardOverview,
  DashboardActivity,
  DashboardCustomer,
  DashboardJob,
  JobStats,
  PaginationMeta,
} from './dashboard.types'

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export function getMockOverview(): DashboardOverview {
  return {
    customers: { total: 127, active: 124 },
    jobs: {
      total: 48,
      open: 12,
      scheduledToday: 4,
      byStatus: {
        New: 3,
        Scheduled: 4,
        InProgress: 5,
        Completed: 31,
        Closed: 3,
        Canceled: 2,
      },
    },
    intake: { new: 3 },
  }
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export function getMockActivities(): DashboardActivity[] {
  const now = Date.now()
  return [
    {
      id: 'mock-act-1',
      type: 'job',
      title: 'Job Completed',
      description: 'Monthly maintenance for Acme Corporation completed successfully',
      timestamp: new Date(now - 2 * 60 * 60 * 1000),
      icon: '✓',
      color: 'success',
    },
    {
      id: 'mock-act-2',
      type: 'customer',
      title: 'New Customer',
      description: 'Global Enterprises joined your platform',
      timestamp: new Date(now - 4 * 60 * 60 * 1000),
      icon: '★',
      color: 'primary',
    },
    {
      id: 'mock-act-3',
      type: 'job',
      title: 'Job Started',
      description: 'System upgrade for TechStart Inc started by Sarah Johnson',
      timestamp: new Date(now - 6 * 60 * 60 * 1000),
      icon: '▶',
      color: 'primary',
    },
    {
      id: 'mock-act-4',
      type: 'system',
      title: 'Invoice Generated',
      description: 'Invoice #INV-2024-005 generated for $2,450.00',
      timestamp: new Date(now - 24 * 60 * 60 * 1000),
      icon: '📄',
      color: 'primary',
    },
    {
      id: 'mock-act-5',
      type: 'team',
      title: 'Team Member Added',
      description: 'Alex Rodriguez joined your team as Service Manager',
      timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000),
      icon: '👤',
      color: 'primary',
    },
  ]
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export const MOCK_CUSTOMERS: DashboardCustomer[] = [
  { id: 'mock-c-1', name: 'Acme Corporation',   email: 'contact@acme.com',    status: 'active',   joinDate: 'Jan 15, 2023' },
  { id: 'mock-c-2', name: 'TechStart Inc',      email: 'hello@techstart.com', status: 'active',   joinDate: 'Mar 22, 2023' },
  { id: 'mock-c-3', name: 'Blue Ridge Services',email: 'info@blueridge.com',  status: 'active',   joinDate: 'Feb 10, 2023' },
  { id: 'mock-c-4', name: 'Global Enterprises', email: 'support@global.com',  status: 'inactive', joinDate: 'May 1, 2024'  },
  { id: 'mock-c-5', name: 'Summit Consulting',  email: 'hello@summit.com',    status: 'inactive', joinDate: 'Jun 20, 2023' },
]

export const MOCK_CUSTOMERS_PAGINATION: PaginationMeta = {
  page: 1, limit: 50, total: 5, pages: 1,
}

// ---------------------------------------------------------------------------
// Jobs
// Real SFO Core status values: 'New' | 'Scheduled' | 'InProgress' | 'Completed' | 'Closed' | 'Canceled'
// ---------------------------------------------------------------------------

export const MOCK_JOBS: DashboardJob[] = [
  { id: 'mock-j-1', title: 'Monthly maintenance',  customer: 'Acme Corporation',   status: 'Completed',  assignee: 'John Smith',    scheduledDate: '2024-05-15' },
  { id: 'mock-j-2', title: 'System upgrade',       customer: 'TechStart Inc',       status: 'InProgress', assignee: 'Sarah Johnson', scheduledDate: '2024-05-18' },
  { id: 'mock-j-3', title: 'Emergency repair',     customer: 'Blue Ridge Services', status: 'InProgress', assignee: 'Mike Davis',    scheduledDate: '2024-05-12' },
  { id: 'mock-j-4', title: 'Installation service', customer: 'Global Enterprises',  status: 'Scheduled',  assignee: 'Unassigned',    scheduledDate: '2024-05-20' },
  { id: 'mock-j-5', title: 'Quarterly review',     customer: 'Summit Consulting',   status: 'New',        assignee: 'John Smith',    scheduledDate: '2024-04-30' },
]

export const MOCK_JOBS_PAGINATION: PaginationMeta = {
  page: 1, limit: 50, total: 5, pages: 1,
}

// ---------------------------------------------------------------------------
// Job stats
// ---------------------------------------------------------------------------

export function getMockJobStats(): JobStats {
  return {
    created: 3,
    estimate: 2,
    scheduled: 4,
    'in-progress': 5,
    completed: 31,
    closed: 3,
    canceled: 2,
    archived: 0,
    total: 50,
  }
}
