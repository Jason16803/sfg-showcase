import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Container, Card, Button } from '@/components'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import './LoginPage.scss'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

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
                <a href="/signup">Create one here</a>
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  )
}
