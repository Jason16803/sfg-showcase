import { useEffect } from 'react'
import '@/styles/global.scss'
import { AppRouter } from '@/router'
import { hydrateAuth } from '@/auth/service'
import { ErrorBoundary } from '@/components'

export default function App() {
  useEffect(() => {
    // On app mount, verify any stored JWT against SFO Core (GET /api/v1/me).
    // Restores user state on success; clears invalid auth on 401/403.
    // ProtectedRoute waits on store.isLoading before rendering or redirecting.
    hydrateAuth()
  }, [])

  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  )
}
