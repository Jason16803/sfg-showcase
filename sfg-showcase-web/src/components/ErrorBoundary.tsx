import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import './ErrorBoundary.scss'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  errorMessage: string | null
}

/**
 * ErrorBoundary
 *
 * Root-level class component that catches unhandled render errors anywhere
 * in the component tree and shows a recovery UI instead of a blank screen.
 *
 * Must be a class component — React's error boundary API (getDerivedStateFromError /
 * componentDidCatch) is only available on class components.
 *
 * Usage: wrap the root <App /> in App.tsx.
 *
 * This catches:
 *   - Uncaught errors thrown during render (e.g. recharts type errors)
 *   - Null dereference errors in page components
 *   - Import failures that slip past TypeScript
 *
 * This does NOT catch:
 *   - Async errors (Promise rejections from API calls — those are caught per-hook)
 *   - Event handler errors (those propagate to window.onerror)
 *   - Errors in the boundary itself
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorMessage: null }
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.'
    return { hasError: true, errorMessage: message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this would go to Sentry / Datadog.
    console.error('[ErrorBoundary] Unhandled render error:', error, info.componentStack)
  }

  handleReload = () => {
    // Reload the page — simplest recovery for an unknown render crash.
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: null })
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary__card">
            <div className="error-boundary__icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
              <path d="M24 6L4 42h40L24 6z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M24 20v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="24" cy="35" r="1.5" fill="currentColor"/>
            </svg>
          </div>
            <h1 className="error-boundary__title">Something went wrong</h1>
            <p className="error-boundary__body">
              An unexpected error occurred in this part of the application.
              Reloading usually fixes it.
            </p>
            {this.state.errorMessage && (
              <pre className="error-boundary__detail">
                {this.state.errorMessage}
              </pre>
            )}
            <div className="error-boundary__actions">
              <button
                className="error-boundary__reload-btn"
                onClick={this.handleReload}
              >
                Reload page
              </button>
              <button
                className="error-boundary__reset-btn"
                onClick={this.handleReset}
              >
                Try without reloading
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
