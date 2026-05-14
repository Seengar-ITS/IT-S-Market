import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getAuthUser, type ItsUser } from '../lib/auth'
interface AuthCtx { user: ItsUser | null; loading: boolean; signOut: () => void }
const AuthContext = createContext<AuthCtx>({ user: null, loading: true, signOut: () => {} })
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ItsUser | null>(null)
  const [loading, setLoading] = useState(true)
  const checkAuth = useCallback(async () => {
    const u = await getAuthUser()
    setUser(u ?? null)
    setLoading(false)
  }, [])
  useEffect(() => { checkAuth() }, [checkAuth])
  function signOut() { localStorage.removeItem('its-id-token') }
  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
