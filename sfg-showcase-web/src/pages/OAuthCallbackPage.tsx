import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '@/auth/service'
import { useAuthStore } from '@/store/authStore'
import { parseOAuthCallback, oauthErrorInfo } from '@/utils/oauth.utils'
import type { OAuthErrorInfo, RecoveryAction } from '@/utils/oauth.utils'
import { AuthShell } from '@/components'
import './OAuthCallbackPage.scss'

/**
 * OAuthCallbackPage
 *
 * Landing page after SFO Core completes the Google OAuth exchange.
 *
 * ── Happy-path flow ───────────────────────────────────────────────────────
 *
 * 1. User clicks "Continue with Google" on /login or /signup
 *    → browser redirects to GET ${VITE_API_URL}/auth/google
 *
 * 2. SFO Core redirects to Google consent screen
 *    (backend owns the redirect_uri pointing to its own callback route)
 *
 * 3. Google redirects to SFO Core's server callback
 *    SFO Core: exchanges code → finds user → issues JWT → redirects to frontend:
 *      ${FRONTEND_ORIGIN}/oauth/callback?accessToken=xxx&refreshToken=yyy
 *
 * 4. This page runs:
 *    a. Reads tokens from URL (parseOAuthCallback)
 *    b. Stores accessToken + refreshToken via authStore
 *    c. Clears tokens from URL bar (history.replaceState — never logged/cached)
 *    d. Calls GET /api/v1/me to verify session and restore user profile
 *    e. Applies platform-scope guard (same as hydrateAuth)
 *    f. Navigates to /dashboard on success
 *
 * ── Error-path flow ───────────────────────────────────────────────────────
 *
 * Any error results in a polished error card with contextual recovery actions.
 * Recovery actions are driven by OAuthErrorInfo.recovery[] from oauth.utils.ts.
 *
 * Error sources:
 *   - URL ?error=access_denied        — user cancelled Google consent
 *   - URL ?error=unauthorized          — no SFG account for this Google identity
 *   - URL ?error=suspended             — account suspended
 *   - URL ?error=platform_scope        — platform account, no tenant access
 *   - URL ?error=not_active            — account pending activation
 *   - URL ?error=oauth_unavailable     — OAuth not configured on backend
 *   - Internal: missing_tokens         — no tokens, no error in URL
 *   - Internal: expired_session        — /me returned 401 after token storage
 *
 * ── StrictMode guard ─────────────────────────────────────────────────────
 *
 * React 18 StrictMode runs effects twice in development. The `hasRun` ref
 * ensures token processing fires exactly once per mount, preventing a
 * double-store + double-redirect race on the happy path.
 *
 * ── Backend requirements ─────────────────────────────────────────────────
 *
 * See: docs/oauth-callback.md
 * See: src/utils/oauth.utils.ts
 */

// ── SVG icons — no emoji, no OS-dependent rendering ─────────────────────

function IconSpinner() {
  return (
    <span
      className="oauth-callback__spinner-ring"
      role="status"
      aria-label="Completing sign-in"
    />
  )
}

function IconError() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="oauth-callback__error-svg"
    >
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/>
      <path d="M24 14v12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="24" cy="32" r="2" fill="currentColor"/>
    </svg>
  )
}

function IconCancelled() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="oauth-callback__error-svg oauth-callback__error-svg--muted"
    >
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 16l16 16M32 16L16 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

function IconLocked() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="oauth-callback__error-svg"
    >
      <rect x="10" y="22" width="28" height="22" rx="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 22V18a8 8 0 0116 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="33" r="2.5" fill="currentColor"/>
    </svg>
  )
}

// Choose icon by error type
function errorIcon(error: string | null) {
  if (error === 'access_denied') return <IconCancelled />
  if (error === 'platform_scope' || error === 'suspended') return <IconLocked />
  return <IconError />
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type PageState = 'processing' | 'error'

export function OAuthCallbackPage() {
  const navigate = useNavigate()

  const setToken        = useAuthStore((s) => s.setToken)
  const setRefreshToken = useAuthStore((s) => s.setRefreshToken)
  const logout          = useAuthStore((s) => s.logout)
  const setScopeError   = useAuthStore((s) => s.setScopeError)

  const [pageState, setPageState] = useState<PageState>('processing')
  const [errorInfo, setErrorInfo]  = useState<OAuthErrorInfo | null>(null)
  const [errorCode, setErrorCode]  = useState<string | null>(null)

  // Prevents double-invocation in React 18 StrictMode
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const run = async () => {
      const { tokens, error, errorDescription } = parseOAuthCallback()

      // ── 1. Error from Google or SFO Core ──────────────────────────────
      if (error) {
        setErrorCode(error)
        setErrorInfo(oauthErrorInfo(error, errorDescription))
        setPageState('error')
        return
      }

      // ── 2. No tokens and no error — unexpected empty callback ─────────
      if (!tokens?.accessToken) {
        setErrorCode('missing_tokens')
        setErrorInfo(oauthErrorInfo('missing_tokens'))
        setPageState('error')
        return
      }

      // ── 3. Store tokens ───────────────────────────────────────────────
      setToken(tokens.accessToken)
      if (tokens.refreshToken) {
        setRefreshToken(tokens.refreshToken)
      }

      // Remove tokens from URL bar — they are now in localStorage.
      // This prevents tokens from appearing in browser history or server logs
      // if the user shares or bookmarks the URL.
      window.history.replaceState({}, '', '/oauth/callback')

      // ── 4. Verify session via GET /api/v1/me ──────────────────────────
      try {
        const user = await authService.hydrateMe()

        // ── 5. Platform-scope guard ──────────────────────────────────────
        // Mirrors the check in auth/service.ts:hydrateAuth().
        // Platform users can pass /me but must not enter the tenant dashboard.
        if (user.scope === 'platform' || user.tenantId === null) {
          logout()
          setScopeError(
            'Platform accounts cannot access the tenant demo dashboard. ' +
            'Sign in with a demo tenant account.'
          )
          setErrorCode('platform_scope')
          setErrorInfo(oauthErrorInfo('platform_scope'))
          setPageState('error')
          return
        }

        // ── 6. Valid tenant user — navigate to dashboard ─────────────────
        navigate('/dashboard', { replace: true })

      } catch {
        // /me returned 401 — token may be malformed, expired, or revoked
        logout()
        setErrorCode('expired_session')
        setErrorInfo(oauthErrorInfo('expired_session'))
        setPageState('error')
      }
    }

    void run()
  }, [navigate, setToken, setRefreshToken, logout, setScopeError])

  // Shared: retry Google OAuth (same URL as login/signup Google buttons)
  const handleTryAgain = () => {
    const apiUrl =
      (import.meta.env.VITE_API_URL as string | undefined) ||
      'https://sfo-core-api.fly.dev/api/v1'
    window.location.href = `${apiUrl}/auth/google`
  }

  // ── Processing state ───────────────────────────────────────────────────

  if (pageState === 'processing') {
    return (
      <AuthShell maxWidth={400}>
        <div className="oauth-callback__card">
          <IconSpinner />
          <div className="oauth-callback__text">
            <h1 className="oauth-callback__title">Completing sign-in</h1>
            <p className="oauth-callback__body">
              Verifying your Google account with SFG.
            </p>
          </div>
        </div>
      </AuthShell>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────

  const info = errorInfo ?? oauthErrorInfo('unknown_error')

  return (
    <AuthShell maxWidth={460}>
      <div className="oauth-callback__card oauth-callback__card--error">

        {/* Icon */}
        <div className="oauth-callback__icon-wrap">
          {errorIcon(errorCode)}
        </div>

        {/* Copy */}
        <div className="oauth-callback__text">
          <h1 className="oauth-callback__title">{info.title}</h1>
          <p className="oauth-callback__body">{info.body}</p>
        </div>

        {/* Recovery actions */}
        <RecoveryActions recovery={info.recovery} onTryAgain={handleTryAgain} />

      </div>
    </AuthShell>
  )
}

// ---------------------------------------------------------------------------
// RecoveryActions — renders the contextual action set for a given error
// ---------------------------------------------------------------------------

interface RecoveryActionsProps {
  recovery:   RecoveryAction[]
  onTryAgain: () => void
}

function RecoveryActions({ recovery, onTryAgain }: RecoveryActionsProps) {
  if (recovery.length === 0) return null

  // Split into primary buttons (first 1–2) and secondary text links (rest)
  const primaries   = recovery.filter(a => a === 'try_again' || a === 'request_access')
  const secondaries = recovery.filter(a => a === 'back_to_login' || a === 'contact_support')

  return (
    <div className="oauth-callback__actions">
      {/* Primary button(s) */}
      {primaries.length > 0 && (
        <div className="oauth-callback__actions-primary">
          {primaries.map(action => {
            if (action === 'try_again') {
              return (
                <button
                  key="try_again"
                  type="button"
                  className="oauth-callback__btn oauth-callback__btn--primary"
                  onClick={onTryAgain}
                >
                  Try again with Google
                </button>
              )
            }
            if (action === 'request_access') {
              return (
                <Link
                  key="request_access"
                  to="/signup"
                  className="oauth-callback__btn oauth-callback__btn--secondary"
                >
                  Request access
                </Link>
              )
            }
            return null
          })}
        </div>
      )}

      {/* Secondary text links */}
      {secondaries.length > 0 && (
        <div className="oauth-callback__actions-secondary">
          {secondaries.map(action => {
            if (action === 'back_to_login') {
              return (
                <Link key="back_to_login" to="/login" className="oauth-callback__link">
                  Back to Sign In
                </Link>
              )
            }
            if (action === 'contact_support') {
              return (
                <Link key="contact_support" to="/contact" className="oauth-callback__link oauth-callback__link--muted">
                  Contact support
                </Link>
              )
            }
            return null
          })}
        </div>
      )}
    </div>
  )
}
