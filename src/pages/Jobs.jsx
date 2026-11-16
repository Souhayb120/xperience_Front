import { ActiveFilters, FilterPanel, OfferList, OffersHeader, Pagination, useOfferQuery, useOffers } from '../components/Offers'

const PAGE_SIZE = 15

// public list of offers: search + filters on the right, newest first. Everything is in the URL (see useOfferQuery).
export default function Jobs() {
  const query = useOfferQuery()
  const { result, counts, error, retry } = useOffers('/jobs', query, PAGE_SIZE)

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
            onRetry={retry}
            onClear={query.clear}
          />
          <Pagination page={query.page} totalPages={result?.page.totalPages} onPage={query.goTo} />
        </div>
      </div>
    </div>
  )
}
