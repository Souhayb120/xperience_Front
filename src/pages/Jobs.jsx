import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import JobCard from '../components/JobCard'

const PAGE_SIZE = 10

// public list of offers: city filter + pages. The filter lives in the URL (?ville=Rabat&page=2)
// so a filtered list can be shared or bookmarked.
export default function Jobs() {
  const [params, setParams] = useSearchParams()
  const city = params.get('ville') ?? ''
  const page = Number(params.get('page') ?? 0)

  const [cityInput, setCityInput] = useState(city)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const query = new URLSearchParams({ page, size: PAGE_SIZE })
    if (city) query.set('city', city)

    setError('')
    api(`/jobs?${query}`)
      .then(setResult)
      .catch((e) => setError(e.message))
  }, [city, page])

  function search(event) {
    event.preventDefault()
    const next = {}
    if (cityInput.trim()) next.ville = cityInput.trim()
    setParams(next)
  }

  function goTo(nextPage) {
    const next = Object.fromEntries(params)
    next.page = String(nextPage)
    setParams(next)
    window.scrollTo({ top: 0 })
  }

  const jobs = result?.content ?? []
  const totalPages = result?.page?.totalPages ?? 0

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <h1>Offres d'emploi</h1>
          <p className="muted" style={{ margin: 0 }}>
            {result ? `${result.page.totalElements} offre(s)${city ? ` à ${city}` : ''}` : 'Chargement…'}
          </p>
        </div>
      </div>

      <form className="filters" onSubmit={search} role="search">
        <label htmlFor="ville" className="visually-hidden">Ville</label>
        <input
          id="ville"
          className="input"
          placeholder="Ville, par ex. Casablanca"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Filtrer</button>
        {city && (
          <button className="btn btn-ghost" type="button" onClick={() => { setCityInput(''); setParams({}) }}>
            Toutes les villes
          </button>
        )}
      </form>

      {error && <p className="alert alert-error" role="alert">{error}</p>}

      {result && jobs.length === 0 && (
        <div className="card empty">Aucune offre pour le moment{city ? ` à ${city}` : ''}.</div>
      )}

      <div className="job-list">
        {jobs.map((job) => <JobCard key={job.id} job={job} />)}
      </div>

      {totalPages > 1 && (
        <nav className="pager" aria-label="Pages">
          <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => goTo(page - 1)}>
            Page précédente
          </button>
          <span className="muted">Page {page + 1} sur {totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page + 1 >= totalPages} onClick={() => goTo(page + 1)}>
            Page suivante
          </button>
        </nav>
      )}
    </div>
  )
}
