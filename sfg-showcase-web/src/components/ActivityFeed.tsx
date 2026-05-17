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
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  return (
    <div className="activity-feed">
      <h3 className="activity-feed__title">Recent Activity</h3>
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
    </div>
  )
}
