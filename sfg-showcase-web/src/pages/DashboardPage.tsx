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

type CustomerRow = DashboardCustomer & Record<string, unknown>
type JobRow      = DashboardJob      & Record<string, unknown>

// ---------------------------------------------------------------------------
// Status distribution — derived from overview.jobs.byStatus
// ---------------------------------------------------------------------------

const STATUS_CONFIG: {
  key: string
  label: string
  className: string
}[] = [
  { key: 'InProgress', label: 'In Progress', className: 'status-strip__item--inprogress' },
  { key: 'Scheduled',  label: 'Scheduled',   className: 'status-strip__item--scheduled'  },
  { key: 'New',        label: 'New',          className: 'status-strip__item--new'        },
  { key: 'Completed',  label: 'Completed',    className: 'status-strip__item--completed'  },
  { key: 'Canceled',   label: 'Canceled',     className: 'status-strip__item--canceled'   },
]

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const customerColumns: Column<CustomerRow>[] = [
  { key: 'name',     label: 'Company' },
  {
    key: 'status',
    label: 'Status',
    width: '100px',
    render: (value) => {
      const s = String(value)
      return (
        <Badge variant={s === 'active' ? 'success' : s === 'inactive' ? 'error' : 'warning'}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </Badge>
      )
    },
  },
  { key: 'joinDate', label: 'Joined', width: '120px' },
]

const jobColumns: Column<JobRow>[] = [
  { key: 'title',    label: 'Job Title' },
  { key: 'customer', label: 'Customer', width: '140px' },
  {
    key: 'status',
    label: 'Status',
    width: '120px',
    render: (value) => {
      const s = String(value)
      let variant: 'success' | 'warning' | 'error' | 'primary' = 'primary'
      if (s === 'Completed' || s === 'Closed' || s === 'completed' || s === 'closed') variant = 'success'
      else if (s === 'InProgress' || s === 'Scheduled' || s === 'in-progress' || s === 'scheduled') variant = 'primary'
      else if (s === 'New' || s === 'Estimate' || s === 'created' || s === 'estimate') variant = 'warning'
      else if (s === 'Canceled' || s === 'Archived' || s === 'canceled' || s === 'archived') variant = 'error'
      return (
        <Badge variant={variant}>
          {s.replace(/-/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')}
        </Badge>
      )
    },
  },
  { key: 'assignee', label: 'Assignee', width: '130px' },
]

// ---------------------------------------------------------------------------
// Skeletons
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

function ChartSkeleton() {
  return (
    <div className="dashboard-page__chart-card" aria-hidden="true">
      <div className="dashboard-page__skeleton-line dashboard-page__skeleton-line--chart-title" />
      <div className="dashboard-page__skeleton-chart" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DashboardPage() {
  const overview  = useDashboardOverview()
  const activity  = useRecentActivity(8)
  const jobs      = useJobs({ limit: 6 })
  const customers = useCustomers({ limit: 5 })

  const activeCustomers = overview.data?.customers.active    ?? 0
  const activeJobs      = overview.data?.jobs.open           ?? 0
  const scheduledToday  = overview.data?.jobs.scheduledToday ?? 0
  const newLeads        = overview.data?.intake.new          ?? 0
  const byStatus        = overview.data?.jobs.byStatus       ?? {}

  const revenueMock = { value: '$42,850', change: { value: 12, isPositive: true } }

  return (
    <main className="dashboard-page">
      <Container>

        {/* ── Page header ────────────────────────────────────────── */}
        <div className="dashboard-page__header">
          <div>
            <h1>Dashboard</h1>
            <p>
              Service workspace overview
              {overview.isMock && (
                <span className="dashboard-page__demo-badge">Demo data</span>
              )}
            </p>
          </div>
        </div>

        {/* ── KPI cards ──────────────────────────────────────────── */}
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
                title="Revenue"
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
                icon="🔧"
              />
              <DashboardMetricCard
                title="Customers"
                value={activeCustomers}
                unit="active"
                change={{ value: 8, isPositive: true }}
                trend="up"
                icon="👥"
              />
              <DashboardMetricCard
                title="Today"
                value={scheduledToday}
                unit="scheduled"
                change={{ value: newLeads, isPositive: newLeads > 0 }}
                trend="stable"
                icon="📅"
              />
            </>
          )}
        </div>

        {/* ── Status distribution strip ───────────────────────────── */}
        {!overview.isLoading && Object.keys(byStatus).length > 0 && (
          <div className="status-strip" aria-label="Job status breakdown">
            {STATUS_CONFIG.map(({ key, label, className }) => {
              const count = byStatus[key] ?? 0
              if (count === 0) return null
              return (
                <div key={key} className={`status-strip__item ${className}`}>
                  <span className="status-strip__count">{count}</span>
                  <span className="status-strip__label">{label}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Charts ─────────────────────────────────────────────── */}
        <section className="dashboard-page__section">
          <h2 className="dashboard-page__section-title">
            Trends
            <span className="dashboard-page__section-sub">Last 6 months</span>
          </h2>
          <div className="dashboard-page__charts">
            {overview.isLoading ? (
              <>
                <ChartSkeleton />
                <ChartSkeleton />
                <ChartSkeleton />
              </>
            ) : (
              <>
                <div className="dashboard-page__chart-card dashboard-page__chart-card--primary">
                  <h3>Revenue Trend</h3>
                  <p className="dashboard-page__chart-sub">Actual vs target</p>
                  <RevenueChart />
                </div>
                <div className="dashboard-page__chart-card">
                  <h3>Job Completion</h3>
                  <p className="dashboard-page__chart-sub">By week</p>
                  <JobCompletionChart />
                </div>
                <div className="dashboard-page__chart-card">
                  <h3>Customer Growth</h3>
                  <p className="dashboard-page__chart-sub">Active vs new</p>
                  <CustomerGrowthChart />
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Jobs + Activity ────────────────────────────────────── */}
        <section className="dashboard-page__section">
          <h2 className="dashboard-page__section-title">
            Operations
            <span className="dashboard-page__section-sub">Recent jobs &amp; activity</span>
          </h2>
          <div className="dashboard-page__content">
            <div className="dashboard-page__main">
              <DataTable<JobRow>
                data={jobs.isLoading ? [] : (jobs.items as JobRow[])}
                columns={jobColumns}
                title="Recent Jobs"
                emptyMessage={jobs.isLoading ? 'Loading jobs…' : 'No jobs found'}
                emptyIcon="🔧"
              />
            </div>
            <div className="dashboard-page__sidebar">
              <ActivityFeed
                activities={activity.isLoading ? [] : (activity.data ?? [])}
                isLoading={activity.isLoading}
              />
            </div>
          </div>
        </section>

        {/* ── Customers ──────────────────────────────────────────── */}
        <section className="dashboard-page__section dashboard-page__section--last">
          <h2 className="dashboard-page__section-title">
            Customers
            <span className="dashboard-page__section-sub">Top accounts</span>
          </h2>
          <DataTable<CustomerRow>
            data={customers.isLoading ? [] : (customers.items as CustomerRow[])}
            columns={customerColumns}
            emptyMessage={customers.isLoading ? 'Loading customers…' : 'No customers found'}
            emptyIcon="👥"
          />
        </section>

      </Container>
    </main>
  )
}
