import { Link } from 'react-router-dom'
import './OAuthCallbackPage.scss'

/**
 * OAuthCallbackPage
 *
 * Handles the redirect from Google's OAuth consent screen.
 *
 * CURRENT STATE — PLACEHOLDER ONLY.
 * No API calls are made here yet. The backend endpoint
 * POST /api/v1/auth/google does not exist in SFO Core API.
 *
 * When the backend is ready, this page will:
 *   1. Read the `code` param from the URL search string.
 *   2. POST { code, redirectUri } to VITE_API_URL/auth/google.
 *   3. On success: call setToken() + setUser() from authStore, navigate to /dashboard.
 *   4. On error: display the appropriate error state and link back to /login.
 *
 * See docs/google-oauth-plan.md for the full implementation checklist.
 */
export function OAuthCallbackPage() {
  return (
    <main className="oauth-callback">
      <div className="oauth-callback__card">
        {/* Spinner */}
        <div className="oauth-callback__spinner" aria-label="Loading" role="status">
          <span className="oauth-callback__spinner-ring" />
        </div>

        <h1 className="oauth-callback__title">Completing sign-in…</h1>

        <p className="oauth-callback__body">
          Google OAuth is not yet active. The backend endpoint required to
          complete this flow is pending implementation.
        </p>

        <p className="oauth-callback__note">
          See <code>docs/google-oauth-plan.md</code> for the full activation
          checklist.
        </p>

        <Link to="/login" className="oauth-callback__back">
          ← Return to Sign In
        </Link>
      </div>
    </main>
  )
}
