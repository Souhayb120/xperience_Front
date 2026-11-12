import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'

// "Mon espace": one home per role
export default function Dashboard() {
  const { user } = useAuth()
  const firstName = user.fullName.split(' ')[0]

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <p className="eyebrow">{ROLE_LABELS[user.role]}</p>
          <h1>Bonjour {firstName}</h1>
        </div>
      </div>

      {user.role === 'CANDIDATE' && <CandidateHome />}
      {user.role === 'SCHOOL' && <SchoolHome />}
      {user.role === 'COMPANY' && <CompanyHome />}
      {user.role === 'ADMIN' && <AdminHome />}
    </div>
  )
}

const ROLE_LABELS = {
  CANDIDATE: 'Espace candidat',
  SCHOOL: 'Espace école',
  COMPANY: 'Espace entreprise',
  ADMIN: 'Administration',
}

// load one endpoint and remember data / error
function useLoad(path) {
  const [state, setState] = useState({ data: null, error: '' })
  useEffect(() => {
    api(path)
      .then((data) => setState({ data, error: '' }))
      .catch((e) => setState({ data: null, error: e.message }))
  }, [path])
  return state
}

function Loading({ error }) {
  return error
    ? <p className="alert alert-error" role="alert">{error}</p>
    : <p className="muted">Chargement…</p>
}

// ---------- candidate ----------
function CandidateHome() {
  const { data: profile, error } = useLoad('/me/profile')
  if (!profile) return <Loading error={error} />

  return (
    <div className="dash-grid">
      <section className="card stack" aria-labelledby="profil-title">
        <h2 id="profil-title" style={{ fontSize: 'var(--fs-xl)' }}>Mon profil</h2>
        <dl className="kv">
          <dt>Ville</dt><dd>{profile.city ?? 'À compléter'}</dd>
          <dt>Expérience</dt><dd>{profile.yearsExperience != null ? `${profile.yearsExperience} an(s)` : 'À compléter'}</dd>
          <dt>École</dt><dd>{profile.school ? `${profile.school.name} (${profile.school.city})` : 'Aucune'}</dd>
        </dl>
        <div className="row">
          {profile.skills.length > 0
            ? profile.skills.map((skill) => <span key={skill} className="chip chip-brand">{skill}</span>)
            : <span className="muted">Aucune compétence ajoutée.</span>}
        </div>
      </section>

      <section className="card stack" aria-labelledby="offres-title">
        <h2 id="offres-title" style={{ fontSize: 'var(--fs-xl)' }}>Les offres</h2>
        <p className="muted">
          {profile.hasResume ? 'Vos offres sont classées selon votre CV et vos compétences.' : 'Ajoutez votre CV pour voir les offres qui vous correspondent.'}
        </p>
        <div className="row">
          <Link to="/mes-offres" className="btn btn-primary">Voir mes offres</Link>
          <Link to="/profil" className="btn btn-ghost">{profile.hasResume ? 'Modifier mon profil' : 'Ajouter mon CV'}</Link>
        </div>
      </section>
    </div>
  )
}

// ---------- school ----------
function SchoolHome() {
  const { data: school, error } = useLoad('/school/me')
  const [copied, setCopied] = useState(false)
  if (!school) return <Loading error={error} />

  async function copyCode() {
    await navigator.clipboard.writeText(school.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="dash-grid">
      <section className="card stack" style={{ textAlign: 'center' }} aria-labelledby="code-title">
        <h2 id="code-title" style={{ fontSize: 'var(--fs-xl)' }}>Le code de {school.name}</h2>
        <p className="big-code">{school.code}</p>
        <div>
          <button className="btn btn-primary" onClick={copyCode}>{copied ? 'Code copié' : 'Copier le code'}</button>
        </div>
        <p className="muted">Donnez ce code à vos étudiants : ils l'ajoutent à l'inscription ou dans leur profil.</p>
      </section>
      <section className="card stack" aria-labelledby="ecole-title">
        <h2 id="ecole-title" style={{ fontSize: 'var(--fs-xl)' }}>Votre école</h2>
        <dl className="kv">
          <dt>Nom</dt><dd>{school.name}</dd>
          <dt>Ville</dt><dd>{school.city}</dd>
          <dt>Contact</dt><dd>{school.contactName}</dd>
          <dt>Email</dt><dd>{school.email}</dd>
        </dl>
      </section>
    </div>
  )
}

// ---------- company ----------
const STATUS = {
  PENDING: { label: 'En attente de validation', chip: 'chip-warn' },
  APPROVED: { label: 'Validée', chip: 'chip-brand' },
  REJECTED: { label: 'Refusée', chip: 'chip-danger' },
}

function CompanyHome() {
  const { data: company, error } = useLoad('/company/me')
  const { data: jobs } = useLoad('/company/jobs?size=1')
  if (!company) return <Loading error={error} />

  const status = STATUS[company.status]
  return (
    <div className="dash-grid">
      <section className="card stack" aria-labelledby="entreprise-title">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 id="entreprise-title" style={{ fontSize: 'var(--fs-xl)', margin: 0 }}>{company.name}</h2>
          <span className={`chip ${status.chip}`}>{status.label}</span>
        </div>
        {company.status === 'PENDING' && (
          <p className="alert alert-info">
            Notre équipe vérifie votre entreprise. Vous pourrez publier vos offres dès qu'elle sera validée.
          </p>
        )}
        {company.status === 'REJECTED' && (
          <p className="alert alert-error">Votre entreprise n'a pas été validée. Contactez l'équipe Xperience.</p>
        )}
        <dl className="kv">
          <dt>Ville</dt><dd>{company.city}</dd>
          <dt>Site web</dt><dd>{company.website ?? '—'}</dd>
          <dt>Contact</dt><dd>{company.contactName}</dd>
        </dl>
      </section>

      <section className="card stack" aria-labelledby="mes-offres-title">
        <h2 id="mes-offres-title" style={{ fontSize: 'var(--fs-xl)' }}>Mes offres</h2>
        <p className="big-code" style={{ letterSpacing: 0 }}>{jobs ? jobs.page.totalElements : '…'}</p>
        <p className="muted">offre(s) publiée(s)</p>
      </section>
    </div>
  )
}

// ---------- admin ----------
function AdminHome() {
  const pending = useLoad('/admin/companies?status=PENDING&size=1')
  const users = useLoad('/admin/users?size=1')
  const schools = useLoad('/admin/schools?size=1')

  const tiles = [
    { label: 'Entreprises à valider', state: pending },
    { label: 'Utilisateurs', state: users },
    { label: 'Écoles', state: schools },
  ]
  return (
    <div className="dash-grid">
      {tiles.map(({ label, state }) => (
        <section key={label} className="card stack">
          <h2 style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>{label}</h2>
          <p className="big-code" style={{ letterSpacing: 0, margin: 0 }}>
            {state.data ? state.data.page.totalElements : state.error ? '—' : '…'}
          </p>
        </section>
      ))}
    </div>
  )
}
