import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, tokenStore } from '../api/client'

// Who is logged in, for the whole app.
// user = the answer of GET /api/me: { id, fullName, email, phoneNumber, role, createdAt }
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(tokenStore.get()))

  const loadMe = useCallback(async () => {
    try {
      setUser(await api('/me'))
    } catch {
      // expired or invalid token: start logged out
      tokenStore.clear()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // on page load: if a token is saved, find out who it belongs to
  useEffect(() => {
    if (tokenStore.get()) loadMe()
  }, [loadMe])

  const signIn = useCallback(async (token) => {
    tokenStore.set(token)
    setLoading(true)
    await loadMe()
  }, [loadMe])

  const login = useCallback(async (email, password) => {
    const { token } = await api('/auth/login', { method: 'POST', body: { email, password } })
    await signIn(token)
  }, [signIn])

  const registerCandidate = useCallback(async (form) => {
    const { token } = await api('/auth/register', { method: 'POST', body: form })
    await signIn(token)
  }, [signIn])

  const registerCompany = useCallback(async (form) => {
    const { token } = await api('/auth/register/company', { method: 'POST', body: form })
    await signIn(token)
  }, [signIn])

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, registerCandidate, registerCompany, logout, reload: loadMe }),
    [user, loading, login, registerCandidate, registerCompany, logout, loadMe],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
