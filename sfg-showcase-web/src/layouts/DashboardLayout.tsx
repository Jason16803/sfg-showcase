import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import './DashboardLayout.scss'

export function DashboardLayout() {
  const { logout } = useAuthStore()

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-layout__sidebar">
        <div className="dashboard-layout__sidebar-header">
          <h2>SFG</h2>
        </div>
        <nav className="dashboard-layout__nav">
          <ul>
            <li>
              <a href="/dashboard" className="dashboard-layout__nav-link">
                Dashboard
              </a>
            </li>
            <li>
              <a href="#" className="dashboard-layout__nav-link">
                Customers
              </a>
            </li>
            <li>
              <a href="#" className="dashboard-layout__nav-link">
                Operations
              </a>
            </li>
            <li>
              <a href="#" className="dashboard-layout__nav-link">
                Team
              </a>
            </li>
            <li>
              <a href="#" className="dashboard-layout__nav-link">
                Reports
              </a>
            </li>
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
            <h1>Welcome</h1>
          </div>
        </header>
        <main className="dashboard-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
