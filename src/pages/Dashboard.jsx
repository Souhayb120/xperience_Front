import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import BarChartCard, { DonutChartCard } from '../components/BarChartCard'

// "Mon espace": one home per role
export default function Dashboard() {
  const { user } = useAuth()
  const firstName = user.fullName.split(' ')[0]

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <h1>Bonjour {firstName}</h1>
          <p className="muted" style={{ margin: 0 }}>{ROLE_LABELS[user.role]}</p>
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
    <>
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
    <SchoolStudents />
    </>
  )
}

// the students who joined with the school's code, each with their best offers
function SchoolStudents() {
  const { data, error } = useLoad('/school/students?size=50')
  const [open, setOpen] = useState(null)        // id of the student whose offers are shown
  const [matches, setMatches] = useState({})     // id -> list of matches

  async function toggle(id) {
    if (open === id) return setOpen(null)
    setOpen(id)
    if (!matches[id]) {
      const result = await api(`/school/students/${id}/matches?size=5`)
      setMatches((m) => ({ ...m, [id]: result.content }))
    }
  }

  if (!data) return <div style={{ marginTop: '2rem' }}><Loading error={error} /></div>

  return (
    <section style={{ marginTop: '2.5rem' }} aria-labelledby="etudiants-title">
      <h2 id="etudiants-title" style={{ fontSize: 'var(--fs-xl)' }}>
        Vos étudiants <span className="muted">({data.page.totalElements})</span>
      </h2>
      {data.content.length === 0 && (
        <div className="card empty">Aucun étudiant pour le moment. Partagez votre code pour qu'ils vous rejoignent.</div>
      )}
      <div className="job-list">
        {data.content.map((student) => (
          <article key={student.id} className="card stack">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0 }}>{student.fullName}</h3>
                <p className="muted" style={{ margin: 0 }}>
                  {[student.city, student.yearsExperience != null && `${student.yearsExperience} an(s) d'expérience`, student.email]
                    .filter(Boolean).join(', ')}
                </p>
              </div>
              <div className="row">
                {student.hasResume ? <span className="chip chip-brand">CV ajouté</span> : <span className="chip">Pas de CV</span>}
                <button className="btn btn-ghost btn-sm" onClick={() => toggle(student.id)} aria-expanded={open === student.id}>
                  {open === student.id ? 'Masquer ses offres' : 'Voir ses offres'}
                </button>
              </div>
            </div>
            {student.skills.length > 0 && (
              <div className="row">{student.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            )}
            {open === student.id && (
              <div className="stack">
                {!matches[student.id] && <p className="muted">Chargement…</p>}
                {matches[student.id]?.length === 0 && <p className="muted">Aucune offre ne correspond encore à son profil.</p>}
                {matches[student.id]?.map(({ job, score }) => (
                  <div key={job.id} className="mini-offer">
                    <strong>{job.title}</strong>
                    <small>{[job.company, job.city, job.contractType].filter(Boolean).join(', ')}</small>
                    <span className="score">{score} %</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
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
          <dt>Site web</dt><dd>{company.website ?? 'Non renseigné'}</dd>
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
  const [statsVersion, setStatsVersion] = useState(0)
  const pending = useLoad('/admin/companies?status=PENDING&size=1')
  const users = useLoad('/admin/users?size=1')
  const schools = useLoad('/admin/schools?size=1')

  const tiles = [
    { label: 'Entreprises à valider', state: pending },
    { label: 'Utilisateurs', state: users },
    { label: 'Écoles', state: schools },
  ]
  return (
    <div className="stack" style={{ gap: '1.5rem' }}>
      <div className="dash-grid">
        {tiles.map(({ label, state }) => (
          <section key={label} className="card stack">
            <h2 style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>{label}</h2>
            <p className="big-code" style={{ letterSpacing: 0, margin: 0, fontSize: '1.9rem' }}>
              {state.data ? state.data.page.totalElements : state.error ? 'n.c.' : '…'}
            </p>
          </section>
        ))}
      </div>
      <ImportCard onImported={() => setStatsVersion((v) => v + 1)} />
      <AdminStats key={statsVersion} />
    </div>
  )
}

// runs the Dreamjob.ma import now (it also runs by itself every day at 06:00 when SCRAPER_ENABLED=true)
function ImportCard({ onImported }) {
  const [state, setState] = useState({ running: false, message: '', error: '' })

  async function run(days) {
    setState({ running: days, message: '', error: '' })
    try {
      const { read, added } = await api(`/admin/scraper/run?days=${days}`, { method: 'POST' })
      setState({
        running: false, error: '',
        message: added > 0
          ? `${added} nouvelle${added > 1 ? 's' : ''} offre${added > 1 ? 's' : ''} ajoutée${added > 1 ? 's' : ''} (${read} lue${read > 1 ? 's' : ''}).`
          : `Aucune nouvelle offre : les ${read} offres lues sont déjà dans Xperience.`,
      })
      if (added > 0) onImported()
    } catch (e) {
      setState({ running: false, message: '', error: e.message })
    }
  }

  return (
    <section className="card import-card" aria-labelledby="import-title">
      <div>
        <h2 id="import-title">Import automatique des offres</h2>
        <p className="muted">
          Chaque jour à 6 h, Xperience lit le flux public de Dreamjob.ma et ajoute les nouvelles offres
          RH, finance, juridique, achats, marketing… Les offres déjà connues sont ignorées. Les 2 derniers mois sont importés des plus anciennes aux plus récentes.
        </p>
        {state.message && <p className="alert alert-info" role="status">{state.message}</p>}
        {state.error && <p className="alert alert-error" role="alert">{state.error}</p>}
      </div>
      <div className="row">
        <button className="btn btn-primary" onClick={() => run(1)} disabled={Boolean(state.running)}>
          {state.running === 1 ? 'Import en cours…' : 'Importer les offres du jour'}
        </button>
        <button className="btn btn-ghost" onClick={() => run(60)} disabled={Boolean(state.running)}
                title="Environ 2 minutes : une page du flux toutes les 2 secondes">
          {state.running === 60 ? 'Import des 2 mois… (≈ 2 min)' : 'Importer les 2 derniers mois'}
        </button>
      </div>
    </section>
  )
}

// charts of the visible offers + the newest candidates (GET /api/admin/stats)
function AdminStats() {
  const { data: stats, error } = useLoad('/admin/stats')
  if (!stats) return <Loading error={error} />

  return (
    <>
      <div className="grid-2" style={{ alignItems: 'start', gap: '1.5rem' }}>
        <BarChartCard title="Offres par ville" data={stats.offersByCity} />
        <DonutChartCard title="Offres par fonction" data={stats.offersByCategory} />
      </div>

      <section className="stack" aria-labelledby="latest-title">
        <div className="page-head" style={{ margin: 0 }}>
          <h2 id="latest-title" style={{ fontSize: 'var(--fs-xl)', margin: 0 }}>Derniers candidats inscrits</h2>
          <Link to="/admin/utilisateurs" className="btn btn-ghost btn-sm">Voir tous les utilisateurs</Link>
        </div>
        {stats.latestCandidates.length === 0 ? (
          <p className="empty">Aucun candidat inscrit pour le moment.</p>
        ) : (
          <div className="table-wrap card">
            <table className="data-table">
              <thead><tr><th>Nom</th><th>Email</th><th>Ville</th><th>École</th><th>CV</th><th>Inscrit le</th></tr></thead>
              <tbody>
                {stats.latestCandidates.map((c) => (
                  <tr key={c.id}>
                    <td>{c.fullName}</td>
                    <td>{c.email}</td>
                    <td>{c.city ?? <span className="muted">n.c.</span>}</td>
                    <td>{c.schoolName ?? <span className="muted">n.c.</span>}</td>
                    <td><span className={`chip ${c.hasResume ? 'chip-brand' : ''}`}>{c.hasResume ? 'Oui' : 'Non'}</span></td>
                    <td>{new Date(c.createdAt).toLocaleDateString('fr-MA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
