import type { ReactNode } from 'react'
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

// Inline SVG icons — no emoji, no OS-dependent rendering
function IconWrench()   { return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="18" height="18"><path d="M12.5 3.5a4 4 0 00-4.9 4.9L3 13a1.5 1.5 0 002 2l4.6-4.6a4 4 0 004.9-4.9l-2.5 2.5-1.5-1.5 2.5-2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg> }
function IconPerson()   { return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="18" height="18"><circle cx="10" cy="6" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function IconPeople()   { return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="18" height="18"><circle cx="7" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1 16c0-2.8 2.7-5 6-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="13" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M19 16c0-2.8-2.7-5-6-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M7 16c0-2.8 2.7-5 6-5s6 2.2 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function IconBolt()     { return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="18" height="18"><path d="M11 2L4 11h6l-1 7 7-9h-6l1-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg> }
function IconClipboard(){ return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="18" height="18"><rect x="5" y="4" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 4V3h4v1" stroke="currentColor" strokeWidth="1.4"/><path d="M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }

const TYPE_ICON_NODES: Record<string, ReactNode> = {
  job:      <IconWrench />,
  customer: <IconPerson />,
  team:     <IconPeople />,
  system:   <IconBolt />,
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
                {TYPE_ICON_NODES[activity.type] ?? <IconClipboard />}
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
