import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Field from '../components/Field'
import AuthLayout from '../components/AuthLayout'

// one test account per role (backend: DEMO_ACCOUNTS_ENABLED=true). Shown only in dev (npm run dev),
// never in the production build: these passwords are public.
const DEMO_PASSWORD = 'demo1234'
const DEMO_ACCOUNTS = [
  { role: 'Candidat', email: 'candidat@demo.ma', hint: 'CV, profil, mes offres' },
  { role: 'École', email: 'ecole@demo.ma', hint: 'Code et étudiants' },
  { role: 'Entreprise', email: 'entreprise@demo.ma', hint: 'Validée, publie des offres' },
  { role: 'Admin', email: 'admin@demo.ma', hint: 'Utilisateurs, écoles, stats' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  async function logIn(email, password) {
    setError('')
    setSending(true)
    try {
      await login(email, password)
      navigate(location.state?.from ?? '/espace', { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  function submit(event) {
    event.preventDefault()
    logIn(form.email, form.password)
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

        {import.meta.env.DEV && (
          <section className="demo-accounts" aria-labelledby="demo-title">
            <h2 id="demo-title">Tester un rôle en un clic</h2>
            <div className="demo-grid">
              {DEMO_ACCOUNTS.map((account) => (
                <button key={account.email} type="button" className="demo-account" disabled={sending}
                        onClick={() => logIn(account.email, DEMO_PASSWORD)}>
                  <strong>{account.role}</strong>
                  <small>{account.hint}</small>
                </button>
              ))}
            </div>
            <p className="muted">Mot de passe de tous les comptes de test : <code>{DEMO_PASSWORD}</code></p>
          </section>
        )}

        <p className="muted" style={{ marginTop: '1.25rem', marginBottom: 0 }}>
          Pas encore de compte ? <Link to="/inscription">Créer un compte candidat</Link> ou{' '}
          <Link to="/inscription/entreprise">inscrire une entreprise</Link>.
        </p>
    </AuthLayout>
  )
}
