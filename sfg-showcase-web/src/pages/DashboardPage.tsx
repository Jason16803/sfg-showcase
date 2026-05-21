import {
  Container,
  DashboardMetricCard,
  ActivityFeed,
  DataTable,
  Badge,
  RevenueChart,
  JobCompletionChart,
  CustomerGrowthChart,
} from '@/components'
import {
  useDashboardOverview,
  useRecentActivity,
  useCustomers,
  useJobs,
} from '@/features/dashboard/hooks'
import type { Column } from '@/components'
import type { DashboardCustomer, DashboardJob } from '@/features/dashboard/dashboard.types'
import './DashboardPage.scss'

// ---------------------------------------------------------------------------
// Row types — intersection satisfies DataTable's T extends Record<string, unknown>
// while preserving known API field types for column key inference.
// ---------------------------------------------------------------------------

type CustomerRow = DashboardCustomer & Record<string, unknown>
type JobRow      = DashboardJob      & Record<string, unknown>

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

/**
 * Customer table columns — DashboardCustomer type (normalised from API).
 *
 * NOTE: revenue/totalSpent intentionally absent.
 * Floe owns financial data — no SFO Core customer endpoint returns it.
 * TODO (Phase 4): add revenue column when Floe tenant billing summary is available.
 */
const customerColumns: Column<CustomerRow>[] = [
  { key: 'name',     label: 'Company Name' },
  {
    key: 'status',
    label: 'Status',
    render: (value) => {
      const status = String(value)
      const variant =
        status === 'active'   ? 'success' :
        status === 'inactive' ? 'error'   :
        'warning'
      return (
        <Badge variant={variant}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
  { key: 'joinDate', label: 'Joined', width: '140px' },
]

/**
 * Job table columns — DashboardJob type (normalised from API).
 *
 * Real SFO Core job status values: 'New' | 'Scheduled' | 'InProgress' |
 *   'Completed' | 'Closed' | 'Canceled' | 'Archived'
 */
const jobColumns: Column<JobRow>[] = [
  { key: 'title',    label: 'Job Title' },
  { key: 'customer', label: 'Customer' },
  {
    key: 'status',
    label: 'Status',
    render: (value) => {
      const status = String(value)
      let variant: 'success' | 'warning' | 'error' | 'primary' = 'primary'
      if (status === 'Completed' || status === 'Closed')          variant = 'success'
      else if (status === 'InProgress' || status === 'Scheduled') variant = 'primary'
      else if (status === 'New' || status === 'Estimate')         variant = 'warning'
      else if (status === 'Canceled' || status === 'Archived')    variant = 'error'
      return (
        <Badge variant={variant}>
          {/* 'InProgress' → 'In Progress' via camelCase split */}
          {status.replace(/([a-z])([A-Z])/g, '$1 $2')}
        </Badge>
      )
    },
  },
  { key: 'assignee', label: 'Assignee', width: '140px' },
]

// ---------------------------------------------------------------------------
// Skeleton card — shown while overview hook is loading
// ---------------------------------------------------------------------------

function MetricSkeleton() {
  return (
    <div className="dashboard-page__skeleton-card" aria-hidden="true">
      <div className="dashboard-page__skeleton-line dashboard-page__skeleton-line--title" />
      <div className="dashboard-page__skeleton-line dashboard-page__skeleton-line--value" />
      <div className="dashboard-page__skeleton-line dashboard-page__skeleton-line--sub" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DashboardPage() {
  const overview  = useDashboardOverview()
  const activity  = useRecentActivity(5)
  const jobs      = useJobs({ limit: 5 })
  const customers = useCustomers({ limit: 5 })

  const activeCustomers = overview.data?.customers.active      ?? 0
  const activeJobs      = overview.data?.jobs.open             ?? 0
  const scheduledToday  = overview.data?.jobs.scheduledToday   ?? 0

  // TODO (Phase 4 / Floe): replace hardcoded revenue mock with real Floe
  // tenant billing summary once that endpoint exists. No SFO Core dashboard
  // endpoint returns financial data — Floe owns all money-related logic.
  const revenueMock = { value: '$42,850', change: { value: 12, isPositive: true } }

  return (
    <main className="dashboard-page">
      <Container>
        {/* Header */}
        <div className="dashboard-page__header">
          <h1>Dashboard</h1>
          <p>
            Service workspace overview
            {overview.isMock && (
              <span className="dashboard-page__demo-badge">Demo data</span>
            )}
          </p>
        </div>

        {/* Metric cards — skeleton while loading, real/mock values after */}
        <div className="dashboard-page__metrics">
          {overview.isLoading ? (
            <>
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
            </>
          ) : (
            <>
              <DashboardMetricCard
                title="Total Revenue"
                value={revenueMock.value}
                unit="this month"
                change={revenueMock.change}
                trend="up"
                icon="💰"
              />
              <DashboardMetricCard
                title="Active Jobs"
                value={activeJobs}
                unit="open"
                change={{ value: 3, isPositive: true }}
                trend="up"
                icon="📋"
              />
              <DashboardMetricCard
                title="Active Customers"
                value={activeCustomers}
                unit="total"
                change={{ value: 8, isPositive: true }}
                trend="up"
                icon="👥"
              />
              <DashboardMetricCard
                title="Scheduled Today"
                value={scheduledToday}
                unit="jobs"
                change={{ value: 0, isPositive: true }}
                trend="stable"
                icon="📅"
              />
            </>
          )}
        </div>

        {/* Charts — internal mock data (deferred endpoints, see Charts.tsx) */}
        <div className="dashboard-page__charts">
          <div className="dashboard-page__chart-card">
            <h3>Revenue Trend</h3>
            {/* TODO (Floe): wire to Floe financial API when tenant revenue endpoint exists */}
            <RevenueChart />
          </div>
          <div className="dashboard-page__chart-card">
            <h3>Job Completion Status</h3>
            {/* TODO (Phase 4): pass JobStats from useJobStats() once Chart accepts data prop */}
            <JobCompletionChart />
          </div>
          <div className="dashboard-page__chart-card">
            <h3>Customer Growth</h3>
            {/* TODO (Phase 4): needs GET /api/v1/dashboard/customer-growth endpoint */}
            <CustomerGrowthChart />
          </div>
        </div>

        {/* Main content: jobs table + activity feed */}
        <div className="dashboard-page__content">
          <div className="dashboard-page__main">
            <DataTable<JobRow>
              data={jobs.isLoading ? [] : (jobs.items as JobRow[])}
              columns={jobColumns}
              title="Recent Jobs"
              emptyMessage={jobs.isLoading ? 'Loading jobs…' : 'No jobs found'}
            />
          </div>
          <div className="dashboard-page__sidebar">
            <ActivityFeed
              activities={activity.isLoading ? [] : (activity.data ?? [])}
              isLoading={activity.isLoading}
            />
          </div>
        </div>

        {/* Footer: customer table */}
        <div className="dashboard-page__footer">
          <DataTable<CustomerRow>
            data={customers.isLoading ? [] : (customers.items as CustomerRow[])}
            columns={customerColumns}
            title="Top Customers"
            emptyMessage={customers.isLoading ? 'Loading customers…' : 'No customers found'}
          />
        </div>
      </Container>
    </main>
  )
}
