import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicLayout } from '@/layouts/PublicLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import {
  HomePage, LoginPage, SignupPage, OAuthCallbackPage,
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
        {/* OAuth callback uses its own full-page layout (glass card + atmosphere) */}
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

        {/* ── Fallback ───────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}
