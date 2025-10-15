import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/cases', label: 'Cases' },
  { to: '/clients', label: 'Clients' },
  { to: '/upcoming', label: 'Upcoming Hearings' },
  { to: '/resources', label: 'Resources' },
]

export default function ShellLayout({ onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden btn"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <Link to="/dashboard" className="text-lg font-semibold tracking-tight">
              Pasha Law Senate
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `hover:text-brand-600 transition ${isActive ? 'text-brand-600' : 'text-slate-600 dark:text-slate-300'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button onClick={onLogout} className="btn">Log out</button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="md:hidden border-t border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900">
            <ul className="px-4 py-3 space-y-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2 text-sm font-medium ${
                        isActive ? 'bg-brand-600/10 text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-200'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <button onClick={onLogout} className="btn w-full" type="button">
                  Log out
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <Outlet />
      </main>
    </div>
  )
}
