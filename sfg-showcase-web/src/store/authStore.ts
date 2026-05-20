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
 */

import { create } from 'zustand'

export const TOKEN_KEY =
  (import.meta.env.VITE_JWT_STORAGE_KEY as string | undefined) || 'auth_token'

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
  token: string | null
  /**
   * True while hydrateAuth() is in flight.
   * Initialised to true when a stored token exists so ProtectedRoute
   * holds at a spinner until the /me verification resolves.
   * False immediately when no token is stored.
   */
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setIsLoading: (isLoading: boolean) => void
  logout: () => void
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const storedToken = localStorage.getItem(TOKEN_KEY)

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: storedToken,
  isLoading: !!storedToken,
  isAuthenticated: !!storedToken,

  setUser: (user) => set({ user }),

  setToken: (token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
    set({ token, isAuthenticated: !!token })
  },

  setIsLoading: (isLoading) => set({ isLoading }),

  /**
   * logout
   * Clears all auth state and removes token from localStorage.
   * Called directly by authService.logout() and by the api/client 401 interceptor.
   * Also called by hydrateAuth() on 401/403 from /me.
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, token: null, isAuthenticated: false, isLoading: false })
  },
}))
