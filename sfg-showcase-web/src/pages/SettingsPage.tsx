import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { AxiosError } from 'axios'
import { Container, Card, Button } from '@/components'
import { useAuthStore } from '@/store/authStore'
import { updateProfile, changePassword } from '@/api/profile.api'
import './SettingsPage.scss'

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName:  z.string().min(1, 'Last name is required'),
  email:     z.string().email('Valid email is required'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ProfileForm   = z.infer<typeof profileSchema>
type PasswordForm  = z.infer<typeof passwordSchema>

interface ApiErrorBody { success: boolean; message: string }

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SettingsPage() {
  const { user, setUser } = useAuthStore()

  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError,   setProfileError]   = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError,   setPasswordError]   = useState<string | null>(null)

  // ── Profile form ──────────────────────────────────────────────────────────

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName:  user?.lastName  ?? '',
      email:     user?.email     ?? '',
    },
  })

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileSuccess(false)
    setProfileError(null)
    try {
      const updated = await updateProfile(data)
      setUser(updated)
      setProfileSuccess(true)
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorBody>
      setProfileError(axiosErr.response?.data?.message ?? 'Failed to update profile. Please try again.')
    }
  }

  // ── Password form ─────────────────────────────────────────────────────────

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordSuccess(false)
    setPasswordError(null)
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      setPasswordSuccess(true)
      passwordForm.reset()
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorBody>
      const msg = axiosErr.response?.data?.message ?? 'Failed to change password.'
      setPasswordError(
        msg === 'Current password is incorrect'
          ? 'The current password you entered is incorrect.'
          : msg
      )
    }
  }

  return (
    <div className="settings-page">
      <Container>
        <div className="settings-page__header">
          <h1>Settings</h1>
          <p>Manage your profile and account preferences</p>
        </div>

        {/* ── Profile ─────────────────────────────────────────────────── */}
        <Card className="settings-page__section">
          <div className="settings-page__section-header">
            <h2>Profile</h2>
            <p>Update your name and email address</p>
          </div>

          {profileError   && <div className="settings-page__error"   role="alert">{profileError}</div>}
          {profileSuccess && <div className="settings-page__success" role="status">Profile updated successfully.</div>}

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="settings-page__form">
            <div className="settings-page__row">
              <div className="settings-page__field">
                <label htmlFor="firstName" className="settings-page__label">First Name</label>
                <input id="firstName" type="text" autoComplete="given-name"
                  {...profileForm.register('firstName')}
                  className={profileForm.formState.errors.firstName ? 'error' : ''}
                />
                {profileForm.formState.errors.firstName && (
                  <span className="settings-page__field-error">{profileForm.formState.errors.firstName.message}</span>
                )}
              </div>
              <div className="settings-page__field">
                <label htmlFor="lastName" className="settings-page__label">Last Name</label>
                <input id="lastName" type="text" autoComplete="family-name"
                  {...profileForm.register('lastName')}
                  className={profileForm.formState.errors.lastName ? 'error' : ''}
                />
                {profileForm.formState.errors.lastName && (
                  <span className="settings-page__field-error">{profileForm.formState.errors.lastName.message}</span>
                )}
              </div>
            </div>

            <div className="settings-page__field">
              <label htmlFor="email" className="settings-page__label">Email Address</label>
              <input id="email" type="email" autoComplete="email"
                {...profileForm.register('email')}
                className={profileForm.formState.errors.email ? 'error' : ''}
              />
              {profileForm.formState.errors.email && (
                <span className="settings-page__field-error">{profileForm.formState.errors.email.message}</span>
              )}
            </div>

            <div className="settings-page__form-footer">
              <Button type="submit" variant="primary" disabled={profileForm.formState.isSubmitting}>
                {profileForm.formState.isSubmitting ? 'Saving…' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </Card>

        {/* ── Password ────────────────────────────────────────────────── */}
        <Card className="settings-page__section">
          <div className="settings-page__section-header">
            <h2>Password</h2>
            <p>Change your account password</p>
          </div>

          {passwordError   && <div className="settings-page__error"   role="alert">{passwordError}</div>}
          {passwordSuccess && <div className="settings-page__success" role="status">Password changed successfully.</div>}

          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="settings-page__form">
            <div className="settings-page__field">
              <label htmlFor="currentPassword" className="settings-page__label">Current Password</label>
              <input id="currentPassword" type="password" autoComplete="current-password"
                {...passwordForm.register('currentPassword')}
                className={passwordForm.formState.errors.currentPassword ? 'error' : ''}
              />
              {passwordForm.formState.errors.currentPassword && (
                <span className="settings-page__field-error">{passwordForm.formState.errors.currentPassword.message}</span>
              )}
            </div>

            <div className="settings-page__row">
              <div className="settings-page__field">
                <label htmlFor="newPassword" className="settings-page__label">New Password</label>
                <input id="newPassword" type="password" autoComplete="new-password"
                  {...passwordForm.register('newPassword')}
                  className={passwordForm.formState.errors.newPassword ? 'error' : ''}
                />
                {passwordForm.formState.errors.newPassword && (
                  <span className="settings-page__field-error">{passwordForm.formState.errors.newPassword.message}</span>
                )}
              </div>
              <div className="settings-page__field">
                <label htmlFor="confirmPassword" className="settings-page__label">Confirm New Password</label>
                <input id="confirmPassword" type="password" autoComplete="new-password"
                  {...passwordForm.register('confirmPassword')}
                  className={passwordForm.formState.errors.confirmPassword ? 'error' : ''}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <span className="settings-page__field-error">{passwordForm.formState.errors.confirmPassword.message}</span>
                )}
              </div>
            </div>

            <div className="settings-page__form-footer">
              <Button type="submit" variant="primary" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting ? 'Changing…' : 'Change Password'}
              </Button>
            </div>
          </form>
        </Card>

        {/* ── Account info (read-only) ─────────────────────────────────── */}
        <Card className="settings-page__section settings-page__section--muted">
          <div className="settings-page__section-header">
            <h2>Account</h2>
            <p>Read-only account details</p>
          </div>
          <dl className="settings-page__info-list">
            <div className="settings-page__info-row">
              <dt>Role</dt>
              <dd>{user?.role?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? '—'}</dd>
            </div>
            <div className="settings-page__info-row">
              <dt>Workspace ID</dt>
              <dd className="settings-page__mono">{user?.tenantId ?? '—'}</dd>
            </div>
            <div className="settings-page__info-row">
              <dt>Account scope</dt>
              <dd>{user?.scope ?? '—'}</dd>
            </div>
          </dl>
          <p className="settings-page__admin-note">
            To change your role or workspace settings, contact your workspace owner.
          </p>
        </Card>
      </Container>
    </div>
  )
}
