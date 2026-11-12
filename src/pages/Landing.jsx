import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

// The public home page. One idea per screen:
// 1. what Xperience is  2. candidates  3. schools  4. companies  5. the last call to action
export default function Landing() {
  const { user, loading } = useAuth()
  // logged-in users have their own home: the landing page is only for visitors
  if (loading) return null
  if (user) return <Navigate to="/espace" replace />

  return (
    <>
      {/* 1. hero: the candidate, with her offers floating over the photo */}
      <section className="screen hero" aria-labelledby="hero-title">
        <div className="wrap grid-2">
          <div data-enter>
            <p className="eyebrow">Emploi des fonctions support au Maroc</p>
            <h1 id="hero-title">Les offres RH, finance et juridique qui vous ressemblent</h1>
            <p className="lead">
              Ajoutez votre CV : Xperience y trouve vos compétences et vous montre d'abord les offres
              qui y correspondent, dans votre ville. Vous postulez directement chez l'employeur.
            </p>
            <div className="row">
              <Link to="/inscription" className="btn btn-primary">Ajouter mon CV</Link>
              <Link to="/offres" className="btn btn-ghost">Voir les offres</Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="photo photo-tall">
              <img src="/images/hero-candidate.jpg" alt="Jeune professionnelle souriante, ordinateur portable à la main" />
            </div>
            <div className="app-frame hero-float" aria-label="Aperçu de « Mes offres » dans Xperience">
              <div className="app-frame-bar">
                <span /><span /><span />
                <strong>Mes offres · Casablanca</strong>
              </div>
              <div className="app-frame-body">
                <div className="mini-offer is-best">
                  <strong>Chargé(e) de paie</strong>
                  <small>Cabinet RH · CDI</small>
                  <span className="score">92 %</span>
                </div>
                <div className="mini-offer">
                  <strong>Contrôleur de gestion junior</strong>
                  <small>Groupe industriel · CDI</small>
                  <span className="score">81 %</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. candidates */}
      <section className="screen" aria-labelledby="candidats-title">
        <div className="wrap grid-2">
          <div className="photo photo-wide">
            <img src="/images/candidates.jpg" alt="Un groupe de jeunes regarde des offres sur un ordinateur portable" />
          </div>
          <div>
            <p className="eyebrow">Candidats</p>
            <h2 id="candidats-title">Votre CV d'abord, les offres ensuite</h2>
            <ol className="steps" aria-label="Comment ça marche">
              <li className="step">
                <span className="step-num">1</span>
                <div><h3>Créez votre compte</h3><p>Nom, email, téléphone. C'est gratuit.</p></div>
              </li>
              <li className="step">
                <span className="step-num">2</span>
                <div><h3>Ajoutez votre CV</h3><p>Paie, SIRH, Excel… Xperience trouve vos compétences dans le PDF.</p></div>
              </li>
              <li className="step">
                <span className="step-num">3</span>
                <div><h3>Postulez chez l'employeur</h3><p>Vos offres sont classées par score. Chaque offre renvoie vers son site ou son email.</p></div>
              </li>
            </ol>
            <p style={{ marginTop: '1.5rem' }}>
              <Link to="/inscription" className="btn btn-primary">Créer mon compte candidat</Link>
            </p>
          </div>
        </div>
      </section>

      {/* 3. schools */}
      <section className="screen" aria-labelledby="ecoles-title">
        <div className="wrap grid-2">
          <div>
            <p className="eyebrow">Écoles</p>
            <h2 id="ecoles-title">Un code pour suivre vos étudiants</h2>
            <p className="lead">
              Chaque école partenaire reçoit un code de 8 caractères. Les étudiants qui l'ajoutent à leur
              profil apparaissent dans l'espace de l'école, avec les offres qui leur correspondent.
            </p>
            <p className="muted">Les comptes écoles sont ouverts par l'équipe Xperience.</p>
          </div>
          <div className="photo photo-wide">
            <img src="/images/schools.jpg" alt="Des étudiants travaillent ensemble dans une bibliothèque" />
            <div className="card photo-card">
              <p className="muted" style={{ margin: 0 }}>Code de votre école</p>
              <p className="big-code" style={{ margin: '0.25rem 0 0', fontSize: '1.9rem' }}>K7M2QX9P</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. companies */}
      <section className="screen screen-dark" aria-labelledby="entreprises-title">
        <div className="wrap grid-2">
          <div>
            <p className="eyebrow">Entreprises</p>
            <h2 id="entreprises-title">Publiez vos offres auprès des bons profils</h2>
            <p className="lead">
              Inscrivez votre entreprise, notre équipe la valide, puis vous publiez vos offres avec votre
              lien ou votre email de candidature. Vous gardez la main sur chaque annonce.
            </p>
            <Link to="/inscription/entreprise" className="btn btn-primary">Inscrire mon entreprise</Link>
          </div>
          <div className="photo photo-wide">
            <img src="/images/companies.jpg" alt="Deux collègues se tapent dans la main au bureau" />
          </div>
        </div>
      </section>

      {/* 5. close */}
      <section className="screen" aria-labelledby="close-title">
        <div className="wrap">
          <h2 id="close-title" className="close-title">Les offres des fonctions support, au même endroit</h2>
          <div className="row">
            <Link to="/inscription" className="btn btn-primary">Ajouter mon CV</Link>
            <Link to="/offres" className="btn btn-ghost">Voir les offres</Link>
          </div>
        </div>
      </section>
    </>
  )
}
