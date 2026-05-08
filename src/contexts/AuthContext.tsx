import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getAuthUser, redirectToLogin, type ItsUser } from '../lib/auth'
interface AuthCtx { user: ItsUser | null; loading: boolean; signOut: () => void }
const AuthContext = createContext<AuthCtx>({ user: null, loading: true, signOut: () => {} })
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ItsUser | null>(null)
  const [loading, setLoading] = useState(true)
  const checkAuth = useCallback(async () => {
    const u = await getAuthUser()
    if (!u) { redirectToLogin(); return }
    setUser(u); setLoading(false)
  }, [])
  useEffect(() => { checkAuth() }, [checkAuth])
  function signOut() { localStorage.removeItem('its-id-token'); redirectToLogin() }
  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
