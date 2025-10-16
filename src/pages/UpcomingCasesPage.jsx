import dayjs from 'dayjs'
import { usePortalData } from '../store/portalData'

export default function UpcomingCasesPage() {
  const cases = usePortalData((state) => state.data.cases)

  const timeline = cases
    .filter((item) => item.nextDate)
    .slice()
    .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate))

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Upcoming hearings timeline</h1>
        <p className="text-sm text-slate-500">Matters appear here as soon as you capture a future hearing date.</p>
      </header>

      <div className="card p-6 space-y-6">
        {timeline.length === 0 ? (
          <p className="text-sm text-slate-500">No hearings scheduled yet. Add next hearing dates inside the Cases tab.</p>
        ) : (
          <ol className="relative border-l border-slate-200 dark:border-slate-700 pl-6 space-y-6">
            {timeline.map((item) => (
              <li key={item.id} className="ml-4">
                <div className="absolute -left-1 mt-1 h-3 w-3 rounded-full border-2 border-white bg-brand-600" />
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {dayjs(item.nextDate).format('dddd, DD MMM YYYY')}
                </p>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {item.client} vs {item.opponent || '—'}
                </h2>
                <p className="text-sm text-slate-500">{item.courtroom || 'Courtroom details pending'}</p>
                <div className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-3 text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    <p className="font-medium text-slate-500">Status</p>
                    <p>{item.status || '—'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">Preparation</p>
                    <p>{item.notes || 'Add preparation notes inside the case file.'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">Practice area</p>
                    <p>{item.practiceArea || '—'}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
