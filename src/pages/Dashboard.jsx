import Card from '../components/Card'
import { useCases } from '../store/cases'
import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import dayjs from 'dayjs'

export default function Dashboard(){
  const { cases } = useCases()

  // Calculation for key statistics
  const stats = useMemo(()=>{
    const today = new Date(); today.setHours(0,0,0,0)
    const total = cases.length
    const todayCount = cases.filter(c => c.nextDate && (new Date(c.nextDate+'T00:00:00')).getTime() === today.getTime()).length
    const upcoming = cases.filter(c => c.nextDate && new Date(c.nextDate) >= new Date()).length
    const overdue = cases.filter(c => c.nextDate && new Date(c.nextDate+'T00:00:00') < today).length
    return { total, today: todayCount, upcoming, overdue }
  }, [cases])

  // Calculation for monthly hearing trend chart
  const trend = useMemo(()=>{
    const map = new Map()
    for(const c of cases){
      if(!c.nextDate) continue
      const d = dayjs(c.nextDate)
      const key = d.format('YYYY-MM') // YYYY-MM for sorting
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    // Sorts by date and maps to objects for recharts
    return [...map.entries()]
      .sort(([a],[b])=>a.localeCompare(b))
      .map(([k,v])=>({ month: dayjs(k).format('MMM YY'), hearings:v }))
  }, [cases])

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="card p-3 text-sm">
          <p className="font-semibold text-slate-700 dark:text-slate-200">{label}</p>
          <p className="text-brand-600">{`${payload[0].value} Hearings`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      
      {/* Statistic Cards (col-span-3 on md screens) */}
      <div className="col-span-12 sm:col-span-6 md:col-span-3"><Card title="Total Matters"><div className="text-3xl font-semibold">{stats.total}</div></Card></div>
      <div className="col-span-12 sm:col-span-6 md:col-span-3"><Card title="Hearings Today"><div className="text-3xl font-semibold text-green-600 dark:text-green-400">{stats.today}</div></Card></div>
      <div className="col-span-12 sm:col-span-6 md:col-span-3"><Card title="Upcoming"><div className="text-3xl font-semibold text-yellow-600 dark:text-yellow-400">{stats.upcoming}</div></Card></div>
      <div className="col-span-12 sm:col-span-6 md:col-span-3"><Card title="Overdue"><div className="text-3xl font-semibold text-red-600 dark:text-red-400">{stats.overdue}</div></Card></div>

      {/* Monthly Trend Chart */}
      <div className="col-span-12">
        <Card title="Hearings by Month">
          <div className="h-72 w-full"> {/* Increased height for better visibility */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="month" stroke="#64748b" className="text-xs" />
                <YAxis allowDecimals={false} stroke="#64748b" className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                    type="monotone" 
                    dataKey="hearings" 
                    stroke="#4f46e5" /* Uses brand color */
                    strokeWidth={2}
                    activeDot={{ r: 6, fill: '#4f46e5', stroke: 'white', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}