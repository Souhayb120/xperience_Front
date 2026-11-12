import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

// header + page + footer, shared by every page
export default function Layout() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // the logged-in pages get the sidebar
  const inApp = Boolean(user) && APP_PAGES.some((page) => location.pathname.startsWith(page))

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
        {inApp ? (
          <div className="app-shell">
            <Sidebar user={user} onLogout={handleLogout} />
            <div className="app-main"><Outlet /></div>
          </div>
        ) : (
          <Outlet />
        )}
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
const APP_PAGES = ['/espace', '/profil', '/mes-offres', '/admin']

// links by role: each one says where it goes
const SIDEBAR_LINKS = {
  CANDIDATE: [
    { to: '/espace', label: 'Mon espace', icon: 'home' },
    { to: '/mes-offres', label: 'Mes offres', icon: 'star' },
    { to: '/profil', label: 'Mon profil et mon CV', icon: 'user' },
    { to: '/offres', label: 'Toutes les offres', icon: 'list' },
  ],
  SCHOOL: [
    { to: '/espace', label: 'Code et étudiants', icon: 'home' },
    { to: '/offres', label: 'Toutes les offres', icon: 'list' },
  ],
  COMPANY: [
    { to: '/espace', label: 'Mon entreprise', icon: 'home' },
    { to: '/offres', label: 'Toutes les offres', icon: 'list' },
  ],
  ADMIN: [
    { to: '/espace', label: 'Tableau de bord', icon: 'home' },
    { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: 'user' },
    { to: '/admin/ecoles', label: 'Écoles', icon: 'school' },
    { to: '/admin/entreprises', label: 'Entreprises', icon: 'building' },
    { to: '/offres', label: 'Toutes les offres', icon: 'list' },
  ],
}

const ROLE_NAMES = { CANDIDATE: 'Candidat', SCHOOL: 'École', COMPANY: 'Entreprise', ADMIN: 'Administrateur' }

function Sidebar({ user, onLogout }) {
  return (
    <aside className="sidebar" aria-label="Menu de mon espace">
      <nav className="side-nav">
        {(SIDEBAR_LINKS[user.role] ?? []).map((link) => (
          <NavLink key={link.to} to={link.to} end className="side-link">
            <Icon name={link.icon} />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="side-user">
        <span className="side-avatar" aria-hidden="true">{user.fullName.charAt(0).toUpperCase()}</span>
        <div>
          <strong>{user.fullName}</strong>
          <small>{ROLE_NAMES[user.role]}</small>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onLogout}>Se déconnecter</button>
      </div>
    </aside>
  )
}

// small line icons (stroke = current text colour)
function Icon({ name }) {
  const paths = {
    home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    school: 'M2 9l10-5 10 5-10 5zM6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5',
    building: 'M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3',
  }
  return (
    <svg className="side-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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
