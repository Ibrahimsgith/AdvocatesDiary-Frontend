import { useState } from 'react'

export default function LoginPage({ onSubmit }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const success = onSubmit(form)
    if (!success) {
      setError('Please provide both email and password to continue.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-slate-100">
      <div className="max-w-md w-full bg-white/90 backdrop-blur rounded-3xl border border-slate-200 shadow-lg p-8 space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Sterling &amp; Co. Law Partners</h1>
          <p className="text-sm text-slate-500">Secure portal for case tracking, client management, and firm operations.</p>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="you@sterlinglaw.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" className="btn btn-primary w-full">Sign in</button>
        </form>

        <div className="text-xs text-slate-400 text-center">
          Protected access. Contact the firm administrator to reset your credentials.
        </div>
      </div>
    </div>
  )
}
