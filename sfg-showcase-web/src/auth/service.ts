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
 *             403 'Account is not active'        ← thrown by authService.login()
 *   Rate limit: 30 req / 15 min
 *
 * GET /api/v1/me  (Authorization: Bearer <token>)
 *   Response: { success, message, data: { id, email, firstName, lastName, role, status, scope, tenantId } }
 *   Note: features absent from /me — login response only
 *   Note: scope present on /me — login response does not include it
 *   Errors:   401 'No token provided'
 *             401 'Token has expired'
 *             401 'Invalid token'
 *             401 'User not found'
 *             403 'Account is suspended'
 *             403 'Account has not been activated'  ← middleware, differs from login error string
 *
 * POST /api/v1/auth/logout  (Authorization: Bearer <token>)
 *   Response: { success, message, data: null }
 *   Effect:   clears refreshToken field on User document in MongoDB
 *
 * ── NOT YET IMPLEMENTED on backend ────────────────────────────────────────
 *   POST /api/v1/auth/refresh  — service method exists; no route mounted
 *   POST /api/v1/auth/google   — Google OAuth; no route mounted
 */

import apiClient from '@/api/client'
import type { AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/store/authStore'

// ---------------------------------------------------------------------------
// Internal types — mirror verified backend response shapes
// ---------------------------------------------------------------------------

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

interface LoginData {
  accessToken: string
  refreshToken: string // returned but no /refresh route exists yet
  user: User
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
   * On success: stores accessToken + user in Zustand store and localStorage.
   * On failure: throws AxiosError — callers read .response.data.message.
   */
  async login(email: string, password: string): Promise<void> {
    const { setToken, setUser } = useAuthStore.getState()

    const res = await apiClient.post<ApiEnvelope<LoginData>>('/auth/login', {
      email,
      password,
    })

    const { accessToken, user } = res.data.data
    setToken(accessToken)
    setUser(user)
  },

  /**
   * hydrateMe
   *
   * GET /api/v1/me
   * Verifies the stored JWT and refreshes the user object in the store.
   * Throws on 401/403 so callers (ProtectedRoute, hydrateAuth) can decide
   * whether to logout or preserve state.
   *
   * Named hydrateMe to align with the Phase 3 task contract.
   */
  async hydrateMe(): Promise<User> {
    const res = await apiClient.get<ApiEnvelope<MeData>>('/me')
    const user = res.data.data as User
    useAuthStore.getState().setUser(user)
    return user
  },

  /**
   * logout
   *
   * POST /api/v1/auth/logout (best-effort — clears refreshToken on backend)
   * Always clears local auth state regardless of server response.
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
 *   1. If no stored token → return immediately (isLoading was already false)
 *   2. Call GET /api/v1/me to verify token and restore user object
 *   3a. Success     → setUser(), setIsLoading(false) — ProtectedRoute renders
 *   3b. 401 / 403   → logout() — clears store + localStorage, isLoading → false
 *   3c. Network/5xx → preserve token (optimistic), setIsLoading(false)
 *                     Individual API calls will surface errors contextually
 *
 * The store initialises isLoading:true when a token is present, so
 * ProtectedRoute holds at a spinner until this function resolves.
 */
export async function hydrateAuth(): Promise<void> {
  const { token, setIsLoading, logout: clearStore } = useAuthStore.getState()

  if (!token) return

  try {
    await authService.hydrateMe()
  } catch (err) {
    const axiosErr = err as AxiosError
    const status = axiosErr.response?.status
    if (status === 401 || status === 403) {
      clearStore()
    }
    // Network / 5xx: leave token intact, let page-level calls handle it
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
    default:
      return serverMessage ?? 'Sign-in failed. Please try again.'
  }
}
