import apiClient from './client'

// POST /auth/register -> UserResponseDto
export const register = (email, password) =>
  apiClient.post('/auth/register', { email, password }).then((res) => res.data)

// POST /auth/login -> LoginResponseDto { accessToken, refreshToken, user }
export const login = (email, password) =>
  apiClient.post('/auth/login', { email, password }).then((res) => res.data)

// POST /auth/refresh -> TokenPairDto
export const refresh = (refreshToken) =>
  apiClient.post('/auth/refresh', { refreshToken }).then((res) => res.data)

// POST /auth/logout (requires bearer auth)
export const logout = (refreshToken) =>
  apiClient.post('/auth/logout', { refreshToken }).then((res) => res.data)

// GET /users/me -> UserResponseDto (requires bearer auth)
export const getMe = () => apiClient.get('/users/me').then((res) => res.data)

// GET /users -> admin-only placeholder endpoint (requires bearer auth)
export const getUsers = () => apiClient.get('/users').then((res) => res.data)
