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
 * Both camelCase (accessToken) and snake_case (access_token) are checked
 * to accommodate different backend serialization conventions.
 *
 * ── Error delivery formats ───────────────────────────────────────────────
 *
 * From Google (user cancelled):
 *   /oauth/callback?error=access_denied
 *
 * From SFO Core backend:
 *   /oauth/callback?error=unauthorized
 *   /oauth/callback?error=suspended
 *   /oauth/callback?error=platform_scope
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
  tokens?:          OAuthTokens
  error?:           string
  errorDescription?: string
}

export interface OAuthErrorInfo {
  title:      string
  body:       string
  /** True for "account not found" errors — shows a "Request access" link */
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

  // Error param — Google or SFO Core error
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
    searchParams.get('accessToken')   ??
    searchParams.get('access_token')  ??
    hashParams.get('accessToken')     ??
    hashParams.get('access_token')    ??
    undefined

  // Refresh token — same precedence
  const refreshToken =
    searchParams.get('refreshToken')  ??
    searchParams.get('refresh_token') ??
    hashParams.get('refreshToken')    ??
    hashParams.get('refresh_token')   ??
    ''   // refresh token is optional — access token is required

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
 * Maps an OAuth error code to a user-facing message object.
 *
 * Error codes come from:
 *   - Google's OAuth redirect (?error=access_denied)
 *   - SFO Core's post-exchange redirect (?error=unauthorized, etc.)
 */
export function oauthErrorInfo(error: string, description?: string): OAuthErrorInfo {
  switch (error) {
    case 'access_denied':
      return {
        title:      'Sign-in cancelled',
        body:       'You cancelled the Google sign-in. You can try again below, or use your email and password.',
        showSignup: false,
      }

    case 'unauthorized':
    case 'account_not_found':
      return {
        title:      'No account found',
        body:       'Your Google account is not linked to an SFG workspace. ' +
                    'Contact your workspace owner to request access.',
        showSignup: true,
      }

    case 'suspended':
      return {
        title:      'Account suspended',
        body:       'Your account has been suspended. Contact your workspace administrator.',
        showSignup: false,
      }

    case 'platform_scope':
      return {
        title:      'Platform account',
        body:       'This Google account is linked to a platform-level SFG account. ' +
                    'Platform accounts cannot access the tenant dashboard. ' +
                    'Use a demo tenant credential instead.',
        showSignup: false,
      }

    case 'not_active':
    case 'account_not_active':
      return {
        title:      'Account not active',
        body:       'Your account is pending activation. Check your invite email or contact your workspace owner.',
        showSignup: false,
      }

    default:
      return {
        title:      'Sign-in failed',
        body:       description ?? `An error occurred during sign-in (${error}). Please try again.`,
        showSignup: false,
      }
  }
}
