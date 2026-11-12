import MatchAnimation from './MatchAnimation'

// login / sign-up: the matching animation on the left, the form on the right
export default function AuthLayout({ title, intro, children }) {
  return (
    <div className="auth-split">
      <aside className="auth-visual">
        <div className="auth-visual-inner">
          <p className="auth-visual-title">Votre CV rencontre les bonnes offres.</p>
          <p className="auth-visual-text">
            Xperience lit vos compétences et classe les offres RH, finance et juridique qui vous correspondent.
          </p>
          <MatchAnimation />
        </div>
      </aside>

      <section className="auth-panel">
        <div className="auth-form">
          {title && <h1>{title}</h1>}
          {intro && <div className="muted">{intro}</div>}
          {children}
        </div>
      </section>
    </div>
  )
}
