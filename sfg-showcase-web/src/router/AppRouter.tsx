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
        {/* ── Public routes ──────────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/"        element={<HomePage />} />
          <Route path="/about"   element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login"   element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
          <Route path="/signup"  element={<RedirectIfAuthed><SignupPage /></RedirectIfAuthed>} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        </Route>

        {/* ── Protected routes — require valid JWT ───────────────────── */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/jobs"      element={<JobsPage />} />
          <Route path="/team"      element={<TeamPage />} />
          <Route path="/settings"  element={<SettingsPage />} />
          <Route path="/reports"   element={<ReportsPage />} />
        </Route>

        {/* ── Fallback ───────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
