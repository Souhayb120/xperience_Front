import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import JobCard from '../components/JobCard'

// "Mes offres": the offers that match the candidate, best score first
export default function Matches() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    api(`/me/matches?page=${page}&size=10`).then(setResult).catch((e) => setError(e.message))
  }, [page])

  const matches = result?.content ?? []
  const totalPages = result?.page?.totalPages ?? 0

  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <h1>Mes offres</h1>
          <p className="muted" style={{ margin: 0 }}>
            Classées selon vos compétences et votre ville. Le score est indicatif, pas une garantie de recrutement.
          </p>
        </div>
        <Link to="/profil" className="btn btn-ghost">Modifier mon profil</Link>
      </div>

      {error && <p className="alert alert-error" role="alert">{error}</p>}

      {result && matches.length === 0 && (
        <div className="card empty stack">
          <p>Aucune offre ne correspond encore à votre profil.</p>
          <p>Ajoutez votre CV ou vos compétences pour voir vos offres.</p>
          <div><Link to="/profil" className="btn btn-primary">Compléter mon profil</Link></div>
        </div>
      )}

      <div className="job-list">
        {matches.map(({ job, score, matchingSkills }) => (
          <div key={job.id} className="match">
            <div className="match-score" aria-label={`Correspondance ${score} %`}>
              <strong>{score}%</strong>
              <span className="match-bar"><span style={{ width: `${score}%` }} /></span>
            </div>
            <JobCard job={job} />
            {matchingSkills.length > 0 && (
              <p className="match-skills">
                Vos compétences demandées : {matchingSkills.map((s) => <span key={s} className="chip chip-brand">{s}</span>)}
              </p>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="pager" aria-label="Pages">
          <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Page précédente</button>
          <span className="muted">Page {page + 1} sur {totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Page suivante</button>
        </nav>
      )}
    </div>
  )
}
