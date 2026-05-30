import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ProtectedRoute } from './ProtectedRoute'
import { ScrollToTop }    from './ScrollToTop'
import { PublicLayout }   from '@/layouts/PublicLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import {
  HomePage, LoginPage, SignupPage, OAuthCallbackPage, NotFoundPage,
  DashboardPage, CustomersPage, JobsPage, TeamPage, SettingsPage, ReportsPage,
  AboutPage, ContactPage,
} from '@/pages'
import { useAuthStore } from '@/store/authStore'

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        {/* ── Marketing / public pages — inside PublicLayout (nav + footer) ── */}
        <Route element={<PublicLayout />}>
          <Route path="/"        element={<HomePage />}    />
          <Route path="/about"   element={<AboutPage />}   />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* ── Auth pages — standalone with AuthShell (own chrome + footer) ─── */}
        {/* These deliberately do NOT use PublicLayout — AuthShell handles the
            full viewport, ambient background, wordmark, and bottom context.
            PublicLayout's nav would create a double-header on auth screens. */}
        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <LoginPage />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuthed>
              <SignupPage />
            </RedirectIfAuthed>
          }
        />

        {/* OAuth callback — standalone with AuthShell, owns its own atmosphere.
            Must remain at this exact path — SFO Core backend is configured to
            redirect here after the Google OAuth exchange completes.            */}
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

        {/* ── Protected dashboard routes ──────────────────────────────────── */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />}   />
          <Route path="/customers" element={<CustomersPage />}   />
          <Route path="/jobs"      element={<JobsPage />}        />
          <Route path="/team"      element={<TeamPage />}        />
          <Route path="/settings"  element={<SettingsPage />}    />
          <Route path="/reports"   element={<ReportsPage />}     />
        </Route>

        {/* ── 404 — wildcard catches all unmatched paths ──────────────────── */}
        {/* Renders NotFoundPage instead of silently redirecting to /.
            NotFoundPage is auth-aware: shows Dashboard link if authenticated. */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  )
}
