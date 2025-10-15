import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { api } from './lib/api'
import { usePortalData } from './store/portalData'
import ShellLayout from './components/ShellLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import CasesPage from './pages/CasesPage.jsx'
import ClientsPage from './pages/ClientsPage.jsx'
import UpcomingCasesPage from './pages/UpcomingCasesPage.jsx'
import ResourcesPage from './pages/ResourcesPage.jsx'

export default function App() {
  const [authState, setAuthState] = useState({ checking: true, isAuthenticated: false })
  const [user, setUser] = useState(null)

  useEffect(() => {
    let cancelled = false
    const verifySession = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ad-token') : null
      if (!token) {
        setAuthState({ checking: false, isAuthenticated: false })
        setUser(null)
        return
      }
      try {
        const session = await api.getSession()
        if (!cancelled) {
          setUser(session.user)
          setAuthState({ checking: false, isAuthenticated: true })
        }
      } catch (error) {
        console.warn('Failed to verify session', error)
        localStorage.removeItem('ad-token')
        if (!cancelled) {
          setUser(null)
          setAuthState({ checking: false, isAuthenticated: false })
        }
      }
    }

    verifySession()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogin = async (values) => {
    if (!values.email || !values.password) {
      return { success: false, error: 'Please provide both email and password to continue.' }
    }
    try {
      const response = await api.login(values)
      localStorage.setItem('ad-token', response.token)
      setUser(response.user)
      setAuthState({ checking: false, isAuthenticated: true })
      await usePortalData.getState().refresh()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message || 'Unable to sign in. Please try again.' }
    }
  }

  const handleLogout = async () => {
    try {
      await api.logout()
    } catch (error) {
      console.warn('Failed to revoke session', error)
    }
    localStorage.removeItem('ad-token')
    usePortalData.getState().reset()
    setUser(null)
    setAuthState({ checking: false, isAuthenticated: false })
  }

  if (authState.checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <p className="text-sm text-slate-500">Checking your session…</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          authState.isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onSubmit={handleLogin} />
          )
        }
      />

      <Route
        element={
          authState.isAuthenticated ? (
            <ShellLayout onLogout={handleLogout} user={user} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/upcoming" element={<UpcomingCasesPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={authState.isAuthenticated ? '/dashboard' : '/'} replace />}
      />
    </Routes>
  )
}
