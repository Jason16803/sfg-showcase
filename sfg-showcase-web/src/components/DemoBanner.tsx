import { Button } from './Button'
import { Container } from './Container'
import './DemoBanner.scss'

export function DemoBanner() {
  return (
    <section className="demo-banner">
      <Container>
        <div className="demo-banner__content">
          <div className="demo-banner__text">
            <h1 className="demo-banner__title">
              Enterprise SaaS for Modern Service Businesses
            </h1>
            <p className="demo-banner__description">
              Streamline operations, empower your team, and delight customers with
              our integrated platform. Built for scale, designed for simplicity.
            </p>
            <div className="demo-banner__actions">
              <Button variant="primary" size="lg">
                Start Demo
              </Button>
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </div>
          </div>
          <div className="demo-banner__visual">
            <div className="demo-banner__placeholder">
              <svg
                viewBox="0 0 400 300"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
              >
                <rect width="400" height="300" fill="url(#gradient)" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                <text
                  x="200"
                  y="150"
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="20"
                  fontWeight="500"
                >
                  Dashboard Preview
                </text>
              </svg>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
