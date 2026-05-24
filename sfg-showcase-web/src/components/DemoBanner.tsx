import { Link } from 'react-router-dom'
import { Button } from './Button'
import { Container } from './Container'
import './DemoBanner.scss'

const BAR_HEIGHTS = ['45%', '62%', '55%', '78%', '68%', '90%', '82%']

export function DemoBanner() {
  return (
    <section className="demo-banner">
      <Container>
        <div className="demo-banner__content">
          {/* ── Text side ─────────────────────────────────────────── */}
          <div className="demo-banner__text">
            <div className="demo-banner__eyebrow">
              <span className="demo-banner__eyebrow-dot" aria-hidden="true" />
              Now in Open Beta
            </div>

            <h1 className="demo-banner__title">
              Operations software built for{' '}
              <span className="demo-banner__title-accent">field teams</span>
            </h1>

            <p className="demo-banner__description">
              SmithForgd is a multi-tenant operations platform for service businesses —
              jobs, customers, invoicing, and team management in one unified dashboard.
            </p>

            <ul className="demo-banner__proof-list" aria-label="Key stats">
              <li><strong>180+</strong> service businesses</li>
              <li><strong>$2.4M</strong> invoices processed</li>
              <li><strong>99.8%</strong> uptime</li>
            </ul>

            <div className="demo-banner__actions">
              <Link to="/login">
                <Button variant="primary" size="lg">
                  Sign In to Dashboard
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="secondary" size="lg">
                  Learn more
                </Button>
              </Link>
            </div>

            <p className="demo-banner__hint">
              No credit card required &middot; Demo tenant available
            </p>
          </div>

          {/* ── Visual side ───────────────────────────────────────── */}
          <div className="demo-banner__visual" aria-hidden="true">
            <div className="demo-banner__dashboard-preview">
              {/* Window chrome */}
              <div className="demo-banner__window-chrome">
                <span /><span /><span />
              </div>

              {/* Header row */}
              <div className="demo-banner__preview-header">
                <div className="demo-banner__preview-title">Dashboard</div>
                <div className="demo-banner__preview-nav">
                  <span>Jobs</span>
                  <span>Customers</span>
                  <span>Team</span>
                </div>
              </div>

              {/* Metric cards */}
              <div className="demo-banner__preview-metrics">
                {[
                  { label: 'Revenue',     value: '$42,850' },
                  { label: 'Active Jobs', value: '12' },
                  { label: 'Customers',   value: '127' },
                  { label: 'On-Time',     value: '94%' },
                ].map(({ label, value }) => (
                  <div key={label} className="demo-banner__metric">
                    <div className="demo-banner__metric-label">{label}</div>
                    <div className="demo-banner__metric-value">{value}</div>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="demo-banner__preview-chart">
                {BAR_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="demo-banner__chart-bar"
                    style={{ height: h }}
                  />
                ))}
              </div>

              {/* Status row */}
              <div className="demo-banner__preview-status">
                <span className="demo-banner__status-dot demo-banner__status-dot--green" />
                <span>3 jobs in progress</span>
                <span className="demo-banner__status-dot demo-banner__status-dot--amber" />
                <span>2 estimates pending</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
