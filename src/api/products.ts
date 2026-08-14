import apiClient from './client'
import type { PaginatedProductsResponse, Product, ProductFilters, ProductInput } from '../types'

// GET /products?page&limit&name&category&minPriceCents&maxPriceCents -> PaginatedProductsResponseDto (public, no auth required)
export const listProducts = ({ page, limit, name, category, minPriceCents, maxPriceCents }: ProductFilters = {}) =>
  apiClient
    .get<PaginatedProductsResponse>('/products', { params: { page, limit, name, category, minPriceCents, maxPriceCents } })
    .then((res) => res.data)

// POST /products -> ProductResponseDto (requires bearer auth, ADMIN role)
export const createProduct = (product: Partial<ProductInput>) =>
  apiClient.post<Product>('/products', product).then((res) => res.data)

// PATCH /products/:id -> ProductResponseDto (requires bearer auth, ADMIN role)
export const updateProduct = (id: string, product: Partial<ProductInput>) =>
  apiClient.patch<Product>(`/products/${id}`, product).then((res) => res.data)

// DELETE /products/:id -> 204 No Content (requires bearer auth, ADMIN role)
export const deleteProduct = (id: string) => apiClient.delete(`/products/${id}`).then((res) => res.data)

// GET /products/categories -> ProductCategoriesResponseDto (public, no auth required)
export const listCategories = () =>
  apiClient.get<{ categories: string[] }>('/products/categories').then((res) => res.data.categories)
