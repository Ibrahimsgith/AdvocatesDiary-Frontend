// src/components/Drawer.jsx
import { useEffect } from 'react'

export default function Drawer({ open, onClose, width = 420, children, title, footer }) {
  // Close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Dynamic class to control the slide animation
  const translateClass = open ? 'translate-x-0' : `translate-x-[${width}px]`
  
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <aside
        // Use flex-col to stack header, content, and footer
        className={`fixed right-0 top-0 z-50 h-full max-w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${translateClass}`}
        style={{ width: `${width}px` }}
        aria-hidden={!open}
        role="dialog"
      >
        {/* Header */}
        <header className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-xl">{title}</h3>
          <button className="btn" onClick={onClose} aria-label="Close">✕</button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <footer className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
            {footer}
          </footer>
        )}
      </aside>
    </>
  )
}