import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import './PublicNav.scss'

export function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled,   setScrolled]   = useState(false)
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Scroll shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <nav className={['public-nav', scrolled ? 'public-nav--scrolled' : ''].filter(Boolean).join(' ')}>
        <div className="public-nav__container">
          <Link to="/" className="public-nav__logo">
            <span className="public-nav__logo-text">SFG</span>
          </Link>

          {/* Desktop links */}
          <ul className="public-nav__links">
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  ['public-nav__nav-link', isActive ? 'public-nav__nav-link--active' : ''].filter(Boolean).join(' ')
                }
              >
                About
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  ['public-nav__nav-link', isActive ? 'public-nav__nav-link--active' : ''].filter(Boolean).join(' ')
                }
              >
                Contact
              </NavLink>
            </li>
          </ul>

          <div className="public-nav__actions">
            <Link to="/login" className="public-nav__link">Sign In</Link>

            {/* Hamburger — mobile only */}
            <button
              className="public-nav__hamburger"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <span className={mobileOpen ? 'public-nav__hamburger-line--open' : ''} />
              <span className={mobileOpen ? 'public-nav__hamburger-line--open' : ''} />
              <span className={mobileOpen ? 'public-nav__hamburger-line--open' : ''} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="public-nav__mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={['public-nav__mobile-drawer', mobileOpen ? 'public-nav__mobile-drawer--open' : ''].filter(Boolean).join(' ')}
      >
        <ul className="public-nav__mobile-links">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                ['public-nav__mobile-link', isActive ? 'public-nav__mobile-link--active' : ''].filter(Boolean).join(' ')
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                ['public-nav__mobile-link', isActive ? 'public-nav__mobile-link--active' : ''].filter(Boolean).join(' ')
              }
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                ['public-nav__mobile-link', isActive ? 'public-nav__mobile-link--active' : ''].filter(Boolean).join(' ')
              }
            >
              Contact
            </NavLink>
          </li>
        </ul>
        <div className="public-nav__mobile-footer">
          <Link to="/login" className="public-nav__mobile-cta">Sign In</Link>
        </div>
      </div>
    </>
  )
}
