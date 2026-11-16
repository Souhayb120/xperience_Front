import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { Briefcase, ChevronDown, MapPin, Search, X } from 'lucide-react'

// The building blocks of the offers pages (public list, "Mes offres", school view).
// The search, the filters and the page live in the URL (?q=paie&ville=Rabat&page=2):
// a filtered list can be shared, bookmarked, and the back button works.

// URL key (French, seen in the address bar) -> backend param and the group in GET .../filters
export const FILTERS = [
  { key: 'ville', api: 'city', group: 'cities', label: 'Ville', all: 'Toutes les villes' },
  { key: 'fonction', api: 'category', group: 'categories', label: 'Fonction', all: 'Toutes les fonctions' },
  { key: 'contrat', api: 'contract', group: 'contracts', label: 'Contrat', all: 'Tous les contrats' },
  { key: 'secteur', api: 'sector', group: 'sectors', label: 'Secteur', all: 'Tous les secteurs' },
]
const SECTOR_NAMES = { public: 'Secteur public', prive: 'Secteur privé' }
export const nameOf = (filter, value) => (filter.key === 'secteur' ? SECTOR_NAMES[value] ?? value : value)

export function useOfferQuery() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const page = Math.max(Number(params.get('page')) || 0, 0)
  const values = Object.fromEntries(FILTERS.map((f) => [f.key, params.get(f.key) ?? '']))

  // the same filters, with the backend's names (without the page)
  const backend = new URLSearchParams()
  if (q) backend.set('q', q)
  FILTERS.forEach((f) => values[f.key] && backend.set(f.api, values[f.key]))

  // a new search or filter always goes back to page 1
  function update(changes) {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)))
    next.delete('page')
    setParams(next)
  }

  function goTo(nextPage) {
    const next = new URLSearchParams(params)
    if (nextPage > 0) next.set('page', nextPage)
    else next.delete('page')
    setParams(next)
    window.scrollTo({ top: 0 })
  }

  const hasFilters = Boolean(q) || FILTERS.some((f) => values[f.key])
  return { q, page, values, hasFilters, backendQuery: backend.toString(), update, goTo, clear: () => setParams({}) }
}

export function OffersHeader({ title, text, q, onSearch }) {
  function submit(event) {
    event.preventDefault()
    onSearch(new FormData(event.currentTarget).get('q').trim())
  }

  return (
    <section className="offers-hero">
      <h1>{title}</h1>
      <p>{text}</p>
      {/* key={q}: the box shows the URL's search again after "Effacer les filtres" or the back button */}
      <form className="offers-search" role="search" onSubmit={submit} key={q}>
        <Search size={18} aria-hidden="true" />
        <label htmlFor="offers-q" className="visually-hidden">Rechercher une offre</label>
        <input id="offers-q" name="q" type="search" defaultValue={q} placeholder="Poste, entreprise, mot-clé" />
        <button className="btn btn-primary" type="submit">Rechercher</button>
      </form>
    </section>
  )
}

export function FilterPanel({ counts, values, onChange }) {
  // open on a computer, closed on a phone (the list comes first there)
  const [open, setOpen] = useState(() => window.matchMedia('(min-width: 861px)').matches)

  return (
    <aside className="card filter-panel" aria-label="Filtres">
      <button type="button" className="filter-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        Filtres <ChevronDown size={20} aria-hidden="true" />
      </button>
      {open && (
        <div className="filter-body">
          {FILTERS.map((f) => (
            <div className="field" key={f.key}>
              <label htmlFor={`filter-${f.key}`}>{f.label}</label>
              <select
                id={`filter-${f.key}`}
                className="select"
                value={values[f.key]}
                onChange={(e) => onChange({ [f.key]: e.target.value })}
              >
                <option value="">{f.all}</option>
                {optionsOf(counts?.[f.group], values[f.key]).map(({ label, count }) => (
                  <option key={label} value={label}>{nameOf(f, label)} ({count})</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}

// the chosen value stays in the list even when no offer has it any more (count 0)
function optionsOf(list = [], selected) {
  return selected && !list.some((o) => o.label === selected) ? [{ label: selected, count: 0 }, ...list] : list
}

export function ActiveFilters({ total, q, values, onChange, onClear }) {
  const active = [
    ...(q ? [{ key: 'q', text: `« ${q} »` }] : []),
    ...FILTERS.filter((f) => values[f.key]).map((f) => ({ key: f.key, text: nameOf(f, values[f.key]) })),
  ]

  return (
    <div className="result-bar">
      <p aria-live="polite"><strong>{total ?? '…'}</strong> {total === 1 ? 'offre' : 'offres'}</p>
      {active.map((a) => (
        <button key={a.key} type="button" className="chip chip-brand chip-remove" onClick={() => onChange({ [a.key]: '' })}
                aria-label={`Retirer le filtre ${a.text}`}>
          {a.text} <X size={14} aria-hidden="true" />
        </button>
      ))}
      {active.length > 0 && <button type="button" className="link-btn" onClick={onClear}>Effacer les filtres</button>}
    </div>
  )
}

// loads one page of offers + the filter counts for the current URL.
// listPath = "/jobs" or "/me/matches"; the counts come from listPath + "/filters"
export function useOffers(listPath, { backendQuery, page }, pageSize) {
  const [result, setResult] = useState(null)
  const [counts, setCounts] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)   // "Réessayer" bumps it to load again

  useEffect(() => {
    let current = true   // ignore an old answer that arrives after a newer request
    setResult(null)
    setError('')
    const params = new URLSearchParams(backendQuery)
    params.set('page', page)
    params.set('size', pageSize)
    api(`${listPath}?${params}`)
      .then((data) => current && setResult(data))
      .catch((e) => current && setError(e.message))
    return () => { current = false }
  }, [listPath, backendQuery, page, pageSize, attempt])

  useEffect(() => {
    let current = true
    api(`${listPath}/filters?${backendQuery}`)
      .then((data) => current && setCounts(data))
      .catch(() => {})   // the list already shows the error; the filters keep their last counts
    return () => { current = false }
  }, [listPath, backendQuery, attempt])

  return { result, counts, error, retry: () => setAttempt((n) => n + 1) }
}

// offers = null while loading; each offer is { job } or, on "Mes offres", { job, score, matchingSkills }.
// empty = what to show when there is no offer and no filter (each page has its own message)
export function OfferList({ offers, error, hasFilters, onRetry, onClear, empty = <p>Aucune offre pour le moment.</p> }) {
  const { pathname, search } = useLocation()

  if (error) {
    return (
      <div className="card offers-state" role="alert">
        <p>{error}</p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>Réessayer</button>
      </div>
    )
  }
  if (!offers) {
    return (
      <ul className="card offer-list" aria-busy="true" aria-label="Chargement des offres">
        {[0, 1, 2, 3, 4].map((i) => (
          <li key={i} className="offer-row" aria-hidden="true">
            <span className="skel skel-logo" />
            <span className="skel-lines"><span className="skel" /><span className="skel skel-short" /></span>
          </li>
        ))}
      </ul>
    )
  }
  if (offers.length === 0) {
    return (
      <div className="card offers-state">
        {hasFilters ? <p>Aucune offre ne correspond à ces filtres.</p> : empty}
        {hasFilters && <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>Effacer les filtres</button>}
      </div>
    )
  }
  return (
    <ul className="card offer-list">
      {offers.map((offer) => <OfferRow key={offer.job.id} {...offer} back={pathname + search} />)}
    </ul>
  )
}

// one offer on one line; the whole row opens the offer (the title link covers it).
// score + matchingSkills only on "Mes offres"
function OfferRow({ job, score, matchingSkills = [], back }) {
  return (
    <li className="offer-row">
      <CompanyLogo company={job.company} />
      <div className="offer-main">
        <Link to={`/offres/${job.id}`} state={{ back }} className="offer-title">{job.title}</Link>
        {job.company && <p className="offer-company">{job.company}</p>}
        <p className="offer-meta">
          {job.city && <span className="offer-place"><MapPin size={14} aria-hidden="true" />{job.city}</span>}
          {job.contractType && <span className="chip">{job.contractType}</span>}
        </p>
        {matchingSkills.length > 0 && (
          <p className="offer-skills">
            Vos compétences : {matchingSkills.slice(0, 3).map((s) => <span key={s} className="chip chip-brand">{s}</span>)}
          </p>
        )}
      </div>
      <div className="offer-side">
        {score != null && <span className="score-badge" aria-label={`Correspondance ${score} %`}>{score} %</span>}
        {job.postedAt && <time className="offer-date" dateTime={job.postedAt}>{relativeDate(job.postedAt)}</time>}
      </div>
    </li>
  )
}

export function Pagination({ page, totalPages, onPage }) {
  if (!totalPages || totalPages <= 1) return null
  return (
    <nav className="pager" aria-label="Pages">
      <button type="button" className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => onPage(page - 1)}>
        Page précédente
      </button>
      <span className="muted">Page {page + 1} sur {totalPages}</span>
      <button type="button" className="btn btn-ghost btn-sm" disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)}>
        Page suivante
      </button>
    </nav>
  )
}

// the company's initials ("Forvis Mazars" -> "FM", "ALTEN" -> "AL"); a briefcase when the offer has no company
export function CompanyLogo({ company }) {
  const words = (company ?? '').split(/[\s\-&.]+/).filter(Boolean)
  const letters = words.length > 1 ? words[0][0] + words[1][0] : words[0]?.slice(0, 2)
  return (
    <span className="offer-logo" aria-hidden="true">
      {letters ? letters.toUpperCase() : <Briefcase size={18} />}
    </span>
  )
}

const relative = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })

// "2026-11-14" -> "il y a 2 jours" (aujourd'hui, hier...); older than a month -> "14 octobre 2026"
export function relativeDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((date - today) / 86_400_000)
  if (days > -31) return relative.format(Math.min(days, 0), 'day')
  return date.toLocaleDateString('fr-MA', { day: 'numeric', month: 'long', year: 'numeric' })
}
