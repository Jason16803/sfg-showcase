import axios from 'axios'
import type { AxiosInstance } from 'axios'

/**
 * Axios client pre-configured for SFO Core API.
 *
 * VITE_API_URL must include the /api/v1 prefix.
 * Example: https://sfo-core-api.fly.dev/api/v1
 *
 * Request interceptor: attaches stored JWT as Authorization: Bearer <token>.
 * Token is read from localStorage directly (same key as authStore) to avoid
 * a circular import: client ← service ← store.
 *
 * Response interceptor — 401 auto-logout rules:
 *
 *   We only call logout() when ALL of the following are true:
 *   1. Status is 401
 *   2. The request was NOT a /me call (hydrateAuth handles its own 401 cleanup)
 *   3. The request actually sent an Authorization header (meaning we had a
 *      token when the request was made — this guards against unauthenticated
 *      requests such as those fired by the public /showcase-dashboard page)
 *   4. The store currently believes the user is authenticated (guards against
 *      in-flight requests from a previous unauthenticated page visit completing
 *      after a fresh login)
 *
 *   This prevents the following failure mode:
 *     /showcase-dashboard (public) mounts DashboardPage hooks → 4 requests
 *     fire with no token → user navigates to /login → user logs in →
 *     the old 401s arrive → interceptor destroys the fresh session.
 *
 *   Feature-endpoint 401s that pass all four guards (i.e., a real mid-session
 *   token failure) still log the user out correctly.
 *
 *   Feature-endpoint 401s that do NOT pass the guards (unauthenticated context,
 *   race condition from stale requests) are rejected but do NOT clear auth state
 *   — the hook's own catch block handles them via mock-data fallback.
 */

const TOKEN_KEY =
  (import.meta.env.VITE_JWT_STORAGE_KEY as string | undefined) || 'auth_token'

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://sfo-core-api.fly.dev/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor — attach Bearer token ──────────────────────────────

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — guarded 401 auto-logout ────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url ?? ''

      // Guard 1: /me is handled by hydrateAuth — skip here
      const isHydrationCall = url.endsWith('/me')
      if (isHydrationCall) return Promise.reject(error)

      // Guard 2: Only logout if the request actually sent an Authorization header.
      // Requests with no header are unauthenticated by design (showcase page,
      // pre-login API calls). A 401 on those is expected — do not touch auth state.
      const sentAuthHeader = !!(error.config?.headers?.Authorization)
      if (!sentAuthHeader) return Promise.reject(error)

      // Guard 3: Only logout if the store currently shows the user as authenticated.
      // This prevents stale in-flight requests from a prior unauthenticated page
      // visit completing after a fresh login from destroying the new session.
      const { useAuthStore } = await import('@/store/authStore')
      const store = useAuthStore.getState()
      if (!store.isAuthenticated) return Promise.reject(error)

      // All guards passed: this is a genuine mid-session token failure.
      // Clear auth state so ProtectedRoute redirects to /login.
      store.logout()
    }

    return Promise.reject(error)
  }
)

export default apiClient
