import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import type { TokenPair } from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

const apiClient = axios.create({
  baseURL: BASE_URL,
})

// Attach the access token to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<{ data: TokenPair }> | null = null

// On a 401, try exactly one silent refresh before giving up. Concurrent
// 401s share the same in-flight refresh call instead of each starting their own.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login')
    ) {
      return Promise.reject(error)
    }

    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post<TokenPair>(`${BASE_URL}/auth/refresh`, { refreshToken })
          .finally(() => {
            refreshPromise = null
          })
      }
      const { data } = await refreshPromise
      tokenStorage.setTokens(data.accessToken, data.refreshToken)
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      tokenStorage.clearTokens()
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(refreshError)
    }
  },
)

export default apiClient
