import { useState } from 'react'
import { Container, DataTable, Badge } from '@/components'
import { useJobs } from '@/features/dashboard/hooks'
import type { Column } from '@/components'
import type { DashboardJob } from '@/features/dashboard/dashboard.types'
import './JobsPage.scss'

type JobRow = DashboardJob & Record<string, unknown>

// SFO Core job status values: 'New' | 'Scheduled' | 'InProgress' |
//   'Completed' | 'Closed' | 'Canceled' | 'Archived'
const JOB_STATUSES = ['New', 'Scheduled', 'InProgress', 'Completed', 'Closed', 'Canceled', 'Archived']

function statusVariant(status: string): 'success' | 'warning' | 'error' | 'primary' {
  if (status === 'Completed' || status === 'Closed')          return 'success'
  if (status === 'InProgress' || status === 'Scheduled')      return 'primary'
  if (status === 'New')                                        return 'warning'
  if (status === 'Canceled' || status === 'Archived')         return 'error'
  return 'primary'
}

const columns: Column<JobRow>[] = [
  { key: 'title',    label: 'Job Title' },
  { key: 'customer', label: 'Customer' },
  {
    key: 'status',
    label: 'Status',
    render: (value) => {
      const s = String(value)
      return (
        <Badge variant={statusVariant(s)}>
          {s.replace(/([a-z])([A-Z])/g, '$1 $2')}
        </Badge>
      )
    },
    width: '130px',
  },
  { key: 'assignee',     label: 'Assigned To',  width: '140px' },
  { key: 'scheduledDate',label: 'Scheduled',     width: '120px',
    render: (value) => value ? new Date(String(value)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  },
]

export function JobsPage() {
  const [statusFilter, setStatusFilter] = useState('')

  const { items, pagination, isLoading, isMock } = useJobs({
    limit: 50,
    status: statusFilter || undefined,
  })

  // BACKEND ENFORCEMENT: All authenticated roles can read jobs.
  // requireAuth + requireTenant enforced on the backend.

  return (
    <main className="jobs-page">
      <Container>
        <div className="jobs-page__header">
          <div>
            <h1>Jobs</h1>
            <p>
              {pagination
                ? `${pagination.total} total jobs`
                : 'Service jobs for this workspace'}
              {isMock && <span className="jobs-page__demo-badge">Demo data</span>}
            </p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="jobs-page__filters">
          <button
            className={`jobs-page__filter-btn${!statusFilter ? ' jobs-page__filter-btn--active' : ''}`}
            onClick={() => setStatusFilter('')}
          >
            All
          </button>
          {JOB_STATUSES.map((s) => (
            <button
              key={s}
              className={`jobs-page__filter-btn${statusFilter === s ? ' jobs-page__filter-btn--active' : ''}`}
              onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
            >
              {s.replace(/([a-z])([A-Z])/g, '$1 $2')}
            </button>
          ))}
        </div>

        <div className="jobs-page__table">
          <DataTable<JobRow>
            data={isLoading ? [] : (items as JobRow[])}
            columns={columns}
            emptyMessage={isLoading ? 'Loading jobs…' : 'No jobs found'}
          />
        </div>

        {pagination && !isLoading && (
          <p className="jobs-page__count">
            Showing {items.length} of {pagination.total} jobs
          </p>
        )}
      </Container>
    </main>
  )
}
