import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop
 *
 * Resets window scroll position to the top on every route change.
 *
 * ── Scroll container audit ────────────────────────────────────────────────
 * Both public pages (PublicLayout) and dashboard pages (DashboardLayout) use
 * document/window as their scroll container. DashboardLayout.scss explicitly
 * avoids overflow:auto on .dashboard-layout__main-wrapper to keep window as
 * the scroll target. No nested scroll container exists.
 *
 * ── Placement ────────────────────────────────────────────────────────────
 * Rendered inside <BrowserRouter> but outside <Routes> so it fires on every
 * navigation regardless of which route tree is active.
 *
 * ── Why useLocation and not a listener ───────────────────────────────────
 * useLocation re-renders this component on every pathname change, triggering
 * the effect. This is the idiomatic React Router v6 pattern — no manual
 * history.listen() wiring required.
 *
 * ── Hash links ───────────────────────────────────────────────────────────
 * The effect only runs when pathname changes, not when hash changes
 * (e.g. /#features on the homepage). Hash-only changes preserve scroll
 * position, which is the correct browser behaviour for anchor links.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Renders nothing — pure side-effect component
  return null
}
