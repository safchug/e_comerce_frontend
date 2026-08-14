import apiClient from './client'
import type { LoginResponse, TokenPair, User } from '../types'

// POST /auth/register -> UserResponseDto
export const register = (email: string, password: string) =>
  apiClient.post<User>('/auth/register', { email, password }).then((res) => res.data)

// POST /auth/login -> LoginResponseDto { accessToken, refreshToken, user }
export const login = (email: string, password: string) =>
  apiClient.post<LoginResponse>('/auth/login', { email, password }).then((res) => res.data)

// POST /auth/refresh -> TokenPairDto
export const refresh = (refreshToken: string) =>
  apiClient.post<TokenPair>('/auth/refresh', { refreshToken }).then((res) => res.data)

// POST /auth/logout (requires bearer auth)
export const logout = (refreshToken: string) =>
  apiClient.post('/auth/logout', { refreshToken }).then((res) => res.data)

// GET /users/me -> UserResponseDto (requires bearer auth)
export const getMe = () => apiClient.get<User>('/users/me').then((res) => res.data)

// GET /users -> admin-only placeholder endpoint (requires bearer auth)
export const getUsers = () => apiClient.get('/users').then((res) => res.data)
