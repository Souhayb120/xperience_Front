import { Link } from 'react-router-dom'
import { ActiveFilters, FilterPanel, OfferList, OffersHeader, Pagination, useOfferQuery, useOffers } from '../components/Offers'

const PAGE_SIZE = 15

// "Mes offres": the offers that match the candidate, best score first, with the same search and filters
// as the public list (GET /api/me/matches takes the same params)
export default function Matches() {
  const query = useOfferQuery()
  const { result, counts, error, retry } = useOffers('/me/matches', query, PAGE_SIZE)

  return (
    <div className="wrap page">
      <OffersHeader
        title="Mes offres"
        text="Classées selon vos compétences et votre ville. Le score est indicatif, pas une garantie de recrutement."
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
            offers={result?.content}
            error={error}
            hasFilters={query.hasFilters}
            onRetry={retry}
            onClear={query.clear}
            empty={
              <>
                <p>Aucune offre ne correspond encore à votre profil. Ajoutez votre CV ou vos compétences pour voir vos offres.</p>
                <Link to="/profil" className="btn btn-primary">Compléter mon profil</Link>
              </>
            }
          />
          <Pagination page={query.page} totalPages={result?.page.totalPages} onPage={query.goTo} />
        </div>
      </div>
    </div>
  )
}
