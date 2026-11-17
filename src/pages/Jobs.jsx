import { ActiveFilters, FilterPanel, OfferList, OffersHeader, Pagination, useOfferQuery, useOffers } from '../components/Offers'

const PAGE_SIZE = 15

// list of offers: search + filters on the right, newest first. Everything is in the URL (see useOfferQuery).
// internships = the "Stages" tab: the same list with the contract fixed to Stage (no contract filter there)
export default function Jobs({ internships = false }) {
  const query = useOfferQuery()
  const backendQuery = new URLSearchParams(query.backendQuery)
  if (internships) backendQuery.set('contract', 'Stage')
  const { result, counts, error, retry } = useOffers('/jobs', { ...query, backendQuery: backendQuery.toString() }, PAGE_SIZE)

  return (
    <div className="wrap page">
      <OffersHeader
        title={internships ? 'Stages en fonctions support' : "Offres d'emploi en fonctions support"}
        text={internships
          ? 'Stages, PFE et alternances en RH, finance, juridique, IT et marketing, partout au Maroc.'
          : 'RH, finance, juridique, achats, IT, marketing et qualité, partout au Maroc. Mises à jour chaque jour.'}
        q={query.q}
        onSearch={(q) => query.update({ q })}
      />

      <div className="offers-layout">
        <FilterPanel counts={counts} values={query.values} onChange={query.update} hide={internships ? 'contrat' : ''} />

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
            onRetry={retry}
            onClear={query.clear}
          />
          <Pagination page={query.page} totalPages={result?.page.totalPages} onPage={query.goTo} />
        </div>
      </div>
    </div>
  )
}
