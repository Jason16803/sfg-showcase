/**
 * authStore.ts
 *
 * Zustand auth store for SFG Showcase Web.
 *
 * User type verified against SFO Core API (sfo-core-contract-agent):
 *   POST /api/v1/auth/login → user: { id, email, firstName, lastName, role, status, tenantId, features }
 *   GET  /api/v1/me         → data: { id, email, firstName, lastName, role, status, scope, tenantId }
 *
 * scope and features are optional because they come from different endpoints.
 *
 * TOKEN_KEY reads VITE_JWT_STORAGE_KEY from env for environment portability.
 * Defaults to 'auth_token' if the env var is not set.
 *
 * REFRESH_TOKEN_KEY reads VITE_JWT_REFRESH_KEY from env.
 * Defaults to TOKEN_KEY + '_refresh' so the two keys are always paired.
 * e.g. VITE_JWT_STORAGE_KEY=sfg_access_token  →  REFRESH_TOKEN_KEY=sfg_access_token_refresh
 */

import { create } from 'zustand'

export const TOKEN_KEY =
  (import.meta.env.VITE_JWT_STORAGE_KEY as string | undefined) || 'auth_token'

/**
 * REFRESH_TOKEN_KEY
 *
 * Separate localStorage key for the refresh token.
 * Using a distinct key from the access token is intentional:
 *   - Easier to clear independently during token rotation
 *   - Avoids accidental overwrite by code that only knows TOKEN_KEY
 *   - Mirrors server-side separation of access vs refresh concerns
 *
 * The token itself is an opaque string issued by SFO Core on login.
 * It is sent to POST /api/v1/auth/refresh in the request body (not in headers).
 */
export const REFRESH_TOKEN_KEY =
  (import.meta.env.VITE_JWT_REFRESH_KEY as string | undefined) ||
  `${TOKEN_KEY}_refresh`

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'owner' | 'general_manager' | 'assistant_manager' | 'employee'
  status: 'active' | 'invited' | 'suspended'
  tenantId: string | null
  /** Present on /me response; absent from login response */
  scope?: 'tenant' | 'platform'
  /** Present on login response; absent from /me response */
  features?: Record<string, boolean>
}

export interface AuthState {
  user: User | null
  /** JWT access token — short-lived, stored under TOKEN_KEY */
  token: string | null
  /**
   * Refresh token — longer-lived, stored under REFRESH_TOKEN_KEY.
   * Sent to POST /api/v1/auth/refresh in the request body (not in headers).
   * Cleared on logout and on refresh failure.
   */
  refreshToken: string | null
  /**
   * True while hydrateAuth() is in flight.
   * Initialised to true when a stored token exists so ProtectedRoute
   * holds at a spinner until the /me verification resolves.
   * False immediately when no token is stored.
   */
  isLoading: boolean
  isAuthenticated: boolean
  /**
   * Set when login or hydrateAuth detects a platform-scoped user.
   * LoginPage reads this to display the scope-guard message without
   * creating a redirect loop.
   * Cleared by logout() and by a successful tenant-scoped login.
   */
  scopeError: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  /** Persist the refresh token to localStorage and store state. */
  setRefreshToken: (token: string | null) => void
  setIsLoading: (isLoading: boolean) => void
  setScopeError: (msg: string | null) => void
  /**
   * logout
   * Clears ALL auth state:
   *   - removes both TOKEN_KEY and REFRESH_TOKEN_KEY from localStorage
   *   - resets user, token, refreshToken, isAuthenticated, scopeError in store
   *
   * Called by:
   *   - authService.logout()   (explicit sign-out)
   *   - api/client.ts          (after failed refresh attempt)
   *   - hydrateAuth()          (on 401/403 from /me with no recoverable refresh)
   */
  logout: () => void
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const storedToken        = localStorage.getItem(TOKEN_KEY)
const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  token:           storedToken,
  refreshToken:    storedRefreshToken,
  isLoading:       !!storedToken,
  isAuthenticated: !!storedToken,
  scopeError:      null,

  setUser: (user) => set({ user }),

  setToken: (token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
    set({ token, isAuthenticated: !!token })
  },

  setRefreshToken: (refreshToken) => {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
    set({ refreshToken })
  },

  setIsLoading: (isLoading) => set({ isLoading }),

  setScopeError: (scopeError) => set({ scopeError }),

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    set({
      user:            null,
      token:           null,
      refreshToken:    null,
      isAuthenticated: false,
      isLoading:       false,
      scopeError:      null,
    })
  },
}))
