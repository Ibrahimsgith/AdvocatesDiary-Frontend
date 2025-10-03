import { Search } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useEffect } from 'react'

export default function Topbar({ onOpenCmd }) {
  // Hotkey listener for Command Palette (Ctrl/Cmd + K)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); onOpenCmd?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onOpenCmd])

  return (
    // Sticky header with glass effect (backdrop-blur) and soft border
    <header className="sticky top-0 z-40 bg-white/60 dark:bg-slate-950/50 backdrop-blur border-b border-slate-200/70 dark:border-slate-800/60">
      <div className="container mx-auto flex items-center justify-between py-3 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* App Title */}
          <span className="font-extrabold text-lg tracking-tight">Advocate Diary</span>
          
          {/* Command Palette Trigger Button (Visible on md+) */}
          <button 
            onClick={onOpenCmd} 
            className="hidden md:flex items-center gap-2 rounded-xl border border-slate-300/70 dark:border-slate-700/60 px-3 py-1.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition duration-150"
          >
            <Search size={16} /><span className="text-sm text-slate-500">Search…</span>
            <span className="ml-2 kbd">⌘K</span> {/* The attractive keyboard shortcut style */}
          </button>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  )
}