/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../api/services'
import type { ApiUser, UserRole } from '../types/api'
import { tokenStorage } from './tokenStorage'

type AuthState = { user: ApiUser | null; restoring: boolean; login: (email: string, password: string, remember: boolean) => Promise<ApiUser>; googleLogin: (idToken: string) => Promise<ApiUser>; register: (role: UserRole, input: { name: string; email: string; password: string; phone?: string; address?: string }) => Promise<string>; refreshUser: () => Promise<ApiUser>; signOut: () => void }
const AuthContext = createContext<AuthState | null>(null)
export const roleHome: Record<UserRole, string> = { customer: '/', restaurant_owner: '/owner', delivery_rider: '/rider', admin: '/admin' }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null); const [restoring, setRestoring] = useState(true)
  const signOut = useCallback(() => { tokenStorage.clear(); setUser(null) }, [])
  useEffect(() => { const restore = async () => { if (!tokenStorage.getAccessToken()) { setRestoring(false); return } try { setUser(await authApi.me()) } catch { signOut() } finally { setRestoring(false) } }; void restore(); window.addEventListener('foodie:session-expired', signOut); return () => window.removeEventListener('foodie:session-expired', signOut) }, [signOut])
  const refreshUser = useCallback(async () => { const current = await authApi.me(); setUser(current); return current }, [])
  const value = useMemo<AuthState>(() => ({ user, restoring, refreshUser, async login(email, password, remember) {
    const auth = await authApi.login(email, password)
    tokenStorage.save(auth.accessToken, auth.refreshToken, remember)
    try {
      // Always use the canonical database user after authentication. This keeps
      // role-based routing correct even if a login response was cached or stale.
      const authenticatedUser = await authApi.me()
      setUser(authenticatedUser)
      return authenticatedUser
    } catch (error) {
      signOut()
      throw error
    }
  }, async googleLogin(idToken) {
    const auth = await authApi.google(idToken)
    tokenStorage.save(auth.accessToken, auth.refreshToken, true)
    try {
      const authenticatedUser = await authApi.me()
      setUser(authenticatedUser)
      return authenticatedUser
    } catch (error) {
      signOut()
      throw error
    }
  }, async register(role, input) { const response = await authApi.register(role, input); return response.message }, signOut }), [user, restoring, refreshUser, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value }
