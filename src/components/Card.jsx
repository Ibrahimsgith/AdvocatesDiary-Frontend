// src/components/Card.jsx

export default function Card({ title, actions, children }){
  return (
    // Uses the global .card class for glassmorphism and soft shadow
    <div className="card p-4">
      {(title || actions) && (
        <div className="flex items-center justify-between mb-3">
          {/* Title uses a darker, more prominent color */}
          {title && <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</div>}
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}