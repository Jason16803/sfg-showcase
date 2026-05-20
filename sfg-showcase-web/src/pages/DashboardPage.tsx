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
// Row types — intersection with Record<string, unknown> satisfies DataTable's
// generic constraint (T extends { id: string } & Record<string, unknown>)
// while keeping the known API field types for column key inference.
// ---------------------------------------------------------------------------

type CustomerRow = DashboardCustomer & Record<string, unknown>
type JobRow      = DashboardJob      & Record<string, unknown>

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

/**
 * Customer columns — uses DashboardCustomer type (normalised from API).
 *
 * NOTE: totalSpent / revenue is intentionally absent.
 * Financial data is owned by Floe — no SFO Core customer endpoint returns it.
 * TODO: add revenue column when Floe tenant billing summary endpoint is available.
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
 * Job columns — uses DashboardJob type (normalised from API).
 *
 * Real SFO Core job statuses: 'New' | 'Scheduled' | 'InProgress' |
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
          {/* Convert 'InProgress' → 'In Progress' */}
          {status.replace(/([a-z])([A-Z])/g, '$1 $2')}
        </Badge>
      )
    },
  },
  { key: 'assignee', label: 'Assignee', width: '140px' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DashboardPage() {
  const overview  = useDashboardOverview()
  const activity  = useRecentActivity(5)
  const jobs      = useJobs({ limit: 5 })
  const customers = useCustomers({ limit: 5 })

  // Derive metric values from overview (real API or mock fallback)
  const activeCustomers = overview.data?.customers.active      ?? '—'
  const activeJobs      = overview.data?.jobs.open             ?? '—'
  const scheduledToday  = overview.data?.jobs.scheduledToday   ?? '—'

  // TODO: Revenue — Floe financial API; no SFO Core dashboard endpoint provides this.
  // Replace with a real value when Floe exposes a tenant revenue summary.

  return (
    <main className="dashboard-page">
      <Container>
        <div className="dashboard-page__header">
          <h1>Dashboard</h1>
          <p>
            Welcome to your SFG workspace
            {overview.isMock && (
              <span className="dashboard-page__demo-badge"> · Demo data</span>
            )}
          </p>
        </div>

        {/* Metric cards */}
        <div className="dashboard-page__metrics">
          <DashboardMetricCard
            title="Total Revenue"
            value="$42,850"
            unit="this month"
            change={{ value: 12, isPositive: true }}
            trend="up"
            icon="💰"
          />
          <DashboardMetricCard
            title="Active Jobs"
            value={overview.isLoading ? '…' : activeJobs}
            unit="open"
            change={{ value: 3, isPositive: true }}
            trend="up"
            icon="📋"
          />
          <DashboardMetricCard
            title="Active Customers"
            value={overview.isLoading ? '…' : activeCustomers}
            unit="total"
            change={{ value: 8, isPositive: true }}
            trend="up"
            icon="👥"
          />
          <DashboardMetricCard
            title="Scheduled Today"
            value={overview.isLoading ? '…' : scheduledToday}
            unit="jobs"
            change={{ value: 0, isPositive: true }}
            trend="stable"
            icon="📅"
          />
        </div>

        {/* Charts */}
        <div className="dashboard-page__charts">
          <div className="dashboard-page__chart-card">
            <h3>Revenue Trend</h3>
            {/* TODO: wire to Floe financial API when tenant revenue summary endpoint exists */}
            <RevenueChart />
          </div>
          <div className="dashboard-page__chart-card">
            <h3>Job Completion Status</h3>
            {/* TODO: accept JobStats prop from useJobs stats hook once Chart accepts data prop */}
            <JobCompletionChart />
          </div>
          <div className="dashboard-page__chart-card">
            <h3>Customer Growth</h3>
            {/* TODO: no SFO Core endpoint for growth over time — needs dedicated route */}
            <CustomerGrowthChart />
          </div>
        </div>

        {/* Main content: recent jobs + activity feed */}
        <div className="dashboard-page__content">
          <div className="dashboard-page__main">
            <DataTable<JobRow>
              data={jobs.isLoading ? [] : (jobs.items as JobRow[])}
              columns={jobColumns}
              title="Recent Jobs"
              emptyMessage={jobs.isLoading ? 'Loading…' : 'No jobs found'}
            />
          </div>
          <div className="dashboard-page__sidebar">
            <ActivityFeed
              activities={activity.isLoading ? [] : (activity.data ?? [])}
            />
          </div>
        </div>

        {/* Footer: customer table */}
        <div className="dashboard-page__footer">
          <DataTable<CustomerRow>
            data={customers.isLoading ? [] : (customers.items as CustomerRow[])}
            columns={customerColumns}
            title="Top Customers"
            emptyMessage={customers.isLoading ? 'Loading…' : 'No customers found'}
          />
        </div>
      </Container>
    </main>
  )
}
