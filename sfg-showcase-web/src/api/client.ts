import axios from 'axios'
import type { AxiosInstance } from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
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
