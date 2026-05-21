import { Link } from 'react-router-dom'
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
              <Link to="/login">
                <Button variant="primary" size="lg">
                  Sign In to Dashboard
                </Button>
              </Link>
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </div>
          </div>
          <div className="demo-banner__visual">
            <div className="demo-banner__dashboard-preview">
              <div className="demo-banner__preview-header">
                <div className="demo-banner__preview-title">Dashboard</div>
                <div className="demo-banner__preview-nav">
                  <span className="demo-banner__preview-nav-item">Customers</span>
                  <span className="demo-banner__preview-nav-item">Jobs</span>
                </div>
              </div>
              <div className="demo-banner__preview-metrics">
                <div className="demo-banner__metric">
                  <div className="demo-banner__metric-label">Revenue</div>
                  <div className="demo-banner__metric-value">$42,850</div>
                </div>
                <div className="demo-banner__metric">
                  <div className="demo-banner__metric-label">Active Jobs</div>
                  <div className="demo-banner__metric-value">12</div>
                </div>
                <div className="demo-banner__metric">
                  <div className="demo-banner__metric-label">Customers</div>
                  <div className="demo-banner__metric-value">127</div>
                </div>
                <div className="demo-banner__metric">
                  <div className="demo-banner__metric-label">On-Time Rate</div>
                  <div className="demo-banner__metric-value">94%</div>
                </div>
              </div>
              <div className="demo-banner__preview-chart">
                <div className="demo-banner__chart-bar" style={{ height: '60%' }} />
                <div className="demo-banner__chart-bar" style={{ height: '75%' }} />
                <div className="demo-banner__chart-bar" style={{ height: '85%' }} />
                <div className="demo-banner__chart-bar" style={{ height: '70%' }} />
                <div className="demo-banner__chart-bar" style={{ height: '90%' }} />
                <div className="demo-banner__chart-bar" style={{ height: '95%' }} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
