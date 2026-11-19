import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { api } from '../api/client'

// sent once the candidate has seen their matches ("Mes offres", or this panel): the bell number goes back to 0
export const MATCHES_SEEN_EVENT = 'xperience:matches-seen'

export function markMatchesSeen() {
  return api('/me/matches/seen', { method: 'POST' })
    .then(() => window.dispatchEvent(new Event(MATCHES_SEEN_EVENT)))
}

// Candidates only: the offers related to the CV (score 50 % or more) added since the last look (GET /api/me/matches/new).
// Opening the panel counts as a look: the number goes back to 0, the list stays on screen.
export default function NotificationBell() {
  const [news, setNews] = useState(null)   // { count, offers, seen }
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    let ignore = false
    api('/me/matches/new')
      .then((data) => { if (!ignore) setNews(data) })
      .catch(() => { if (!ignore) setNews({ count: 0, offers: [] }) })   // no number is better than an error in the header
    const seen = () => setNews((current) => current && { ...current, seen: true })
    window.addEventListener(MATCHES_SEEN_EVENT, seen)
    return () => {
      ignore = true
      window.removeEventListener(MATCHES_SEEN_EVENT, seen)
    }
  }, [])

  // Escape and a tap outside close the panel
  useEffect(() => {
    if (!open) return undefined
    function onKey(event) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    function onPointer(event) {
      if (!boxRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  const unseen = news && !news.seen ? news.count : 0

  function toggle() {
    const opening = !open
    setOpen(opening)
    if (opening && unseen > 0) {
      markMatchesSeen().catch(() => {})   // only the number depends on it: it comes back at the next visit
    }
  }

  const label = unseen > 0
    ? `Notifications : ${unseen} nouvelle${unseen > 1 ? 's' : ''} offre${unseen > 1 ? 's' : ''} pour votre CV`
    : 'Notifications'

  return (
    <div className="bell" ref={boxRef}>
      <button ref={buttonRef} type="button" className="theme-toggle bell-button" aria-label={label}
              aria-expanded={open} aria-controls="bell-panel" onClick={toggle}>
        <Bell aria-hidden="true" />
        {unseen > 0 && <span className="bell-count" aria-hidden="true">{unseen > 9 ? '9+' : unseen}</span>}
      </button>

      {open && (
        <div id="bell-panel" className="bell-panel" role="region" aria-label="Nouvelles offres pour votre CV">
          {news?.offers.length > 0 ? (
            <>
              <p className="bell-title">
                {news.count === 1
                  ? 'Une nouvelle offre correspond à votre CV et vous ne l\'avez pas encore vue.'
                  : `${news.count} nouvelles offres correspondent à votre CV et vous ne les avez pas encore vues.`}
              </p>
              {news.offers.map(({ job, score }) => (
                <Link key={job.id} to={`/offres/${job.id}`} className="mini-offer" onClick={() => setOpen(false)}>
                  <strong>{job.title}</strong>
                  <small>{[job.company, job.city].filter(Boolean).join(', ')}</small>
                  <span className="score">{score} %</span>
                </Link>
              ))}
            </>
          ) : (
            <p className="bell-title muted">Pas de nouvelle offre pour votre CV. Nous vous prévenons ici dès qu'il y en a.</p>
          )}
          <Link to="/mes-offres" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Voir toutes mes offres</Link>
        </div>
      )}
    </div>
  )
}
