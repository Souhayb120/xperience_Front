import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

// header + page + footer, shared by every page
export default function Layout() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // close the phone menu after each page change
  useEffect(() => setMenuOpen(false), [location.pathname])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <>
      <a className="skip-link" href="#contenu">Aller au contenu</a>

      <header className="site-header">
        <div className="wrap">
          <Link to="/" className="logo" aria-label="Xperience, accueil">
            <LogoMark />
            Xperience
          </Link>

          <button
            type="button"
            className="btn btn-ghost btn-sm menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Fermer' : 'Menu'}
          </button>

          <nav id="menu" className={`nav${menuOpen ? ' open' : ''}`} aria-label="Navigation principale">
            <NavLink to="/offres">Offres</NavLink>
            {user ? (
              <>
                {user.role === 'CANDIDATE' && <NavLink to="/mes-offres">Mes offres</NavLink>}
                <NavLink to="/espace">Mon espace</NavLink>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <NavLink to="/connexion">Se connecter</NavLink>
                <Link to="/inscription" className="btn btn-primary btn-sm">Créer mon compte</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main id="contenu">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <span>© {new Date().getFullYear()} Xperience — les fonctions support au Maroc</span>
          <span className="photo-credit">Photos : Unsplash</span>
          <nav aria-label="Liens du pied de page">
            <Link to="/offres">Offres</Link>
            <Link to="/inscription">Candidats</Link>
            <Link to="/inscription/entreprise">Entreprises</Link>
          </nav>
        </div>
      </footer>
    </>
  )
}

// the mark: a navy circle with a white arrow going up (career growth),
// crossed by a coral stroke so the two together draw the "X" of Xperience
function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="var(--ink)" />
      <path d="M10 22L22 10" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <path d="M15.5 10H22v6.5" fill="none" stroke="#ffffff" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 10l3.6 3.6M18.4 18.4L22 22" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
