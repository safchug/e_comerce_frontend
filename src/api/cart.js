import apiClient from './client'

// GET /cart -> CartResponseDto (requires bearer auth)
export const getCart = () => apiClient.get('/cart').then((res) => res.data)

// POST /cart/items -> CartResponseDto (requires bearer auth)
export const addItem = (productId, quantity) =>
  apiClient.post('/cart/items', { productId, quantity }).then((res) => res.data)

// PATCH /cart/items/:productId -> CartResponseDto (requires bearer auth)
export const setItemQuantity = (productId, quantity) =>
  apiClient.patch(`/cart/items/${productId}`, { quantity }).then((res) => res.data)

// DELETE /cart/items/:productId -> 204 No Content (requires bearer auth)
export const removeItem = (productId) => apiClient.delete(`/cart/items/${productId}`).then((res) => res.data)
