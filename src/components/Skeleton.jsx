// grey shapes of the content while it loads (instead of "Chargement…"); screen readers hear one "Chargement…"

export function SkeletonLines({ count = 3 }) {
  return (
    <div className="skel-lines" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => <span key={i} className={`skel${i === count - 1 ? ' skel-short' : ''}`} />)}
    </div>
  )
}

export function SkeletonCard({ lines = 3, logo = false }) {
  return (
    <div className="card skel-card" aria-hidden="true">
      <div className="skel-card-head">
        {logo && <span className="skel skel-logo" />}
        <span className="skel skel-title" />
      </div>
      <SkeletonLines count={lines} />
    </div>
  )
}

// cards in the dashboard grid, inside a page that already has its title
export function SkeletonGrid({ cards = 2, lines = 3 }) {
  return (
    <div className="dash-grid" role="status" aria-busy="true">
      <span className="visually-hidden">Chargement…</span>
      {Array.from({ length: cards }, (_, i) => <SkeletonCard key={i} lines={lines} />)}
    </div>
  )
}

// a whole page: a title bar, then cards
export function PageSkeleton({ cards = 2, lines = 3 }) {
  return (
    <div className="wrap page">
      <span className="skel skel-heading" aria-hidden="true" />
      <SkeletonGrid cards={cards} lines={lines} />
    </div>
  )
}
