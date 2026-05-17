import { create } from 'zustand'
import type { User, AuthState } from './types'

const TOKEN_KEY = import.meta.env.VITE_JWT_STORAGE_KEY || 'sfg_auth_token'
const USER_KEY = 'sfg_auth_user'

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
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  },

  setUser: (user) => {
    set({ user })
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  getToken: () => get().token,

  logout: () => {
    set({ token: null, user: null, error: null })
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  hydrate: () => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (!storedToken) return

    const storedUser = localStorage.getItem(USER_KEY)
    let restoredUser: User | null = null

    if (storedUser) {
      try {
        restoredUser = JSON.parse(storedUser) as User
      } catch {
        // Corrupted JSON — discard silently so startup never crashes.
        localStorage.removeItem(USER_KEY)
        restoredUser = null
      }
    }

    set({ token: storedToken, user: restoredUser })
  },
}))
