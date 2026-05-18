/**
 * auth/service.ts
 *
 * Auth service for SFG Showcase Web.
 * All shapes verified against the live SFO Core API backend.
 *
 * Backend contract (verified against /mnt/d/sfg-api/apps/sfo-core-api):
 *
 *   POST /api/v1/auth/login
 *     Request:  { email, password }
 *     Response: { success, message, data: { accessToken, refreshToken, user } }
 *     Errors:   401 "Invalid credentials" | 403 "Account is suspended" | 403 "Account is not active"
 *
 *   GET /api/v1/me  (Authorization: Bearer <token>)
 *     Response: { success, message, data: { id, email, firstName, lastName, role, status, scope, tenantId } }
 *     Errors:   401 "No token provided" | 401 "Token has expired" | 401 "Invalid token"
 *
 *   POST /api/v1/auth/logout  (Authorization: Bearer <token>)
 *     Response: { success, message, data: null }
 *
 * NOT YET IMPLEMENTED on backend:
 *   - POST /api/v1/auth/google  (Google OAuth — no route exists yet)
 *   - POST /api/v1/auth/refresh (refresh token route — service method exists but no route)
 */

import apiClient from '@/api/client'
import type { AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/store/authStore'

// ---------------------------------------------------------------------------
// Internal envelope types — match verified backend contract
// ---------------------------------------------------------------------------

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

interface LoginData {
  accessToken: string
  refreshToken: string  // stored by backend; no refresh endpoint on frontend yet
  user: User
}

// /me omits features (login-only field); keep User compatible by making it optional
type MeData = Omit<User, 'features'>

// ---------------------------------------------------------------------------
// Auth service
// ---------------------------------------------------------------------------

export const authService = {
  /**
   * login
   * Calls POST /api/v1/auth/login.
   * On success: stores accessToken + user in Zustand store and localStorage.
   * On failure: throws with the backend message string so callers can display it.
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
   * getCurrentUser
   * Calls GET /api/v1/me with the stored Bearer token.
   * Updates user in the store. Throws on auth failure.
   */
  async getCurrentUser(): Promise<User> {
    const res = await apiClient.get<ApiEnvelope<MeData>>('/me')
    const user = res.data.data as User
    useAuthStore.getState().setUser(user)
    return user
  },

  /**
   * logout
   * Calls POST /api/v1/auth/logout to clear the backend refresh token,
   * then unconditionally clears local auth state.
   * Network/server errors do NOT prevent the client-side logout.
   */
  async logout(): Promise<void> {
    const { token, logout: clearStore } = useAuthStore.getState()
    try {
      if (token) {
        await apiClient.post('/auth/logout')
      }
    } catch {
      // Best-effort — always clear client state regardless of server response
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
 * Called once on app mount in App.tsx.
 *
 * When the app loads and a JWT exists in localStorage, this function
 * verifies it against SFO Core (/api/v1/me) and restores the user object.
 *
 * The store initialises isLoading:true when a token is present (see authStore.ts),
 * so ProtectedRoute holds at a loading spinner until this resolves.
 *
 * Outcomes:
 *   Success  → user object set in store, isLoading → false
 *   401/403  → token invalid/expired/suspended; full logout, isLoading → false
 *   Network  → server unreachable; token preserved (optimistic), isLoading → false
 *   No token → returns immediately (isLoading was already false)
 */
export async function hydrateAuth(): Promise<void> {
  const { token, setUser, setIsLoading, logout: clearStore } = useAuthStore.getState()

  if (!token) return

  try {
    const res = await apiClient.get<ApiEnvelope<MeData>>('/me')
    setUser(res.data.data as User)
  } catch (err) {
    const axiosErr = err as AxiosError
    const status = axiosErr.response?.status
    if (status === 401 || status === 403) {
      // Server rejected the token — clear everything so the user goes to /login
      clearStore()
    }
    // Other errors (network down, 5xx): leave token intact so protected routes
    // can still render. Individual API calls will surface errors contextually.
  } finally {
    setIsLoading(false)
  }
}
