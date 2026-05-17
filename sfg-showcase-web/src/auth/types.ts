/**
 * ApiResponse<T>
 * All SFO Core responses are wrapped in this envelope.
 * { success: boolean, message: string, data: T }
 */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

/**
 * User
 * Matches the user shape returned by both POST /api/v1/auth/login
 * and GET /api/v1/me.
 *
 * tenantId is null for platform-scope users (scope: 'platform').
 * features is only present in the login response, not /me.
 */
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'owner' | 'general_manager' | 'assistant_manager' | 'employee'
  status: 'active' | 'invited' | 'suspended'
  scope: 'tenant' | 'platform'
  tenantId: string | null
  features?: Record<string, boolean>
}

/**
 * LoginRequest
 * POST /api/v1/auth/login request body.
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * AuthResponse
 * Shape of data inside the ApiResponse envelope for POST /api/v1/auth/login.
 *
 * Note: a refresh route (/api/v1/auth/refresh) does not yet exist on the
 * backend. refreshToken is stored for future use only.
 */
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

/**
 * MeResponse
 * Shape of data inside the ApiResponse envelope for GET /api/v1/me.
 * Distinct from AuthResponse — no tokens, no features field.
 */
export interface MeResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  role: User['role']
  status: User['status']
  scope: User['scope']
  tenantId: string | null
}

/**
 * AuthState
 * Internal Zustand store state shape.
 * token stores the accessToken value under a stable internal name.
 */
export interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  error: string | null
}
