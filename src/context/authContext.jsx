import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth'
import { getCurrentAuthUser, normalizeAuthUser, refreshDummyJsonSession, loginWithDummyJson } from '../services/auth'
import { getRegisteredAccountById, loginLocalAccount, registerLocalAccount } from '../services/localAccounts'

const SESSION_KEY = 'shopstream-dummyjson-session'

function readSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    if (session?.provider === 'local' && session?.user) {
      const localUser = getRegisteredAccountById(session.user.id)
      if (localUser) return { ...session, user: normalizeAuthUser(localUser) }
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session?.accessToken && session?.user ? session : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [initialSession] = useState(readSession)
  const [session, setSession] = useState(initialSession)
  const [ready, setReady] = useState(() => !initialSession || initialSession.provider === 'local')
  const user = session?.user || null

  useEffect(() => {
    if (!initialSession) return undefined
    if (initialSession.provider === 'local') return undefined
    const controller = new AbortController()
    let active = true

    const restoreSession = async () => {
      try {
        const profile = await getCurrentAuthUser(initialSession.accessToken, controller.signal)
        const restored = { ...initialSession, user: normalizeAuthUser(profile) }
        localStorage.setItem(SESSION_KEY, JSON.stringify(restored))
        if (active) setSession(restored)
      } catch (error) {
        if (error.name === 'AbortError') return
        try {
          if (!initialSession.refreshToken) throw error
          const refreshed = await refreshDummyJsonSession(initialSession.refreshToken)
          localStorage.setItem(SESSION_KEY, JSON.stringify(refreshed))
          if (active) setSession(refreshed)
        } catch {
          localStorage.removeItem(SESSION_KEY)
          if (active) setSession(null)
        }
      } finally {
        if (active) setReady(true)
      }
    }

    restoreSession()
    return () => {
      active = false
      controller.abort()
    }
  }, [initialSession])

  const login = useCallback(async (username, password) => {
    const nextSession = await loginLocalAccount(username, password) || await loginWithDummyJson(username, password)
    nextSession.user = normalizeAuthUser(nextSession.user)
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
    setReady(true)
    return nextSession.user
  }, [])

  const register = useCallback(async (details) => {
    const createdUser = await registerLocalAccount(details)
    const nextSession = { provider: 'local', user: normalizeAuthUser(createdUser), accessToken: '', refreshToken: '' }
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
    setReady(true)
    return nextSession.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setReady(true)
  }, [])

  useEffect(() => {
    const syncRegisteredUser = () => {
      if (session?.provider !== 'local') return
      const updatedUser = getRegisteredAccountById(session.user.id)
      if (!updatedUser) return logout()
      const nextSession = { ...session, user: normalizeAuthUser(updatedUser) }
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
      setSession(nextSession)
    }
    window.addEventListener('shopstream-users-updated', syncRegisteredUser)
    return () => window.removeEventListener('shopstream-users-updated', syncRegisteredUser)
  }, [session, logout])

  const value = useMemo(() => ({ user, ready, login, register, logout }), [user, ready, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
