import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Field from '../components/Field'
import AuthLayout from '../components/AuthLayout'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSending(true)
    try {
      await login(form.email, form.password)
      navigate(location.state?.from ?? '/espace', { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthLayout>
        <h1>Se connecter</h1>
        <p className="muted">Candidats, écoles et entreprises : le même accès.</p>

        <form className="form" onSubmit={submit} noValidate>
          {error && <p className="alert alert-error" role="alert">{error}</p>}
          <Field label="Email" name="email" type="email" autoComplete="email" required
                 value={form.email} onChange={update} />
          <Field label="Mot de passe" name="password" type="password" autoComplete="current-password" required
                 value={form.password} onChange={update} />
          <button className="btn btn-primary" type="submit" disabled={sending}>
            {sending ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="muted" style={{ marginTop: '1.25rem', marginBottom: 0 }}>
          Pas encore de compte ? <Link to="/inscription">Créer un compte candidat</Link> ou{' '}
          <Link to="/inscription/entreprise">inscrire une entreprise</Link>.
        </p>
    </AuthLayout>
  )
}
