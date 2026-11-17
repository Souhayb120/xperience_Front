import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { BriefcaseBusiness, Globe, GraduationCap, House, List, Star, User } from 'lucide-react'
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

  const headerRef = useRef(null)
  const toggleRef = useRef(null)

  // close the phone menu after each page change
  useEffect(() => setMenuOpen(false), [location.pathname])

  // while the phone menu is open: Escape closes it (focus back on the Menu button), a tap outside the header too
  useEffect(() => {
    if (!menuOpen) return undefined
    function onKey(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    function onPointer(event) {
      if (!headerRef.current?.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [menuOpen])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <>
      <a className="skip-link" href="#contenu">Aller au contenu</a>

      <header ref={headerRef} className={`site-header${menuOpen ? ' menu-open' : ''}`}>
        <div className="wrap">
          <Link to={user ? '/espace' : '/'} className="logo" aria-label={user ? 'Xperience, mon espace' : 'Xperience, accueil'}>
            <Logo />
          </Link>

          <ThemeToggle />

          <button
            ref={toggleRef}
            type="button"
            className="btn btn-ghost btn-sm menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Fermer' : 'Menu'}
          </button>

          <nav id="menu" className={`nav${menuOpen ? ' open' : ''}`} aria-label="Navigation principale">
            {user ? (
              <>
                {/* the offers are for candidates only */}
                {user.role === 'CANDIDATE' && (
                  <>
                    <NavLink to="/offres">Offres</NavLink>
                    <NavLink to="/metiers">Métiers</NavLink>
                    <NavLink to="/mes-offres">Mes offres</NavLink>
                  </>
                )}
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
          <span>© {new Date().getFullYear()} Xperience, les fonctions support au Maroc</span>
          <span className="photo-credit">Photos : Unsplash</span>
          <nav aria-label="Liens du pied de page">
            <Link to="/inscription">Créer un compte candidat</Link>
            <Link to="/connexion">Se connecter</Link>
          </nav>
        </div>
      </footer>
    </>
  )
}

const APP_PAGES = ['/espace', '/profil', '/mes-offres', '/offres', '/metiers', '/admin']

// links by role: each one says where it goes; short = the label of the phone tab bar
const SIDEBAR_LINKS = {
  CANDIDATE: [
    { to: '/espace', label: 'Mon espace', short: 'Accueil', icon: 'home' },
    { to: '/mes-offres', label: 'Mes offres', short: 'Mes offres', icon: 'star' },
    { to: '/offres', label: 'Toutes les offres', short: 'Offres', icon: 'list' },
    { to: '/metiers', label: 'Métiers', short: 'Métiers', icon: 'briefcase' },
    { to: '/profil', label: 'Mon profil et mon CV', short: 'Profil', icon: 'user' },
  ],
  SCHOOL: [
    { to: '/espace', label: 'Code et étudiants', short: 'Étudiants', icon: 'home' },
  ],
  ADMIN: [
    { to: '/espace', label: 'Tableau de bord', short: 'Tableau', icon: 'home' },
    { to: '/admin/utilisateurs', label: 'Utilisateurs', short: 'Comptes', icon: 'user' },
    { to: '/admin/ecoles', label: 'Écoles', short: 'Écoles', icon: 'school' },
    { to: '/admin/offres', label: 'Offres', short: 'Offres', icon: 'briefcase' },
    { to: '/admin/sites-carrieres', label: 'Sites carrières', short: 'Sites', icon: 'globe' },
  ],
}

const ROLE_NAMES = { CANDIDATE: 'Candidat', SCHOOL: 'École', ADMIN: 'Administrateur' }

function Sidebar({ user, onLogout }) {
  const links = SIDEBAR_LINKS[user.role] ?? []
  // a phone tab bar with a single tab is useless: hidden there (sidebar-single)
  return (
    <aside className={`sidebar${links.length < 2 ? ' sidebar-single' : ''}`} aria-label="Menu de mon espace">
      <nav className="side-nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end className="side-link">
            <Icon name={link.icon} />
            {/* only one of the two labels is displayed (display: none hides the other from screen readers too) */}
            <span className="side-label">{link.label}</span>
            <span className="side-label-short">{link.short}</span>
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

// sidebar icons from Lucide (one library, same stroke everywhere)
const ICONS = {
  home: House, star: Star, user: User, list: List,
  school: GraduationCap, briefcase: BriefcaseBusiness, globe: Globe,
}

function Icon({ name }) {
  const LucideIcon = ICONS[name]
  return <LucideIcon className="side-icon" size={18} strokeWidth={2} aria-hidden="true" />
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
    }).catch(() => {})   // the browser skipped the animation: the theme still changes
    transition.finished.finally(() => root.classList.remove('to-light')).catch(() => {})
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
