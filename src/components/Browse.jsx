import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { FILTERS, nameOf } from './Offers'

// "Parcourir": functions, cities and contracts with their number of offers.
// Each item opens the offers page already filtered (same URL keys as /offres: ville, fonction, contrat, secteur).

const linkTo = (urlKey, value) => `/offres?${new URLSearchParams({ [urlKey]: value })}`

// the counts of every visible offer (GET /api/jobs/filters with no filter)
export function useJobCounts() {
  const [state, setState] = useState({ counts: null, error: '' })
  useEffect(() => {
    api('/jobs/filters')
      .then((counts) => setState({ counts, error: '' }))
      .catch((e) => setState({ counts: null, error: e.message }))
  }, [])
  return state
}

// one card per function: "Finance et Comptabilité · 111 offres"
export function FunctionGrid({ items }) {
  if (!items) {
    return (
      <div className="browse-grid" aria-busy="true" aria-label="Chargement des fonctions">
        {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className="skel browse-skel" />)}
      </div>
    )
  }
  return (
    <ul className="browse-grid">
      {items.map(({ label, count }) => (
        <li key={label}>
          <Link to={linkTo('fonction', label)} className="browse-card">
            <span>{label}</span>
            <span className="browse-count">{count} {count === 1 ? 'offre' : 'offres'}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

// a wrap of links "Casablanca 202"; urlKey = ville, contrat or secteur
export function CountChips({ items, urlKey }) {
  const filter = FILTERS.find((f) => f.key === urlKey)
  if (!items) {
    return (
      <div className="count-chips" aria-busy="true" aria-label="Chargement">
        {[0, 1, 2, 3, 4].map((i) => <span key={i} className="skel chip-skel" />)}
      </div>
    )
  }
  return (
    <ul className="count-chips">
      {items.map(({ label, count }) => (
        <li key={label}>
          <Link to={linkTo(urlKey, label)} className="count-chip">
            {nameOf(filter, label)} <span>{count}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
