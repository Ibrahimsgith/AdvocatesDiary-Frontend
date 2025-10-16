import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { usePortalData } from '../store/portalData'

const navItems = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/cases', label: 'Cases' },
  { to: '/clients', label: 'Clients' },
  { to: '/upcoming', label: 'Upcoming Hearings' },
  { to: '/resources', label: 'Resources' },
]

export default function ShellLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const load = usePortalData((state) => state.load)
  const hasLoaded = usePortalData((state) => state.hasLoaded)
  const isLoading = usePortalData((state) => state.isLoading)
  const error = usePortalData((state) => state.error)
  const clearError = usePortalData((state) => state.clearError)
  const notice = usePortalData((state) => state.notice)
  const clearNotice = usePortalData((state) => state.clearNotice)
  const hasCache = usePortalData((state) => state.hasCache)

  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      load().catch(() => {})
    }
  }, [hasLoaded, isLoading, load])

  const handleRetry = () => {
    clearError()
    load().catch(() => {})
  }

  const renderContent = () => {
    if (!hasLoaded) {
      if (hasCache) {
        return <Outlet />
      }
      if (isLoading) {
        return (
          <div className="card p-6 text-sm text-slate-500">Loading the latest portal data…</div>
        )
      }
      return (
        <div className="card p-6 space-y-3 text-sm">
          <p className="font-medium text-red-600">{error || 'Unable to load portal data.'}</p>
          <button type="button" className="btn btn-primary" onClick={handleRetry}>
            Try again
          </button>
        </div>
      )
    }

    return <Outlet />
  }

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
            </ul>
          </nav>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-4">
        {error && hasLoaded && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 flex items-start justify-between gap-4">
            <span>{error}</span>
            <button type="button" className="text-xs font-medium underline" onClick={clearError}>
              Dismiss
            </button>
          </div>
        )}
        {notice && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start justify-between gap-4">
            <span>{notice}</span>
            <button type="button" className="text-xs font-medium underline" onClick={clearNotice}>
              Dismiss
            </button>
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  )
}
