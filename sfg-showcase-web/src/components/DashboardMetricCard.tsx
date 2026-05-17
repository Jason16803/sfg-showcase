import type { ReactNode } from 'react'
import './DashboardMetricCard.scss'

interface DashboardMetricCardProps {
  title: string
  value: string | number
  unit?: string
  change?: {
    value: number
    isPositive: boolean
  }
  icon?: ReactNode
  trend?: 'up' | 'down' | 'stable'
}

export function DashboardMetricCard({
  title,
  value,
  unit,
  change,
  icon,
  trend,
}: DashboardMetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-card__header">
        <h3 className="metric-card__title">{title}</h3>
        {icon && <div className="metric-card__icon">{icon}</div>}
      </div>
      <div className="metric-card__content">
        <div className="metric-card__value">
          <span className="metric-card__number">{value}</span>
          {unit && <span className="metric-card__unit">{unit}</span>}
        </div>
        {change && (
          <div
            className={`metric-card__change ${
              change.isPositive ? 'metric-card__change--positive' : 'metric-card__change--negative'
            }`}
          >
            <span className="metric-card__trend">
              {change.isPositive ? '↑' : '↓'}
            </span>
            <span>{Math.abs(change.value)}% from last month</span>
          </div>
        )}
      </div>
      {trend && (
        <div className="metric-card__trend-indicator">
          <div
            className={`metric-card__trend-bar metric-card__trend-bar--${trend}`}
          />
        </div>
      )}
    </div>
  )
}
