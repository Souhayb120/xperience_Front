import { CountChips, FunctionGrid, useJobCounts } from '../components/Browse'

// /metiers: browse the offers by function, city, contract and sector, each with its number of offers
export default function Browse() {
  const { counts, error } = useJobCounts()

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <h1>Parcourir les offres</h1>
          <p className="muted" style={{ margin: 0 }}>
            Choisissez une fonction, une ville ou un contrat pour voir les offres qui y correspondent.
          </p>
        </div>
      </div>

      {error ? (
        <p className="alert alert-error" role="alert">{error}</p>
      ) : (
        <>
          <section className="browse-section" aria-labelledby="browse-functions">
            <h2 id="browse-functions">Emploi par fonction</h2>
            <FunctionGrid items={counts?.categories} />
          </section>

          <div className="browse-two">
            <section className="browse-section" aria-labelledby="browse-cities">
              <h2 id="browse-cities">Emploi par ville</h2>
              <CountChips items={counts?.cities} urlKey="ville" />
            </section>
            <div>
              <section className="browse-section" aria-labelledby="browse-contracts">
                <h2 id="browse-contracts">Par type de contrat</h2>
                <CountChips items={counts?.contracts} urlKey="contrat" />
              </section>
              <section className="browse-section" aria-labelledby="browse-sectors">
                <h2 id="browse-sectors">Secteur public ou privé</h2>
                <CountChips items={counts?.sectors} urlKey="secteur" />
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
