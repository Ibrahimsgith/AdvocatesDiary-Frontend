import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useCases } from '../store/cases.js'

export default function Layout({children}){
  const navigate = useNavigate()
  const { hydrate, hydrated } = useCases()
  useEffect(()=>{ hydrate?.() }, [hydrate])
  return (
    <div className="container-narrow">
      <header className="header">
        <div>
          <h1 className="text-xl font-bold m-0">Advocate Diary</h1>
          <div className="muted">Track matters, hearings, and notes</div>
        </div>
        <nav className="flex gap-2 flex-wrap">
          <NavLink to="/" className="btn">Dashboard</NavLink>
          <NavLink to="/matters" className="btn">Matters</NavLink>
          <button className="btn btn-primary" onClick={()=>navigate('/matters/new')}>+ New Matter</button>
        </nav>
      </header>
      <div className="card p-4">
        {!hydrated ? <div className="p-4">Loading…</div> : children}
      </div>
      <footer className="text-center text-slate-500 mt-4">Local-first. Flip <code>USE_API</code> to sync with the backend.</footer>
    </div>
  )
}
