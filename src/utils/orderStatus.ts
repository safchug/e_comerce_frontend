import type { OrderStatus } from '../types'

export const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

// Cancellation is only allowed before an order ships (matches the API's 409 for terminal/shipped orders).
export const isCancellable = (status: OrderStatus) => status === 'PENDING' || status === 'PAID'

const BADGE_CLASS: Record<OrderStatus, string> = {
  PENDING: 'badge-pending',
  PAID: 'badge-paid',
  SHIPPED: 'badge-shipped',
  DELIVERED: 'badge-ok',
  CANCELLED: 'badge-cancelled',
}

export const orderStatusBadgeClass = (status: OrderStatus) => BADGE_CLASS[status]
