import apiClient from './client'
import type { HealthStatus } from '../types'

// GET /health -> HealthStatus
export const getHealth = () => apiClient.get<HealthStatus>('/health').then((res) => res.data)
