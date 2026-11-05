import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function RequireAuth({ children, adminOnly = false, allowedRoles = null }) {
  const { user, ready } = useAuth()
  const location = useLocation()

  if (!ready) return <p className="auth-session-loading" role="status">Checking your session...</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/profile" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/profile" replace />
  return children
}
