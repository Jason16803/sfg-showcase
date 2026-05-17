import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components'
import { rolePermissions } from '@/data/mockData'
import './DashboardLayout.scss'

export function DashboardLayout() {
  const { logout } = useAuthStore()
  const userRole = 'owner'
  const roleConfig = rolePermissions[userRole as keyof typeof rolePermissions]

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
              const isActive = section === 'Dashboard' && window.location.pathname === '/dashboard'
              return (
                <li key={section}>
                  <a
                    href={href}
                    className={`dashboard-layout__nav-link ${isActive ? 'dashboard-layout__nav-link--active' : ''}`}
                  >
                    {section}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="dashboard-layout__sidebar-footer">
          <button
            className="dashboard-layout__logout"
            onClick={logout}
          >
            Sign Out
          </button>
        </div>
      </aside>

      <div className="dashboard-layout__main-wrapper">
        <header className="dashboard-layout__header">
          <div className="dashboard-layout__header-content">
            <div className="dashboard-layout__header-text">
              <h1>Welcome back</h1>
              <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="dashboard-layout__header-user">
              <div className="dashboard-layout__user-avatar">JD</div>
              <div>
                <p className="dashboard-layout__user-name">Jane Doe</p>
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
