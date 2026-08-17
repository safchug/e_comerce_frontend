import { formatPrice } from '../utils/formatPrice'
import type { Order, OrderItem, Product } from '../types'

export function OrderItemsTable({
  items,
  currency,
  productMap,
}: {
  items: OrderItem[]
  currency: string
  productMap?: Record<string, Product>
}) {
  return (
    <table className="product-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const product = productMap?.[item.productId]
          return (
            <tr key={item.productId}>
              <td>{product ? product.name : item.productId}</td>
              <td>{formatPrice(item.unitPriceCents, currency)}</td>
              <td>{item.quantity}</td>
              <td>{formatPrice(item.lineTotalCents, currency)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export function OrderTotals({ order }: { order: Order }) {
  return (
    <div className="cart-summary">
      <div className="cart-summary-row">
        <span>Subtotal</span>
        <span>{formatPrice(order.subtotalCents, order.currency)}</span>
      </div>
      {order.discountCents > 0 && (
        <div className="cart-summary-row">
          <span>Discount</span>
          <span>-{formatPrice(order.discountCents, order.currency)}</span>
        </div>
      )}
      <div className="cart-summary-row">
        <span>Tax{order.taxRate > 0 ? ` (${(order.taxRate * 100).toFixed(2)}%)` : ''}</span>
        <span>{formatPrice(order.taxCents, order.currency)}</span>
      </div>
      <div className="cart-total">
        <span>Total</span>
        <span>{formatPrice(order.totalCents, order.currency)}</span>
      </div>
    </div>
  )
}
