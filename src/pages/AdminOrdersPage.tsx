import { useState } from 'react'
import type { FormEvent } from 'react'
import { updateOrderStatus } from '../api/orders'
import { extractErrorMessage } from '../context/AuthContext'
import { OrderItemsTable, OrderTotals } from '../components/OrderSummary'
import { ORDER_STATUSES, orderStatusBadgeClass } from '../utils/orderStatus'
import type { Order, OrderStatus } from '../types'

export default function AdminOrdersPage() {
  const [orderId, setOrderId] = useState('')
  const [status, setStatus] = useState<OrderStatus>('PAID')
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Order | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedId = orderId.trim()
    // The API has no GET /orders/:id, so we can't show the order's current status
    // before this PATCH lands - require an explicit confirm to reduce the risk of
    // silently regressing an order's status because of a stale/default selection.
    if (!window.confirm(`Set order ${trimmedId} to ${status}?`)) return
    setError(null)
    setUpdating(true)
    try {
      const updated = await updateOrderStatus(trimmedId, status)
      setResult(updated)
    } catch (err) {
      setError(extractErrorMessage(err))
      setResult(null)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="page">
      <h1>Orders (admin)</h1>

      <div className="card">
        <h2 className="card-title">Update order status</h2>
        <p className="field-hint">
          The API has no endpoint to list orders, so enter an order ID directly (e.g. from an order confirmation
          link or a customer&apos;s report) to advance its status.
        </p>
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field form-field-wide">
              <label htmlFor="orderId">Order ID</label>
              <input
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="9c1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="status">New status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={updating || !orderId.trim()}>
            {updating ? 'Updating…' : 'Update status'}
          </button>
        </form>
      </div>

      {result && (
        <div className="card">
          <h2 className="card-title">Updated order</h2>
          <p className="order-meta">
            Order #{result.id} ·{' '}
            <span className={`badge ${orderStatusBadgeClass(result.status)}`}>{result.status}</span>
          </p>
          <OrderItemsTable items={result.items} currency={result.currency} />
          <OrderTotals order={result} />
        </div>
      )}
    </div>
  )
}
