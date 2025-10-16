import { useEffect, useMemo } from 'react'

const parseWidth = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { numeric: value, css: `${value}px` }
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.endsWith('px')) {
      const numeric = Number.parseFloat(trimmed)
      if (Number.isFinite(numeric)) {
        return { numeric, css: trimmed }
      }
    }

    const numeric = Number.parseFloat(trimmed)
    if (Number.isFinite(numeric)) {
      return { numeric, css: `${numeric}px` }
    }
  }

  return { numeric: 420, css: '420px' }
}

export default function Drawer({ open, onClose, width = 420, children, title, footer }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.()
    }

    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const resolvedWidth = useMemo(() => parseWidth(width), [width])
  const panelStyle = useMemo(
    () => ({
      width: resolvedWidth.css,
      transform: `translateX(${open ? 0 : resolvedWidth.numeric}px)`,
    }),
    [open, resolvedWidth]
  )

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className="fixed right-0 top-0 z-50 h-full max-w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 ease-out flex flex-col"
        style={panelStyle}
        aria-hidden={!open}
        role="dialog"
      >
        <header className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-xl">{title}</h3>
          <button className="btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {footer && <footer className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 shrink-0">{footer}</footer>}
      </aside>
    </>
  )
}
