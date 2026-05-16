import { DemoBanner, Container } from '@/components'
import './HomePage.scss'

export function HomePage() {
  return (
    <main className="home-page">
      <DemoBanner />

      <section className="home-features" id="features">
        <Container>
          <div className="home-features__header">
            <h2>Powerful Features</h2>
            <p>Everything you need to run your service business efficiently</p>
          </div>
          <div className="home-features__grid">
            {[
              {
                title: 'Team Management',
                description: 'Organize, schedule, and empower your team',
              },
              {
                title: 'Customer Intelligence',
                description: 'Deep insights into customer behavior and preferences',
              },
              {
                title: 'Operations Hub',
                description: 'Streamline workflows and operational processes',
              },
              {
                title: 'Analytics & Reporting',
                description: 'Real-time metrics and actionable business intelligence',
              },
            ].map((feature) => (
              <div key={feature.title} className="home-features__card">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="home-footer-cta">
        <Container>
          <div className="home-footer-cta__content">
            <h2>Ready to transform your business?</h2>
            <p>Join hundreds of service businesses using SFG Showcase</p>
            <button className="home-footer-cta__button">Start Your Demo</button>
          </div>
        </Container>
      </section>
    </main>
  )
}
