import { useMemo, useState } from 'react'

export default function LoginPage({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const title = useMemo(
    () => (mode === 'login' ? 'Sign in to Pasha Law Senate' : 'Create your Pasha Law Senate account'),
    [mode]
  )

  const description =
    mode === 'login'
      ? 'Secure portal for case tracking, client management, and firm operations.'
      : 'Set up your secure access to manage matters, clients, and team collaboration.'

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const handler = mode === 'login' ? onLogin : onRegister
      if (typeof handler !== 'function') {
        throw new Error('Authentication handler is not available.')
      }

      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password }

      const result = await handler(payload)
      if (!result?.success) {
        setError(
          result?.error ||
            (mode === 'login'
              ? 'Unable to sign in. Please try again.'
              : 'Unable to create your account. Please try again.')
        )
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-slate-100">
      <div className="max-w-md w-full bg-white/90 backdrop-blur rounded-3xl border border-slate-200 shadow-lg p-8 space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{description}</p>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="input"
                placeholder="Your name"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="you@pashalawsenate.com"
              autoComplete={mode === 'login' ? 'username' : 'email'}
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
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="text-xs text-slate-400 text-center space-y-1">
          <p>
            {mode === 'login'
              ? 'Protected access. Contact the firm administrator to reset your credentials.'
              : 'Only trusted firm staff should create accounts. Passwords must remain confidential.'}
          </p>
          <button
            type="button"
            className="text-sky-600 hover:text-sky-700 font-medium"
            onClick={() => {
              setMode((current) => (current === 'login' ? 'register' : 'login'))
              setError('')
              setIsSubmitting(false)
            }}
          >
            {mode === 'login' ? 'Need an account? Create one now.' : 'Already registered? Sign in instead.'}
          </button>
        </div>
      </div>
    </div>
  )
}
