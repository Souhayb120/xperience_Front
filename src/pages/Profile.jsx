import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import Field from '../components/Field'
import { PageSkeleton } from '../components/Skeleton'
import ConfirmDialog from '../components/ConfirmDialog'

// the candidate edits their profile and uploads their CV (PDF)
export default function Profile() {
  const { reload } = useAuth()
  const [form, setForm] = useState(null)
  const [school, setSchool] = useState(null)
  const [resume, setResume] = useState(null)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)   // { type: 'ok' | 'error', text }
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  function fill(profile) {
    setForm({
      fullName: profile.fullName ?? '',
      phoneNumber: profile.phoneNumber ?? '',
      city: profile.city ?? '',
      yearsExperience: profile.yearsExperience ?? '',
      schoolCode: '',
    })
    setSchool(profile.school)
    setResume(profile.hasResume ? profile.resumeFileName : null)
  }

  useEffect(() => {
    api('/me/profile').then(fill).catch((e) => setMessage({ type: 'error', text: e.message }))
  }, [])

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  async function save(event) {
    event.preventDefault()
    setErrors({})
    setMessage(null)
    setSaving(true)
    try {
      const body = {
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        city: form.city,
        yearsExperience: form.yearsExperience === '' ? null : Number(form.yearsExperience),
      }
      // the school code is only sent when typed (empty = keep the current school)
      if (form.schoolCode.trim()) body.schoolCode = form.schoolCode.trim()

      fill(await api('/me/profile', { method: 'PATCH', body }))
      await reload()
      setMessage({ type: 'ok', text: 'Profil enregistré.' })
    } catch (e) {
      setErrors(e.fields ?? {})
      setMessage({ type: 'error', text: e.message })
    } finally {
      setSaving(false)
    }
  }

  async function leaveSchool() {
    fill(await api('/me/profile', { method: 'PATCH', body: { schoolCode: '' } }))
    setMessage({ type: 'ok', text: "Vous n'êtes plus lié(e) à cette école." })
  }

  async function upload(event) {
    const file = event.target.files[0]
    if (!file) return
    setMessage(null)
    setUploading(true)
    try {
      const data = new FormData()
      data.append('file', file)
      fill(await api('/me/resume', { method: 'POST', body: data }))
      setMessage({ type: 'ok', text: 'CV ajouté. Vos offres sont classées selon ce CV.' })
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  async function removeResume() {
    setMessage(null)
    try {
      fill(await api('/me/resume', { method: 'DELETE' }))
      setMessage({ type: 'ok', text: 'CV supprimé.' })
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
    }
  }

  if (!form) {
    return message ? <p className="wrap page alert alert-error" role="alert">{message.text}</p> : <PageSkeleton lines={5} />
  }

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Mon profil</h1>
        <Link to="/mes-offres" className="btn btn-primary">Voir mes offres</Link>
      </div>

      {message && (
        <p className={`alert ${message.type === 'ok' ? 'alert-info' : 'alert-error'}`} role="status">{message.text}</p>
      )}

      <div className="dash-grid" style={{ marginTop: '1.25rem', alignItems: 'start' }}>
        <section className="card stack" aria-labelledby="cv-title">
          <h2 id="cv-title" style={{ fontSize: 'var(--fs-xl)' }}>Mon CV</h2>
          <p className="muted">
            Ajoutez votre CV en PDF (5 Mo maximum). Xperience le compare aux offres pour vous montrer les plus proches.
          </p>
          {resume && <p><span className="chip chip-brand">{resume}</span></p>}
          <label className="btn btn-primary" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
            {uploading ? 'Lecture du CV…' : resume ? 'Remplacer mon CV' : 'Ajouter mon CV (PDF)'}
            <input type="file" accept="application/pdf,.pdf" onChange={upload} disabled={uploading}
                   className="visually-hidden" />
          </label>
          {resume && (
            <button type="button" className="btn btn-ghost" onClick={() => setConfirming(true)} disabled={uploading}>
              Supprimer mon CV
            </button>
          )}
          {confirming && (
            <ConfirmDialog title="Supprimer votre CV ?"
                           text="Votre CV et les compétences trouvées dedans seront supprimés. Vous pourrez en ajouter un autre."
                           yesLabel="Oui, supprimer"
                           onYes={() => { setConfirming(false); void removeResume() }} onNo={() => setConfirming(false)} />
          )}
        </section>

        <form className="card form" onSubmit={save} noValidate aria-labelledby="infos-title">
          <h2 id="infos-title" style={{ fontSize: 'var(--fs-xl)', margin: 0 }}>Mes informations</h2>
          <Field label="Nom complet" name="fullName" value={form.fullName} onChange={update} error={errors.fullName} />
          <Field label="Téléphone" name="phoneNumber" type="tel" value={form.phoneNumber} onChange={update} error={errors.phoneNumber} />
          <Field label="Ville" name="city" placeholder="Casablanca" value={form.city} onChange={update} error={errors.city} />
          <Field label="Années d'expérience" name="yearsExperience" type="number" min="0" max="50"
                 value={form.yearsExperience} onChange={update} error={errors.yearsExperience} />

          {school ? (
            <p className="notice">
              École : <strong>{school.name}</strong> ({school.city}).{' '}
              <button type="button" className="link" onClick={leaveSchool} style={{ border: 0, cursor: 'pointer', font: 'inherit' }}>
                Quitter cette école
              </button>
            </p>
          ) : (
            <>
              <Field label="Code de votre école (facultatif)" name="schoolCode" value={form.schoolCode}
                     onChange={update} error={errors.schoolCode} />
              {form.schoolCode.trim() && (
                <p className="notice">En ajoutant le code de votre école, elle pourra voir votre profil et vos offres correspondantes.</p>
              )}
            </>
          )}

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}
