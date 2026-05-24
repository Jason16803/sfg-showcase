import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Container, DataTable, Badge } from '@/components'
import { useJobs } from '@/features/dashboard/hooks'
import { useDemoStore } from '@/store/demoStore'
import { useAuthStore } from '@/store/authStore'
import type { Column } from '@/components'
import type { DashboardJob } from '@/features/dashboard/dashboard.types'
import './JobsPage.scss'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type JobRow = DashboardJob & Record<string, unknown>

// ---------------------------------------------------------------------------
// SFO Core canonical job status values (lowercase, from constants/statuses.js)
// Previous values were PascalCase — fixed to match backend contract.
// ---------------------------------------------------------------------------

const JOB_STATUS_OPTIONS = [
  { value: 'created',     label: 'Created'     },
  { value: 'estimate',    label: 'Estimate'    },
  { value: 'scheduled',   label: 'Scheduled'   },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed'   },
  { value: 'closed',      label: 'Closed'      },
  { value: 'canceled',    label: 'Canceled'    },
  { value: 'archived',    label: 'Archived'    },
]

function statusVariant(s: string): 'success' | 'warning' | 'error' | 'primary' {
  if (s === 'completed' || s === 'closed')       return 'success'
  if (s === 'in-progress' || s === 'scheduled')  return 'primary'
  if (s === 'created' || s === 'estimate')       return 'warning'
  if (s === 'canceled' || s === 'archived')      return 'error'
  // Legacy PascalCase values from mock data — graceful fallback
  if (s === 'Completed' || s === 'Closed')       return 'success'
  if (s === 'InProgress' || s === 'Scheduled')   return 'primary'
  if (s === 'New')                                return 'warning'
  if (s === 'Canceled' || s === 'Archived')      return 'error'
  return 'primary'
}

function formatStatus(s: string): string {
  // Handle both 'in-progress' and 'InProgress' display shapes
  return s.replace(/-/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
}

// ---------------------------------------------------------------------------
// RBAC helpers (mirrors backend ROLE_HIERARCHY)
// ---------------------------------------------------------------------------

const ROLE_LEVEL: Record<string, number> = {
  owner: 4, general_manager: 3, assistant_manager: 2, employee: 1,
}

function hasMinRole(userRole: string | undefined, minRole: string): boolean {
  return (ROLE_LEVEL[userRole ?? ''] ?? 0) >= (ROLE_LEVEL[minRole] ?? 0)
}

// ---------------------------------------------------------------------------
// Add Job form
// ---------------------------------------------------------------------------

interface AddJobFormProps {
  onAdd: (title: string, status: string) => void
  onCancel: () => void
}

function AddJobForm({ onAdd, onCancel }: AddJobFormProps) {
  const [title,  setTitle]  = useState('')
  const [status, setStatus] = useState('created')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim(), status)
  }

  return (
    <form className="jobs-page__add-form" onSubmit={handleSubmit}>
      <h3 className="jobs-page__add-form-title">
        Add Demo Job
        <span className="jobs-page__local-badge">local only</span>
      </h3>
      <div className="jobs-page__add-form-row">
        <div className="jobs-page__add-form-field">
          <label className="jobs-page__add-form-label">Job Title *</label>
          <input
            className="jobs-page__add-form-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. HVAC Inspection"
            required
            autoFocus
          />
        </div>
        <div className="jobs-page__add-form-field">
          <label className="jobs-page__add-form-label">Status</label>
          <select
            className="jobs-page__add-form-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {JOB_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="jobs-page__add-form-actions">
        <button type="submit" className="jobs-page__add-form-submit">Add Job</button>
        <button type="button" className="jobs-page__add-form-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function JobsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddForm,  setShowAddForm]  = useState(false)

  // ── Real API data ─────────────────────────────────────────────────────────
  // Fetch without status filter; we apply filtering client-side on displayJobs
  // so that local demo additions remain visible across filter switches.
  const { items, pagination, isLoading, isMock } = useJobs({ limit: 100 })

  // ── Demo overlay ──────────────────────────────────────────────────────────
  const { jobs, setJobs, addJob, removeJob, hasLocalChanges, resetLocalChanges } = useDemoStore()
  const { user } = useAuthStore()

  // Prime demoStore from API on first successful load (or after resetLocalChanges)
  useEffect(() => {
    if (!isLoading && jobs === null) {
      setJobs(items)
    }
  }, [items, isLoading, jobs, setJobs])

  // ── RBAC ──────────────────────────────────────────────────────────────────
  const canWrite = hasMinRole(user?.role, 'assistant_manager')

  // ── Display data ──────────────────────────────────────────────────────────
  const allJobs    = jobs ?? items
  const displayJobs = statusFilter
    ? allJobs.filter((j) => j.status === statusFilter)
    : allJobs

  // ── Column definitions (inside component to close over canWrite / removeJob)
  const columns: Column<JobRow>[] = [
    {
      key: 'title',
      label: 'Job Title',
      render: (_value, row) => (
        <span className="jobs-page__title-cell">
          {row.title}
          {String(row.id ?? '').startsWith('soft_') && (
            <span className="jobs-page__local-badge">local</span>
          )}
        </span>
      ),
    },
    { key: 'customer', label: 'Customer' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const s = String(value)
        return (
          <Badge variant={statusVariant(s)}>
            {formatStatus(s).replace(/\b\w/g, (c) => c.toUpperCase())}
          </Badge>
        )
      },
      width: '130px',
    },
    { key: 'assignee',      label: 'Assigned To', width: '140px' },
    {
      key: 'scheduledDate',
      label: 'Scheduled',
      width: '120px',
      render: (value) =>
        value
          ? new Date(String(value)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '—',
    },
    // Actions column — only rendered when user has write access
    ...(canWrite
      ? [{
          key: 'id' as keyof JobRow,
          label: '',
          width: '48px',
          render: (_value: unknown, row: JobRow) => (
            <button
              className="jobs-page__delete-btn"
              onClick={() => removeJob(String(row.id))}
              title="Remove (local only)"
              aria-label={`Remove ${row.title}`}
            >
              ×
            </button>
          ),
        }]
      : []),
  ]

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddJob = (title: string, status: string) => {
    addJob({ title, status })
    setShowAddForm(false)
  }

  const handleReset = () => {
    if (!window.confirm('Reset demo job changes to baseline? Local additions will be removed.')) return
    resetLocalChanges()
  }

  return (
    <main className="jobs-page">
      <Container>
        <div className="jobs-page__header">
          <div>
            <h1>Jobs</h1>
            <p>
              {pagination
                ? `${allJobs.length} jobs`
                : 'Service jobs for this workspace'}
              {isMock && <span className="jobs-page__demo-badge">Demo data</span>}
            </p>
          </div>

          {/* Role-gated add button — assistant_manager+ */}
          {canWrite && !showAddForm && (
            <button
              className="jobs-page__add-btn"
              onClick={() => setShowAddForm(true)}
            >
              + Add Demo Job
            </button>
          )}
        </div>

        {/* Demo notice — shown when real API data is loaded */}
        {!isMock && (
          <div className="jobs-page__demo-notice">
            <strong>Live data</strong> from{' '}
            <code>{import.meta.env.VITE_API_URL}/jobs</code>.{' '}
            Adds and deletions are <strong>local only</strong> and reset on reload.
            {hasLocalChanges && (
              <>
                {' '}
                <button className="jobs-page__reset-link" onClick={handleReset}>
                  Reset local changes
                </button>
              </>
            )}
          </div>
        )}

        {/* Add job inline form */}
        {showAddForm && canWrite && (
          <AddJobForm
            onAdd={handleAddJob}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Status filter tab bar */}
        <div className="jobs-page__filters">
          <button
            className={`jobs-page__filter-btn${!statusFilter ? ' jobs-page__filter-btn--active' : ''}`}
            onClick={() => setStatusFilter('')}
          >
            All ({allJobs.length})
          </button>
          {JOB_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`jobs-page__filter-btn${statusFilter === opt.value ? ' jobs-page__filter-btn--active' : ''}`}
              onClick={() => setStatusFilter(statusFilter === opt.value ? '' : opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="jobs-page__table">
          <DataTable<JobRow>
            data={isLoading ? [] : (displayJobs as JobRow[])}
            columns={columns}
            emptyMessage={isLoading ? 'Loading jobs…' : 'No jobs match this filter'}
          />
        </div>

        {!isLoading && (
          <p className="jobs-page__count">
            Showing {displayJobs.length}{statusFilter ? ` ${formatStatus(statusFilter)}` : ''} job{displayJobs.length !== 1 ? 's' : ''}
            {hasLocalChanges && <span className="jobs-page__local-count"> · {allJobs.filter((j) => String(j.id).startsWith('soft_')).length} local</span>}
          </p>
        )}
      </Container>
    </main>
  )
}
