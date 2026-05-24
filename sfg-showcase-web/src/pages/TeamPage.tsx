import { Container, Badge } from '@/components'
import { useTeam } from '@/features/dashboard/hooks'
import { useAuthStore } from '@/store/authStore'
import './TeamPage.scss'

// Role → Badge variant mapping
const roleBadgeVariant = (role: string): 'primary' | 'info' | 'warning' | 'success' => {
  if (role === 'owner')             return 'primary'
  if (role === 'general_manager')   return 'info'
  if (role === 'assistant_manager') return 'warning'
  return 'success'
}

// Status → Badge variant
const statusBadgeVariant = (status: string): 'success' | 'warning' | 'error' => {
  if (status === 'active')  return 'success'
  if (status === 'invited') return 'warning'
  return 'error'
}

// Format last login timestamp
function formatLastLogin(lastLogin: string | null): string {
  if (!lastLogin) return 'Never'
  const d = new Date(lastLogin)
  const diffMs = Date.now() - d.getTime()
  const diffMins  = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays  = Math.floor(diffMs / 86_400_000)
  if (diffMins  < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays  <  7) return `${diffDays}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Format role label
function roleLabel(role: string): string {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function TeamPage() {
  const { data: members, isLoading, isMock } = useTeam()
  const { user: currentUser } = useAuthStore()

  // BACKEND ENFORCEMENT: GET /api/v1/team requires general_manager+.
  // Roles below that threshold will receive mock data (403 triggers fallback).
  // Frontend sidebar hides this section for employees.

  return (
    <main className="team-page">
      <Container>
        <div className="team-page__header">
          <div>
            <h1>Team</h1>
            <p>
              {members ? `${members.length} team member${members.length !== 1 ? 's' : ''}` : 'Workspace team members'}
              {isMock && <span className="team-page__demo-badge">Demo data</span>}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="team-page__loading">
            {[1, 2, 3].map((n) => (
              <div key={n} className="team-page__skeleton-row" aria-hidden="true">
                <div className="team-page__skeleton-avatar" />
                <div className="team-page__skeleton-content">
                  <div className="team-page__skeleton-line team-page__skeleton-line--name" />
                  <div className="team-page__skeleton-line team-page__skeleton-line--email" />
                </div>
              </div>
            ))}
          </div>
        ) : members && members.length > 0 ? (
          <ul className="team-page__list">
            {members.map((member) => {
              const isCurrentUser = currentUser?.id === member.id
              const initials = `${member.firstName[0] ?? ''}${member.lastName[0] ?? ''}`.toUpperCase()
              return (
                <li key={member.id} className={`team-page__member${isCurrentUser ? ' team-page__member--current' : ''}`}>
                  <div className="team-page__avatar" aria-hidden="true">{initials}</div>
                  <div className="team-page__member-info">
                    <div className="team-page__name-row">
                      <span className="team-page__name">
                        {member.firstName} {member.lastName}
                        {isCurrentUser && <span className="team-page__you">you</span>}
                      </span>
                      <Badge variant={roleBadgeVariant(member.role)}>
                        {roleLabel(member.role)}
                      </Badge>
                    </div>
                    <p className="team-page__email">{member.email}</p>
                  </div>
                  <div className="team-page__meta">
                    <Badge variant={statusBadgeVariant(member.status)}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </Badge>
                    <span className="team-page__last-login">
                      Last active {formatLastLogin(member.lastLogin)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="team-page__empty">
            <p>No team members found.</p>
          </div>
        )}
      </Container>
    </main>
  )
}
