import apiClient from './client'
import type { Order, OrderStatus } from '../types'

// POST /orders -> OrderResponseDto (requires bearer auth)
export const placeOrder = () => apiClient.post<Order>('/orders').then((res) => res.data)

// POST /orders/:id/cancel -> OrderResponseDto (requires bearer auth, must be the order's owner)
export const cancelOrder = (id: string) =>
  apiClient.post<Order>(`/orders/${id}/cancel`).then((res) => res.data)

// PATCH /orders/:id/status -> OrderResponseDto (requires bearer auth, ADMIN role)
export const updateOrderStatus = (id: string, status: OrderStatus) =>
  apiClient.patch<Order>(`/orders/${id}/status`, { status }).then((res) => res.data)
