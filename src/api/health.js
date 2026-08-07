import apiClient from './client'

// GET /health -> HealthStatus
export const getHealth = () => apiClient.get('/health').then((res) => res.data)
