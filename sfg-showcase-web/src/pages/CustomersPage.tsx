import { useState } from 'react'
import { Container, DataTable, Badge } from '@/components'
import { useCustomers } from '@/features/dashboard/hooks'
import type { Column } from '@/components'
import type { DashboardCustomer } from '@/features/dashboard/dashboard.types'
import './CustomersPage.scss'

type CustomerRow = DashboardCustomer & Record<string, unknown>

const columns: Column<CustomerRow>[] = [
  { key: 'name',     label: 'Customer Name' },
  { key: 'email',    label: 'Email' },
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
]

export function CustomersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { items, pagination, isLoading, isMock } = useCustomers({
    limit: 50,
    search: search || undefined,
    status: statusFilter || undefined,
  })

  // BACKEND ENFORCEMENT: assistant_manager+ enforced via requireRole on backend.
  // Frontend visibility is role-gated in the sidebar nav (rolePermissions).
  // This page shows mock data for roles below assistant_manager — it will not crash.

  return (
    <main className="customers-page">
      <Container>
        <div className="customers-page__header">
          <div>
            <h1>Customers</h1>
            <p>
              {pagination
                ? `${pagination.total} total customers`
                : 'Customer accounts for this workspace'}
              {isMock && <span className="customers-page__demo-badge">Demo data</span>}
            </p>
          </div>
        </div>

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
            data={isLoading ? [] : (items as CustomerRow[])}
            columns={columns}
            emptyMessage={isLoading ? 'Loading customers…' : 'No customers found'}
          />
        </div>

        {pagination && !isLoading && (
          <p className="customers-page__count">
            Showing {items.length} of {pagination.total} customers
          </p>
        )}
      </Container>
    </main>
  )
}
