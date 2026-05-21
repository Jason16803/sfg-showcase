import { Container } from '@/components'
import './ReportsPage.scss'

// Reports is a confirmed planned feature but has no backend endpoint yet.
// No API calls are made here — no fake data, no broken requests.
//
// TODO (Phase 4 / Floe integration): wire to:
//   - Floe: tenant revenue summary
//   - GET /api/v1/jobs/stats: job completion rates over time
//   - A future GET /api/v1/dashboard/reports endpoint

const PLANNED_REPORTS = [
  {
    icon: '💰',
    title: 'Revenue Report',
    description: 'Monthly and quarterly revenue breakdown by customer and service type.',
    source: 'Floe financial API',
  },
  {
    icon: '📋',
    title: 'Job Completion Report',
    description: 'On-time completion rates, average job duration, and status trends.',
    source: 'GET /api/v1/jobs/stats',
  },
  {
    icon: '👥',
    title: 'Customer Activity Report',
    description: 'New customer acquisition, churn, and lifetime value trends.',
    source: 'GET /api/v1/customers',
  },
  {
    icon: '🏆',
    title: 'Team Performance Report',
    description: 'Jobs completed per team member, response times, and workload distribution.',
    source: 'GET /api/v1/team',
  },
]

export function ReportsPage() {
  return (
    <main className="reports-page">
      <Container>
        <div className="reports-page__header">
          <h1>Reports</h1>
          <p>Analytics and reporting for your workspace</p>
        </div>

        <div className="reports-page__coming-soon">
          <div className="reports-page__icon" aria-hidden="true">📊</div>
          <h2>Reports coming soon</h2>
          <p>
            Reporting is in active development. The data sources are already wired —
            report views will be added in a future release.
          </p>
        </div>

        <div className="reports-page__planned">
          <h3>Planned reports</h3>
          <ul className="reports-page__planned-list">
            {PLANNED_REPORTS.map((r) => (
              <li key={r.title} className="reports-page__planned-item">
                <span className="reports-page__planned-icon" aria-hidden="true">{r.icon}</span>
                <div>
                  <p className="reports-page__planned-title">{r.title}</p>
                  <p className="reports-page__planned-desc">{r.description}</p>
                  <p className="reports-page__planned-source">Source: {r.source}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </main>
  )
}
