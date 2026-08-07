import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'
import { tokenStorage } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadCurrentUser = useCallback(async () => {
    if (!tokenStorage.getAccessToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const me = await authApi.getMe()
      setUser(me)
    } catch {
      tokenStorage.clearTokens()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCurrentUser()

    const handleForcedLogout = () => setUser(null)
    window.addEventListener('auth:logout', handleForcedLogout)
    return () => window.removeEventListener('auth:logout', handleForcedLogout)
  }, [loadCurrentUser])

  const clearError = () => setError(null)

  const handleLogin = async (email, password) => {
    setError(null)
    try {
      const data = await authApi.login(email, password)
      tokenStorage.setTokens(data.accessToken, data.refreshToken)
      setUser(data.user)
      return data.user
    } catch (err) {
      setError(extractErrorMessage(err))
      throw err
    }
  }

  const handleRegister = async (email, password) => {
    setError(null)
    try {
      return await authApi.register(email, password)
    } catch (err) {
      setError(extractErrorMessage(err))
      throw err
    }
  }

  const handleLogout = async () => {
    const refreshToken = tokenStorage.getRefreshToken()
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } catch {
      // Even if the server call fails, clear local state so the user is logged out.
    } finally {
      tokenStorage.clearTokens()
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    error,
    clearError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser: loadCurrentUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

export function extractErrorMessage(err) {
  const message = err?.response?.data?.message
  if (Array.isArray(message)) return message.join(', ')
  if (typeof message === 'string') return message
  return err?.message || 'Something went wrong. Please try again.'
}
