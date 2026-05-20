import { Navigate, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import './ProtectedRoute.scss'

interface ProtectedRouteProps {
  children?: ReactNode
}

/**
 * ProtectedRoute
 *
 * Wraps routes that require a valid JWT and authenticated user.
 *
 * States:
 *   isLoading:true       → render spinner (hydrateAuth() in flight)
 *   isAuthenticated:true → render children or <Outlet /> (layout routes)
 *   isAuthenticated:false → redirect to /login (no token, or token was cleared)
 *
 * Used in two patterns in AppRouter:
 *   1. Layout wrap:  <ProtectedRoute><DashboardLayout /></ProtectedRoute>
 *      DashboardLayout renders <Outlet /> — nested routes inject into it.
 *   2. Direct wrap:  <ProtectedRoute><SomePage /></ProtectedRoute>
 *
 * Security note: frontend route hiding is NOT a security boundary.
 * All API routes enforce requireAuth() + requireRole() on the backend.
 * This component only provides the UX redirect; it does not grant access.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore()

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
    return <Navigate to="/login" replace />
  }

  // Support both layout routes (children = <DashboardLayout /> which has <Outlet />)
  // and direct child wrapping. If children is provided, render it; otherwise
  // render <Outlet /> for nested route injection.
  return children ? <>{children}</> : <Outlet />
}
