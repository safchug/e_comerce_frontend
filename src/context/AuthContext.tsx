import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
import * as authApi from '../api/auth'
import { tokenStorage } from '../api/client'
import type { ApiErrorResponse, User } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  error: string | null
  clearError: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<User>
  register: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const handleLogin = async (email: string, password: string) => {
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

  const handleRegister = async (email: string, password: string) => {
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

  const value: AuthContextValue = {
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

export function extractErrorMessage(err: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(err)) {
    const message = err.response?.data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}
