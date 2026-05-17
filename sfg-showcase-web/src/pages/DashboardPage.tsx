import { Container, DashboardMetricCard, ActivityFeed, DataTable, Badge, RevenueChart, JobCompletionChart, CustomerGrowthChart } from '@/components'
import { mockCustomers, mockJobs, mockActivities, mockDashboardMetrics } from '@/data/mockData'
import type { Column } from '@/components'
import type { MockCustomer, MockJob } from '@/data/mockData'
import './DashboardPage.scss'

export function DashboardPage() {
  const customerColumns: Column<MockCustomer>[] = [
    { key: 'name', label: 'Company Name' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const status = value as string
        return (
          <Badge variant={status === 'active' ? 'success' : status === 'pending' ? 'warning' : 'error'}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      }
    },
    { key: 'joinDate', label: 'Joined', width: '120px' },
    {
      key: 'totalSpent',
      label: 'Revenue',
      render: (value) => `$${(value as number).toLocaleString()}`
    },
  ]

  const jobColumns: Column<MockJob>[] = [
    { key: 'title', label: 'Job Title' },
    { key: 'customer', label: 'Customer' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const status = value as string
        let variant: 'success' | 'warning' | 'error' | 'primary' = 'primary'
        if (status === 'completed') variant = 'success'
        else if (status === 'in_progress') variant = 'primary'
        else if (status === 'pending') variant = 'warning'
        else if (status === 'overdue') variant = 'error'
        return (
          <Badge variant={variant}>
            {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </Badge>
        )
      }
    },
    { key: 'assignee', label: 'Assignee', width: '130px' },
  ]

  return (
    <main className="dashboard-page">
      <Container>
        <div className="dashboard-page__header">
          <h1>Dashboard</h1>
          <p>Welcome to your SFG workspace</p>
        </div>

        <div className="dashboard-page__metrics">
          <DashboardMetricCard
            title="Total Revenue"
            value={mockDashboardMetrics.totalRevenue.value}
            change={mockDashboardMetrics.totalRevenue.change}
            trend={mockDashboardMetrics.totalRevenue.trend}
            icon="💰"
          />
          <DashboardMetricCard
            title="Active Jobs"
            value={mockDashboardMetrics.activeJobs.value}
            unit={mockDashboardMetrics.activeJobs.unit}
            change={mockDashboardMetrics.activeJobs.change}
            trend={mockDashboardMetrics.activeJobs.trend}
            icon="📋"
          />
          <DashboardMetricCard
            title="Active Customers"
            value={mockDashboardMetrics.activeCustomers.value}
            unit={mockDashboardMetrics.activeCustomers.unit}
            change={mockDashboardMetrics.activeCustomers.change}
            trend={mockDashboardMetrics.activeCustomers.trend}
            icon="👥"
          />
          <DashboardMetricCard
            title="Completion Rate"
            value={mockDashboardMetrics.completionRate.value}
            change={mockDashboardMetrics.completionRate.change}
            trend={mockDashboardMetrics.completionRate.trend}
            icon="✓"
          />
        </div>

        <div className="dashboard-page__charts">
          <div className="dashboard-page__chart-card">
            <h3>Revenue Trend</h3>
            <RevenueChart />
          </div>
          <div className="dashboard-page__chart-card">
            <h3>Job Completion Status</h3>
            <JobCompletionChart />
          </div>
          <div className="dashboard-page__chart-card">
            <h3>Customer Growth</h3>
            <CustomerGrowthChart />
          </div>
        </div>

        <div className="dashboard-page__content">
          <div className="dashboard-page__main">
            <DataTable
              data={mockJobs.slice(0, 5)}
              columns={jobColumns}
              title="Recent Jobs"
            />
          </div>
          <div className="dashboard-page__sidebar">
            <ActivityFeed activities={mockActivities} />
          </div>
        </div>

        <div className="dashboard-page__footer">
          <DataTable
            data={mockCustomers}
            columns={customerColumns}
            title="Top Customers"
          />
        </div>
      </Container>
    </main>
  )
}
