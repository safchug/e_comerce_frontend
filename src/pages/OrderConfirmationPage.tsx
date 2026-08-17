import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { cancelOrder } from '../api/orders'
import { extractErrorMessage } from '../context/AuthContext'
import { useProductMap } from '../hooks/useProductMap'
import { formatPrice } from '../utils/formatPrice'
import { isCancellable, orderStatusBadgeClass } from '../utils/orderStatus'
import type { Order } from '../types'

function formatOrderDate(createdAt: string) {
  const date = new Date(createdAt)
  return Number.isNaN(date.getTime()) ? createdAt : date.toLocaleString()
}

export default function OrderConfirmationPage() {
  const { id } = useParams()
  const location = useLocation()
  const initialOrder = (location.state as { order?: Order } | null)?.order
  const [order, setOrder] = useState(initialOrder)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const productMap = useProductMap()

  // The order is only available via router state from the checkout redirect
  // (no GET /orders/:id yet), so a direct visit or refresh can't recover it.
  if (!order || order.id !== id) {
    return (
      <div className="page">
        <h1>Order details unavailable</h1>
        <p className="page-status">
          This order can only be viewed right after checkout.
          <br />
          <Link to="/cart">Back to cart</Link>
        </p>
      </div>
    )
  }

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return
    setCancelling(true)
    setCancelError(null)
    try {
      const updated = await cancelOrder(order.id)
      setOrder(updated)
    } catch (err) {
      setCancelError(extractErrorMessage(err))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="page">
      <h1>Order confirmed</h1>
      <p className="order-meta">
        Order #{order.id} · placed {formatOrderDate(order.createdAt)} ·{' '}
        <span className={`badge ${orderStatusBadgeClass(order.status)}`}>{order.status}</span>
      </p>

      <div className="card">
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
            {order.items.map((item) => {
              const product = productMap[item.productId]
              return (
                <tr key={item.productId}>
                  <td>{product ? product.name : item.productId}</td>
                  <td>{formatPrice(item.unitPriceCents, order.currency)}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.lineTotalCents, order.currency)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
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

        {isCancellable(order.status) && (
          <div className="order-actions">
            {cancelError && <div className="alert alert-error alert-inline">{cancelError}</div>}
            <button type="button" className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling…' : 'Cancel order'}
            </button>
          </div>
        )}
      </div>

      <Link to="/products">Continue shopping</Link>
    </div>
  )
}
