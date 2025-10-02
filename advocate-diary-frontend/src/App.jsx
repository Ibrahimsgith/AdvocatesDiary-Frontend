import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Matters from './pages/Matters.jsx'
import MatterForm from './pages/MatterForm.jsx'

export default function App(){
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/matters" element={<Matters />} />
        <Route path="/matters/new" element={<MatterForm />} />
        <Route path="/matters/:id" element={<MatterForm />} />
        <Route path="*" element={<div className="p-4">Not Found</div>} />
      </Routes>
    </Layout>
  )
}
