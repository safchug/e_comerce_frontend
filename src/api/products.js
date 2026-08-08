import apiClient from './client'

// GET /products?page&limit -> PaginatedProductsResponseDto (public, no auth required)
export const listProducts = ({ page, limit } = {}) =>
  apiClient.get('/products', { params: { page, limit } }).then((res) => res.data)

// POST /products -> ProductResponseDto (requires bearer auth, ADMIN role)
export const createProduct = (product) =>
  apiClient.post('/products', product).then((res) => res.data)

// PATCH /products/:id -> ProductResponseDto (requires bearer auth, ADMIN role)
export const updateProduct = (id, product) =>
  apiClient.patch(`/products/${id}`, product).then((res) => res.data)

// DELETE /products/:id -> 204 No Content (requires bearer auth, ADMIN role)
export const deleteProduct = (id) => apiClient.delete(`/products/${id}`).then((res) => res.data)
