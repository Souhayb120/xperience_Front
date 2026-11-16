import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, FileUp } from 'lucide-react'
import { api } from '../api/client'
import { ActiveFilters, FilterPanel, OfferList, OffersHeader, Pagination, useOfferQuery, useOffers } from '../components/Offers'

const PAGE_SIZE = 15
const MAX_RESUME_BYTES = 5 * 1024 * 1024
const SHOWN_KEY = 'xperience.matchesShown'   // this tab already asked for its offers: no need to click again

// "Mes offres": first the candidate's CV, then a button shows the offers that match it (best score first)
export default function Matches() {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [shown, setShown] = useState(() => sessionStorage.getItem(SHOWN_KEY) === '1')
  const [version, setVersion] = useState(0)   // a new CV reloads the offers

  useEffect(() => {
    api('/me/profile').then(setProfile).catch((e) => setError(e.message))
  }, [])

  function showOffers() {
    sessionStorage.setItem(SHOWN_KEY, '1')
    setShown(true)
  }

  function resumeUploaded(updated) {
    setProfile(updated)
    setVersion((v) => v + 1)
  }

  if (!profile) {
    return (
      <div className="wrap page">
        {error ? <p className="alert alert-error" role="alert">{error}</p> : <p className="muted">Chargement…</p>}
      </div>
    )
  }

  const canMatch = profile.skills.length > 0
  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <h1>Mes offres</h1>
          <p className="muted" style={{ margin: 0 }}>
            Xperience lit votre CV, trouve vos compétences et vous montre les offres qui y correspondent.
          </p>
        </div>
      </div>

      <ResumeCard profile={profile} onUploaded={resumeUploaded} />

      {!shown && (
        <div className="resume-cta">
          <button type="button" className="btn btn-primary" onClick={showOffers} disabled={!canMatch}>
            Voir les offres pour mon CV
          </button>
          {!canMatch && <p className="muted">Ajoutez d'abord votre CV : nous y cherchons vos compétences.</p>}
        </div>
      )}

      {shown && <MatchResults key={version} />}
    </div>
  )
}

// the CV: its name and the skills found in it, or a drop area when there is none yet (PDF, 5 MB max)
function ResumeCard({ profile, onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)
  const [dragging, setDragging] = useState(false)

  async function upload(file) {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setMessage({ type: 'error', text: 'Le CV doit être un fichier PDF' })
      return
    }
    if (file.size > MAX_RESUME_BYTES) {
      setMessage({ type: 'error', text: 'Le CV ne doit pas dépasser 5 Mo' })
      return
    }
    setMessage(null)
    setUploading(true)
    try {
      const data = new FormData()
      data.append('file', file)
      const before = profile.skills.length
      const updated = await api('/me/resume', { method: 'POST', body: data })
      const found = updated.skills.length - before
      onUploaded(updated)
      setMessage({ type: 'ok', text: `CV ajouté. ${found > 0 ? `${found} compétence(s) trouvée(s).` : 'Aucune nouvelle compétence trouvée.'}` })
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setUploading(false)
    }
  }

  function drop(event) {
    event.preventDefault()
    setDragging(false)
    upload(event.dataTransfer.files[0])
  }

  const picker = (
    <label className={`btn ${profile.hasResume ? 'btn-ghost' : 'btn-primary'}`} style={{ cursor: uploading ? 'wait' : 'pointer' }}>
      {uploading ? 'Lecture du CV…' : profile.hasResume ? 'Remplacer mon CV' : 'Choisir mon CV (PDF)'}
      <input type="file" accept="application/pdf,.pdf" disabled={uploading} className="visually-hidden"
             onChange={(e) => { upload(e.target.files[0]); e.target.value = '' }} />
    </label>
  )

  return (
    <section className="card resume-card" aria-labelledby="cv-title"
             onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
             onDragLeave={() => setDragging(false)} onDrop={drop}>
      {profile.hasResume ? (
        <div className="resume-file">
          <FileText size={32} aria-hidden="true" />
          <div className="resume-file-name">
            <h2 id="cv-title">Mon CV</h2>
            <p className="muted">{profile.resumeFileName}</p>
          </div>
          {picker}
        </div>
      ) : (
        <div className={`resume-empty${dragging ? ' is-dragging' : ''}`}>
          <FileUp size={32} aria-hidden="true" />
          <h2 id="cv-title">Ajoutez votre CV</h2>
          <p className="muted">PDF, 5 Mo maximum. Glissez-le ici ou choisissez-le.</p>
          {picker}
        </div>
      )}

      {profile.skills.length > 0 && (
        <p className="match-skills">
          Compétences trouvées : {profile.skills.slice(0, 10).map((s) => <span key={s} className="chip chip-brand">{s}</span>)}
          {profile.skills.length > 10 && <span>+ {profile.skills.length - 10}</span>}
          <Link to="/profil" className="link-btn">Modifier</Link>
        </p>
      )}

      {message && (
        <p className={`alert ${message.type === 'ok' ? 'alert-info' : 'alert-error'}`} role="status">{message.text}</p>
      )}
    </section>
  )
}

// the offers for the CV, with the same search and filters as the public list (GET /api/me/matches)
function MatchResults() {
  const query = useOfferQuery()
  const { result, counts, error, retry } = useOffers('/me/matches', query, PAGE_SIZE)

  return (
    <section className="matches-results" aria-label="Offres pour mon CV">
      <OffersHeader
        level="h2"
        title="Les offres pour votre CV"
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
            empty={<p>Aucune offre ne correspond encore à votre CV. Ajoutez des compétences dans votre profil.</p>}
          />
          <Pagination page={query.page} totalPages={result?.page.totalPages} onPage={query.goTo} />
        </div>
      </div>
    </section>
  )
}
