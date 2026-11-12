import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

// only for logged-in users; the others go to the login page and come back after
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="wrap page muted">Chargement…</p>
  }
  if (!user) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />
  }
  return children
}
