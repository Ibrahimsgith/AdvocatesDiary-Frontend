import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { PlusCircle } from 'lucide-react'

export default function Sidebar(){
  const navigate = useNavigate()

  // Defines the link class, using 'nav-active' from index.css for the brand color
  const link = ({ isActive }) => clsx(
    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition duration-150',
    isActive && 'nav-active'
  )

  return (
    // Stickiness and 'card' style applied
    <aside className="col-span-12 md:col-span-3 lg:col-span-2">
      <nav className="card p-3 space-y-2 sticky top-[72px]">
        <NavLink to="/" className={link}>🏠 Dashboard</NavLink>
        <NavLink to="/matters" className={link}>📁 Matters</NavLink>
        <NavLink to="/calendar" className={link}>🗓️ Calendar</NavLink>
        <NavLink to="/reports" className={link}>📊 Reports</NavLink>
        
        {/* New Matter button using btn-primary */}
        <button 
            className="btn btn-primary w-full mt-3" 
            onClick={() => navigate('/matters/new')}
        >
            <PlusCircle className="h-4 w-4" /> New Matter
        </button>
      </nav>
      {/* Footer text with muted styling */}
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-3 px-1">Local-first • API-backed</div>
    </aside>
  )
}