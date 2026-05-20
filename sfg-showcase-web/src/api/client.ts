import axios from 'axios'
import type { AxiosInstance } from 'axios'

/**
 * Axios client pre-configured for SFO Core API.
 *
 * VITE_API_URL must include the /api/v1 prefix.
 * Example: http://localhost:3001/api/v1
 *
 * Request interceptor: attaches stored JWT as Authorization: Bearer <token>.
 * Token is read from localStorage directly (same key as authStore) to avoid
 * a circular import: client ← service ← store.
 *
 * Response interceptor: clears auth state on any 401 from any route.
 * This handles expired tokens mid-session without requiring every caller
 * to individually handle 401. Import of useAuthStore is lazy (inside the
 * interceptor function) to avoid a module-level circular dependency.
 */

const TOKEN_KEY =
  (import.meta.env.VITE_JWT_STORAGE_KEY as string | undefined) || 'auth_token'

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
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

// ── Response interceptor — auto-logout on 401 ─────────────────────────────
//
// 401 from any route means the token is invalid, expired, or revoked.
// Lazy import of useAuthStore prevents circular dependency at module load time.
// Note: the import() returns a module object; we access .useAuthStore from it.

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Avoid triggering logout during the hydrateAuth() call itself —
      // hydrateAuth handles its own 401 cleanup. We only auto-logout here
      // for authenticated requests that fail mid-session.
      const url: string = error.config?.url ?? ''
      const isHydrationCall = url.endsWith('/me')

      if (!isHydrationCall) {
        const { useAuthStore } = await import('@/store/authStore')
        useAuthStore.getState().logout()
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
