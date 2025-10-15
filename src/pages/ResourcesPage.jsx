import { useState } from 'react'
import { usePortalData } from '../store/portalData'

const defaultResourceForm = {
  title: '',
  description: '',
  link: '',
}

const defaultDeskForm = {
  name: '',
  email: '',
  notes: '',
}

export default function ResourcesPage() {
  const resources = usePortalData((state) => state.data.resources)
  const supportDesks = usePortalData((state) => state.data.supportDesks)
  const team = usePortalData((state) => state.data.team)
  const addResource = usePortalData((state) => state.addResource)
  const removeResource = usePortalData((state) => state.removeResource)
  const addSupportDesk = usePortalData((state) => state.addSupportDesk)
  const removeSupportDesk = usePortalData((state) => state.removeSupportDesk)

  const [resourceForm, setResourceForm] = useState(defaultResourceForm)
  const [deskForm, setDeskForm] = useState(defaultDeskForm)

  const handleResourceChange = (event) => {
    const { name, value } = event.target
    setResourceForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleResourceSubmit = (event) => {
    event.preventDefault()
    if (!resourceForm.title) return
    addResource(resourceForm)
    setResourceForm(defaultResourceForm)
  }

  const handleDeskChange = (event) => {
    const { name, value } = event.target
    setDeskForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleDeskSubmit = (event) => {
    event.preventDefault()
    if (!deskForm.name) return
    addSupportDesk(deskForm)
    setDeskForm(defaultDeskForm)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Firm operations &amp; resources</h1>
        <p className="text-sm text-slate-500">Upload the templates, contacts, and guides your team depends on.</p>
      </header>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Resource library</h2>
        <form className="grid gap-4 md:grid-cols-3" onSubmit={handleResourceSubmit}>
          <label className="space-y-2 text-sm md:col-span-1">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Title</span>
            <input
              name="title"
              className="input"
              value={resourceForm.title}
              onChange={handleResourceChange}
              placeholder="Court filing checklist"
              required
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Description</span>
            <textarea
              name="description"
              className="input min-h-[80px]"
              value={resourceForm.description}
              onChange={handleResourceChange}
              placeholder="Briefly describe what the resource covers"
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Link or reference</span>
            <input
              name="link"
              className="input"
              value={resourceForm.link}
              onChange={handleResourceChange}
              placeholder="https://drive.google.com/..."
            />
          </label>
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" className="btn btn-primary">Add resource</button>
          </div>
        </form>
        <div className="grid gap-4 md:grid-cols-2">
          {resources.length === 0 ? (
            <p className="text-sm text-slate-500">No resources uploaded yet.</p>
          ) : (
            resources.map((item) => (
              <article key={item.id} className="card p-5 space-y-2">
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                    {item.description && <p className="text-sm text-slate-500">{item.description}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeResource(item.id)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </header>
                {item.link && (
                  <a href={item.link} className="text-sm text-brand-600 hover:underline" target="_blank" rel="noreferrer">
                    Open reference
                  </a>
                )}
              </article>
            ))
          )}
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Support desks</h2>
        <form className="grid gap-4 md:grid-cols-3" onSubmit={handleDeskSubmit}>
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Desk name</span>
            <input
              name="name"
              className="input"
              value={deskForm.name}
              onChange={handleDeskChange}
              placeholder="Court filings desk"
              required
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Email</span>
            <input
              type="email"
              name="email"
              className="input"
              value={deskForm.email}
              onChange={handleDeskChange}
              placeholder="team@firm.com"
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Notes</span>
            <textarea
              name="notes"
              className="input min-h-[80px]"
              value={deskForm.notes}
              onChange={handleDeskChange}
              placeholder="Availability hours, turnaround times, or responsibilities"
            />
          </label>
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" className="btn btn-primary">Add support desk</button>
          </div>
        </form>
        <div className="grid gap-4 md:grid-cols-2">
          {supportDesks.length === 0 ? (
            <p className="text-sm text-slate-500">No support desks added yet.</p>
          ) : (
            supportDesks.map((desk) => (
              <article key={desk.id} className="card p-5 space-y-2">
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{desk.name}</h3>
                    {desk.email && <p className="text-sm text-slate-500">Email: {desk.email}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSupportDesk(desk.id)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </header>
                {desk.notes && <p className="text-sm text-slate-500">{desk.notes}</p>}
              </article>
            ))
          )}
        </div>
      </section>

      <section className="card p-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Emergency contacts</h2>
        {team.length === 0 ? (
          <p className="text-slate-500">Add key contacts from the dashboard to see them listed here.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-2">
            {team.map((member) => (
              <li key={member.id}>
                {member.name}
                {member.phone && <span> — {member.phone}</span>}
                {member.email && <span className="text-slate-500"> • {member.email}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
