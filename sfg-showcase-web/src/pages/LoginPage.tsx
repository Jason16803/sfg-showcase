import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Container, Card, Button } from '@/components'
import { useAuthStore } from '@/store/authStore'
import { Link, useNavigate } from 'react-router-dom'
import './LoginPage.scss'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

/**
 * Google "G" logo — inline SVG.
 * Used only as a visual indicator on the disabled OAuth button.
 * Replace with the real Google button library when OAuth is activated.
 */
function GoogleIcon() {
  return (
    <svg
      className="login-page__google-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const setToken = useAuthStore((state) => state.setToken)
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const { token, user } = await response.json()
      setToken(token)
      setUser(user)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <main className="login-page">
      <Container>
        <div className="login-page__content">
          <Card className="login-page__card">
            <div className="login-page__header">
              <h1>Sign In</h1>
              <p>Welcome back to SFG Showcase</p>
            </div>

            {/*
             * Google OAuth button — DISABLED (pending backend activation).
             *
             * TODO (Week 2): When POST /api/v1/auth/google is live on SFO Core:
             *   1. Remove the `disabled` prop.
             *   2. Replace the onClick with: window.location.href = buildGoogleAuthUrl()
             *   3. Import buildGoogleAuthUrl from @/utils/oauth.utils.ts
             *   4. Remove the .login-page__google-note element below.
             * See docs/google-oauth-plan.md for the full checklist.
             */}
            <div className="login-page__oauth">
              <button
                type="button"
                className="login-page__google-btn"
                disabled
                aria-disabled="true"
                title="Google sign-in requires backend activation — see docs/google-oauth-plan.md"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
              <p className="login-page__google-note">
                Google sign-in is pending backend activation.
              </p>
            </div>

            {/* Divider */}
            <div className="login-page__divider" aria-hidden="true">
              <span>or sign in with email</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="login-page__form">
              <div className="login-page__field">
                <label htmlFor="email" className="login-page__label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && (
                  <span className="login-page__error">{errors.email.message}</span>
                )}
              </div>

              <div className="login-page__field">
                <label htmlFor="password" className="login-page__label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && (
                  <span className="login-page__error">{errors.password.message}</span>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="login-page__submit"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="login-page__footer">
              <p>
                Don't have an account?{' '}
                <Link to="/signup">Create one here</Link>
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  )
}
