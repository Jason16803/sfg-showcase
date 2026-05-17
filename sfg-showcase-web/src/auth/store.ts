import { create } from 'zustand'
import type { User, AuthState } from './types'

const STORAGE_KEY = import.meta.env.VITE_JWT_STORAGE_KEY || 'sfg_auth_token'

interface AuthStore extends AuthState {
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  getToken: () => string | null
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: null,
  user: null,
  isLoading: false,
  error: null,

  setToken: (token) => {
    set({ token })
    if (token) {
      localStorage.setItem(STORAGE_KEY, token)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  },

  setUser: (user) => set({ user }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  getToken: () => get().token,

  logout: () => {
    set({ token: null, user: null, error: null })
    localStorage.removeItem(STORAGE_KEY)
  },

  hydrate: () => {
    const storedToken = localStorage.getItem(STORAGE_KEY)
    if (storedToken) {
      set({ token: storedToken })
    }
  },
}))
