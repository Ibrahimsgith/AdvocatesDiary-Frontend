import { useState } from 'react'
import dayjs from 'dayjs'
import { usePortalData } from '../store/portalData'

const defaultForm = {
  caseNumber: '',
  client: '',
  opponent: '',
  practiceArea: '',
  nextDate: '',
  status: '',
  courtroom: '',
  notes: '',
}

export default function CasesPage() {
  const cases = usePortalData((state) => state.data.cases)
  const addCase = usePortalData((state) => state.addCase)
  const removeCase = usePortalData((state) => state.removeCase)
  const [form, setForm] = useState(defaultForm)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.caseNumber || !form.client) return
    addCase(form)
    setForm(defaultForm)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Active case files</h1>
        <p className="text-sm text-slate-500">Add matters below to build your live case register.</p>
      </header>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Add a matter</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Case number</span>
            <input
              name="caseNumber"
              className="input"
              value={form.caseNumber}
              onChange={handleChange}
              placeholder="e.g. CIV/2381/2024"
              required
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Client</span>
            <input
              name="client"
              className="input"
              value={form.client}
              onChange={handleChange}
              placeholder="Client name"
              required
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Opponent</span>
            <input
              name="opponent"
              className="input"
              value={form.opponent}
              onChange={handleChange}
              placeholder="Opposing party"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Practice area</span>
            <input
              name="practiceArea"
              className="input"
              value={form.practiceArea}
              onChange={handleChange}
              placeholder="Commercial dispute"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Next hearing</span>
            <input
              type="date"
              name="nextDate"
              className="input"
              value={form.nextDate}
              onChange={handleChange}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Status</span>
            <input
              name="status"
              className="input"
              value={form.status}
              onChange={handleChange}
              placeholder="Awaiting filing"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Courtroom</span>
            <input
              name="courtroom"
              className="input"
              value={form.courtroom}
              onChange={handleChange}
              placeholder="Court details"
            />
          </label>
          <label className="space-y-2 text-sm md:col-span-2">
            <span className="block font-medium text-slate-600 dark:text-slate-300">Notes</span>
            <textarea
              name="notes"
              className="input min-h-[90px]"
              value={form.notes}
              onChange={handleChange}
              placeholder="Preparation steps, evidence reminders, or links"
            />
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="btn btn-primary">Add matter</button>
          </div>
        </form>
      </section>

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
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white/60 dark:bg-slate-950/50">
            {cases.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>
                  No cases have been added yet.
                </td>
              </tr>
            ) : (
              cases.map((item) => (
                <tr key={item.id} className="hover:bg-brand-50/50 dark:hover:bg-slate-800/60">
                  <td className="px-4 py-4 font-medium text-brand-700 dark:text-brand-200">{item.caseNumber}</td>
                  <td className="px-4 py-4">{item.client}</td>
                  <td className="px-4 py-4">{item.opponent || '—'}</td>
                  <td className="px-4 py-4">
                    {item.practiceArea ? <span className="badge">{item.practiceArea}</span> : '—'}
                  </td>
                  <td className="px-4 py-4">
                    {item.nextDate ? dayjs(item.nextDate).format('DD MMM YYYY') : '—'}
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{item.status || '—'}</td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => removeCase(item.id)}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
