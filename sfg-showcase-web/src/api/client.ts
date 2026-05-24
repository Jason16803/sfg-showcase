import axios from 'axios'
import type { AxiosInstance } from 'axios'

/**
 * Axios client pre-configured for SFO Core API.
 *
 * VITE_API_URL must include the /api/v1 prefix.
 * Example: https://sfo-core-api.fly.dev/api/v1
 *
 * ── Request interceptor ───────────────────────────────────────────────────
 * Attaches stored JWT as Authorization: Bearer <token>.
 * Token is read from localStorage directly (same key as authStore) to avoid
 * a circular import: client ← service ← store.
 *
 * ── Response interceptor — refresh-then-retry on 401 ─────────────────────
 *
 * A 401 on a protected request triggers the following flow:
 *
 *   1. Guards — skip interceptor action entirely if any guard fails:
 *      G1. URL ends with /me              → hydrateAuth handles it; skip
 *      G2. URL ends with /auth/refresh    → refresh itself failed; logout
 *      G3. Request sent no auth header    → unauthenticated call; skip
 *      G4. Store not authenticated        → stale request; skip
 *      G5. config._retry already true     → already retried once; logout
 *
 *   2. Refresh attempt — POST /api/v1/auth/refresh { refreshToken }
 *      Success → stores new access token, retries original request ONCE.
 *      Failure → logout (invalid token, network error, route not yet live).
 *
 *   3. Logout — clears both tokens from localStorage + store.
 *      ProtectedRoute detects isAuthenticated:false → redirects to /login.
 *
 * ── Preventing loops ──────────────────────────────────────────────────────
 *   G2 prevents refresh failures from triggering another refresh attempt.
 *   G5 prevents a second retry if the refreshed token is also rejected.
 *   G1 keeps hydrateAuth's 401 handling self-contained (it handles /me refresh).
 */

// Extend AxiosRequestConfig to carry a single-retry guard flag.
// 'declare module' augmentations are erasable syntax — valid under erasableSyntaxOnly.
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

const TOKEN_KEY =
  (import.meta.env.VITE_JWT_STORAGE_KEY as string | undefined) || 'auth_token'

// Inline type for the POST /api/v1/auth/refresh response envelope
interface RefreshEnvelope {
  success: boolean
  message: string
  data: { accessToken: string }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://sfo-core-api.fly.dev/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Helper — resolve auth store at runtime to avoid circular import ────────
// Dynamic import is intentional: client.ts is a singleton that is loaded
// before authStore. Importing authStore at module level would create a cycle.
async function getStore() {
  const { useAuthStore } = await import('@/store/authStore')
  return useAuthStore.getState()
}

// ── Request interceptor — attach Bearer token ──────────────────────────────

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — refresh-then-retry on 401 ──────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const url: string = error.config?.url ?? ''
    const originalConfig = error.config

    // Bail early if axios did not attach a config (malformed request, timeout
    // before request was sent, etc.). Nothing we can do without a config.
    if (!originalConfig) return Promise.reject(error)

    // G1: /me — hydrateAuth owns this 401; do not interfere.
    if (url.endsWith('/me')) return Promise.reject(error)

    // G2: The refresh endpoint itself returned 401 (invalid refresh token).
    //     Do NOT attempt another refresh — logout instead.
    if (url.endsWith('/auth/refresh')) {
      const store = await getStore()
      if (store.isAuthenticated) store.logout()
      return Promise.reject(error)
    }

    // G3: Request was sent without an Authorization header.
    //     This is an unauthenticated call by design — not a session failure.
    if (!(originalConfig?.headers?.Authorization)) return Promise.reject(error)

    // G4: Store does not consider the user authenticated.
    //     Handles stale in-flight requests from a pre-login page visit that
    //     arrive after a fresh login and would otherwise destroy the new session.
    const store = await getStore()
    if (!store.isAuthenticated) return Promise.reject(error)

    // G5: Already retried once — the new token was also rejected.
    //     Give up and logout.
    if (originalConfig._retry) {
      store.logout()
      return Promise.reject(error)
    }

    // ── Refresh attempt ───────────────────────────────────────────────────
    originalConfig._retry = true

    const { refreshToken } = store

    if (!refreshToken) {
      // No refresh token stored — user must re-authenticate
      store.logout()
      return Promise.reject(error)
    }

    try {
      // POST /api/v1/auth/refresh  { refreshToken }
      //
      // The request interceptor will attach the expired access token as the
      // Authorization header. The refresh endpoint is public (no requireAuth
      // middleware) and reads only the request body — the header is ignored.
      //
      // If the endpoint is not yet mounted on the backend, this call returns
      // 404 (not 401), which falls to the outer catch and triggers logout.
      const refreshRes = await apiClient.post<RefreshEnvelope>(
        '/auth/refresh',
        { refreshToken }
      )

      const newToken = refreshRes.data.data.accessToken

      // Persist the new access token (localStorage + store)
      store.setToken(newToken)

      // Patch the original request config and retry ONCE with the new token
      originalConfig.headers.Authorization = `Bearer ${newToken}`
      return apiClient(originalConfig)

    } catch {
      // Refresh failed — network error, 404 (route not mounted), 400/401
      // from backend. Clear full auth state.
      store.logout()
      return Promise.reject(error)
    }
  }
)

export default apiClient
