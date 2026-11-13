// The idea of Xperience in motion: a CV sends its skills along the lines to three offers,
// their scores fill up, and the best match lights up. Pure CSS + SVG, loops every 7s,
// stops under "reduced motion" (see .match-anim in global.css).
const OFFERS = [
  { title: 'Chargé(e) de paie', place: 'Casablanca, CDI', score: 92, best: true },
  { title: 'Responsable formation', place: 'Rabat, CDI', score: 64 },
  { title: 'Contrôleur de gestion', place: 'Casablanca, CDI', score: 41 },
]

export default function MatchAnimation() {
  return (
    <div className="match-anim" aria-hidden="true">
      <div className="ma-cv">
        <div className="ma-avatar" />
        <div className="ma-line ma-line-name" />
        <div className="ma-line" />
        <div className="ma-line ma-line-short" />
        <div className="ma-chips">
          <span>paie</span><span>SIRH</span><span>Excel</span>
        </div>
      </div>

      <svg className="ma-links" viewBox="0 0 100 300" preserveAspectRatio="none">
        <path d="M0 150 C 50 150, 50 40, 100 40" />
        <path d="M0 150 L 100 150" />
        <path d="M0 150 C 50 150, 50 260, 100 260" />
      </svg>

      <div className="ma-offers">
        {OFFERS.map((offer, i) => (
          <div key={offer.title} className={`ma-offer${offer.best ? ' is-best' : ''}`} style={{ '--i': i, '--score': `${offer.score}%` }}>
            <strong>{offer.title}</strong>
            <small>{offer.place}</small>
            <div className="ma-bar"><span /></div>
            <b>{offer.score}%</b>
          </div>
        ))}
      </div>
    </div>
  )
}
