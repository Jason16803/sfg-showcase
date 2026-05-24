import { Container } from '@/components'
import './AboutPage.scss'

const VALUES = [
  {
    icon: '🏗️',
    title: 'Built to last',
    body: 'Every architectural decision is made with reliability, performance, and long-term maintainability in mind — not just the next sprint.',
  },
  {
    icon: '🤝',
    title: 'Operators first',
    body: 'We design for the people actually running the operations, not just the executives approving the budget. Field teams are first-class users.',
  },
  {
    icon: '🔐',
    title: 'Trust by default',
    body: 'Multi-tenant isolation, RBAC, and audit trails are not afterthoughts. They are baked into the architecture from day one.',
  },
  {
    icon: '⚡',
    title: 'Relentlessly iterative',
    body: 'We ship fast, learn from real usage, and improve constantly. Beta means we move with urgency — and that feedback shapes every release.',
  },
]

const TEAM = [
  {
    initials: 'JH',
    name: 'Jason Haire',
    role: 'Founder & CEO',
    bio: 'Built SFG from the ground up after watching service businesses struggle with fragmented, outdated operations tooling. Former field operations lead.',
  },
  {
    initials: 'SR',
    name: 'Samira Reyes',
    role: 'Head of Product',
    bio: 'Former field operations manager turned product leader. Knows exactly what operators need because she ran them.',
  },
  {
    initials: 'TW',
    name: 'Tyler Webb',
    role: 'Lead Engineer',
    bio: 'Full-stack systems engineer with deep experience in multi-tenant SaaS architecture, auth infrastructure, and developer tooling.',
  },
]

const STATS = [
  { val: '180+', label: 'Businesses onboarded' },
  { val: '$2.4M', label: 'Invoices processed' },
  { val: '99.8%', label: 'Uptime (90-day)' },
  { val: '4.8★', label: 'Average rating' },
]

export function AboutPage() {
  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <Container>
          <div className="about-hero__eyebrow">About SFG</div>
          <h1 className="about-hero__title">
            Operations software that works<br />as hard as you do.
          </h1>
          <p className="about-hero__sub">
            SmithForgd started as a tool to solve the real operational chaos we saw in service businesses.
            Today it&rsquo;s a platform powering field teams, franchises, and service operators across the country.
          </p>
        </Container>
      </section>

      {/* Mission + Stats */}
      <section className="about-mission">
        <Container>
          <div className="about-mission__layout">
            <div className="about-mission__text">
              <div className="about-mission__eyebrow">Our mission</div>
              <h2>Give every service business the operational edge of a Fortune 500.</h2>
              <p>
                The best HVAC company, landscaper, or home services team shouldn&rsquo;t lose to a bigger competitor
                just because they lack modern software. We believe every business — regardless of size — deserves
                the tools to run jobs, manage teams, and grow revenue.
              </p>
              <p>
                SmithForgd is built on that belief: clear workflows, real-time visibility, and a platform that
                gets out of your way.
              </p>
            </div>
            <div className="about-mission__stats">
              {STATS.map((s) => (
                <div key={s.val} className="about-mission__stat">
                  <div className="about-mission__stat-val">{s.val}</div>
                  <div className="about-mission__stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="about-values">
        <Container>
          <div className="about-values__header">
            <div className="about-values__eyebrow">What drives us</div>
            <h2>Our values</h2>
          </div>
          <div className="about-values__grid">
            {VALUES.map((v) => (
              <div key={v.title} className="about-values__card">
                <div className="about-values__card-icon">{v.icon}</div>
                <h3 className="about-values__card-title">{v.title}</h3>
                <p className="about-values__card-body">{v.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Team */}
      <section className="about-team">
        <Container>
          <div className="about-team__header">
            <div className="about-team__eyebrow">The team</div>
            <h2>Built by operators, for operators</h2>
          </div>
          <div className="about-team__grid">
            {TEAM.map((m) => (
              <div key={m.name} className="about-team__card">
                <div className="about-team__avatar">{m.initials}</div>
                <div className="about-team__name">{m.name}</div>
                <div className="about-team__role">{m.role}</div>
                <p className="about-team__bio">{m.bio}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  )
}
