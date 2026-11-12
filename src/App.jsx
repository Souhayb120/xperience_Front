import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import Landing from './pages/Landing'
import Jobs from './pages/Jobs'
import Login from './pages/Login'
import RegisterCandidate from './pages/RegisterCandidate'
import RegisterCompany from './pages/RegisterCompany'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Matches from './pages/Matches'
import NotFound from './pages/NotFound'

// every page, in one place (French URLs: the site is in French)
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="offres" element={<Jobs />} />
        <Route path="connexion" element={<Login />} />
        <Route path="inscription" element={<RegisterCandidate />} />
        <Route path="inscription/entreprise" element={<RegisterCompany />} />
        <Route
          path="espace"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="profil" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="mes-offres" element={<RequireAuth><Matches /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
