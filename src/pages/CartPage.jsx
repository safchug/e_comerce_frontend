import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProducts } from '../api/products'
import { useCart } from '../context/CartContext'
import { extractErrorMessage } from '../context/AuthContext'
import { formatPrice } from '../utils/formatPrice'

export default function CartPage() {
  const { items, loading, error, setItemQuantity, removeItem } = useCart()
  const [productMap, setProductMap] = useState({})
  const [rowBusy, setRowBusy] = useState({})
  const [rowError, setRowError] = useState({})

  // Cart lines only carry productId + quantity, and there's no GET /products/:id,
  // so fetch a page of the catalog to look up names/prices for display.
  useEffect(() => {
    listProducts({ limit: 100 })
      .then((res) => {
        const map = {}
        for (const product of res.data) map[product.id] = product
        setProductMap(map)
      })
      .catch(() => {})
  }, [])

  const runRowAction = async (productId, action) => {
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

  const handleQuantityChange = (productId, quantity) => {
    if (!Number.isFinite(quantity) || quantity < 1) return
    runRowAction(productId, () => setItemQuantity(productId, quantity))
  }

  const handleRemove = (productId) => {
    runRowAction(productId, () => removeItem(productId))
  }

  const currency = items.map((item) => productMap[item.productId]?.currency).find(Boolean) || 'USD'
  const totalCents = items.reduce((sum, item) => {
    const product = productMap[item.productId]
    return sum + (product ? product.priceCents * item.quantity : 0)
  }, 0)

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
                    <td>{product ? formatPrice(product.priceCents, product.currency) : '—'}</td>
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
                    <td>{product ? formatPrice(product.priceCents * item.quantity, product.currency) : '—'}</td>
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
          <div className="cart-total">
            <span>Total</span>
            <span>{formatPrice(totalCents, currency)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
