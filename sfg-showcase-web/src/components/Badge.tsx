import type { ReactNode } from 'react'
import './Badge.scss'

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info'
export type BadgeSize    = 'sm' | 'md'

interface BadgeProps {
  variant?:  BadgeVariant
  size?:     BadgeSize
  dot?:      boolean        // prefix with a colored status dot
  children:  ReactNode
  className?: string
}

/**
 * Badge — unified status/label pill component.
 *
 * Variants: primary, success, warning, error, info
 * Sizes:    sm (11px), md (12px — default)
 * Dot:      optional leading colored dot for status indicators
 *
 * Usage:
 *   <Badge variant="success">Active</Badge>
 *   <Badge variant="warning" size="sm" dot>Pending</Badge>
 */
export function Badge({
  variant   = 'primary',
  size      = 'md',
  dot       = false,
  children,
  className = '',
}: BadgeProps) {
  const classes = [
    'badge',
    `badge--${variant}`,
    `badge--${size}`,
    className,
  ].filter(Boolean).join(' ')

  return (
    <span className={classes}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
