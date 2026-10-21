import { useCallback, useRef, useState } from 'react'
import { AuthContext } from './authContext.js'
import { authApi } from '../api/authApi.js'
import { apiRequest } from '../api/httpClient.js'
import { clearVerifier, getVerifier, startPkce } from '../api/pkce.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const session = useRef(null)
  const version = useRef(0)
  const refreshInFlight = useRef(null)

  const acceptSession = useCallback((value) => {
    session.current = value
    setUser(value?.user || null)
  }, [])

  const request = useCallback(async (path, options = {}) => {
    if (!session.current) throw new Error('Увійди до облікового запису.')
    const currentVersion = version.current
    const usedToken = session.current.accessToken
    try {
      return await apiRequest(path, { ...options, token: usedToken })
    } catch (error) {
      if (error.status !== 401 || !session.current || currentVersion !== version.current) throw error
      if (session.current.accessToken !== usedToken) {
        return apiRequest(path, { ...options, token: session.current.accessToken })
      }
      if (!refreshInFlight.current) {
        refreshInFlight.current = authApi.refresh(session.current.refreshToken)
          .then((value) => {
            if (currentVersion !== version.current) throw new Error('Сесію завершено.')
            acceptSession(value)
            return value
          })
          .catch((refreshError) => {
            if (currentVersion === version.current) acceptSession(null)
            throw refreshError
          })
          .finally(() => { refreshInFlight.current = null })
      }
      const refreshed = await refreshInFlight.current
      return apiRequest(path, { ...options, token: refreshed.accessToken })
    }
  }, [acceptSession])

  const login = useCallback(async (email, password) => {
    const value = await authApi.login({ email, password })
    version.current += 1
    acceptSession(value)
  }, [acceptSession])

  const register = useCallback(async (email, password, displayName) => {
    const codeChallenge = await startPkce()
    const result = await authApi.register({ email, password, displayName, codeChallenge })
    if (result.session) {
      clearVerifier()
      version.current += 1
      acceptSession(result.session)
    }
    return result
  }, [acceptSession])

  const recover = useCallback(async (email) => {
    const codeChallenge = await startPkce()
    await authApi.recover({ email, codeChallenge })
  }, [])

  const exchangeCode = useCallback(async (code) => {
    const value = await authApi.exchange(code, getVerifier())
    clearVerifier()
    version.current += 1
    acceptSession(value)
  }, [acceptSession])

  const logout = useCallback(async () => {
    const token = session.current?.accessToken
    version.current += 1
    acceptSession(null)
    if (token) await authApi.logout(token)
  }, [acceptSession])

  const updateUser = useCallback((profile) => {
    if (session.current?.user.id === profile.id) acceptSession({ ...session.current, user: profile })
  }, [acceptSession])

  return <AuthContext.Provider value={{ user, login, register, recover, exchangeCode, logout, request, updateUser }}>
    {children}
  </AuthContext.Provider>
}
