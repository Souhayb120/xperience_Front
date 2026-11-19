import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, FileUp } from 'lucide-react'
import { api } from '../api/client'
import { ActiveFilters, FilterPanel, OfferList, OffersHeader, Pagination, useOfferQuery, useOffers } from '../components/Offers'
import { PageSkeleton } from '../components/Skeleton'
import ConfirmDialog from '../components/ConfirmDialog'
import { markMatchesSeen } from '../components/NotificationBell'

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
      error
        ? <div className="wrap page"><p className="alert alert-error" role="alert">{error}</p></div>
        : <PageSkeleton cards={1} lines={4} />
    )
  }

  const canMatch = profile.hasResume || profile.skills.length > 0   // the whole CV is read, skills are a bonus
  return (
    <div className="wrap page">
      <div className="page-head">
        <div>
          <h1>Mes offres</h1>
          <p className="muted" style={{ margin: 0 }}>
            Xperience lit votre CV, trouve vos compétences et vous montre les offres qui y correspondent.
            Pour comparer le sens de votre CV et des offres, son texte est analysé par l'IA Gemini de Google.
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

      {shown && canMatch && <MatchResults key={version} />}
    </div>
  )
}

// the CV: its name and the skills found in it, or a drop area when there is none yet (PDF, 5 MB max)
function ResumeCard({ profile, onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [confirming, setConfirming] = useState(false)

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
      const updated = await api('/me/resume', { method: 'POST', body: data })
      const found = updated.skills.length
      onUploaded(updated)
      setMessage({ type: 'ok', text: `CV ajouté. ${found > 0 ? `${found} compétence(s) trouvée(s).` : 'Aucune compétence précise trouvée : vos offres seront classées sur le texte du CV.'}` })
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setUploading(false)
    }
  }

  async function remove() {
    setMessage(null)
    try {
      onUploaded(await api('/me/resume', { method: 'DELETE' }))
      setMessage({ type: 'ok', text: 'CV supprimé.' })
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
    }
  }

  function drop(event) {
    event.preventDefault()
    setDragging(false)
    void upload(event.dataTransfer.files[0])   // upload() shows its own errors
  }

  const picker = (
    <label className={`btn ${profile.hasResume ? 'btn-ghost' : 'btn-primary'}`} style={{ cursor: uploading ? 'wait' : 'pointer' }}>
      {uploading ? 'Lecture du CV…' : profile.hasResume ? 'Remplacer mon CV' : 'Choisir mon CV (PDF)'}
      <input type="file" accept="application/pdf,.pdf" disabled={uploading} className="visually-hidden"
             onChange={(e) => { void upload(e.target.files[0]); e.target.value = '' }} />
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
          <button type="button" className="btn btn-ghost" onClick={() => setConfirming(true)} disabled={uploading}>
            Supprimer mon CV
          </button>
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
      {confirming && (
        <ConfirmDialog title="Supprimer votre CV ?"
                       text="Votre CV et les compétences trouvées dedans seront supprimés. Vous pourrez en ajouter un autre."
                       yesLabel="Oui, supprimer"
                       onYes={() => { setConfirming(false); void remove() }} onNo={() => setConfirming(false)} />
      )}
    </section>
  )
}

// the offers for the CV, with the same search and filters as the public list (GET /api/me/matches)
function MatchResults() {
  const query = useOfferQuery()
  const { result, counts, error, retry } = useOffers('/me/matches', query, PAGE_SIZE)

  // the candidate is looking at their matches: the bell's new offers are seen
  useEffect(() => {
    markMatchesSeen().catch(() => {})   // only the bell number depends on it
  }, [])

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
            empty={<p>Aucune offre ne correspond encore à votre CV. Essayez un CV plus détaillé, ou revenez demain : de nouvelles offres arrivent chaque jour.</p>}
          />
          <Pagination page={query.page} totalPages={result?.page.totalPages} onPage={query.goTo} />
        </div>
      </div>
    </section>
  )
}
