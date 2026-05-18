/**
 * authStore.ts
 *
 * Zustand auth store for SFG Showcase Web.
 *
 * User type verified against SFO Core API responses:
 *   POST /api/v1/auth/login → { id, email, firstName, lastName, role, status, tenantId, features }
 *   GET  /api/v1/me         → { id, email, firstName, lastName, role, status, scope, tenantId }
 *
 * scope and features are optional because they come from different endpoints.
 */

import { create } from 'zustand'

const TOKEN_KEY = 'auth_token'

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
  /** True while hydrateAuth() is in flight. ProtectedRoute waits on this. */
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

  // isLoading starts true when a token is stored so ProtectedRoute waits for
  // hydrateAuth() to verify it before deciding to render or redirect.
  // If no token: false (nothing to hydrate; route decision is immediate).
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
   * logout — clears all auth state and removes token from localStorage.
   * Called by authService.logout() and hydrateAuth() on 401/403.
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, token: null, isAuthenticated: false, isLoading: false })
  },
}))
