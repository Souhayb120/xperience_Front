import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import { api } from '../api/client'
import { CompanyLogo } from '../components/Offers'
import { SkeletonCard } from '../components/Skeleton'

// one offer, opened from the list. Candidates apply outside the app: the offer's link, or by email.
export default function JobDetail() {
  const { id } = useParams()
  const { state } = useLocation()
  const [job, setJob] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api(`/jobs/${id}`).then(setJob).catch((e) => setError(e.status === 404 ? "Cette offre n'existe plus." : e.message))
  }, [id])

  const applyHref = job && (job.url || (job.applyEmail ? `mailto:${job.applyEmail}` : null))

  return (
    <div className="wrap page offer-detail">
      {/* back to the same list, with its filters and page */}
      <Link to={state?.back ?? '/offres'} className="back-link"><ArrowLeft size={16} aria-hidden="true" /> Retour aux offres</Link>

      {error && <p className="alert alert-error" role="alert">{error}</p>}
      {!job && !error && <div role="status" aria-busy="true"><span className="visually-hidden">Chargement…</span><SkeletonCard logo lines={6} /></div>}

      {job && (
        <article className="card offer-detail-card">
          <header className="offer-detail-head">
            <CompanyLogo company={job.company} />
            <div>
              <h1>{job.title}</h1>
              {job.company && <p className="offer-company">{job.company}</p>}
            </div>
          </header>

          <p className="offer-meta">
            {job.city && <span className="offer-place"><MapPin size={14} aria-hidden="true" />{job.city}</span>}
            {job.contractType && <span className="chip">{job.contractType}</span>}
            {job.category && <span className="chip">{job.category}</span>}
            {job.postedAt && <time dateTime={job.postedAt}>Publiée le {new Date(job.postedAt).toLocaleDateString('fr-MA', { day: 'numeric', month: 'long', year: 'numeric' })}</time>}
          </p>

          {job.summary && <p className="offer-summary">{job.summary}</p>}

          {job.skills?.length > 0 && (
            <p className="match-skills">Compétences : {job.skills.map((s) => <span key={s} className="chip chip-brand">{s}</span>)}</p>
          )}

          {applyHref ? (
            <div className="offer-apply">
              <a className="btn btn-primary" href={applyHref} target="_blank" rel="noopener noreferrer">Postuler</a>
              <span className="muted">Vous postulez sur le site de l'offre.</span>
            </div>
          ) : (
            <p className="muted">Pas de lien de candidature pour cette offre.</p>
          )}
        </article>
      )}
    </div>
  )
}
