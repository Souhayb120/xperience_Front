import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Field from '../components/Field'
import AuthLayout from '../components/AuthLayout'

const EMPTY = {
  companyName: '', city: '', website: '', description: '',
  contactName: '', email: '', phoneNumber: '', password: '',
}

export default function RegisterCompany() {
  const { registerCompany } = useAuth()
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
      // optional fields: send null when empty
      const body = {
        ...form,
        website: form.website.trim() || null,
        description: form.description.trim() || null,
      }
      await registerCompany(body)
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
        <h1>Inscrire mon entreprise</h1>
        <p className="notice">
          Notre équipe valide chaque entreprise avant sa première offre. Vous pouvez vous connecter tout de suite.
        </p>

        <form className="form" onSubmit={submit} noValidate style={{ marginTop: '1.25rem' }}>
          {message && <p className="alert alert-error" role="alert">{message}</p>}

          <Field label="Nom de l'entreprise" name="companyName" autoComplete="organization" required
                 value={form.companyName} onChange={update} error={errors.companyName} />
          <Field label="Ville" name="city" autoComplete="address-level2" required
                 value={form.city} onChange={update} error={errors.city} />
          <Field label="Site web (facultatif)" name="website" type="url" placeholder="https://"
                 value={form.website} onChange={update} error={errors.website} />
          <Field label="Présentation (facultatif)" name="description" as="textarea" maxLength={1000}
                 value={form.description} onChange={update} error={errors.description} />

          <Field label="Nom du contact" name="contactName" autoComplete="name" required
                 value={form.contactName} onChange={update} error={errors.contactName} />
          <Field label="Email professionnel" name="email" type="email" autoComplete="email" required
                 value={form.email} onChange={update} error={errors.email} />
          <Field label="Téléphone" name="phoneNumber" type="tel" autoComplete="tel" required
                 hint="Format marocain : 05…, 06…, 07… ou +212…"
                 value={form.phoneNumber} onChange={update} error={errors.phoneNumber} />
          <Field label="Mot de passe" name="password" type="password" autoComplete="new-password" required
                 hint="8 caractères minimum"
                 value={form.password} onChange={update} error={errors.password} />

          <button className="btn btn-primary" type="submit" disabled={sending}>
            {sending ? 'Inscription…' : "Inscrire l'entreprise"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: '1.25rem', marginBottom: 0 }}>
          Déjà inscrit ? <Link to="/connexion">Se connecter</Link>.
        </p>
    </AuthLayout>
  )
}
