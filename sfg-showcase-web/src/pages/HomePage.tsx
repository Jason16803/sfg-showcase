import { Link } from 'react-router-dom'
import { DemoBanner, Container, Button } from '@/components'
import './HomePage.scss'

// Feature cards — concrete copy, icon accent colors
const FEATURES = [
  {
    icon: 'M',   // wrench / maintenance
    accent: 'primary',
    title: 'Job & Work Order Management',
    description:
      'Create, assign, schedule, and close jobs in real time. Full status history from estimate to closed — visible to everyone on the team.',
  },
  {
    icon: 'C',
    accent: 'info',
    title: 'Customer Database',
    description:
      'Centralised customer records with contact details, job history, and status tracking. Know every account at a glance, every time.',
  },
  {
    icon: 'T',
    accent: 'success',
    title: 'Team & Role Management',
    description:
      'Assign roles — Owner, Manager, Employee — with scoped access per user. Built-in RBAC means the right people see the right data.',
  },
  {
    icon: 'A',
    accent: 'warning',
    title: 'Analytics & Reporting',
    description:
      'Revenue trends, job completion rates, and customer growth metrics — all in one dashboard. Decision-ready data, not spreadsheets.',
  },
]

export function HomePage() {
  return (
    <div className="home-page">
      <DemoBanner />

      {/* ── Features section ─────────────────────────────────────── */}
      <section className="home-features" id="features">
        <Container>
          <div className="home-features__header">
            <div className="home-features__eyebrow">Platform capabilities</div>
            <h2>Built for the way field teams actually work</h2>
            <p>
              Every feature in SFG exists because someone running a service business
              needed it yesterday.
            </p>
          </div>
          <div className="home-features__grid">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className={`home-features__card home-features__card--${feature.accent}`}
              >
                <div className={`home-features__card-icon home-features__card-icon--${feature.accent}`}>
                  {/* Decorative letter glyph as icon stand-in */}
                  <span aria-hidden="true">{feature.icon}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Social proof strip ───────────────────────────────────── */}
      <section className="home-proof">
        <Container>
          <div className="home-proof__grid">
            {[
              { val: '180+',  label: 'Service businesses' },
              { val: '$2.4M', label: 'Invoices processed'  },
              { val: '99.8%', label: 'Platform uptime'     },
              { val: '4.8★',  label: 'Average rating'      },
            ].map(({ val, label }) => (
              <div key={val} className="home-proof__item">
                <div className="home-proof__val">{val}</div>
                <div className="home-proof__label">{label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────── */}
      <section className="home-footer-cta">
        <Container>
          <div className="home-footer-cta__content">
            <div className="home-footer-cta__eyebrow">Ready to get started?</div>
            <h2>Stop managing operations in spreadsheets.</h2>
            <p>
              SFG Showcase is live and accepting demo access requests.
              Explore a real multi-tenant workspace with sample jobs,
              customers, and team members already seeded.
            </p>
            <div className="home-footer-cta__actions">
              <Link to="/login">
                <Button variant="primary" size="lg">
                  Start your demo
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="lg">
                  Talk to us first
                </Button>
              </Link>
            </div>
            <p className="home-footer-cta__hint">
              No credit card &middot; No commitment &middot; Demo tenant pre-seeded
            </p>
          </div>
        </Container>
      </section>
    </div>
  )
}
