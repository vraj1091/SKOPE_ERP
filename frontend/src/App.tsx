import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import ErrorBoundary from './components/ErrorBoundary'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Sales from './pages/Sales'
import Customers from './pages/Customers'
import Financial from './pages/Financial'
import Reports from './pages/Reports'
import Users from './pages/Users'
import Marketing from './pages/Marketing'
import Stores from './pages/Stores'
import AdIntegrations from './pages/AdIntegrations'
import AdvancedReports from './pages/AdvancedReports'
import AIInsights from './pages/AIInsights'
import Settings from './pages/Settings'
import Analytics from './pages/Analytics'
import LiveDashboard from './pages/LiveDashboard'

// Layout
import Layout from './components/Layout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore()

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="stores" element={<Stores />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="sales" element={<Sales />} />
            <Route path="customers" element={<Customers />} />
            <Route path="financial" element={<Financial />} />
            <Route path="marketing" element={<Marketing />} />
            <Route path="ad-integrations" element={<AdIntegrations />} />
            <Route path="ai-insights" element={<AIInsights />} />
            <Route path="reports" element={<Reports />} />
            <Route path="advanced-reports" element={<AdvancedReports />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="live-dashboard" element={<LiveDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App

