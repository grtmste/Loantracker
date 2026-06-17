import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Loans from './pages/Loans'
import Tracking from './pages/Tracking'
import LoanDetail from './pages/LoanDetail'
import LoanForm from './pages/LoanForm'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/jälgimine" element={<Tracking />} />
        <Route path="/laenud" element={<Loans />} />
        <Route path="/laen/uus" element={<LoanForm />} />
        <Route path="/laen/:id" element={<LoanDetail />} />
        <Route path="/laen/:id/muuda" element={<LoanForm />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
