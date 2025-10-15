import { resources, team } from '../data/firmData'

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Firm Operations &amp; Resources</h1>
        <p className="text-sm text-slate-500">Guidelines, templates, and administrative details that keep the law firm running smoothly.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {resources.map((item) => (
          <article key={item.title} className="card p-5 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h2>
            <p className="text-sm text-slate-500">{item.description}</p>
            <a href={item.link} className="text-sm text-brand-600 hover:underline">Download reference</a>
          </article>
        ))}
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Support desks</h2>
        <div className="grid gap-4 md:grid-cols-3 text-sm text-slate-600 dark:text-slate-300">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Court Filings</h3>
            <p>Email: filings@sterlinglaw.com</p>
            <p>Turnaround: 24 hours for district courts, 48 hours for High Courts</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Client Services</h3>
            <p>Email: clients@sterlinglaw.com</p>
            <p>Availability: Monday to Saturday, 9.00 am – 7.00 pm</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Research Desk</h3>
            <p>Email: research@sterlinglaw.com</p>
            <p>Specialisation: Case law updates, legislative tracking, sectoral alerts</p>
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Emergency contacts</h2>
        <ul className="list-disc pl-5 space-y-2">
          {team.map((member) => (
            <li key={member.email}>
              {member.name} — {member.phone}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
