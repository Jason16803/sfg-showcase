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
  isLoading?: boolean
}

function formatTime(date: Date): string {
  const diffMs    = Date.now() - date.getTime()
  const diffMins  = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays  = Math.floor(diffMs / 86_400_000)

  if (diffMins  <  1)  return 'Just now'
  if (diffMins  < 60)  return `${diffMins}m ago`
  if (diffHours < 24)  return `${diffHours}h ago`
  if (diffDays  <  7)  return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Consistent icon set — single emoji per activity type
const TYPE_ICONS: Record<string, string> = {
  job:      '🔧',
  customer: '👤',
  team:     '👥',
  system:   '⚡',
}

export function ActivityFeed({ activities, isLoading = false }: ActivityFeedProps) {
  return (
    <div className="activity-feed">
      <div className="activity-feed__header">
        <h3 className="activity-feed__title">Recent Activity</h3>
        {!isLoading && activities.length > 0 && (
          <span className="activity-feed__count">{activities.length}</span>
        )}
      </div>

      {isLoading ? (
        <ul className="activity-feed__list activity-feed__list--loading" aria-label="Loading activity">
          {[1, 2, 3, 4].map((n) => (
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
          <span className="activity-feed__empty-icon" aria-hidden="true">📋</span>
          <p>No recent activity</p>
        </div>
      ) : (
        <ul className="activity-feed__list" role="list">
          {activities.map((activity) => (
            <li key={activity.id} className="activity-feed__item">
              <div
                className={`activity-feed__icon activity-feed__icon--${activity.color}`}
                aria-hidden="true"
              >
                {TYPE_ICONS[activity.type] ?? activity.icon}
              </div>
              <div className="activity-feed__content">
                <h4 className="activity-feed__activity-title">{activity.title}</h4>
                <p className="activity-feed__description">{activity.description}</p>
                <time className="activity-feed__time" dateTime={activity.timestamp.toISOString()}>
                  {formatTime(activity.timestamp)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
