/**
 * oauth.utils.ts
 *
 * Utilities for the Google OAuth callback handoff from SFO Core.
 *
 * ── Backend handoff mechanism ────────────────────────────────────────────
 *
 * The OAuth flow is backend-initiated:
 *   1. Frontend redirects browser to GET ${VITE_API_URL}/auth/google
 *   2. SFO Core builds the Google OAuth consent URL and redirects there
 *   3. User approves → Google redirects to SFO Core's server callback
 *   4. SFO Core exchanges the code, finds/creates the user, issues JWTs
 *   5. SFO Core redirects browser to: ${FRONTEND_ORIGIN}/oauth/callback
 *      carrying the tokens in the URL
 *
 * The frontend NEVER handles the Google authorization code directly.
 * Token exchange is entirely server-side inside SFO Core.
 *
 * ── Token delivery formats ───────────────────────────────────────────────
 *
 * Primary — query params (most common server-side pattern):
 *   /oauth/callback?accessToken=xxx&refreshToken=yyy
 *
 * Fallback — URL hash (never sent to server, used by some OAuth libraries):
 *   /oauth/callback#accessToken=xxx&refreshToken=yyy
 *
 * Both camelCase (accessToken) and snake_case (access_token) are accepted
 * to accommodate different backend serialization conventions.
 *
 * ── Error delivery formats ───────────────────────────────────────────────
 *
 * From Google (user declined):
 *   /oauth/callback?error=access_denied
 *
 * From SFO Core backend:
 *   /oauth/callback?error=unauthorized          — no SFG account for this Google identity
 *   /oauth/callback?error=account_not_found     — alias for unauthorized
 *   /oauth/callback?error=suspended             — account suspended
 *   /oauth/callback?error=platform_scope        — platform account, no tenant access
 *   /oauth/callback?error=not_active            — account pending activation
 *   /oauth/callback?error=account_not_active    — alias for not_active
 *   /oauth/callback?error=oauth_unavailable     — Google OAuth not yet configured on backend
 *
 * Frontend-generated error codes (not from URL, set internally):
 *   missing_tokens   — callback URL contained no tokens and no error
 *   expired_session  — /me returned 401 after tokens were stored
 *
 * ── Backend requirements ─────────────────────────────────────────────────
 *
 * REQUIRED for Google OAuth to function:
 *   1. GET  /api/v1/auth/google           — redirects to Google consent screen
 *   2. POST /api/v1/auth/google/callback  — exchanges code, issues JWTs, redirects to
 *        ${FRONTEND_URL}/oauth/callback?accessToken=...&refreshToken=...
 *        OR on error:
 *        ${FRONTEND_URL}/oauth/callback?error=<code>&message=<optional_description>
 *
 * For the request-access (signup) flow, the backend must additionally:
 *   - Detect new Google users (no existing SFG account)
 *   - Create a PendingAccessRequest document instead of issuing a JWT
 *   - Send admin notification via Resend to ADMIN_NOTIFICATION_EMAIL
 *   - Return error=unauthorized so the frontend shows "Request access"
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OAuthTokens {
  accessToken:  string
  /** Empty string if backend did not include a refresh token in the redirect */
  refreshToken: string
}

export interface OAuthCallbackResult {
  tokens?:           OAuthTokens
  error?:            string
  errorDescription?: string
}

/**
 * RecoveryAction — typed set of recovery actions available on an error card.
 *
 * OAuthCallbackPage renders action buttons based on this list, so the
 * copy and behavior are centralised here rather than scattered across
 * component render branches.
 */
export type RecoveryAction =
  | 'try_again'       // Redirect to Google OAuth start URL
  | 'request_access'  // Link to /signup
  | 'back_to_login'   // Link to /login
  | 'contact_support' // Link to /contact

export interface OAuthErrorInfo {
  title:    string
  body:     string
  recovery: RecoveryAction[]
  /**
   * @deprecated Use `recovery.includes('request_access')` instead.
   * Kept for backward compatibility with any code referencing this field.
   */
  showSignup: boolean
}

// ---------------------------------------------------------------------------
// parseOAuthCallback
// ---------------------------------------------------------------------------

/**
 * Reads tokens or error codes from the current URL.
 *
 * Checks query params first, then URL hash as fallback.
 * Checks camelCase (accessToken) then snake_case (access_token).
 *
 * Called once on OAuthCallbackPage mount.
 */
export function parseOAuthCallback(): OAuthCallbackResult {
  const searchParams = new URLSearchParams(window.location.search)
  const hashParams   = new URLSearchParams(window.location.hash.slice(1))

  // Error param — Google or SFO Core error code
  const error =
    searchParams.get('error') ??
    hashParams.get('error')   ??
    undefined

  if (error) {
    const errorDescription =
      searchParams.get('error_description') ??
      hashParams.get('error_description')   ??
      searchParams.get('message')           ??
      hashParams.get('message')             ??
      undefined

    return { error, errorDescription }
  }

  // Access token — camelCase then snake_case, query params then hash
  const accessToken =
    searchParams.get('accessToken')  ??
    searchParams.get('access_token') ??
    hashParams.get('accessToken')    ??
    hashParams.get('access_token')   ??
    undefined

  // Refresh token — same precedence (optional)
  const refreshToken =
    searchParams.get('refreshToken')  ??
    searchParams.get('refresh_token') ??
    hashParams.get('refreshToken')    ??
    hashParams.get('refresh_token')   ??
    ''

  if (accessToken) {
    return { tokens: { accessToken, refreshToken } }
  }

  // Nothing in the URL — unexpected state
  return {}
}

// ---------------------------------------------------------------------------
// oauthErrorInfo
// ---------------------------------------------------------------------------

/**
 * Maps an OAuth error code to a user-facing message and recovery action list.
 *
 * Error codes come from:
 *   - Google's OAuth redirect (?error=access_denied)
 *   - SFO Core's post-exchange redirect (?error=unauthorized, etc.)
 *   - Frontend-generated codes (missing_tokens, expired_session)
 *
 * The recovery array drives which action buttons OAuthCallbackPage renders,
 * in the order they should appear. Primary action first.
 */
export function oauthErrorInfo(error: string, description?: string): OAuthErrorInfo {
  switch (error) {

    case 'access_denied':
      return {
        title:      'Sign-in cancelled',
        body:       'You declined the Google sign-in request. You can try again, or sign in with your email and password instead.',
        recovery:   ['try_again', 'back_to_login'],
        showSignup: false,
      }

    case 'unauthorized':
    case 'account_not_found':
      return {
        title:      'No account found',
        body:       'Your Google account is not linked to an SFG workspace. Contact your workspace owner to be invited, or submit a request for access.',
        recovery:   ['request_access', 'back_to_login', 'contact_support'],
        showSignup: true,
      }

    case 'suspended':
      return {
        title:      'Account suspended',
        body:       'Your account has been suspended. Please contact your workspace administrator to resolve this before signing in.',
        recovery:   ['contact_support', 'back_to_login'],
        showSignup: false,
      }

    case 'platform_scope':
      return {
        title:      'Platform account',
        body:       'This Google account is linked to a platform-level SFG account. Platform accounts cannot access the tenant dashboard. Use a demo tenant credential instead.',
        recovery:   ['back_to_login'],
        showSignup: false,
      }

    case 'not_active':
    case 'account_not_active':
      return {
        title:      'Account not yet active',
        body:       'Your account is pending activation. Check your invite email for a setup link, or contact your workspace owner.',
        recovery:   ['contact_support', 'back_to_login'],
        showSignup: false,
      }

    case 'missing_tokens':
      return {
        title:      'Sign-in incomplete',
        body:       'The sign-in process did not return the expected credentials. This is usually a temporary issue — please try again.',
        recovery:   ['try_again', 'back_to_login', 'contact_support'],
        showSignup: false,
      }

    case 'expired_session':
      return {
        title:      'Session could not be verified',
        body:       'Your sign-in credentials could not be confirmed. This can happen if the sign-in took too long. Please sign in again.',
        recovery:   ['back_to_login', 'try_again'],
        showSignup: false,
      }

    case 'oauth_unavailable':
      return {
        title:      'Google sign-in unavailable',
        body:       'Google sign-in is not currently configured on this server. Use your email and password to sign in, or contact support.',
        recovery:   ['back_to_login', 'contact_support'],
        showSignup: false,
      }

    default:
      return {
        title:      'Sign-in failed',
        body:       description
          ? `Sign-in could not be completed: ${description}. Please try again or contact support if this continues.`
          : 'An unexpected error occurred during sign-in. Please try again.',
        recovery:   ['try_again', 'back_to_login', 'contact_support'],
        showSignup: false,
      }
  }
}
