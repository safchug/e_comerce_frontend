import apiClient from './client'

// GET /products?page&limit&name&category&minPriceCents&maxPriceCents -> PaginatedProductsResponseDto (public, no auth required)
export const listProducts = ({ page, limit, name, category, minPriceCents, maxPriceCents } = {}) =>
  apiClient
    .get('/products', { params: { page, limit, name, category, minPriceCents, maxPriceCents } })
    .then((res) => res.data)

// POST /products -> ProductResponseDto (requires bearer auth, ADMIN role)
export const createProduct = (product) =>
  apiClient.post('/products', product).then((res) => res.data)

// PATCH /products/:id -> ProductResponseDto (requires bearer auth, ADMIN role)
export const updateProduct = (id, product) =>
  apiClient.patch(`/products/${id}`, product).then((res) => res.data)

// DELETE /products/:id -> 204 No Content (requires bearer auth, ADMIN role)
export const deleteProduct = (id) => apiClient.delete(`/products/${id}`).then((res) => res.data)

// GET /products/categories -> ProductCategoriesResponseDto (public, no auth required)
export const listCategories = () =>
  apiClient.get('/products/categories').then((res) => res.data.categories)
