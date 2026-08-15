import apiClient from './client'
import type { Order } from '../types'

// POST /orders -> OrderResponseDto (requires bearer auth)
export const placeOrder = () => apiClient.post<Order>('/orders').then((res) => res.data)
