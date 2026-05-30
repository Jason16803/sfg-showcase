import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import './NotFoundPage.scss'

/**
 * NotFoundPage
 *
 * Rendered by the wildcard route (`path="*"`) for any URL that does not
 * match a defined route. Replaces the previous silent redirect to `/`.
 *
 * Auth-aware: if the user is authenticated, a Dashboard link is offered.
 * This page is NOT wrapped by PublicLayout or DashboardLayout — it is
 * intentionally standalone so it works from any context (public, auth,
 * dashboard subpath, etc.) without nav confusion.
 */

function NotFoundGraphic() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className="not-found__graphic"
    >
      {/* Outer dashed ring — suggests "out of bounds" */}
      <circle
        cx="60" cy="60" r="52"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="8 5"
        opacity="0.15"
      />
      {/* Mid ring */}
      <circle
        cx="60" cy="60" r="36"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.1"
      />
      {/* Question mark — body */}
      <path
        d="M51 47c0-5 4-9 9-9s9 4 9 9c0 3.5-2.2 6.5-5.5 8C61.6 56.6 60 58.5 60 61v4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Question mark — dot */}
      <circle cx="60" cy="72" r="3" fill="currentColor" />
    </svg>
  )
}

export function NotFoundPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <div className="not-found">
      {/* Minimal chrome — just wordmark, no full nav */}
      <header className="not-found__header">
        <Link to="/" className="not-found__wordmark" aria-label="SFG home">
          SFG
        </Link>
      </header>

      {/* Main content */}
      <main className="not-found__main">
        <div className="not-found__card">

          <div className="not-found__graphic-wrap">
            <NotFoundGraphic />
          </div>

          <div className="not-found__code" aria-hidden="true">404</div>

          <div className="not-found__text">
            <h1 className="not-found__title">Page not found</h1>
            <p className="not-found__body">
              The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
              Check the URL, or use one of the links below to get back on track.
            </p>
          </div>

          <div className="not-found__actions">
            {/* Primary: context-aware based on auth state */}
            {isAuthenticated ? (
              <Link to="/dashboard" className="not-found__btn not-found__btn--primary">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/" className="not-found__btn not-found__btn--primary">
                Back to Home
              </Link>
            )}

            {/* Secondary: sign in or home depending on auth state */}
            {isAuthenticated ? (
              <Link to="/" className="not-found__btn not-found__btn--secondary">
                Public site
              </Link>
            ) : (
              <Link to="/login" className="not-found__btn not-found__btn--secondary">
                Sign In
              </Link>
            )}

            {/* Tertiary: always available */}
            <Link to="/contact" className="not-found__link">
              Contact us
            </Link>
          </div>

        </div>
      </main>

      {/* Minimal footer */}
      <footer className="not-found__footer">
        <p>
          SmithForgd &mdash; Service Operations Platform
          &nbsp;&middot;&nbsp;
          <Link to="/about" className="not-found__footer-link">About</Link>
        </p>
      </footer>
    </div>
  )
}
