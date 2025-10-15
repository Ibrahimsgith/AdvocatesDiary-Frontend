import { caseSummaries, stats, tasks, team } from '../data/firmData'
import dayjs from 'dayjs'

const statCards = [
  { label: 'Active Matters', key: 'activeMatters' },
  { label: 'Hearings This Week', key: 'hearingsThisWeek' },
  { label: 'Filings Pending', key: 'filingsPending' },
  { label: 'Team Utilisation', key: 'teamUtilisation', suffix: '%' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article key={card.key} className="card p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              {stats[card.key]}
              {card.suffix ?? ''}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="card p-5 lg:col-span-2 space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Priority Hearings</h2>
            <span className="text-xs text-slate-500">Automatically synced from court calendars</span>
          </header>
          <div className="space-y-4">
            {caseSummaries.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-brand-600">{item.id}</p>
                    <p className="text-base font-medium">{item.client} vs {item.opponent}</p>
                  </div>
                  <span className="badge">{item.practiceArea}</span>
                </div>
                <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-3 text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    <dt className="font-medium text-slate-500">Next hearing</dt>
                    <dd>{dayjs(item.nextDate).format('DD MMM YYYY')}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Courtroom</dt>
                    <dd>{item.courtroom}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Status</dt>
                    <dd>{item.status}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-sm text-slate-500">{item.notes}</p>
              </div>
            ))}
          </div>
        </article>

        <aside className="space-y-6">
          <article className="card p-5 space-y-4">
            <h2 className="text-lg font-semibold">Action Items</h2>
            <ul className="space-y-3 text-sm">
              {tasks.map((task) => (
                <li key={task.title} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-brand-600" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                    <p className="text-xs text-slate-500">
                      Owner: {task.owner} • Due {dayjs(task.due).format('DD MMM')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="card p-5 space-y-4">
            <h2 className="text-lg font-semibold">Key Contacts</h2>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {team.map((member) => (
                <li key={member.email} className="rounded-xl border border-slate-200/70 dark:border-slate-800/70 p-3">
                  <p className="font-semibold text-slate-900 dark:text-white">{member.name}</p>
                  <p>{member.role}</p>
                  <p className="text-xs mt-1">{member.phone}</p>
                  <p className="text-xs">{member.email}</p>
                </li>
              ))}
            </ul>
          </article>
        </aside>
      </section>
    </div>
  )
}
