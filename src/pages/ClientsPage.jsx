import { clients } from '../data/firmData'

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Client Directory</h1>
        <p className="text-sm text-slate-500">Comprehensive profile of active and retainer clients with communication notes.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {clients.map((client) => (
          <article key={client.email} className="card p-5 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{client.name}</h2>
            <p className="text-sm text-slate-500">Primary contact: {client.contact}</p>
            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
              <p>{client.phone}</p>
              <p>{client.email}</p>
            </div>
            <p className="text-sm text-slate-500">{client.notes}</p>
            <button className="btn btn-primary text-sm">View engagement</button>
          </article>
        ))}
      </div>

      <section className="card p-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Client relationship essentials</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Every new client receives an onboarding questionnaire and conflict check approval.</li>
          <li>Matters are tagged to responsible partners with monthly review calls scheduled.</li>
          <li>Secure document vault ensures clients can upload evidence and track progress.</li>
        </ul>
      </section>
    </div>
  )
}
