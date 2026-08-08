import { useEffect, useState } from 'react'
import { listProducts } from '../api/products'
import { extractErrorMessage } from '../context/AuthContext'
import { formatPrice } from '../utils/formatPrice'

const LIMIT = 20

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listProducts({ page, limit: LIMIT })
      .then((data) => {
        if (!cancelled) setResult(data)
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page])

  const products = result?.data ?? []
  const meta = result?.meta

  return (
    <div className="page">
      <h1>Products</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="page-status">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="page-status">No products found.</p>
      ) : (
        <div className="card">
          <table className="product-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.description || '—'}</td>
                  <td>{formatPrice(product.priceCents, product.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {meta && (
            <div className="pagination">
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => setPage((p) => p - 1)}
                disabled={meta.page <= 1}
              >
                Previous
              </button>
              <span className="pagination-status">
                Page {meta.page} of {Math.max(meta.totalPages, 1)} ({meta.total} products)
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta.hasNextPage}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
