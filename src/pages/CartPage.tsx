import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listProducts } from '../api/products'
import { useCart } from '../context/CartContext'
import { extractErrorMessage } from '../context/AuthContext'
import { formatPrice } from '../utils/formatPrice'
import type { Product } from '../types'

export default function CartPage() {
  const { cart, items, loading, error, setItemQuantity, removeItem, placeOrder } = useCart()
  const navigate = useNavigate()
  const [productMap, setProductMap] = useState<Record<string, Product>>({})
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({})
  const [rowError, setRowError] = useState<Record<string, string | null>>({})
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  // The cart already carries authoritative pricing/totals (unitPriceCents, lineTotalCents,
  // subtotalCents, taxCents, totalCents, ...). Product names aren't part of the cart response
  // and there's no GET /products/:id, so fetch a page of the catalog just to look up names.
  useEffect(() => {
    listProducts({ limit: 100 })
      .then((res) => {
        const map: Record<string, Product> = {}
        for (const product of res.data) map[product.id] = product
        setProductMap(map)
      })
      .catch(() => {})
  }, [])

  const runRowAction = async (productId: string, action: () => Promise<unknown>) => {
    setRowBusy((prev) => ({ ...prev, [productId]: true }))
    setRowError((prev) => ({ ...prev, [productId]: null }))
    try {
      await action()
    } catch (err) {
      setRowError((prev) => ({ ...prev, [productId]: extractErrorMessage(err) }))
    } finally {
      setRowBusy((prev) => ({ ...prev, [productId]: false }))
    }
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity < 1) return
    runRowAction(productId, () => setItemQuantity(productId, quantity))
  }

  const handleRemove = (productId: string) => {
    runRowAction(productId, () => removeItem(productId))
  }

  const handlePlaceOrder = async () => {
    setPlacingOrder(true)
    setOrderError(null)
    try {
      const order = await placeOrder()
      navigate(`/orders/${order.id}`, { state: { order } })
    } catch (err) {
      setOrderError(extractErrorMessage(err))
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <div className="page">
      <h1>My cart</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="page-status">Loading cart…</p>
      ) : items.length === 0 ? (
        <p className="page-status">
          Your cart is empty. <Link to="/products">Browse products</Link>
        </p>
      ) : (
        <div className="card">
          <table className="product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const product = productMap[item.productId]
                const busy = !!rowBusy[item.productId]
                return (
                  <tr key={item.productId}>
                    <td>{product ? product.name : item.productId}</td>
                    <td>{formatPrice(item.unitPriceCents, cart?.currency)}</td>
                    <td>
                      <div className="quantity-stepper">
                        <button
                          type="button"
                          className="btn btn-secondary btn-small"
                          disabled={busy || item.quantity <= 1}
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-small"
                          disabled={busy}
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      {rowError[item.productId] && (
                        <div className="alert alert-error alert-inline">{rowError[item.productId]}</div>
                      )}
                    </td>
                    <td>{formatPrice(item.lineTotalCents, cart?.currency)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        disabled={busy}
                        onClick={() => handleRemove(item.productId)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {cart && (
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotalCents, cart.currency)}</span>
              </div>
              {cart.discountCents > 0 && (
                <div className="cart-summary-row">
                  <span>Discount</span>
                  <span>-{formatPrice(cart.discountCents, cart.currency)}</span>
                </div>
              )}
              <div className="cart-summary-row">
                <span>Tax{cart.taxRate > 0 ? ` (${(cart.taxRate * 100).toFixed(2)}%)` : ''}</span>
                <span>{formatPrice(cart.taxCents, cart.currency)}</span>
              </div>
              <div className="cart-total">
                <span>Total</span>
                <span>{formatPrice(cart.totalCents, cart.currency)}</span>
              </div>
              {orderError && <div className="alert alert-error alert-inline">{orderError}</div>}
              <div className="cart-checkout">
                <button type="button" className="btn btn-primary" disabled={placingOrder} onClick={handlePlaceOrder}>
                  {placingOrder ? 'Placing order…' : 'Place order'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
