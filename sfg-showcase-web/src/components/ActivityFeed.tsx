import './ActivityFeed.scss'

export interface Activity {
  id: string
  type: 'job' | 'customer' | 'team' | 'system'
  title: string
  description: string
  timestamp: Date
  icon: string
  color: 'primary' | 'success' | 'warning' | 'error'
}

interface ActivityFeedProps {
  activities: Activity[]
  /** When true, shows a loading state instead of empty-state messaging */
  isLoading?: boolean
}

export function ActivityFeed({ activities, isLoading = false }: ActivityFeedProps) {
  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins  = Math.floor(diffMs / 60_000)
    const diffHours = Math.floor(diffMs / 3_600_000)
    const diffDays  = Math.floor(diffMs / 86_400_000)

    if (diffMins < 1)  return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7)   return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="activity-feed">
      <h3 className="activity-feed__title">Recent Activity</h3>

      {isLoading ? (
        // Loading skeleton — three shimmer rows
        <ul className="activity-feed__list activity-feed__list--loading" aria-label="Loading activity">
          {[1, 2, 3].map((n) => (
            <li key={n} className="activity-feed__item activity-feed__item--skeleton" aria-hidden="true">
              <div className="activity-feed__skeleton-icon" />
              <div className="activity-feed__skeleton-content">
                <div className="activity-feed__skeleton-line activity-feed__skeleton-line--title" />
                <div className="activity-feed__skeleton-line activity-feed__skeleton-line--desc" />
                <div className="activity-feed__skeleton-line activity-feed__skeleton-line--time" />
              </div>
            </li>
          ))}
        </ul>
      ) : activities.length === 0 ? (
        <div className="activity-feed__empty">
          <p>No recent activity</p>
        </div>
      ) : (
        <ul className="activity-feed__list">
          {activities.map((activity, index) => (
            <li key={activity.id} className="activity-feed__item">
              <div className={`activity-feed__icon activity-feed__icon--${activity.color}`}>
                {activity.icon}
              </div>
              <div className="activity-feed__content">
                <h4 className="activity-feed__activity-title">{activity.title}</h4>
                <p className="activity-feed__description">{activity.description}</p>
                <span className="activity-feed__time">{formatTime(activity.timestamp)}</span>
              </div>
              {index < activities.length - 1 && (
                <div className="activity-feed__connector" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
