import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LangProvider } from './contexts/LangContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Layout from './components/layout/Layout'

// Pages (lazy-loaded for performance)
import { lazy, Suspense } from 'react'
const Login         = lazy(() => import('./pages/Login'))
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Standings     = lazy(() => import('./pages/Standings'))
const DriverProfile = lazy(() => import('./pages/DriverProfile'))
const Schedule      = lazy(() => import('./pages/Schedule'))
const Admin         = lazy(() => import('./pages/Admin'))

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text3)', fontSize: 13 }}>Cargando…</span>
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />

              {/* Protected — require auth */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/standings/:championshipId" element={
                <ProtectedRoute>
                  <Layout><Standings /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/driver/:driverId" element={
                <ProtectedRoute>
                  <Layout><DriverProfile /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/schedule" element={
                <ProtectedRoute>
                  <Layout><Schedule /></Layout>
                </ProtectedRoute>
              } />

              {/* Admin only */}
              <Route path="/admin" element={
                <AdminRoute>
                  <Layout><Admin /></Layout>
                </AdminRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  )
}
