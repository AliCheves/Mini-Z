import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LangContext'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const { t } = useLang()

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>{t('loading')}</span>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  return children
}

export function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  const { t } = useLang()

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>{t('loading')}</span>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
