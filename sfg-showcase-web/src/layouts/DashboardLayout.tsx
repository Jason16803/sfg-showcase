import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components'
import { rolePermissions } from '@/data/mockData'
import { authService } from '@/auth/service'
import './DashboardLayout.scss'

// ---------------------------------------------------------------------------
// Sections with wired routes in Week 3.
// A section NOT in this set renders as a non-interactive "Soon" label.
// Update this set as new routes/pages are added.
// ---------------------------------------------------------------------------
const IMPLEMENTED_ROUTES = new Set([
  'Dashboard',
  'Jobs',
  'Customers',
  'Team',
  'Settings',
  'Reports',
])

/**
 * DashboardLayout
 *
 * Sidebar nav is role-aware via rolePermissions[user.role].sections.
 * Active state driven by useLocation() (not window.location.pathname).
 * Nav uses <Link to=""> for SPA navigation — no full-page reloads.
 *
 * Sections in IMPLEMENTED_ROUTES → real <Link>.
 * Sections not in the set → non-interactive <span> with "Soon" badge.
 *
 * Frontend role-gating controls nav visibility only.
 * All access control is enforced on the backend via requireRole().
 */
export function DashboardLayout() {
  const { user } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

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

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-layout__sidebar">
        <div className="dashboard-layout__sidebar-header">
          <Link to="/dashboard" className="dashboard-layout__wordmark">SFG</Link>
          <Badge variant="primary">{roleConfig.label}</Badge>
        </div>

        <nav className="dashboard-layout__nav" aria-label="Dashboard navigation">
          <ul>
            {roleConfig.sections.map((section) => {
              const path     = `/${section.toLowerCase().replace(/\s+/g, '-')}`
              const isActive = location.pathname.startsWith(path) &&
                               (path === '/dashboard' ? location.pathname === '/dashboard' : true)
              const isReady  = IMPLEMENTED_ROUTES.has(section)

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
            })}
          </ul>
        </nav>

        <div className="dashboard-layout__sidebar-footer">
          <button className="dashboard-layout__logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      <div className="dashboard-layout__main-wrapper">
        <header className="dashboard-layout__header">
          <div className="dashboard-layout__header-content">
            <div className="dashboard-layout__header-text">
              <h1>Welcome back{user?.firstName ? `, ${user.firstName}` : ''}</h1>
              <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="dashboard-layout__header-user">
              <div className="dashboard-layout__user-avatar" aria-hidden="true">{initials}</div>
              <div>
                <p className="dashboard-layout__user-name">{displayName}</p>
                <p className="dashboard-layout__user-role">{roleConfig.label}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="dashboard-layout__main"><Outlet /></main>
      </div>
    </div>
  )
}
