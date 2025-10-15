import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, Sun, Moon, Search } from 'lucide-react'
import clsx from 'clsx'
import { Toaster } from 'react-hot-toast'
import { useHydrateCases } from '../store/cases'

function useTheme() {
  const [dark, setDark] = useState(() =>
    localStorage.getItem('theme') === 'dark' ||
    (localStorage.getItem('theme') === null && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])
  return { dark, toggle: () => setDark(d => !d) }
}

export default function Layout({ children }) {
  const [open, setOpen] = useState(true)
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const hydrated = useHydrateCases()

  const linkClass = ({ isActive }) =>
    clsx('flex items-center gap-2 rounded-xl px-3 py-2 text-sm',
      isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Toaster position="top-right" />
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-950/60 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <button className="btn" onClick={() => setOpen(o => !o)} aria-label="Toggle sidebar">
              <Menu size={18} />
            </button>
            <h1 className="text-lg font-bold">Advocate Diary</h1>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input placeholder="Search matters…" className="input pl-9 w-72" onKeyDown={(e)=>{
                if(e.key==='Enter'){ navigate('/matters?search='+encodeURIComponent(e.currentTarget.value)) }
              }}/>
            </div>
            <button className="btn" onClick={toggle} aria-label="Toggle theme">
              {dark ? <Sun size={16}/> : <Moon size={16}/>}
              <span className="hidden md:inline">{dark ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container grid grid-cols-12 gap-4 py-4">
        <aside className={clsx('col-span-12 md:col-span-3 lg:col-span-2 transition-all', open ? 'block' : 'hidden md:block')}>
          <nav className="card p-3 space-y-2">
            <NavLink to="/" className={linkClass}>🏠 Dashboard</NavLink>
            <NavLink to="/matters" className={linkClass}>📁 Matters</NavLink>
            <button
              className="btn btn-primary w-full"
              onClick={() => navigate('/matters/new')}
              disabled={!hydrated}
            >
              + New Matter
            </button>
          </nav>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-3 px-1">Local-first • API-backed</div>
        </aside>

        <main className={clsx('col-span-12', open ? 'md:col-span-9 lg:col-span-10' : 'md:col-span-12')}>
          <div className="card p-4">
            {hydrated ? children : (
              <div className="py-24 flex flex-col items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                <span className="animate-pulse">Loading matters…</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
