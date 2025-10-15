import { useState } from 'react'
import { usePortalData } from '../store/portalData'

const defaultResourceForm = {
  title: '',
  type: '',
  link: '',
  owner: '',
  notes: '',
}

const defaultDeskForm = {
  department: '',
  phone: '',
  email: '',
  hours: '',
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
  const [isAddingResource, setIsAddingResource] = useState(false)
  const [isAddingDesk, setIsAddingDesk] = useState(false)
  const [removingResourceId, setRemovingResourceId] = useState(null)
  const [removingDeskId, setRemovingDeskId] = useState(null)

  const handleResourceChange = (event) => {
    const { name, value } = event.target
    setResourceForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleResourceSubmit = async (event) => {
    event.preventDefault()
    if (!resourceForm.title) return
    setIsAddingResource(true)
    try {
      await addResource(resourceForm)
      setResourceForm(defaultResourceForm)
    } catch (error) {
      console.error('Failed to add resource', error)
    } finally {
      setIsAddingResource(false)
    }
  }

  const handleDeskChange = (event) => {
    const { name, value } = event.target
    setDeskForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleDeskSubmit = async (event) => {
    event.preventDefault()
    if (!deskForm.department) return
    setIsAddingDesk(true)
    try {
      await addSupportDesk(deskForm)
      setDeskForm(defaultDeskForm)
    } catch (error) {
      console.error('Failed to add support desk', error)
    } finally {
      setIsAddingDesk(false)
    }
  }

  const handleResourceRemove = async (id) => {
    setRemovingResourceId(id)
    try {
      await removeResource(id)
    } catch (error) {
      console.error('Failed to remove resource', error)
    } finally {
      setRemovingResourceId(null)
    }
  }

  const handleDeskRemove = async (id) => {
    setRemovingDeskId(id)
    try {
      await removeSupportDesk(id)
    } catch (error) {
      console.error('Failed to remove support desk', error)
    } finally {
      setRemovingDeskId(null)
    }
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
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Category</span>
            <input
              name="type"
              className="input"
              value={resourceForm.type}
              onChange={handleResourceChange}
              placeholder="Template, policy, guide"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Owner</span>
            <input
              name="owner"
              className="input"
              value={resourceForm.owner}
              onChange={handleResourceChange}
              placeholder="Assigned team"
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Link</span>
            <input
              name="link"
              className="input"
              value={resourceForm.link}
              onChange={handleResourceChange}
              placeholder="https://drive.google.com/..."
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-3">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Notes</span>
            <textarea
              name="notes"
              className="input min-h-[80px]"
              value={resourceForm.notes}
              onChange={handleResourceChange}
              placeholder="Brief description, version history, or access notes"
            />
          </label>
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={isAddingResource}>
              {isAddingResource ? 'Saving…' : 'Add resource'}
            </button>
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
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      {[item.type, item.owner].filter(Boolean).join(' • ')}
                    </div>
                    {item.notes && <p className="text-sm text-slate-500">{item.notes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleResourceRemove(item.id)}
                    className="text-xs text-red-500 hover:text-red-600"
                    disabled={removingResourceId === item.id}
                  >
                    {removingResourceId === item.id ? 'Removing…' : 'Remove'}
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
              name="department"
              className="input"
              value={deskForm.department}
              onChange={handleDeskChange}
              placeholder="Court filings desk"
              required
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Phone</span>
            <input
              name="phone"
              className="input"
              value={deskForm.phone}
              onChange={handleDeskChange}
              placeholder="Contact number"
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
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Hours</span>
            <input
              name="hours"
              className="input"
              value={deskForm.hours}
              onChange={handleDeskChange}
              placeholder="Weekdays 9am - 6pm"
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-3">
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
            <button type="submit" className="btn btn-primary" disabled={isAddingDesk}>
              {isAddingDesk ? 'Saving…' : 'Add support desk'}
            </button>
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
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{desk.department}</h3>
                    <div className="text-xs text-slate-500 space-y-1">
                      {desk.phone && <p>Phone: {desk.phone}</p>}
                      {desk.email && <p>Email: {desk.email}</p>}
                      {desk.hours && <p>Hours: {desk.hours}</p>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeskRemove(desk.id)}
                    className="text-xs text-red-500 hover:text-red-600"
                    disabled={removingDeskId === desk.id}
                  >
                    {removingDeskId === desk.id ? 'Removing…' : 'Remove'}
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
