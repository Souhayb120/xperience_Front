import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import Field from '../components/Field'

// The ADMIN pages: users, schools, companies. Each list loads a page of 20 from the API.

function usePagedList(path) {
  const [page, setPage] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const separator = path.includes('?') ? '&' : '?'

  const load = useCallback(() => {
    api(`${path}${separator}page=${page}&size=20`).then(setResult).catch((e) => setError(e.message))
  }, [path, separator, page])

  useEffect(() => { load() }, [load])
  return { result, error, setError, page, setPage, reload: load }
}

function Pager({ result, page, setPage }) {
  const total = result?.page?.totalPages ?? 0
  if (total <= 1) return null
  return (
    <nav className="pager" aria-label="Pages">
      <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Page précédente</button>
      <span className="muted">Page {page + 1} sur {total}</span>
      <button className="btn btn-ghost btn-sm" disabled={page + 1 >= total} onClick={() => setPage(page + 1)}>Page suivante</button>
    </nav>
  )
}

const ROLE_NAMES = { CANDIDATE: 'Candidat', SCHOOL: 'École', COMPANY: 'Entreprise', ADMIN: 'Administrateur' }
const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('fr-MA') : '')

// ---------- users ----------
export function AdminUsers() {
  const { result, error, setError, page, setPage, reload } = usePagedList('/admin/users')

  async function remove(user) {
    if (!window.confirm(`Supprimer le compte de ${user.fullName} ?`)) return
    try { await api(`/admin/users/${user.id}`, { method: 'DELETE' }); reload() } catch (e) { setError(e.message) }
  }

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Utilisateurs</h1>
        <span className="muted">{result ? `${result.page.totalElements} compte(s)` : ''}</span>
      </div>
      {error && <p className="alert alert-error" role="alert">{error}</p>}
      <div className="table-wrap card">
        <table className="data-table">
          <thead><tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Rôle</th><th>Inscrit le</th><th /></tr></thead>
          <tbody>
            {result?.content.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber}</td>
                <td><span className="chip">{ROLE_NAMES[user.role]}</span></td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  {/* schools and companies are deleted from their own page (with their data) */}
                  {user.role === 'CANDIDATE' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => remove(user)}>Supprimer</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager result={result} page={page} setPage={setPage} />
    </div>
  )
}

// ---------- schools ----------
const EMPTY_SCHOOL = { name: '', city: '', contactName: '', email: '', phoneNumber: '', password: '' }

export function AdminSchools() {
  const { result, error, setError, page, setPage, reload } = usePagedList('/admin/schools')
  const [form, setForm] = useState(EMPTY_SCHOOL)
  const [errors, setErrors] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [created, setCreated] = useState(null)

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function create(event) {
    event.preventDefault()
    setErrors({}); setError(''); setCreated(null)
    try {
      const school = await api('/admin/schools', { method: 'POST', body: form })
      setCreated(school); setForm(EMPTY_SCHOOL); setShowForm(false); reload()
    } catch (e) { setErrors(e.fields ?? {}); setError(e.message) }
  }

  async function newCode(school) {
    if (!window.confirm(`Créer un nouveau code pour ${school.name} ? L'ancien ne marchera plus.`)) return
    try { await api(`/admin/schools/${school.id}/new-code`, { method: 'POST' }); reload() } catch (e) { setError(e.message) }
  }

  async function remove(school) {
    if (!window.confirm(`Supprimer l'école ${school.name} et son compte ? Ses étudiants restent inscrits.`)) return
    try { await api(`/admin/schools/${school.id}`, { method: 'DELETE' }); reload() } catch (e) { setError(e.message) }
  }

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Écoles</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Fermer' : 'Ajouter une école'}
        </button>
      </div>
      {error && <p className="alert alert-error" role="alert">{error}</p>}
      {created && (
        <p className="alert alert-info" role="status">
          École « {created.name} » créée. Son code : <strong>{created.code}</strong>
        </p>
      )}

      {showForm && (
        <form className="card form" onSubmit={create} noValidate style={{ marginBottom: '1.5rem' }}>
          <div className="grid-2" style={{ alignItems: 'start', gap: '1rem' }}>
            <Field label="Nom de l'école" name="name" value={form.name} onChange={update} error={errors.name} />
            <Field label="Ville" name="city" value={form.city} onChange={update} error={errors.city} />
            <Field label="Nom du contact" name="contactName" value={form.contactName} onChange={update} error={errors.contactName} />
            <Field label="Email de connexion" name="email" type="email" value={form.email} onChange={update} error={errors.email} />
            <Field label="Téléphone" name="phoneNumber" type="tel" value={form.phoneNumber} onChange={update} error={errors.phoneNumber} />
            <Field label="Mot de passe" name="password" type="password" hint="8 caractères minimum" value={form.password} onChange={update} error={errors.password} />
          </div>
          <div><button className="btn btn-primary" type="submit">Créer l'école</button></div>
        </form>
      )}

      <div className="table-wrap card">
        <table className="data-table">
          <thead><tr><th>École</th><th>Ville</th><th>Code</th><th>Contact</th><th /></tr></thead>
          <tbody>
            {result?.content.map((school) => (
              <tr key={school.id}>
                <td>{school.name}</td>
                <td>{school.city}</td>
                <td><code className="code">{school.code}</code></td>
                <td>{school.contactName}<br /><small className="muted">{school.email}</small></td>
                <td className="row" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => newCode(school)}>Nouveau code</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => remove(school)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {result?.content.length === 0 && <p className="empty">Aucune école pour le moment.</p>}
      </div>
      <Pager result={result} page={page} setPage={setPage} />
    </div>
  )
}

// ---------- companies ----------
const STATUS = {
  PENDING: { label: 'En attente', chip: 'chip-warn' },
  APPROVED: { label: 'Validée', chip: 'chip-brand' },
  REJECTED: { label: 'Refusée', chip: 'chip-danger' },
}

export function AdminCompanies() {
  const [status, setStatus] = useState('PENDING')
  const { result, error, setError, page, setPage, reload } = usePagedList(
    status ? `/admin/companies?status=${status}` : '/admin/companies')

  async function act(company, action) {
    try {
      if (action === 'delete') {
        if (!window.confirm(`Supprimer ${company.name}, son compte et toutes ses offres ?`)) return
        await api(`/admin/companies/${company.id}`, { method: 'DELETE' })
      } else {
        await api(`/admin/companies/${company.id}/${action}`, { method: 'POST' })
      }
      reload()
    } catch (e) { setError(e.message) }
  }

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Entreprises</h1>
        <div className="row" role="group" aria-label="Filtrer par statut">
          {[['PENDING', 'À valider'], ['APPROVED', 'Validées'], ['REJECTED', 'Refusées'], ['', 'Toutes']].map(([value, label]) => (
            <button key={label} className={`btn btn-sm ${status === value ? 'btn-primary' : 'btn-ghost'}`}
                    aria-pressed={status === value}
                    onClick={() => { setStatus(value); setPage(0) }}>{label}</button>
          ))}
        </div>
      </div>
      {error && <p className="alert alert-error" role="alert">{error}</p>}
      <div className="table-wrap card">
        <table className="data-table">
          <thead><tr><th>Entreprise</th><th>Ville</th><th>Contact</th><th>Statut</th><th /></tr></thead>
          <tbody>
            {result?.content.map((company) => (
              <tr key={company.id}>
                <td>{company.name}{company.website && <><br /><small><a href={company.website} target="_blank" rel="noopener noreferrer">{company.website}</a></small></>}</td>
                <td>{company.city}</td>
                <td>{company.contactName}<br /><small className="muted">{company.email}</small></td>
                <td><span className={`chip ${STATUS[company.status].chip}`}>{STATUS[company.status].label}</span></td>
                <td className="row" style={{ justifyContent: 'flex-end' }}>
                  {company.status !== 'APPROVED' && <button className="btn btn-primary btn-sm" onClick={() => act(company, 'approve')}>Valider</button>}
                  {company.status !== 'REJECTED' && <button className="btn btn-ghost btn-sm" onClick={() => act(company, 'reject')}>Refuser</button>}
                  <button className="btn btn-ghost btn-sm" onClick={() => act(company, 'delete')}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {result?.content.length === 0 && <p className="empty">Aucune entreprise dans cette liste.</p>}
      </div>
      <Pager result={result} page={page} setPage={setPage} />
    </div>
  )
}

// ---------- offers ----------
const SOURCE_NAMES = { dreamjob: 'Dreamjob.ma', 'emploi-public': 'Emploi public', admin: 'Admin', company: 'Entreprise', seed: 'Exemple' }
const SORTS = [
  ['date-desc', 'Plus récentes'],
  ['date-asc', 'Plus anciennes'],
  ['title-asc', 'Titre A → Z'],
  ['title-desc', 'Titre Z → A'],
]
const PERIODS = [[1, "Aujourd'hui"], [7, '7 jours'], [15, '15 jours'], [30, '1 mois'], [60, '2 mois']]
const MAX_DAYS = 62
const IMPORT_SOURCES = ['dreamjob', 'emploi-public']   // the sources the admin can import from
const isoDay = (date) => date.toISOString().slice(0, 10)

export function AdminJobs() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ q: '', city: '', category: '', source: '', sort: 'date-desc' })
  const [choices, setChoices] = useState({ cities: [], categories: [], sources: [] })

  const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString()
  const { result, error, setError, page, setPage, reload } = usePagedList(`/admin/jobs?${params}`)

  const loadChoices = useCallback(() => { api('/admin/jobs/filters').then(setChoices).catch(() => {}) }, [])
  useEffect(() => { loadChoices() }, [loadChoices])

  // the search box waits 300 ms after the last key before asking the server
  useEffect(() => {
    const timer = setTimeout(() => setFilters((f) => (f.q === search ? f : { ...f, q: search })), 300)
    return () => clearTimeout(timer)
  }, [search])
  useEffect(() => { setPage(0) }, [params, setPage])

  const setFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })
  const reset = () => { setSearch(''); setFilters({ q: '', city: '', category: '', source: '', sort: 'date-desc' }) }

  async function remove(job) {
    if (!window.confirm(`Supprimer l'offre « ${job.title} » ?`)) return
    try { await api(`/admin/jobs/${job.id}`, { method: 'DELETE' }); reload() } catch (e) { setError(e.message) }
  }

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Offres</h1>
        <span className="muted">{result ? `${result.page.totalElements} offre(s)` : ''}</span>
      </div>

      {/* one tab per source: Dreamjob.ma and Emploi public offers are kept apart, each with its own import */}
      <div className="source-tabs" role="tablist" aria-label="Source des offres">
        {['', ...IMPORT_SOURCES, ...choices.sources.filter((s) => !IMPORT_SOURCES.includes(s))].map((s) => (
          <button key={s || 'all'} type="button" role="tab" aria-selected={filters.source === s}
                  className={`source-tab${filters.source === s ? ' active' : ''}`}
                  onClick={() => setFilters({ ...filters, source: s })}>
            {s ? SOURCE_NAMES[s] ?? s : 'Toutes'}
          </button>
        ))}
      </div>

      {IMPORT_SOURCES.includes(filters.source)
        ? <ImportPanel key={filters.source} source={filters.source} onImported={() => { reload(); loadChoices() }} />
        : <p className="muted import-hint">Pour importer des offres, ouvrez l'onglet Dreamjob.ma ou Emploi public.</p>}

      <div className="card filters" role="search">
        <input className="input" type="search" placeholder="Rechercher un titre ou une entreprise…"
               aria-label="Rechercher" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="select" name="city" aria-label="Ville" value={filters.city} onChange={setFilter}>
          <option value="">Toutes les villes</option>
          {choices.cities.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="select" name="category" aria-label="Fonction" value={filters.category} onChange={setFilter}>
          <option value="">Toutes les fonctions</option>
          {choices.categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="select" name="sort" aria-label="Trier" value={filters.sort} onChange={setFilter}>
          {SORTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button className="btn btn-ghost btn-sm" onClick={reset}>Effacer</button>
      </div>

      {error && <p className="alert alert-error" role="alert">{error}</p>}
      <div className="table-wrap card">
        <table className="data-table">
          <thead><tr><th>Offre</th><th>Ville</th><th>Fonction</th><th>Source</th><th>Publiée le</th><th /></tr></thead>
          <tbody>
            {result?.content.map((job) => (
              <tr key={job.id}>
                <td>
                  {job.url ? <a href={job.url} target="_blank" rel="noopener noreferrer">{job.title}</a> : job.title}
                  {(job.company || job.publisherName) && <><br /><small className="muted">{job.publisherName ?? job.company}</small></>}
                </td>
                <td>{job.city ?? <span className="muted">n.c.</span>}</td>
                <td>{job.category ?? <span className="muted">n.c.</span>}</td>
                <td><span className="chip">{SOURCE_NAMES[job.source] ?? job.source}</span></td>
                <td>{job.postedAt ? new Date(job.postedAt).toLocaleDateString('fr-MA') : <span className="muted">n.c.</span>}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => remove(job)}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {result?.content.length === 0 && <p className="empty">Aucune offre ne correspond à ces filtres.</p>}
      </div>
      <Pager result={result} page={page} setPage={setPage} />
    </div>
  )
}

// imports the offers of one source published in a chosen period, from the oldest to the newest.
// Emploi public: only the contests still open, and each contest page is read (slower).
function ImportPanel({ source, onImported }) {
  const today = new Date()
  const [since, setSince] = useState(isoDay(new Date(today.getTime() - 6 * 86400000)))
  const [state, setState] = useState({ running: false, message: '', error: '' })

  // both dates at midnight UTC, so the difference is a whole number of days
  const days = Math.round((Date.parse(isoDay(today)) - Date.parse(since)) / 86400000) + 1
  const pickPeriod = (n) => setSince(isoDay(new Date(today.getTime() - (n - 1) * 86400000)))
  const isDreamjob = source === 'dreamjob'

  async function run() {
    setState({ running: true, message: '', error: '' })
    try {
      const { read, added } = await api(`/admin/scraper/run?source=${source}&days=${days}`, { method: 'POST' })
      setState({
        running: false, error: '',
        message: added > 0
          ? `${added} nouvelle(s) offre(s) ajoutée(s) sur ${read} lue(s).`
          : `Aucune nouvelle offre : les ${read} offres lues sont déjà dans Xperience.`,
      })
      if (added > 0) onImported()
    } catch (e) {
      setState({ running: false, message: '', error: e.message })
    }
  }

  return (
    <section className="card import-panel" aria-labelledby="import-panel-title">
      <div className="import-panel-head">
        <h2 id="import-panel-title">Importer depuis {SOURCE_NAMES[source]}</h2>
        <p className="muted">
          {isDreamjob
            ? 'Choisissez la période : les offres publiées depuis cette date sont ajoutées de la plus ancienne à la plus récente, sans doublons.'
            : 'Choisissez la période : les concours de la fonction publique publiés depuis cette date et encore ouverts sont ajoutés, du plus ancien au plus récent. Chaque concours est lu sur sa page : comptez quelques minutes pour un mois.'}
        </p>
      </div>
      <div className="import-panel-row">
        <div className="row" role="group" aria-label="Période">
          {PERIODS.map(([n, label]) => (
            <button key={n} type="button" className={`btn btn-sm ${days === n ? 'btn-primary' : 'btn-ghost'}`}
                    aria-pressed={days === n} onClick={() => pickPeriod(n)}>{label}</button>
          ))}
        </div>
        <label className="import-since">
          Depuis le
          <input className="input" type="date" value={since} onChange={(e) => setSince(e.target.value)}
                 min={isoDay(new Date(today.getTime() - (MAX_DAYS - 1) * 86400000))} max={isoDay(today)} />
        </label>
        <button className="btn btn-primary" onClick={run} disabled={state.running || days < 1 || days > MAX_DAYS}>
          {state.running ? 'Import en cours…' : `Importer ${days} jour${days > 1 ? 's' : ''}`}
        </button>
      </div>
      {state.message && <p className="alert alert-info" role="status">{state.message}</p>}
      {state.error && <p className="alert alert-error" role="alert">{state.error}</p>}
    </section>
  )
}
