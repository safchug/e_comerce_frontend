import apiClient from './client'
import type { Cart } from '../types'

// GET /cart -> CartResponseDto (requires bearer auth)
export const getCart = () => apiClient.get<Cart>('/cart').then((res) => res.data)

// POST /cart/items -> CartResponseDto (requires bearer auth)
export const addItem = (productId: string, quantity: number) =>
  apiClient.post<Cart>('/cart/items', { productId, quantity }).then((res) => res.data)

// PATCH /cart/items/:productId -> CartResponseDto (requires bearer auth)
export const setItemQuantity = (productId: string, quantity: number) =>
  apiClient.patch<Cart>(`/cart/items/${productId}`, { quantity }).then((res) => res.data)

// DELETE /cart/items/:productId -> 204 No Content (requires bearer auth)
export const removeItem = (productId: string) =>
  apiClient.delete(`/cart/items/${productId}`).then(() => undefined)
