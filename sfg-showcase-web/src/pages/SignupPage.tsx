import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthShell, Button } from '@/components'
import './SignupPage.scss'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
// No API call is made. This collects interest data only.
// SFG onboarding is invite/client-provisioning based.
//
// BACKEND REQUIREMENT — Google OAuth request-access flow:
//
// When "Request access with Google" is clicked, the user is redirected to
// GET ${VITE_API_URL}/auth/google — the same OAuth start URL used by login.
//
// The OAuth callback must be extended to detect "request access" context:
//
// 1. Callback receives verified Google profile (name, email, avatar URL)
//    from Google's OAuth token exchange (already done for login flow).
//
// 2. If the user does NOT have an existing account, instead of issuing a JWT,
//    the backend should:
//      a. Create a PendingAccessRequest document in MongoDB:
//           { googleId, email, firstName, lastName, company?, jobTitle?,
//             requestedAt, status: 'pending' }
//      b. Send an admin notification email via Resend to the configured
//           ADMIN_NOTIFICATION_EMAIL env variable.
//      c. Return the user's Google profile as JSON (name, email) so the
//           frontend can pre-fill the request-access form, OR redirect to
//           /signup?prefill=<encoded> with profile data.
//      d. Do NOT issue a JWT or create a tenant workspace.
//
// 3. Admin reviews pending requests, provisions a workspace, and sends an
//    invite code or magic link to the requester.
//
// 4. User receives approval email and completes onboarding via invite flow.
//
// Until this backend work is done, clicking the Google button on signup
// redirects to the same OAuth URL as login — the backend will see an
// unknown user and return an "unauthorized" error, which OAuthCallbackPage
// handles gracefully with a "No account found" message + "Request access" link.
// This is honest and safe — no fake functionality.
// ---------------------------------------------------------------------------

const signupSchema = z
  .object({
    firstName:       z.string().min(1, 'First name is required'),
    lastName:        z.string().min(1, 'Last name is required'),
    email:           z.string().email('Enter a valid work email'),
    company:         z.string().min(1, 'Company name is required'),
    jobTitle:        z.string().min(1, 'Role or title is required'),
    password:        z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupForm = z.infer<typeof signupSchema>

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function GoogleIcon() {
  return (
    <svg
      className="signup-page__google-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SignupPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) })

  const onSubmit = async (_data: SignupForm) => {
    await new Promise((r) => setTimeout(r, 600))
    setSubmitted(true)
  }

  // Redirects to the OAuth start URL — same as login.
  // Until the backend implements the request-access OAuth flow (see docs above),
  // unknown users will land on OAuthCallbackPage with an "unauthorized" error
  // and a "Request access" link back here. This is safe and honest behaviour.
  const handleGoogleRequest = () => {
    const apiUrl =
      (import.meta.env.VITE_API_URL as string | undefined) ||
      'https://sfo-core-api.fly.dev/api/v1'
    window.location.href = `${apiUrl}/auth/google`
  }

  // ── Success state ──────────────────────────────────────────────────────

  if (submitted) {
    return (
      <AuthShell maxWidth={480}>
        <div className="signup-page__card signup-page__card--success">
          <div className="signup-page__success">
            <div className="signup-page__success-ring" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" opacity="0.35"/>
                <path d="M14 24l8 8 14-16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="signup-page__success-title">Request received</h1>
            <p className="signup-page__success-body">
              Signup requests are handled through SmithForgd onboarding.
              Your request has been captured for demo purposes.
            </p>
            <p className="signup-page__success-note">
              In a real deployment, a SmithForgd team member would reach out
              to provision your workspace and send an invite code.
            </p>
            <Link to="/login" className="signup-page__success-link">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </AuthShell>
    )
  }

  // ── Request access form ────────────────────────────────────────────────

  return (
    <AuthShell maxWidth={500}>
      <div className="signup-page__card">

        {/* Header */}
        <div className="signup-page__header">
          <div className="signup-page__badge">Request Access</div>
          <h1>Create your workspace</h1>
          <p>
            SFG is invite-based. Submit your details and a SmithForgd team
            member will reach out to set up your workspace.
          </p>
        </div>

        {/* Google OAuth request-access option */}
        <div className="signup-page__oauth">
          <button
            type="button"
            className="signup-page__google-btn"
            onClick={handleGoogleRequest}
          >
            <GoogleIcon />
            <span>Request access with Google</span>
          </button>
          <p className="signup-page__oauth-note">
            Verifies your identity — does not create an account.
            A workspace must still be provisioned by our team.
          </p>
        </div>

        {/* Divider */}
        <div className="signup-page__divider" aria-hidden="true">
          <span>or fill in your details below</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="signup-page__form" noValidate>

          <div className="signup-page__row">
            <div className="signup-page__field">
              <label htmlFor="su-firstName" className="signup-page__label">First Name</label>
              <input
                id="su-firstName"
                type="text"
                placeholder="Jane"
                autoComplete="given-name"
                {...register('firstName')}
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && <span className="signup-page__error">{errors.firstName.message}</span>}
            </div>
            <div className="signup-page__field">
              <label htmlFor="su-lastName" className="signup-page__label">Last Name</label>
              <input
                id="su-lastName"
                type="text"
                placeholder="Smith"
                autoComplete="family-name"
                {...register('lastName')}
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && <span className="signup-page__error">{errors.lastName.message}</span>}
            </div>
          </div>

          <div className="signup-page__field">
            <label htmlFor="su-email" className="signup-page__label">Work Email</label>
            <input
              id="su-email"
              type="email"
              placeholder="jane@yourcompany.com"
              autoComplete="email"
              {...register('email')}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="signup-page__error">{errors.email.message}</span>}
          </div>

          <div className="signup-page__field">
            <label htmlFor="su-company" className="signup-page__label">Company Name</label>
            <input
              id="su-company"
              type="text"
              placeholder="Acme Services LLC"
              autoComplete="organization"
              {...register('company')}
              className={errors.company ? 'error' : ''}
            />
            {errors.company && <span className="signup-page__error">{errors.company.message}</span>}
          </div>

          <div className="signup-page__field">
            <label htmlFor="su-jobTitle" className="signup-page__label">Role / Title</label>
            <input
              id="su-jobTitle"
              type="text"
              placeholder="Owner, Operations Manager, etc."
              autoComplete="organization-title"
              {...register('jobTitle')}
              className={errors.jobTitle ? 'error' : ''}
            />
            {errors.jobTitle && <span className="signup-page__error">{errors.jobTitle.message}</span>}
          </div>

          <div className="signup-page__row">
            <div className="signup-page__field">
              <label htmlFor="su-password" className="signup-page__label">Password</label>
              <input
                id="su-password"
                type="password"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                {...register('password')}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="signup-page__error">{errors.password.message}</span>}
            </div>
            <div className="signup-page__field">
              <label htmlFor="su-confirmPassword" className="signup-page__label">Confirm</label>
              <input
                id="su-confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="signup-page__error">{errors.confirmPassword.message}</span>}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="signup-page__submit"
          >
            {isSubmitting ? 'Submitting…' : 'Request Access'}
          </Button>

          <p className="signup-page__disclaimer">
            Demo environment &mdash; no real account will be created.
          </p>
        </form>

        {/* Footer */}
        <div className="signup-page__footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign in here</Link>
          </p>
        </div>

      </div>
    </AuthShell>
  )
}
