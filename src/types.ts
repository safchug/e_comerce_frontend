export type Role = 'ADMIN' | 'CUSTOMER'

export interface User {
  id: string
  email: string
  role: Role
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface Product {
  id: string
  sku: string
  name: string
  description?: string
  priceCents: number
  currency: string
  active: boolean
}

export type ProductInput = Omit<Product, 'id'>

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
}

export interface PaginatedProductsResponse {
  data: Product[]
  meta: PaginationMeta
}

export interface ProductFilters {
  page?: number
  limit?: number
  name?: string
  category?: string
  minPriceCents?: number
  maxPriceCents?: number
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface Cart {
  items: CartItem[]
}

export interface HealthStatus {
  status: string
  uptime: number
  timestamp: string
}

export interface ApiErrorResponse {
  message?: string | string[]
}
