import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Field from '../components/Field'
import AuthLayout from '../components/AuthLayout'

const EMPTY = { fullName: '', email: '', phoneNumber: '', password: '', schoolCode: '' }

export default function RegisterCandidate() {
  const { registerCandidate } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  async function submit(event) {
    event.preventDefault()
    setErrors({})
    setMessage('')
    setSending(true)
    try {
      // the school code is optional: send nothing when it is empty
      const body = { ...form, schoolCode: form.schoolCode.trim() || null }
      await registerCandidate(body)
      navigate('/espace', { replace: true })
    } catch (e) {
      setErrors(e.fields ?? {})
      setMessage(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthLayout>
        <h1>Créer mon compte candidat</h1>
        <p className="muted">Gratuit. Vous complétez votre profil juste après.</p>

        <form className="form" onSubmit={submit} noValidate>
          {message && <p className="alert alert-error" role="alert">{message}</p>}

          <Field label="Nom complet" name="fullName" autoComplete="name" required
                 value={form.fullName} onChange={update} error={errors.fullName} />
          <Field label="Email" name="email" type="email" autoComplete="email" required
                 value={form.email} onChange={update} error={errors.email} />
          <Field label="Téléphone" name="phoneNumber" type="tel" autoComplete="tel" required
                 hint="Format marocain : 06…, 07… ou +212…"
                 value={form.phoneNumber} onChange={update} error={errors.phoneNumber} />
          <Field label="Mot de passe" name="password" type="password" autoComplete="new-password" required
                 hint="8 caractères minimum"
                 value={form.password} onChange={update} error={errors.password} />
          <Field label="Code de votre école (facultatif)" name="schoolCode" autoComplete="off"
                 hint="Donné par votre école. Vous pourrez aussi l'ajouter plus tard."
                 value={form.schoolCode} onChange={update} error={errors.schoolCode} />

          {form.schoolCode.trim() && (
            <p className="notice">
              En ajoutant le code de votre école, elle pourra voir votre profil et vos offres correspondantes.
            </p>
          )}

          <button className="btn btn-primary" type="submit" disabled={sending}>
            {sending ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="muted" style={{ marginTop: '1.25rem', marginBottom: 0 }}>
          Déjà inscrit ? <Link to="/connexion">Se connecter</Link>. Vous recrutez ?{' '}
          <Link to="/inscription/entreprise">Inscrire votre entreprise</Link>.
        </p>
    </AuthLayout>
  )
}
