import { Link } from 'react-router-dom'

export default function CaseTable({items}){
  if(!items.length) return <div className="muted p-4">No matters yet.</div>
  const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString() : '—'
  const isToday = (d) => {
    if(!d) return false
    const t = new Date(); t.setHours(0,0,0,0)
    const nd = new Date(d + 'T00:00:00'); nd.setHours(0,0,0,0)
    return nd.getTime() === t.getTime()
  }
  const isOverdue = (d) => d && new Date(d) < new Date(new Date().toDateString())
  const isSoon = (d) => {
    if(!d) return false
    const dt = new Date(d + 'T00:00:00')
    const now = new Date(); now.setHours(0,0,0,0)
    const diff = (dt - now) / (1000*60*60*24)
    return diff >= 0 && diff <= 7
  }
  return (
    <div className="max-h-[60vh] overflow-auto">
      <table className="table">
        <thead>
          <tr>
            <th className="w-40">Case No.</th>
            <th className="w-48">Client</th>
            <th className="w-40">Next Hearing</th>
            <th>Court / Stage</th>
            <th>Notes</th>
            <th className="w-36">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.sort((a,b)=> (a.nextDate||'9999-12-31').localeCompare(b.nextDate||'9999-12-31')).map(m => (
            <tr key={m.id}>
              <td><strong>{m.caseNo}</strong><br/><span className="muted">{(m.tags||[]).map(t=>`#${t}`).join(' ')}</span></td>
              <td>{m.client}<br/><span className="muted">{m.opposite||''}</span></td>
              <td>
                {fmt(m.nextDate)}<br/>
                {isOverdue(m.nextDate) ? <span className="badge badge-overdue">Overdue</span> :
                 isToday(m.nextDate) ? <span className="badge">Today</span> :
                 isSoon(m.nextDate) ? <span className="badge badge-soon">Soon</span> : null}
              </td>
              <td>{m.court||''}<br/><span className="muted">{m.stage||''}</span></td>
              <td>{m.notes||''}</td>
              <td>
                <Link className="btn" to={`/matters/${m.id}`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
