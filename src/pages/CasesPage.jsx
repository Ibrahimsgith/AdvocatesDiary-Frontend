import dayjs from 'dayjs'
import { caseSummaries } from '../data/firmData'

export default function CasesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Active Case Files</h1>
        <p className="text-sm text-slate-500">Centralised list of ongoing matters with next steps and hearing schedules.</p>
      </header>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
          <thead className="bg-slate-50/70 dark:bg-slate-900/70 text-left text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Case number</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Opponent</th>
              <th className="px-4 py-3">Practice area</th>
              <th className="px-4 py-3">Next hearing</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white/60 dark:bg-slate-950/50">
            {caseSummaries.map((item) => (
              <tr key={item.id} className="hover:bg-brand-50/50 dark:hover:bg-slate-800/60">
                <td className="px-4 py-4 font-medium text-brand-700 dark:text-brand-200">{item.id}</td>
                <td className="px-4 py-4">{item.client}</td>
                <td className="px-4 py-4">{item.opponent}</td>
                <td className="px-4 py-4">
                  <span className="badge">{item.practiceArea}</span>
                </td>
                <td className="px-4 py-4">{dayjs(item.nextDate).format('DD MMM YYYY')}</td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Case management protocols</h2>
        <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-2">
          <li>Digitised cause lists with automated reminders 48 hours before each hearing.</li>
          <li>Standard evidence bundles stored in the firm drive with tiered access controls.</li>
          <li>Hearing notes template to capture courtroom updates immediately after proceedings.</li>
        </ul>
      </section>
    </div>
  )
}
