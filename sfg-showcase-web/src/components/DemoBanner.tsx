import { Link } from 'react-router-dom'
import { Button } from './Button'
import { Container } from './Container'
import './DemoBanner.scss'

// Revenue curve data — 6 months, normalised to 0-100 for the SVG viewport
// Mirrors the mock data in Charts.tsx: 28400 → 47300
const CURVE_POINTS = [
  { x: 0,   y: 72 },
  { x: 20,  y: 62 },
  { x: 40,  y: 48 },
  { x: 60,  y: 54 },
  { x: 80,  y: 36 },
  { x: 100, y: 20 },
]

// Build a smooth SVG path from the points (cubic bezier)
function buildCurvePath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return ''
  const scale = (x: number, y: number) =>
    `${(x / 100) * 460},${(y / 100) * 72}`

  let d = `M ${scale(pts[0].x, pts[0].y)}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const cpx  = ((prev.x + curr.x) / 2 / 100) * 460
    const cpy1 = (prev.y / 100) * 72
    const cpy2 = (curr.y / 100) * 72
    d += ` C ${cpx},${cpy1} ${cpx},${cpy2} ${scale(curr.x, curr.y)}`
  }
  return d
}

const CURVE_PATH = buildCurvePath(CURVE_POINTS)
// Area fill — close the path to baseline
const AREA_PATH  = `${CURVE_PATH} L 460,72 L 0,72 Z`

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

          {/* ── Visual side — dashboard product preview ───────────── */}
          <div className="demo-banner__visual" aria-hidden="true">
            <div className="demo-banner__dashboard-preview">

              {/* Window chrome */}
              <div className="demo-banner__window-chrome">
                <span /><span /><span />
                <div className="demo-banner__window-title">SmithForgd — Dashboard</div>
              </div>

              {/* Mini navigation */}
              <div className="demo-banner__preview-header">
                <div className="demo-banner__preview-title">Dashboard</div>
                <div className="demo-banner__preview-nav">
                  <span className="demo-banner__preview-nav-active">Overview</span>
                  <span>Jobs</span>
                  <span>Customers</span>
                </div>
              </div>

              {/* KPI metric cards */}
              <div className="demo-banner__preview-metrics">
                {[
                  { label: 'Revenue',     value: '$42,850', trend: '+12%', up: true  },
                  { label: 'Active Jobs', value: '12',      trend: '+3',   up: true  },
                  { label: 'Customers',   value: '127',     trend: '+8%',  up: true  },
                  { label: 'On-Time',     value: '94%',     trend: '−1%',  up: false },
                ].map(({ label, value, trend, up }) => (
                  <div key={label} className="demo-banner__metric">
                    <div className="demo-banner__metric-label">{label}</div>
                    <div className="demo-banner__metric-value">{value}</div>
                    <div className={`demo-banner__metric-trend ${up ? 'demo-banner__metric-trend--up' : 'demo-banner__metric-trend--down'}`}>
                      {trend}
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue SVG area chart */}
              <div className="demo-banner__preview-chart">
                <div className="demo-banner__chart-label">Revenue Trend</div>
                <svg
                  viewBox="0 0 460 80"
                  preserveAspectRatio="none"
                  className="demo-banner__chart-svg"
                  role="img"
                  aria-label="Revenue trend chart"
                >
                  <defs>
                    <linearGradient id="heroAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#60a5fa" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <path d={AREA_PATH} fill="url(#heroAreaGrad)" />
                  {/* Stroke line */}
                  <path
                    d={CURVE_PATH}
                    fill="none"
                    stroke="#93c5fd"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Target dashed line */}
                  <line
                    x1="0" y1="44" x2="460" y2="28"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    opacity="0.7"
                  />
                </svg>
              </div>

              {/* Status strip */}
              <div className="demo-banner__preview-status">
                <span className="demo-banner__status-dot demo-banner__status-dot--green" />
                <span>3 jobs in progress</span>
                <span className="demo-banner__status-dot demo-banner__status-dot--amber" />
                <span>2 estimates pending</span>
                <span className="demo-banner__preview-status-spacer" />
                <span className="demo-banner__preview-badge">Live</span>
              </div>

            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
