import { useMemo, useState } from 'react'
import { useCases } from '../store/cases'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function StatCard({ title, value, hint }) {
  return (
    <div className="card p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { cases } = useCases()
  const [loading] = useState(false)

  const stats = useMemo(() => {
    const total = cases.length
    const today = (() => {
      const t = new Date(); t.setHours(0,0,0,0)
      return cases.filter(c => {
        if(!c.nextDate) return false
        const d = new Date(c.nextDate + 'T00:00:00'); d.setHours(0,0,0,0)
        return d.getTime() === t.getTime()
      }).length
    })()
    const upcoming = cases.filter(c => c.nextDate && new Date(c.nextDate) >= new Date()).length
    const overdue = cases.filter(c => c.nextDate && new Date(c.nextDate) < new Date(new Date().toDateString())).length
    return { total, today, upcoming, overdue }
  }, [cases])

  const trend = useMemo(() => {
    const map = new Map()
    for (const c of cases) {
      if(!c.nextDate) continue
      const d = new Date(c.nextDate)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return [...map.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>({ month:k, hearings:v }))
  }, [cases])

  if (loading) {
    return <div className="grid md:grid-cols-4 gap-3">
      {[...Array(4)].map((_,i)=><div key={i} className="card p-4">
        <div className="skeleton h-4 w-20 mb-2"></div>
        <div className="skeleton h-8 w-24"></div>
      </div>)}
    </div>
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-3">
        <StatCard title="Total Matters" value={stats.total} />
        <StatCard title="Hearings Today" value={stats.today} />
        <StatCard title="Upcoming (7+ days)" value={stats.upcoming} />
        <StatCard title="Overdue" value={stats.overdue} />
      </div>

      <div className="card p-4">
        <div className="text-sm text-slate-500 mb-2">Hearings by Month</div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false}/>
              <Tooltip />
              <Line type="monotone" dataKey="hearings" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
