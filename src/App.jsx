import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import Landing from './pages/Landing'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import Browse from './pages/Browse'
import Login from './pages/Login'
import RegisterCandidate from './pages/RegisterCandidate'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Matches from './pages/Matches'
import NotFound from './pages/NotFound'
import { AdminCareerSites, AdminJobs, AdminSchools, AdminUsers } from './pages/AdminPages'

// every page, in one place (French URLs: the site is in French)
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        {/* the offers are for candidates only (the home page shows their counts) */}
        <Route path="offres" element={<RequireAuth role="CANDIDATE"><Jobs /></RequireAuth>} />
        <Route path="offres/:id" element={<RequireAuth role="CANDIDATE"><JobDetail /></RequireAuth>} />
        <Route path="stages" element={<RequireAuth role="CANDIDATE"><Jobs internships /></RequireAuth>} />
        <Route path="metiers" element={<RequireAuth role="CANDIDATE"><Browse /></RequireAuth>} />
        <Route path="connexion" element={<Login />} />
        <Route path="inscription" element={<RegisterCandidate />} />
        <Route
          path="espace"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="profil" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="mes-offres" element={<RequireAuth role="CANDIDATE"><Matches /></RequireAuth>} />
        <Route path="admin/utilisateurs" element={<RequireAuth><AdminUsers /></RequireAuth>} />
        <Route path="admin/ecoles" element={<RequireAuth><AdminSchools /></RequireAuth>} />
        <Route path="admin/offres" element={<RequireAuth><AdminJobs /></RequireAuth>} />
        <Route path="admin/sites-carrieres" element={<RequireAuth><AdminCareerSites /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
