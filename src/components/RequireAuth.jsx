import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

// only for logged-in users; the others go to the login page and come back after (same page, same filters).
// role="CANDIDATE": a page for one role only; the other roles go back to their own space
export default function RequireAuth({ children, role }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="wrap page muted">Chargement…</p>
  }
  if (!user) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname + location.search }} />
  }
  if (role && user.role !== role) {
    return <Navigate to="/espace" replace />
  }
  return children
}
