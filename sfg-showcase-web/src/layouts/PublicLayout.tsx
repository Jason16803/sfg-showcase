import { Link } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { PublicNav } from '@/components'
import './PublicLayout.scss'

const FOOTER_NAV = [
  {
    heading: 'Product',
    links: [
      // /#features as a Link causes ScrollToTop to fire on pathname change
      // then hash is ignored. Routing to / correctly lands on the home page
      // where the features section is immediately visible.
      { label: 'Features',     to: '/'        },
      { label: 'How it works', to: '/about'   },
      { label: 'Pricing',      to: '/contact' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About',   to: '/about'   },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign in',        to: '/login'  },
      { label: 'Request access', to: '/signup' },
    ],
  },
]

export function PublicLayout() {
  return (
    <div className="public-layout">
      <PublicNav />
      <main className="public-layout__main">
        <Outlet />
      </main>

      <footer className="public-layout__footer">
        <div className="public-layout__footer-inner">

          {/* Brand column */}
          <div className="public-layout__footer-brand">
            <Link to="/" className="public-layout__footer-wordmark">SFG</Link>
            <p className="public-layout__footer-tagline">
              Service operations for field teams.<br />
              Multi-tenant · API-first · Beta
            </p>
            <p className="public-layout__footer-location">
              Tallahassee, FL &amp; Valdosta, GA
            </p>
            <div className="public-layout__footer-badges">
              <span className="public-layout__footer-badge">Open Beta</span>
              <span className="public-layout__footer-badge public-layout__footer-badge--teal">
                v0.4.0
              </span>
            </div>
          </div>

          {/* Nav columns */}
          {FOOTER_NAV.map((col) => (
            <div key={col.heading} className="public-layout__footer-col">
              <div className="public-layout__footer-col-heading">{col.heading}</div>
              <ul className="public-layout__footer-col-links">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="public-layout__footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom bar */}
        <div className="public-layout__footer-bottom">
          <p>&copy; {new Date().getFullYear()} SmithForgd. All rights reserved.</p>
          <p className="public-layout__footer-credits">
            Built by{' '}
            <a
              href="https://github.com/TWG-Projects"
              target="_blank"
              rel="noopener noreferrer"
              className="public-layout__footer-credit-link"
            >
              TWG Projects
            </a>
            {' '}&middot; SFG Showcase &mdash; Academic Portfolio Project
          </p>
        </div>
      </footer>
    </div>
  )
}
