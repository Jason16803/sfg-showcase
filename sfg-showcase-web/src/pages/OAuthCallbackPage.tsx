import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '@/auth/service'
import { useAuthStore } from '@/store/authStore'
import { parseOAuthCallback, oauthErrorInfo } from '@/utils/oauth.utils'
import type { OAuthErrorInfo } from '@/utils/oauth.utils'
import './OAuthCallbackPage.scss'

/**
 * OAuthCallbackPage
 *
 * Landing page after SFO Core completes the Google OAuth exchange.
 *
 * ── Flow ─────────────────────────────────────────────────────────────────
 *
 * 1. User clicks "Continue with Google" on /login
 *    → browser redirects to: GET ${VITE_API_URL}/auth/google
 *
 * 2. SFO Core redirects browser to Google's consent screen
 *    (backend owns the redirect_uri pointing to its own callback route)
 *
 * 3. Google redirects to SFO Core's server callback
 *    SFO Core: exchanges code → finds user → issues JWT → redirects to frontend
 *
 * 4. Browser arrives here at: /oauth/callback?accessToken=xxx&refreshToken=yyy
 *    (or ?error=access_denied / ?error=unauthorized / etc.)
 *
 * 5. This page:
 *    a. Reads tokens from URL (parseOAuthCallback)
 *    b. Stores accessToken + refreshToken via authStore
 *    c. Cleans tokens from URL bar (history.replaceState)
 *    d. Calls GET /api/v1/me to verify session + get user profile
 *    e. Applies platform-scope guard (same as hydrateAuth)
 *    f. Navigates to /dashboard on success
 *    g. Shows an error card on any failure
 *
 * ── Error handling ────────────────────────────────────────────────────────
 *
 * access_denied        → user cancelled Google consent
 * unauthorized         → no SFG account for this Google identity
 * suspended            → account suspended
 * platform_scope       → platform account, no tenant dashboard access
 * no tokens in URL     → unexpected empty callback
 * /me failure          → token invalid or user not found
 * platform user (scope)→ tokens stored then immediately cleared
 *
 * ── Stability note ───────────────────────────────────────────────────────
 *
 * React 18 StrictMode runs effects twice in development. The `hasRun` ref
 * guard ensures token processing fires exactly once per mount.
 */

type PageState = 'processing' | 'error'

export function OAuthCallbackPage() {
  const navigate = useNavigate()

  const setToken        = useAuthStore((s) => s.setToken)
  const setRefreshToken = useAuthStore((s) => s.setRefreshToken)
  const logout          = useAuthStore((s) => s.logout)
  const setScopeError   = useAuthStore((s) => s.setScopeError)

  const [pageState, setPageState] = useState<PageState>('processing')
  const [errorInfo, setErrorInfo]  = useState<OAuthErrorInfo | null>(null)

  // Prevents double-invocation in React 18 StrictMode
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const run = async () => {
      const { tokens, error, errorDescription } = parseOAuthCallback()

      // ── 1. Error from Google or SFO Core ──────────────────────────────
      if (error) {
        setErrorInfo(oauthErrorInfo(error, errorDescription))
        setPageState('error')
        return
      }

      // ── 2. No tokens and no error — unexpected empty callback ─────────
      if (!tokens?.accessToken) {
        setErrorInfo({
          title:      'No credentials received',
          body:       'The sign-in process did not return the expected tokens. ' +
                      'This may be a temporary issue — please try again.',
          showSignup: false,
        })
        setPageState('error')
        return
      }

      // ── 3. Store tokens ───────────────────────────────────────────────
      setToken(tokens.accessToken)
      if (tokens.refreshToken) {
        setRefreshToken(tokens.refreshToken)
      }

      // Clean tokens from URL bar — they are now persisted in localStorage.
      // After this point, tokens are stored and the URL is clean.
      window.history.replaceState({}, '', '/oauth/callback')

      // ── 4. Verify session — GET /api/v1/me ────────────────────────────
      try {
        const user = await authService.hydrateMe()

        // ── 5. Platform scope guard ──────────────────────────────────────
        // Matches the same check in auth/service.ts hydrateAuth().
        // Platform users pass /me but cannot enter the tenant dashboard.
        if (user.scope === 'platform' || user.tenantId === null) {
          logout()
          setScopeError(
            'Platform accounts cannot access the tenant demo dashboard. ' +
            'Sign in with a demo tenant account.'
          )
          setErrorInfo(oauthErrorInfo('platform_scope'))
          setPageState('error')
          return
        }

        // ── 6. Valid tenant user — navigate to dashboard ─────────────────
        navigate('/dashboard', { replace: true })

      } catch {
        // /me failed — the token may be malformed or the user was not found
        logout()
        setErrorInfo({
          title:      'Session verification failed',
          body:       'Your sign-in could not be verified. The session may be invalid. ' +
                      'Please try signing in again.',
          showSignup: false,
        })
        setPageState('error')
      }
    }

    void run()
  }, [navigate, setToken, setRefreshToken, logout, setScopeError])

  // ── Processing state — spinner ─────────────────────────────────────────

  if (pageState === 'processing') {
    return (
      <main className="oauth-callback">
        <div className="oauth-callback__card">
          <div
            className="oauth-callback__spinner"
            aria-label="Completing sign-in"
            role="status"
          >
            <span className="oauth-callback__spinner-ring" />
          </div>
          <h1 className="oauth-callback__title">Completing sign-in…</h1>
          <p className="oauth-callback__body">
            Verifying your Google account with SFG.
          </p>
        </div>
      </main>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────

  return (
    <main className="oauth-callback">
      <div className="oauth-callback__card oauth-callback__card--error">
        <div className="oauth-callback__error-icon" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="oauth-callback__error-svg"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="0.5" fill="currentColor" />
          </svg>
        </div>

        <h1 className="oauth-callback__title">
          {errorInfo?.title ?? 'Sign-in failed'}
        </h1>

        <p className="oauth-callback__body">
          {errorInfo?.body ?? 'An unexpected error occurred. Please try again.'}
        </p>

        <div className="oauth-callback__actions">
          <Link to="/login" className="oauth-callback__back">
            ← Return to Sign In
          </Link>

          {errorInfo?.showSignup && (
            <Link to="/signup" className="oauth-callback__signup-link">
              Request access →
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
