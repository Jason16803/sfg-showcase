/**
 * auth/service.ts
 *
 * Auth service for SFG Showcase Web.
 * All shapes verified against the live SFO Core API backend.
 *
 * ── Verified backend contract (/mnt/d/sfg-api/apps/sfo-core-api) ──────────
 *
 * POST /api/v1/auth/login
 *   Request:  { email, password }
 *   Response: { success, message, data: { accessToken, refreshToken, user } }
 *   user:     { id, email, firstName, lastName, role, status, tenantId, features }
 *   Errors:   401 'Invalid credentials'
 *             403 'Account is suspended'
 *             403 'Account is not active'
 *   Rate limit: 30 req / 15 min
 *
 * GET /api/v1/me  (Authorization: Bearer <token>)
 *   Response: { success, message, data: { id, email, firstName, lastName, role, status, scope, tenantId } }
 *   Note: features absent from /me — login response only
 *   Note: scope present on /me — login response does not include it
 *
 * POST /api/v1/auth/logout  (Authorization: Bearer <token>)
 *   Response: { success, message, data: null }
 *   Effect:   clears refreshToken field on User document in MongoDB
 *
 * POST /api/v1/auth/refresh  (public — no auth middleware)
 *   Request:  { refreshToken: string }
 *   Response: { success, message, data: { accessToken: string } }
 *   Errors:   401 'Invalid or expired refresh token'
 *             400 'Refresh token required'
 *   Note: backend service (refreshAccessToken) exists; route must be mounted.
 *         Frontend is ready; this call 404s until the route is live.
 *
 * POST /api/v1/auth/google   — NOT YET IMPLEMENTED on backend
 */

import apiClient from '@/api/client'
import type { AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/store/authStore'

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

/**
 * PLATFORM_SCOPE_ERROR
 * Message shown when a platform-scoped account attempts to access the
 * tenant dashboard. Referenced in login(), hydrateAuth(), and
 * refreshAccessToken() retry path.
 */
const PLATFORM_SCOPE_ERROR =
  'Platform accounts cannot access the tenant demo dashboard. ' +
  'Sign in with a demo tenant account.'

// ---------------------------------------------------------------------------
// Internal types — mirror verified backend response shapes
// ---------------------------------------------------------------------------

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

interface LoginData {
  accessToken:  string
  refreshToken: string
  user: User
}

interface RefreshData {
  accessToken: string
}

// /me does not include features — optional on User keeps the type compatible
type MeData = Omit<User, 'features'>

// ---------------------------------------------------------------------------
// Auth service
// ---------------------------------------------------------------------------

export const authService = {
  /**
   * login
   *
   * POST /api/v1/auth/login
   * On success:
   *   - stores accessToken  under TOKEN_KEY  in localStorage + store
   *   - stores refreshToken under REFRESH_TOKEN_KEY in localStorage + store
   * On platform-scope detection: surfaces scopeError, never stores tokens.
   * On failure: throws AxiosError — callers read .response.data.message.
   */
  async login(email: string, password: string): Promise<void> {
    const { setToken, setUser, setRefreshToken } = useAuthStore.getState()

    const res = await apiClient.post<ApiEnvelope<LoginData>>('/auth/login', {
      email,
      password,
    })

    const { accessToken, refreshToken, user } = res.data.data

    // Platform scope guard — tenantId: null in login response indicates a
    // platform user. scope is not in the login response, but tenantId is
    // sufficient. Never store tokens for platform users.
    if (user.tenantId === null) {
      useAuthStore.getState().setScopeError(PLATFORM_SCOPE_ERROR)
      throw new Error('platform_scope')
    }

    setToken(accessToken)
    setRefreshToken(refreshToken)
    setUser(user)
  },

  /**
   * hydrateMe
   *
   * GET /api/v1/me
   * Verifies the stored JWT and refreshes the user object in the store.
   * Throws on 401/403 so callers can decide whether to refresh or logout.
   */
  async hydrateMe(): Promise<User> {
    const res = await apiClient.get<ApiEnvelope<MeData>>('/me')
    const user = res.data.data as User
    useAuthStore.getState().setUser(user)
    return user
  },

  /**
   * refreshAccessToken
   *
   * POST /api/v1/auth/refresh
   * Exchanges the stored refresh token for a new access token.
   * Stores the new access token in localStorage + store on success.
   * Throws on any failure (invalid token, network error, 404 not-yet-live).
   *
   * Called by:
   *   - api/client.ts  response interceptor (after 401 on a protected request)
   *   - hydrateAuth()  (after 401 from GET /me on app startup)
   *
   * Note: the request interceptor will attach the expired access token as the
   * Authorization header — the refresh endpoint ignores it and reads only the
   * body. The endpoint is public (no requireAuth middleware on the backend).
   *
   * BACKEND PREREQUISITE:
   *   POST /api/v1/auth/refresh must be mounted in SFO Core.
   *   Until it is, this call returns 404 and throws immediately, which is
   *   caught by callers and handled as a refresh failure (→ logout).
   */
  async refreshAccessToken(): Promise<string> {
    const { refreshToken } = useAuthStore.getState()

    if (!refreshToken) {
      throw new Error('no_refresh_token')
    }

    const res = await apiClient.post<ApiEnvelope<RefreshData>>(
      '/auth/refresh',
      { refreshToken }
    )

    const { accessToken } = res.data.data
    useAuthStore.getState().setToken(accessToken)
    return accessToken
  },

  /**
   * logout
   *
   * POST /api/v1/auth/logout (best-effort — clears refreshToken on backend)
   * Always clears local auth state regardless of server response.
   * Clears both access token and refresh token from localStorage.
   */
  async logout(): Promise<void> {
    const { token, logout: clearStore } = useAuthStore.getState()
    try {
      if (token) {
        await apiClient.post('/auth/logout')
      }
    } catch {
      // Best-effort — client state is always cleared even if server call fails
    } finally {
      clearStore()
    }
  },
}

// ---------------------------------------------------------------------------
// App startup hydration
// ---------------------------------------------------------------------------

/**
 * hydrateAuth
 *
 * Called once in App.tsx useEffect on mount.
 *
 * Flow:
 *   1. No stored access token → return immediately (isLoading already false)
 *   2. GET /api/v1/me to verify token and restore user object
 *   3a. 200, tenant user    → setUser(), proceed to dashboard
 *   3b. 200, platform user  → clearStore(), setScopeError() — show warning
 *   3c. 401 (expired token) → attempt POST /api/v1/auth/refresh, then retry /me
 *       - Refresh succeeds  → setToken(new), retry /me, restore session
 *       - Refresh fails     → clearStore() — user must re-login
 *   3d. 403                 → clearStore() — suspended / not activated
 *   3e. Network / 5xx       → preserve token (optimistic); page-level calls surface errors
 */
export async function hydrateAuth(): Promise<void> {
  const { token, setIsLoading, logout: clearStore } = useAuthStore.getState()

  if (!token) return

  try {
    const user = await authService.hydrateMe()

    // Platform scope guard — /me includes scope, the definitive check.
    if (user.scope === 'platform' || user.tenantId === null) {
      clearStore()
      useAuthStore.getState().setScopeError(PLATFORM_SCOPE_ERROR)
      return
    }
  } catch (err) {
    const axiosErr = err as AxiosError
    const status = axiosErr.response?.status

    if (status === 401) {
      // Access token may be expired — attempt refresh before giving up.
      // If the /refresh route is not yet live (404), this throws immediately
      // and the inner catch clears auth state cleanly.
      try {
        await authService.refreshAccessToken()

        // Refresh succeeded — retry /me with the new access token
        const retryUser = await authService.hydrateMe()

        // Re-apply platform scope guard on the refreshed session
        if (retryUser.scope === 'platform' || retryUser.tenantId === null) {
          clearStore()
          useAuthStore.getState().setScopeError(PLATFORM_SCOPE_ERROR)
        }
        // Successful refresh + valid tenant user: fall through to finally
      } catch {
        // Refresh failed (invalid/expired refresh token, network error,
        // or /refresh not yet mounted on backend). Clear auth entirely.
        clearStore()
      }
    } else if (status === 403) {
      // Account suspended or not activated — no recovery possible
      clearStore()
    }
    // Network / 5xx: preserve token (optimistic) — let page-level hooks surface
  } finally {
    setIsLoading(false)
  }
}

// ---------------------------------------------------------------------------
// Error message helpers (exported for use in LoginPage and future pages)
// ---------------------------------------------------------------------------

/**
 * Map SFO Core auth error messages to user-friendly copy.
 *
 * Note: login route throws 'Account is not active'
 *       requireAuth middleware returns 'Account has not been activated'
 * Both are mapped here so callers don't need to distinguish the source.
 */
export function friendlyAuthError(serverMessage: string | undefined): string {
  switch (serverMessage) {
    case 'Invalid credentials':
      return 'Incorrect email or password. Please try again.'
    case 'Account is suspended':
      return 'Your account has been suspended. Contact your administrator.'
    case 'Account is not active':
    case 'Account has not been activated':
      return 'Your account is pending activation. Check your invite email.'
    case 'Token has expired':
      return 'Your session has expired. Please sign in again.'
    case 'Too many auth attempts, please try again later':
      return 'Too many sign-in attempts. Please wait a few minutes and try again.'
    case 'platform_scope':
      return 'Platform accounts cannot access this dashboard. Use one of the demo credentials below.'
    default:
      return serverMessage ?? 'Sign-in failed. Please try again.'
  }
}
