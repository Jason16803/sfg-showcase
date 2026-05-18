import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components'
import { rolePermissions } from '@/data/mockData'
import { authService } from '@/auth/service'
import './DashboardLayout.scss'

/**
 * DashboardLayout
 *
 * Sidebar navigation is role-aware: sections shown are determined by the
 * authenticated user's role from the Zustand store.
 *
 * Frontend role-gating controls UI visibility only.
 * All access control enforcement happens on the backend via requireRole().
 */
export function DashboardLayout() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Resolve role from store; fall back to 'employee' (most restricted) if somehow
  // the user object is missing — ProtectedRoute should prevent this in practice.
  const userRole = (user?.role ?? 'employee') as keyof typeof rolePermissions

  // Guard: if role is not in the permission map, fall back to employee
  const roleConfig =
    rolePermissions[userRole] ?? rolePermissions['employee']

  // Derive display name and initials from store user
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'User'
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '??'

  const handleLogout = async () => {
    // authService.logout() clears backend refresh token + local store
    await authService.logout()
    navigate('/login')
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-layout__sidebar">
        <div className="dashboard-layout__sidebar-header">
          <h2>SFG</h2>
          <Badge variant="primary">{roleConfig.label}</Badge>
        </div>

        <nav className="dashboard-layout__nav">
          <ul>
            {roleConfig.sections.map((section) => {
              const href = `/${section.toLowerCase().replace(/\s+/g, '-')}`
              const isActive =
                section === 'Dashboard' &&
                window.location.pathname === '/dashboard'
              return (
                <li key={section}>
                  <a
                    href={href}
                    className={[
                      'dashboard-layout__nav-link',
                      isActive ? 'dashboard-layout__nav-link--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {section}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="dashboard-layout__sidebar-footer">
          {/* BACKEND ENFORCEMENT REQUIRED: logout clears refresh token via
              POST /api/v1/auth/logout. Client state is always cleared even
              if the server call fails. */}
          <button className="dashboard-layout__logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="dashboard-layout__main-wrapper">
        <header className="dashboard-layout__header">
          <div className="dashboard-layout__header-content">
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
              <div className="dashboard-layout__user-avatar">{initials}</div>
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
