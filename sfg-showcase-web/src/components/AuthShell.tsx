import type { ReactNode, CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import './AuthShell.scss'

interface AuthShellProps {
  children: ReactNode
  /** Width cap on the card column. Defaults to 420px (login). */
  maxWidth?: number
}

/**
 * AuthShell
 *
 * Shared ambient canvas for all auth pages (login, signup, OAuth callback,
 * protected-route loading). Provides:
 *
 *   - Full-height dark atmospheric background with radial glows
 *   - Subtle SVG dot-grid overlay (enterprise command-center quality)
 *   - Entrance animation: 220ms ease-out opacity + translateY
 *   - Wordmark link back to home
 *   - Bottom context line
 *
 * Does NOT contain any auth logic, form state, or navigation.
 * Auth logic lives entirely in the page components.
 */
export function AuthShell({ children, maxWidth = 420 }: AuthShellProps) {
  return (
    <div className="auth-shell">
      {/* Ambient background layers — rendered via CSS, not DOM */}

      {/* SVG dot-grid overlay — subtle enterprise texture */}
      <svg
        className="auth-shell__grid"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <pattern
            id="auth-grid-dots"
            x="0"
            y="0"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.75" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid-dots)" />
      </svg>

      {/* Top chrome bar */}
      <header className="auth-shell__chrome">
        <Link to="/" className="auth-shell__wordmark" aria-label="Back to home">
          SFG
        </Link>
        <span className="auth-shell__chrome-badge">
          <span className="auth-shell__chrome-dot" aria-hidden="true" />
          Open Beta
        </span>
      </header>

      {/* Card column */}
      <main className="auth-shell__main" style={{ '--auth-max-width': `${maxWidth}px` } as CSSProperties}>
        <div className="auth-shell__card-wrapper">
          {children}
        </div>
      </main>

      {/* Bottom context */}
      <footer className="auth-shell__footer">
        <p>
          SmithForgd &mdash; Service Operations Platform
          &nbsp;&middot;&nbsp;
          <Link to="/about" className="auth-shell__footer-link">About</Link>
          &nbsp;&middot;&nbsp;
          <Link to="/contact" className="auth-shell__footer-link">Contact</Link>
        </p>
      </footer>
    </div>
  )
}
