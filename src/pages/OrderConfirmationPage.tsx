import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { listProducts } from '../api/products'
import { formatPrice } from '../utils/formatPrice'
import type { Order, Product } from '../types'

export default function OrderConfirmationPage() {
  const { id } = useParams()
  const location = useLocation()
  const order = (location.state as { order?: Order } | null)?.order
  const [productMap, setProductMap] = useState<Record<string, Product>>({})

  // The order response only carries productId per line, so fetch a page of
  // the catalog just to look up names (same approach as CartPage).
  useEffect(() => {
    listProducts({ limit: 100 })
      .then((res) => {
        const map: Record<string, Product> = {}
        for (const product of res.data) map[product.id] = product
        setProductMap(map)
      })
      .catch(() => {})
  }, [])

  if (!order || order.id !== id) {
    return (
      <div className="page">
        <h1>Order placed</h1>
        <p className="page-status">
          Order details aren't available here.
          <br />
          <Link to="/cart">Back to cart</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Order confirmed</h1>
      <p className="order-meta">
        Order #{order.id} · placed {new Date(order.createdAt).toLocaleString()}
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
      </div>

      <Link to="/products">Continue shopping</Link>
    </div>
  )
}
