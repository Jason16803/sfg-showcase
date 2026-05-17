export interface User {
  id: string
  email: string
  role: 'owner' | 'general_manager' | 'assistant_manager' | 'employee'
  tenantId: string
  status: 'active' | 'invited' | 'suspended'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  error: string | null
}
