import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { ActiveFilters, FilterPanel, OfferList, OffersHeader, Pagination, useOfferQuery } from '../components/Offers'

const PAGE_SIZE = 15

// public list of offers: search + filters on the right, newest first. Everything is in the URL (see useOfferQuery).
export default function Jobs() {
  const query = useOfferQuery()
  const { backendQuery, page } = query

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
    params.set('size', PAGE_SIZE)
    api(`/jobs?${params}`)
      .then((data) => current && setResult(data))
      .catch((e) => current && setError(e.message))
    return () => { current = false }
  }, [backendQuery, page, attempt])

  useEffect(() => {
    let current = true
    api(`/jobs/filters?${backendQuery}`)
      .then((data) => current && setCounts(data))
      .catch(() => {})   // the list already shows the error; the filters keep their last counts
    return () => { current = false }
  }, [backendQuery, attempt])

  return (
    <div className="wrap page">
      <OffersHeader
        title="Offres d'emploi en fonctions support"
        text="RH, finance, juridique, achats, IT, marketing et qualité, partout au Maroc. Mises à jour chaque jour."
        q={query.q}
        onSearch={(q) => query.update({ q })}
      />

      <div className="offers-layout">
        <FilterPanel counts={counts} values={query.values} onChange={query.update} />

        <div className="offers-results">
          <ActiveFilters
            total={result?.page.totalElements}
            q={query.q}
            values={query.values}
            onChange={query.update}
            onClear={query.clear}
          />
          <OfferList
            offers={result?.content.map((job) => ({ job }))}
            error={error}
            hasFilters={query.hasFilters}
            onRetry={() => setAttempt((n) => n + 1)}
            onClear={query.clear}
          />
          <Pagination page={page} totalPages={result?.page.totalPages} onPage={query.goTo} />
        </div>
      </div>
    </div>
  )
}
