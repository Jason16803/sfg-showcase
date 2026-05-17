import type { ReactNode } from 'react'
import './Badge.scss'

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

export function Badge({
  variant = 'primary',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span className={`badge badge--${variant} ${className}`}>
      {children}
    </span>
  )
}
