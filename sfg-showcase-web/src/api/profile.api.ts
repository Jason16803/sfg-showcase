/**
 * profile.api.ts
 *
 * API functions for the current user's profile.
 * Verified against SFO Core user.routes.js:
 *
 *   PUT /api/v1/me
 *     Request:  { firstName?, lastName?, email? }
 *     Response: { success, message, data: { id, email, firstName, lastName, role, scope, tenantId } }
 *     Auth:     Bearer token required (any authenticated user)
 *
 *   PUT /api/v1/me/password
 *     Request:  { currentPassword, newPassword }
 *     Response: { success, message, data: null }
 *     Auth:     Bearer token required (any authenticated user)
 *     Errors:   400 'currentPassword and newPassword are required'
 *               400 'New password must be at least 8 characters'
 *               401 'Current password is incorrect'
 */

import apiClient from '@/api/client'
import type { User } from '@/store/authStore'

interface ApiEnvelope<T> { success: boolean; message: string; data: T }

export interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  email?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

/**
 * updateProfile
 * PUT /api/v1/me — updates firstName, lastName, and/or email.
 * Returns the updated user object so callers can sync the auth store.
 */
export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const res = await apiClient.put<ApiEnvelope<User>>('/me', payload)
  return res.data.data
}

/**
 * changePassword
 * PUT /api/v1/me/password — changes the current user's password.
 * Returns void on success; throws AxiosError on failure.
 */
export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.put<ApiEnvelope<null>>('/me/password', payload)
}
