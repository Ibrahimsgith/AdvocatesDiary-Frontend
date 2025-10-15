import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ShellLayout from './components/ShellLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import CasesPage from './pages/CasesPage.jsx'
import ClientsPage from './pages/ClientsPage.jsx'
import UpcomingCasesPage from './pages/UpcomingCasesPage.jsx'
import ResourcesPage from './pages/ResourcesPage.jsx'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('ad-authenticated') === 'true'
  })

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('ad-authenticated', 'true')
    } else {
      localStorage.removeItem('ad-authenticated')
    }
  }, [isAuthenticated])

  const handleLogin = (values) => {
    if (!values.email || !values.password) return false
    setIsAuthenticated(true)
    return true
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onSubmit={handleLogin} />
          )
        }
      />

      <Route
        element={
          isAuthenticated ? (
            <ShellLayout onLogout={handleLogout} />
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
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />}
      />
    </Routes>
  )
}
