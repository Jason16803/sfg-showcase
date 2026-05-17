import { Link } from 'react-router-dom'
import './PublicNav.scss'

export function PublicNav() {
  return (
    <nav className="public-nav">
      <div className="public-nav__container">
        <Link to="/" className="public-nav__logo">
          <span className="public-nav__logo-text">SFG</span>
        </Link>
        <ul className="public-nav__links">
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
          <li>
            <Link to="/showcase-dashboard" className="public-nav__preview-link">
              View Dashboard Preview
            </Link>
          </li>
        </ul>
        <div className="public-nav__actions">
          <Link to="/login" className="public-nav__link">
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  )
}
