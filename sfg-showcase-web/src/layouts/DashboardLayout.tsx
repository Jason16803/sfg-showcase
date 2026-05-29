import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useDemoStore } from '@/store/demoStore'
import { Badge } from '@/components'
import { rolePermissions } from '@/data/mockData'
import { authService } from '@/auth/service'
import './DashboardLayout.scss'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const IMPLEMENTED_ROUTES = new Set([
  'Dashboard',
  'Jobs',
  'Customers',
  'Team',
  'Settings',
  'Reports',
])

// ---------------------------------------------------------------------------
// renderNavLinks — plain function, NOT a React component.
//
// Returns the nav <li> elements for a given section list.
// Extracting this at module level avoids the react/no-unstable-nested-components
// ESLint warning that fires when a component is defined inside another
// component's render function (which causes it to be re-created every render).
//
// Receives reactive values as arguments instead of closing over them.
// ---------------------------------------------------------------------------

function renderNavLinks(sections: string[], currentPath: string) {
  return sections.map((section) => {
    const path     = `/${section.toLowerCase().replace(/\s+/g, '-')}`
    const isActive =
      currentPath.startsWith(path) &&
      (path === '/dashboard' ? currentPath === '/dashboard' : true)
    const isReady = IMPLEMENTED_ROUTES.has(section)

    return (
      <li key={section}>
        {isReady ? (
          <Link
            to={path}
            className={[
              'dashboard-layout__nav-link',
              isActive ? 'dashboard-layout__nav-link--active' : '',
            ].filter(Boolean).join(' ')}
          >
            {section}
          </Link>
        ) : (
          <span
            className="dashboard-layout__nav-link dashboard-layout__nav-link--pending"
            title={`${section} — coming in a future release`}
          >
            {section}
            <span className="dashboard-layout__nav-soon">Soon</span>
          </span>
        )}
      </li>
    )
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DashboardLayout() {
  const { user } = useAuthStore()
  const { hasLocalChanges, resetLocalChanges } = useDemoStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileNavOpen,   setMobileNavOpen]   = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  const userRole    = (user?.role ?? 'employee') as keyof typeof rolePermissions
  const roleConfig  = rolePermissions[userRole] ?? rolePermissions['employee']
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'User'
  const initials    = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '??'

  const handleLogout = async () => {
    await authService.logout()
    navigate('/login')
  }

  const handleResetDemo = () => {
    resetLocalChanges()
    setConfirmingReset(false)
  }

  return (
    <div className="dashboard-layout">

      {/* ── Demo mode strip — sticky across full width ─────────── */}
      <div className="dashboard-layout__demo-strip">
        <span className="dashboard-layout__demo-label">DEMO</span>
        <span className="dashboard-layout__demo-info">
          Tenant&nbsp;<code>{user?.tenantId ?? '—'}</code>
          &nbsp;&middot;&nbsp;Writes are local only
        </span>
        {hasLocalChanges && !confirmingReset && (
          <button
            className="dashboard-layout__demo-reset"
            onClick={() => setConfirmingReset(true)}
            title="Reset local demo changes"
          >
            ↺ Reset changes
          </button>
        )}
        {confirmingReset && (
          <span className="dashboard-layout__demo-confirm">
            Reset all local changes?&nbsp;
            <button
              className="dashboard-layout__demo-confirm-btn dashboard-layout__demo-confirm-btn--yes"
              onClick={handleResetDemo}
            >
              Yes, reset
            </button>
            <button
              className="dashboard-layout__demo-confirm-btn"
              onClick={() => setConfirmingReset(false)}
            >
              Cancel
            </button>
          </span>
        )}
      </div>

      {/* ── Desktop sidebar ───────────────────────────────────── */}
      <aside className="dashboard-layout__sidebar">
        <div className="dashboard-layout__sidebar-header">
          <Link to="/dashboard" className="dashboard-layout__wordmark">SFG</Link>
          <Badge variant="primary">{roleConfig.label}</Badge>
        </div>

        <nav className="dashboard-layout__nav" aria-label="Dashboard navigation">
          <ul>{renderNavLinks(roleConfig.sections, location.pathname)}</ul>
        </nav>

        <div className="dashboard-layout__sidebar-footer">
          <button className="dashboard-layout__logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile nav overlay ──────────────────────────────────── */}
      {mobileNavOpen && (
        <div
          className="dashboard-layout__mobile-overlay"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile nav drawer ───────────────────────────────────── */}
      <aside
        className={[
          'dashboard-layout__mobile-drawer',
          mobileNavOpen ? 'dashboard-layout__mobile-drawer--open' : '',
        ].filter(Boolean).join(' ')}
        aria-label="Mobile navigation"
        aria-hidden={!mobileNavOpen}
      >
        <div className="dashboard-layout__mobile-drawer-header">
          <Link to="/dashboard" className="dashboard-layout__wordmark">SFG</Link>
          <button
            className="dashboard-layout__mobile-close"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>
        <div className="dashboard-layout__mobile-role">
          <Badge variant="primary">{roleConfig.label}</Badge>
        </div>
        <nav className="dashboard-layout__nav" aria-label="Mobile navigation">
          <ul>{renderNavLinks(roleConfig.sections, location.pathname)}</ul>
        </nav>
        <div className="dashboard-layout__sidebar-footer">
          <button className="dashboard-layout__logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content area ──────────────────────────────────── */}
      <div className="dashboard-layout__main-wrapper">
        <header className="dashboard-layout__header">
          <div className="dashboard-layout__header-content">
            {/* Hamburger — mobile only */}
            <button
              className="dashboard-layout__hamburger"
              onClick={() => setMobileNavOpen(true)}
              aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav-drawer"
            >
              <span />
              <span />
              <span />
            </button>

            <div className="dashboard-layout__header-text">
              <h1>Welcome back{user?.firstName ? `, ${user.firstName}` : ''}</h1>
              <p>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="dashboard-layout__header-user">
              <div className="dashboard-layout__user-avatar" aria-hidden="true">
                {initials}
              </div>
              <div>
                <p className="dashboard-layout__user-name">{displayName}</p>
                <p className="dashboard-layout__user-role">{roleConfig.label}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
