import type { Activity } from '@/components/ActivityFeed'

export interface MockCustomer {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive' | 'pending'
  joinDate: string
  totalSpent: number
}

export interface MockJob {
  id: string
  title: string
  customer: string
  status: 'completed' | 'in_progress' | 'pending' | 'overdue'
  dueDate: string
  assignee: string
}

export const mockCustomers: MockCustomer[] = [
  { id: '1', name: 'Acme Corporation',    email: 'contact@acme.com',    status: 'active',   joinDate: '2023-01-15', totalSpent: 45230 },
  { id: '2', name: 'TechStart Inc',       email: 'hello@techstart.com', status: 'active',   joinDate: '2023-03-22', totalSpent: 32180 },
  { id: '3', name: 'Blue Ridge Services', email: 'info@blueridge.com',  status: 'active',   joinDate: '2023-02-10', totalSpent: 28950 },
  { id: '4', name: 'Global Enterprises',  email: 'support@global.com',  status: 'pending',  joinDate: '2024-05-01', totalSpent: 0     },
  { id: '5', name: 'Summit Consulting',   email: 'hello@summit.com',    status: 'inactive', joinDate: '2023-06-20', totalSpent: 15670 },
]

export const mockJobs: MockJob[] = [
  { id: 'JOB-001', title: 'Monthly maintenance',  customer: 'Acme Corporation',   status: 'completed',  dueDate: '2024-05-15', assignee: 'John Smith'    },
  { id: 'JOB-002', title: 'System upgrade',       customer: 'TechStart Inc',       status: 'in_progress',dueDate: '2024-05-18', assignee: 'Sarah Johnson' },
  { id: 'JOB-003', title: 'Emergency repair',     customer: 'Blue Ridge Services', status: 'in_progress',dueDate: '2024-05-12', assignee: 'Mike Davis'    },
  { id: 'JOB-004', title: 'Installation service', customer: 'Global Enterprises',  status: 'pending',    dueDate: '2024-05-20', assignee: 'Unassigned'   },
  { id: 'JOB-005', title: 'Quarterly review',     customer: 'Summit Consulting',   status: 'overdue',    dueDate: '2024-04-30', assignee: 'John Smith'    },
]

export const mockActivities: Activity[] = [
  { id: '1', type: 'job',      title: 'Job Completed',    description: 'Monthly maintenance for Acme Corporation completed successfully', timestamp: new Date(Date.now() - 2  * 60 * 60 * 1000), icon: '✓',  color: 'success' },
  { id: '2', type: 'customer', title: 'New Customer',     description: 'Global Enterprises joined your platform',                        timestamp: new Date(Date.now() - 4  * 60 * 60 * 1000), icon: '★',  color: 'primary' },
  { id: '3', type: 'job',      title: 'Job Started',      description: 'System upgrade for TechStart Inc started by Sarah Johnson',      timestamp: new Date(Date.now() - 6  * 60 * 60 * 1000), icon: '▶',  color: 'primary' },
  { id: '4', type: 'system',   title: 'Invoice Generated',description: 'Invoice #INV-2024-005 generated for $2,450.00',                 timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), icon: '📄', color: 'primary' },
  { id: '5', type: 'team',     title: 'Team Member Added',description: 'Alex Rodriguez joined your team as Service Manager',            timestamp: new Date(Date.now() - 2  * 24 * 60 * 60 * 1000), icon: '👤', color: 'primary' },
]

export const mockDashboardMetrics = {
  totalRevenue:    { value: '$42,850', unit: 'this month', change: { value: 12, isPositive: true }, trend: 'up'     as const },
  activeJobs:      { value: 12,        unit: 'in progress',change: { value: 3,  isPositive: true }, trend: 'up'     as const },
  activeCustomers: { value: 127,       unit: 'total',      change: { value: 8,  isPositive: true }, trend: 'up'     as const },
  completionRate:  { value: '94%',     unit: 'on-time',    change: { value: 2,  isPositive: true }, trend: 'stable' as const },
}

/**
 * rolePermissions
 *
 * Controls sidebar nav section visibility per role.
 * Section labels must match the path-mapping in DashboardLayout:
 *   section.toLowerCase().replace(/\s+/g, '-') === the route path
 *
 * "Jobs"     → /jobs     (GET /api/v1/jobs — all roles)
 * "Customers"→ /customers(GET /api/v1/customers — assistant_manager+)
 * "Team"     → /team     (GET /api/v1/team — general_manager+)
 * "Settings" → /settings (PUT /api/v1/me — any auth)
 * "Reports"  → /reports  (placeholder — no confirmed backend endpoint)
 * "Billing"  → /billing  (Floe-owned — no confirmed backend endpoint)
 */
export const rolePermissions = {
  owner: {
    label: 'Owner',
    color: 'primary',
    sections: ['Dashboard', 'Jobs', 'Customers', 'Team', 'Reports', 'Settings', 'Billing'],
  },
  general_manager: {
    label: 'General Manager',
    color: 'info',
    sections: ['Dashboard', 'Jobs', 'Customers', 'Team', 'Reports'],
  },
  assistant_manager: {
    label: 'Assistant Manager',
    color: 'warning',
    sections: ['Dashboard', 'Jobs', 'Customers', 'Team'],
  },
  employee: {
    label: 'Employee',
    color: 'success',
    sections: ['Dashboard', 'Jobs'],
  },
}

// ---------------------------------------------------------------------------
// Demo credentials — Week 3 demo session
// These correspond to the seeded sfg-showcase-demo tenant (TNT_SFG_DEMO).
// Backend prerequisite: node src/scripts/seedDemoTenant.js in sfo-core-api
// ---------------------------------------------------------------------------

export type DemoRole = 'owner' | 'assistant_manager' | 'employee'

export interface DemoAccount {
  label: string
  role: DemoRole
  email: string
  password: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { label: 'Owner',                  role: 'owner',             email: 'demo-owner@sfg-showcase.dev',    password: 'DemoOwner123!'   },
  { label: 'Supervisor (Asst. Mgr)', role: 'assistant_manager', email: 'demo-manager@sfg-showcase.dev',  password: 'DemoManager123!' },
  { label: 'Employee',               role: 'employee',          email: 'demo-employee@sfg-showcase.dev', password: 'DemoEmployee123!'},
]
