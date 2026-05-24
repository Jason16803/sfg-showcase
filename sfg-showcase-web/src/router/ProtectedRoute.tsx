import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import './ProtectedRoute.scss'

interface ProtectedRouteProps {
  children?: ReactNode
}

/**
 * ProtectedRoute
 *
 * Guards routes that require a valid JWT + authenticated user.
 *
 * States:
 *   isLoading:true        → spinner (hydrateAuth in flight)
 *   isAuthenticated:true  → render children or <Outlet />
 *   isAuthenticated:false → redirect to /login WITH { state: { from } }
 *
 * The `from` location state is consumed by LoginPage to:
 *   a) Redirect back to the intended route after successful login
 *   b) Detect that the user was redirected mid-session (show "session ended" notice)
 *
 * Security note: this is a UX gate only.
 * All real access control is enforced by requireAuth() + requireRole() on the backend.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="protected-route-loading" role="status" aria-label="Verifying session">
        <div className="protected-route-loading__spinner">
          <span className="protected-route-loading__ring" />
        </div>
        <p className="protected-route-loading__text">Verifying session…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Pass the current location so LoginPage can:
    //   1. Redirect back here after login
    //   2. Show a "session ended" notice if the user was already authenticated
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
