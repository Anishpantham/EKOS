import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/search', label: 'Search' },
  { to: '/graph', label: 'Knowledge Graph' },
  { to: '/integrity', label: 'Integrity Center' },
  { to: '/documents', label: 'Documents' },
]

function SidebarContent({ onNavigate }) {
  return (
    <>
      <div className="px-5 py-6 border-b border-border-soft">
        <p className="font-display text-2xl text-paper tracking-tight">EKOS</p>
        <p className="text-[11px] font-mono text-muted mt-1 uppercase tracking-wider">
          Aurelia Technologies
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-surface-raised text-paper font-medium'
                  : 'text-muted hover:text-paper hover:bg-surface'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-border-soft">
        <p className="text-[11px] font-mono text-muted-soft leading-relaxed">
          Enterprise Knowledge
          <br />
          Operating System
        </p>
      </div>
    </>
  )
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-ink">
      {/* Desktop rail */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-border-soft flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 border-b border-border-soft bg-ink">
        <p className="font-display text-lg text-paper">EKOS</p>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="text-paper p-2 -mr-2"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-ink border-r border-border-soft flex flex-col z-50">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
