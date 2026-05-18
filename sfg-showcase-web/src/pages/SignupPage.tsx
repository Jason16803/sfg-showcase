import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Container, Card, Button } from '@/components'
import './SignupPage.scss'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
// Backend note: POST /api/v1/auth/register exists but requires an inviteCode.
// SFG onboarding is invite/client-provisioning based — open self-registration
// is intentionally not supported. This form collects interest data only and
// shows a placeholder success state. No API call is made.
// ---------------------------------------------------------------------------

const signupSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Enter a valid work email'),
    company: z.string().min(1, 'Company name is required'),
    jobTitle: z.string().min(1, 'Role or title is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupForm = z.infer<typeof signupSchema>

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SignupPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  // Simulate a brief async pause so the button state feels real,
  // then flip to the success state. No API call is made.
  const onSubmit = async (_data: SignupForm) => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="signup-page">
        <Container>
          <div className="signup-page__content">
            <Card className="signup-page__card signup-page__card--success">
              <div className="signup-page__success">
                <div className="signup-page__success-icon" aria-hidden="true">
                  ✓
                </div>
                <h1 className="signup-page__success-title">Request Received</h1>
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
            </Card>
          </div>
        </Container>
      </main>
    )
  }

  return (
    <main className="signup-page">
      <Container>
        <div className="signup-page__content">
          <Card className="signup-page__card">
            {/* Header */}
            <div className="signup-page__header">
              <div className="signup-page__badge">Request Access</div>
              <h1>Create Your Workspace</h1>
              <p>
                SFG is invite-based. Submit your info and a SmithForgd team
                member will reach out to set up your workspace.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="signup-page__form"
              noValidate
            >
              {/* Name row */}
              <div className="signup-page__row">
                <div className="signup-page__field">
                  <label htmlFor="firstName" className="signup-page__label">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Jane"
                    autoComplete="given-name"
                    {...register('firstName')}
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && (
                    <span className="signup-page__error">
                      {errors.firstName.message}
                    </span>
                  )}
                </div>

                <div className="signup-page__field">
                  <label htmlFor="lastName" className="signup-page__label">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Smith"
                    autoComplete="family-name"
                    {...register('lastName')}
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && (
                    <span className="signup-page__error">
                      {errors.lastName.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Work email */}
              <div className="signup-page__field">
                <label htmlFor="email" className="signup-page__label">
                  Work Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="jane@yourcompany.com"
                  autoComplete="email"
                  {...register('email')}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && (
                  <span className="signup-page__error">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Company */}
              <div className="signup-page__field">
                <label htmlFor="company" className="signup-page__label">
                  Company Name
                </label>
                <input
                  id="company"
                  type="text"
                  placeholder="Acme Services LLC"
                  autoComplete="organization"
                  {...register('company')}
                  className={errors.company ? 'error' : ''}
                />
                {errors.company && (
                  <span className="signup-page__error">
                    {errors.company.message}
                  </span>
                )}
              </div>

              {/* Job title */}
              <div className="signup-page__field">
                <label htmlFor="jobTitle" className="signup-page__label">
                  Role / Title
                </label>
                <input
                  id="jobTitle"
                  type="text"
                  placeholder="Owner, Operations Manager, etc."
                  autoComplete="organization-title"
                  {...register('jobTitle')}
                  className={errors.jobTitle ? 'error' : ''}
                />
                {errors.jobTitle && (
                  <span className="signup-page__error">
                    {errors.jobTitle.message}
                  </span>
                )}
              </div>

              {/* Password row */}
              <div className="signup-page__row">
                <div className="signup-page__field">
                  <label htmlFor="password" className="signup-page__label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    {...register('password')}
                    className={errors.password ? 'error' : ''}
                  />
                  {errors.password && (
                    <span className="signup-page__error">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                <div className="signup-page__field">
                  <label
                    htmlFor="confirmPassword"
                    className="signup-page__label"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  {errors.confirmPassword && (
                    <span className="signup-page__error">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="signup-page__submit"
              >
                {isSubmitting ? 'Submitting…' : 'Request Access'}
              </Button>

              {/* Disclaimer */}
              <p className="signup-page__disclaimer">
                This is a demo environment. No real account will be created.
              </p>
            </form>

            {/* Footer */}
            <div className="signup-page__footer">
              <p>
                Already have an account?{' '}
                <Link to="/login">Sign in here</Link>
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  )
}
