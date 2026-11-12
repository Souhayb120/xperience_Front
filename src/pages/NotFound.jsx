import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="auth-page">
      <div className="card auth-card" style={{ textAlign: 'center' }}>
        <h1>Page introuvable</h1>
        <p className="muted">Cette adresse ne mène à aucune page.</p>
        <Link to="/" className="btn btn-primary">Revenir à l'accueil</Link>
      </div>
    </div>
  )
}
