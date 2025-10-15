import { Navigate, Route, Routes } from 'react-router-dom'
import ShellLayout from './components/ShellLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import CasesPage from './pages/CasesPage.jsx'
import ClientsPage from './pages/ClientsPage.jsx'
import UpcomingCasesPage from './pages/UpcomingCasesPage.jsx'
import ResourcesPage from './pages/ResourcesPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ShellLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="cases" element={<CasesPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="upcoming" element={<UpcomingCasesPage />} />
        <Route path="resources" element={<ResourcesPage />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  )
}
