import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
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
          <Link to={user ? '/espace' : '/'} className="logo" aria-label={user ? 'Xperience, mon espace' : 'Xperience, accueil'}>
            <Logo />
          </Link>

          <ThemeToggle />

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
    { to: '/admin/offres', label: 'Offres', icon: 'briefcase' },
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
    briefcase: 'M3 8h18v12H3zM8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3M3 13h18',
    building: 'M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3',
  }
  return (
    <svg className="side-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// The Xperience wordmark: a lime X whose top-right stroke becomes an upward arrow (growth),
// then "perience" in heavy teal. Drawn in code because the logo PNG is not in the repo yet.
function Logo() {
  return (
    <>
      <svg className="logo-x" viewBox="0 0 40 40" aria-hidden="true">
        <g fill="none" stroke="var(--logo-x)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 34L30 8" />
          <path d="M6 6l28 28" />
          <path d="M18 5h14v14" />
        </g>
      </svg>
      <span className="logo-word">perience</span>
    </>
  )
}

// Light / dark button. The switch is an "eclipse": going dark, the night grows out of the button
// as a circle; going light, the night shrinks back into it.
function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? 'light')
  const dark = theme === 'dark'

  function toggle(event) {
    const next = dark ? 'light' : 'dark'
    const root = document.documentElement
    const apply = () => {
      root.dataset.theme = next
      localStorage.setItem('xperience.theme', next)
      flushSync(() => setTheme(next))
    }
    // old browsers and "reduce motion": switch at once
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      apply()
      return
    }

    const { left, top, width, height } = event.currentTarget.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const small = `circle(0px at ${x}px ${y}px)`
    const big = `circle(${radius}px at ${x}px ${y}px)`

    root.classList.toggle('to-light', next === 'light')
    const transition = document.startViewTransition(apply)
    transition.ready.then(() => {
      root.animate(
        { clipPath: next === 'dark' ? [small, big] : [big, small] },
        {
          duration: 700,
          easing: 'cubic-bezier(0.7, 0, 0.25, 1)',
          pseudoElement: next === 'dark' ? '::view-transition-new(root)' : '::view-transition-old(root)',
          fill: 'forwards',
        },
      )
    })
    transition.finished.finally(() => root.classList.remove('to-light'))
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggle}
            aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
            title={dark ? 'Mode clair' : 'Mode sombre'}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <mask id="moon-mask">
          <rect x="-4" y="-4" width="32" height="32" fill="#fff" />
          <circle className="moon-cut" cx="26" cy="2" r="5.5" fill="#000" />
        </mask>
        <circle className="sun-core" cx="12" cy="12" r="5" fill="currentColor" mask="url(#moon-mask)" />
        <g className="sun-rays" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 1.5v2.5M12 20v2.5M1.5 12H4M20 12h2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
        </g>
      </svg>
    </button>
  )
}
