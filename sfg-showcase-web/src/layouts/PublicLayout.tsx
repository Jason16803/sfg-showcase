import { Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="public-layout">
      <header className="public-header">
        <h1>SFG Showcase</h1>
      </header>
      <main className="public-main">
        <Outlet />
      </main>
      <footer className="public-footer">
        <p>&copy; 2024 SFG Showcase. All rights reserved.</p>
      </footer>
    </div>
  )
}
