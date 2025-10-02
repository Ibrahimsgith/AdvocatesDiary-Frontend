import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCases } from '../store/cases.js'
import { exportJson } from '../lib/storage.js'

export default function Matters(){
  const { cases } = useCases()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    const query = q.toLowerCase().trim()
    return cases.filter(m => {
      const text = [m.caseNo, m.client, m.opposite, m.court, m.stage, m.notes, (m.tags||[]).join(',')].join(' ').toLowerCase()
      const matchQ = !query || text.includes(query)
      const nd = m.nextDate || null
      const today = new Date(); today.setHours(0,0,0,0)
      const isOverdue = nd && new Date(nd) < new Date(new Date().toDateString())
      const isToday = nd && (()=>{ const d=new Date(nd+'T00:00:00'); d.setHours(0,0,0,0); return d.getTime()===today.getTime() })()
      const matchF = filter==='all' ? true :
        filter==='upcoming' ? (nd && !isOverdue) :
        filter==='overdue' ? isOverdue :
        filter==='today' ? isToday : true
      return matchQ && matchF
    })
  }, [cases, q, filter])

  return (
    <div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-6"><input className="input" placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} /></div>
        <div className="col-span-6 md:col-span-3">
          <select className="select" value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
          </select>
        </div>
        <div className="col-span-6 md:col-span-3 flex gap-2">
          <Link className="btn btn-primary grow text-center" to="/matters/new">+ Add</Link>
          <button className="btn grow" onClick={()=>exportJson(cases)}>Export</button>
          <label className="btn grow text-center cursor-pointer">
            Import<input type="file" accept="application/json" hidden onChange={async (e)=>{
              const file = e.target.files?.[0]; if(!file) return;
              const text = await file.text(); const data = JSON.parse(text);
              if(!Array.isArray(data)) return alert('Invalid file');
              localStorage.setItem('advocate-diary:v1', JSON.stringify(data)); window.location.reload()
            }} />
          </label>
        </div>
      </div>
      <CaseTable items={filtered} />
    </div>
  )
}
