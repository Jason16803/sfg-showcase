import { Outlet } from 'react-router-dom'
import { PublicNav } from '@/components'
import './PublicLayout.scss'

export function PublicLayout() {
  return (
    <div className="public-layout">
      <PublicNav />
      <main className="public-layout__main">
        <Outlet />
      </main>
      <footer className="public-layout__footer">
        <p>&copy; 2024 SFG Showcase. All rights reserved.</p>
      </footer>
    </div>
  )
}

