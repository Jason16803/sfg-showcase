import { Outlet } from 'react-router-dom'

export function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
      </header>
      <nav className="dashboard-nav">
        <ul>
          <li><a href="/dashboard">Home</a></li>
        </ul>
      </nav>
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  )
}
