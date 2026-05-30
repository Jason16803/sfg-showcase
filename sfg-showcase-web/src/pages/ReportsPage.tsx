import { Container } from '@/components'
import './ReportsPage.scss'

// Reports is a confirmed planned feature but has no backend endpoint yet.
// No API calls are made here — no fake data, no broken requests.
//
// TODO (Phase 4 / Floe integration): wire to:
//   - Floe: tenant revenue summary
//   - GET /api/v1/jobs/stats: job completion rates over time
//   - A future GET /api/v1/dashboard/reports endpoint

// Inline SVG icons — no emoji, no OS-dependent rendering
function IconRevenue()  { return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="20" height="20"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 5v1.5M10 13.5V15M7.5 8.5c0-1.1.9-2 2.5-2h0c1.4 0 2.5.9 2.5 2s-1.1 2-2.5 2-2.5.9-2.5 2c0 1.1.9 2 2.5 2h0c1.6 0 2.5-.9 2.5-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconJobs()     { return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="20" height="20"><rect x="3" y="6" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M7 6V5a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M7 11h6M7 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconCustomers(){ return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="20" height="20"><circle cx="7" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M2 17c0-2.8 2.2-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="14" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M9 17c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconTeam()     { return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="20" height="20"><circle cx="10" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 18c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M3.5 10h13M7 10v4M13 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconChart()    { return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="40" height="40"><rect x="3" y="12" width="3" height="5" rx="1" fill="currentColor" opacity=".4"/><rect x="8.5" y="8" width="3" height="9" rx="1" fill="currentColor" opacity=".65"/><rect x="14" y="4" width="3" height="13" rx="1" fill="currentColor"/><path d="M2 18h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> }

const PLANNED_REPORTS = [
  {
    Icon: IconRevenue,
    title: 'Revenue Report',
    description: 'Monthly and quarterly revenue breakdown by customer and service type.',
    source: 'Floe financial API',
  },
  {
    Icon: IconJobs,
    title: 'Job Completion Report',
    description: 'On-time completion rates, average job duration, and status trends.',
    source: 'GET /api/v1/jobs/stats',
  },
  {
    Icon: IconCustomers,
    title: 'Customer Activity Report',
    description: 'New customer acquisition, churn, and lifetime value trends.',
    source: 'GET /api/v1/customers',
  },
  {
    Icon: IconTeam,
    title: 'Team Performance Report',
    description: 'Jobs completed per team member, response times, and workload distribution.',
    source: 'GET /api/v1/team',
  },
]

export function ReportsPage() {
  return (
    <div className="reports-page">
      <Container>
        <div className="reports-page__header">
          <h1>Reports</h1>
          <p>Analytics and reporting for your workspace</p>
        </div>

        <div className="reports-page__coming-soon">
          <div className="reports-page__icon" aria-hidden="true">
            <IconChart />
          </div>
          <h2>Reports coming soon</h2>
          <p>
            Reporting is in active development. The data sources are already wired —
            report views will be added in a future release.
          </p>
        </div>

        <div className="reports-page__planned">
          <h3>Planned reports</h3>
          <ul className="reports-page__planned-list">
            {PLANNED_REPORTS.map(({ Icon, title, description, source }) => (
              <li key={title} className="reports-page__planned-item">
                <span className="reports-page__planned-icon" aria-hidden="true">
                  <Icon />
                </span>
                <div>
                  <p className="reports-page__planned-title">{title}</p>
                  <p className="reports-page__planned-desc">{description}</p>
                  <p className="reports-page__planned-source">Source: {source}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </div>
  )
}
