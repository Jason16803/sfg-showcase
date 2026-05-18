import axios from 'axios'
import type { AxiosInstance } from 'axios'

/**
 * Axios client pre-configured for SFO Core API.
 *
 * VITE_API_URL must include the /api/v1 prefix.
 * Example: http://localhost:3001/api/v1
 *
 * The request interceptor attaches the stored JWT as a Bearer token.
 * Token is read from localStorage directly (same key used by authStore)
 * to avoid a circular import: client ← service ← store.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient
