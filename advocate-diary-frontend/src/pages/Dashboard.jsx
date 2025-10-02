import { useMemo } from 'react'
import { useCases } from '../store/cases.js'
import CaseTable from '../components/CaseTable.jsx'

export default function Dashboard(){
  const { cases } = useCases()
  const upcoming = useMemo(() => {
    const now = new Date(); now.setHours(0,0,0,0)
    return cases.filter(c => c.nextDate && new Date(c.nextDate) >= now)
  }, [cases])

  return (
    <div>
      <h2 className="text-lg font-semibold mt-0">Upcoming</h2>
      <CaseTable items={upcoming} />
    </div>
  )
}
