import { useState } from 'react'
import { usePortalData } from '../store/portalData'

const defaultForm = {
  organisation: '',
  primaryContact: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
}

export default function ClientsPage() {
  const clients = usePortalData((state) => state.data.clients)
  const addClient = usePortalData((state) => state.addClient)
  const removeClient = usePortalData((state) => state.removeClient)
  const [form, setForm] = useState(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.organisation) return
    setIsSubmitting(true)
    try {
      await addClient(form)
      setForm(defaultForm)
    } catch (error) {
      console.error('Failed to add client', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async (id) => {
    setRemovingId(id)
    try {
      await removeClient(id)
    } catch (error) {
      console.error('Failed to remove client', error)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Client directory</h1>
        <p className="text-sm text-slate-500">Capture the details of everyone you represent.</p>
      </header>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Add a client</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Client name</span>
            <input
              name="organisation"
              className="input"
              value={form.organisation}
              onChange={handleChange}
              placeholder="Organisation or individual"
              required
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Primary contact</span>
            <input
              name="primaryContact"
              className="input"
              value={form.primaryContact}
              onChange={handleChange}
              placeholder="Contact person"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Phone</span>
            <input
              name="phone"
              className="input"
              value={form.phone}
              onChange={handleChange}
              placeholder="Contact number"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Email</span>
            <input
              type="email"
              name="email"
              className="input"
              value={form.email}
              onChange={handleChange}
              placeholder="contact@client.com"
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Address</span>
            <input
              name="address"
              className="input"
              value={form.address}
              onChange={handleChange}
              placeholder="Mailing address"
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Notes</span>
            <textarea
              name="notes"
              className="input min-h-[90px]"
              value={form.notes}
              onChange={handleChange}
              placeholder="Engagement notes, billing cycles, or reminders"
            />
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Adding…' : 'Add client'}
            </button>
          </div>
        </form>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {clients.length === 0 ? (
          <p className="card p-5 text-sm text-slate-500">No clients recorded yet.</p>
        ) : (
          clients.map((client) => (
            <article key={client.id} className="card p-5 space-y-2">
              <header className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{client.organisation}</h2>
                  {client.primaryContact && (
                    <p className="text-sm text-slate-500">Primary contact: {client.primaryContact}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(client.id)}
                  className="text-xs text-red-500 hover:text-red-600"
                  disabled={removingId === client.id}
                >
                  {removingId === client.id ? 'Removing…' : 'Remove'}
                </button>
              </header>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                {client.phone && <p>{client.phone}</p>}
                {client.email && <p>{client.email}</p>}
                {client.address && <p>{client.address}</p>}
              </div>
              {client.notes && <p className="text-sm text-slate-500">{client.notes}</p>}
              <button className="btn btn-primary text-sm" type="button">Open engagement</button>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
