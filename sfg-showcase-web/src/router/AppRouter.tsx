import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicLayout } from '@/layouts/PublicLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import {
  HomePage,
  LoginPage,
  SignupPage,
  OAuthCallbackPage,
  DashboardPage,
  ShowcaseDashboardPage,
} from '@/pages'
import { Container } from '@/components'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no auth required */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/*
           * OAuth callback — public route, no PublicLayout chrome needed.
           * Receives ?code= from Google, exchanges it with SFO Core API.
           * CURRENT STATE: placeholder spinner only — backend endpoint pending.
           * See docs/google-oauth-plan.md.
           */}
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

          <Route
            path="/showcase-dashboard"
            element={
              <Container>
                <ShowcaseDashboardPage />
              </Container>
            }
          />
        </Route>

        {/* Protected routes — require valid JWT */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
