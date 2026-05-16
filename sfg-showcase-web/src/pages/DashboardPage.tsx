import { Container } from '@/components'
import './DashboardPage.scss'

export function DashboardPage() {
  return (
    <main className="dashboard-page">
      <Container>
        <div className="dashboard-page__header">
          <h1>Dashboard</h1>
          <p>Welcome to your SFG workspace</p>
        </div>

        <div className="dashboard-page__grid">
          <div className="dashboard-page__widget">
            <div className="dashboard-page__widget-header">
              <h3>Total Revenue</h3>
            </div>
            <div className="dashboard-page__widget-content">
              <div className="dashboard-page__stat">$0</div>
              <p className="dashboard-page__stat-label">This month</p>
            </div>
          </div>

          <div className="dashboard-page__widget">
            <div className="dashboard-page__widget-header">
              <h3>Active Orders</h3>
            </div>
            <div className="dashboard-page__widget-content">
              <div className="dashboard-page__stat">0</div>
              <p className="dashboard-page__stat-label">In progress</p>
            </div>
          </div>

          <div className="dashboard-page__widget">
            <div className="dashboard-page__widget-header">
              <h3>Team Members</h3>
            </div>
            <div className="dashboard-page__widget-content">
              <div className="dashboard-page__stat">0</div>
              <p className="dashboard-page__stat-label">Active</p>
            </div>
          </div>

          <div className="dashboard-page__widget">
            <div className="dashboard-page__widget-header">
              <h3>Customer Satisfaction</h3>
            </div>
            <div className="dashboard-page__widget-content">
              <div className="dashboard-page__stat">N/A</div>
              <p className="dashboard-page__stat-label">No data</p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  )
}
