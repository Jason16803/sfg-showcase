import type { ReactNode } from 'react'
import './Container.scss'

interface ContainerProps {
  children: ReactNode
  className?: string
}

export function Container({ children, className = '' }: ContainerProps) {
  return <div className={`container-main ${className}`}>{children}</div>
}
