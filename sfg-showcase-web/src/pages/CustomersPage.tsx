import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Container, DataTable, Badge } from '@/components'
import { useCustomers } from '@/features/dashboard/hooks'
import { useDemoStore } from '@/store/demoStore'
import { useAuthStore } from '@/store/authStore'
import type { Column } from '@/components'
import type { DashboardCustomer } from '@/features/dashboard/dashboard.types'
import './CustomersPage.scss'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CustomerRow = DashboardCustomer & Record<string, unknown>

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
// Add Customer form  (soft CRUD — local only)
// ---------------------------------------------------------------------------

interface AddCustomerFormProps {
  onAdd:    (name: string, email: string, status: string) => void
  onCancel: () => void
}

function AddCustomerForm({ onAdd, onCancel }: AddCustomerFormProps) {
  const [name,   setName]   = useState('')
  const [email,  setEmail]  = useState('')
  const [status, setStatus] = useState('active')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name.trim(), email.trim(), status)
  }

  return (
    <form className="customers-page__add-form" onSubmit={handleSubmit}>
      <h3 className="customers-page__add-form-title">
        Add Demo Customer
        <span className="customers-page__local-badge">local only</span>
      </h3>
      <div className="customers-page__add-form-row">
        <div className="customers-page__add-form-field">
          <label className="customers-page__add-form-label">Full Name *</label>
          <input
            className="customers-page__add-form-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jane Smith"
            required
            autoFocus
          />
        </div>
        <div className="customers-page__add-form-field">
          <label className="customers-page__add-form-label">Email</label>
          <input
            className="customers-page__add-form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
          />
        </div>
        <div className="customers-page__add-form-field">
          <label className="customers-page__add-form-label">Status</label>
          <select
            className="customers-page__add-form-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="customers-page__add-form-actions">
        <button type="submit" className="customers-page__add-form-submit">Add Customer</button>
        <button type="button" className="customers-page__add-form-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CustomersPage() {
  const [search,      setSearch]      = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddForm,  setShowAddForm]  = useState(false)

  // ── Real API data ─────────────────────────────────────────────────────────
  const { items, pagination, isLoading, isMock } = useCustomers({ limit: 100 })

  // ── Demo overlay ──────────────────────────────────────────────────────────
  const { customers, setCustomers, addCustomer, removeCustomer, hasLocalChanges, resetLocalChanges } = useDemoStore()
  const { user } = useAuthStore()

  // Prime demoStore from API on first load (or after resetLocalChanges)
  useEffect(() => {
    if (!isLoading && customers === null) {
      setCustomers(items)
    }
  }, [items, isLoading, customers, setCustomers])

  // ── RBAC ──────────────────────────────────────────────────────────────────
  // BACKEND ENFORCEMENT: GET /api/v1/customers requires assistant_manager+.
  // Roles below that threshold will receive mock data (403 triggers fallback).
  // Frontend also hides write controls for non-qualifying roles.
  const canWrite = hasMinRole(user?.role, 'assistant_manager')

  // ── Display data ──────────────────────────────────────────────────────────
  const allCustomers = customers ?? items
  const displayCustomers = allCustomers.filter((c) => {
    const matchesSearch = !search.trim() ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // ── Columns (inside component to close over canWrite / removeCustomer) ────
  const columns: Column<CustomerRow>[] = [
    {
      key: 'name',
      label: 'Customer Name',
      render: (_value, row) => (
        <span className="customers-page__name-cell">
          {row.name}
          {String(row.id ?? '').startsWith('soft_') && (
            <span className="customers-page__local-badge">local</span>
          )}
        </span>
      ),
    },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const s = String(value)
        const variant = s === 'active' ? 'success' : s === 'inactive' ? 'error' : 'warning'
        return <Badge variant={variant}>{s.charAt(0).toUpperCase() + s.slice(1)}</Badge>
      },
      width: '110px',
    },
    { key: 'joinDate', label: 'Joined', width: '140px' },
    ...(canWrite
      ? [{
          key: 'id' as keyof CustomerRow,
          label: '',
          width: '48px',
          render: (_value: unknown, row: CustomerRow) => (
            <button
              className="customers-page__delete-btn"
              onClick={() => removeCustomer(String(row.id))}
              title="Remove (local only)"
              aria-label={`Remove ${row.name}`}
            >
              ×
            </button>
          ),
        }]
      : []),
  ]

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddCustomer = (name: string, email: string, status: string) => {
    addCustomer({ name, email: email || '—', status })
    setShowAddForm(false)
  }

  const handleReset = () => {
    if (!window.confirm('Reset demo customer changes to baseline?')) return
    resetLocalChanges()
  }

  return (
    <main className="customers-page">
      <Container>
        <div className="customers-page__header">
          <div>
            <h1>Customers</h1>
            <p>
              {pagination
                ? `${allCustomers.length} customers`
                : 'Customer accounts for this workspace'}
              {isMock && <span className="customers-page__demo-badge">Demo data</span>}
            </p>
          </div>

          {/* Role-gated add button — assistant_manager+ */}
          {canWrite && !showAddForm && (
            <button
              className="customers-page__add-btn"
              onClick={() => setShowAddForm(true)}
            >
              + Add Demo Customer
            </button>
          )}
        </div>

        {/* Demo notice */}
        {!isMock && (
          <div className="customers-page__demo-notice">
            <strong>Live data</strong> from{' '}
            <code>{import.meta.env.VITE_API_URL}/customers</code>.{' '}
            Requires <strong>assistant_manager+</strong> role.
            Adds and deletions are <strong>local only</strong>.
            {hasLocalChanges && (
              <>
                {' '}
                <button className="customers-page__reset-link" onClick={handleReset}>
                  Reset local changes
                </button>
              </>
            )}
          </div>
        )}

        {/* Role restriction message for employees */}
        {isMock && user && !hasMinRole(user.role, 'assistant_manager') && (
          <div className="customers-page__role-notice">
            ℹ Your role (<strong>{user.role.replace(/_/g, ' ')}</strong>) does not have API access
            to customers. Showing demo data. Log in as <em>Supervisor</em> or <em>Owner</em> to see real records.
          </div>
        )}

        {/* Inline add form */}
        {showAddForm && canWrite && (
          <AddCustomerForm
            onAdd={handleAddCustomer}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Filters */}
        <div className="customers-page__filters">
          <input
            type="text"
            className="customers-page__search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="customers-page__status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="customers-page__table">
          <DataTable<CustomerRow>
            data={isLoading ? [] : (displayCustomers as CustomerRow[])}
            columns={columns}
            emptyMessage={isLoading ? 'Loading customers…' : 'No customers found'}
          />
        </div>

        {!isLoading && (
          <p className="customers-page__count">
            Showing {displayCustomers.length} of {allCustomers.length} customers
            {hasLocalChanges && (
              <span className="customers-page__local-count">
                {' '}· {allCustomers.filter((c) => String(c.id).startsWith('soft_')).length} local
              </span>
            )}
          </p>
        )}
      </Container>
    </main>
  )
}
