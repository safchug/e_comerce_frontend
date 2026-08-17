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
  category: string
  description?: string | null
  priceCents: number
  currency: string
  active: boolean
  stockQuantity: number
  createdAt: string
  updatedAt: string
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

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
  unitPriceCents: number
  lineTotalCents: number
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  currency: string
  subtotalCents: number
  discountCents: number
  taxRate: number
  taxCents: number
  totalCents: number
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  quantity: number
  unitPriceCents: number
  lineTotalCents: number
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  status: OrderStatus
  currency: string
  subtotalCents: number
  discountCents: number
  taxRate: number
  taxCents: number
  totalCents: number
  createdAt: string
  updatedAt: string
}

export interface HealthStatus {
  status: string
  uptime: number
  timestamp: string
}

export interface ApiErrorResponse {
  message?: string | string[]
}
