// one job offer. Candidates apply outside the app: on the offer's link, or by email.
export default function JobCard({ job }) {
  const applyHref = job.url || (job.applyEmail ? `mailto:${job.applyEmail}` : null)

  return (
    <article className="card job-card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h3>{job.title}</h3>
        {job.contractType && <span className="chip chip-brand">{job.contractType}</span>}
      </div>

      <div className="job-meta">
        {job.company && <span>{job.company}</span>}
        {job.city && <span>{job.city}</span>}
        {job.category && <span>{job.category}</span>}
        {job.postedAt && <span>Publiée le {formatDate(job.postedAt)}</span>}
      </div>

      {job.summary && <p className="muted" style={{ margin: 0 }}>{job.summary}</p>}

      {applyHref && (
        <div>
          <a className="btn btn-ghost btn-sm" href={applyHref} target="_blank" rel="noopener noreferrer">
            Postuler sur le site de l'offre
          </a>
        </div>
      )}
    </article>
  )
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('fr-MA', { day: 'numeric', month: 'long', year: 'numeric' })
}
