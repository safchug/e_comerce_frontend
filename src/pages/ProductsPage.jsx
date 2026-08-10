import { useEffect, useState } from 'react'
import { listCategories, listProducts } from '../api/products'
import { extractErrorMessage } from '../context/AuthContext'
import { formatPrice } from '../utils/formatPrice'

const LIMIT = 20
const EMPTY_FILTERS = { name: '', category: '', minPrice: '', maxPrice: '' }

// Converts a whole-dollar string from the price inputs into whole cents for the API.
const toCents = (dollars) => {
  if (dollars === '' || dollars === undefined) return undefined
  const value = Number(dollars)
  return Number.isFinite(value) ? Math.round(value * 100) : undefined
}

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  // Debounce filter changes so we don't fire a request on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      setAppliedFilters(filters)
      setPage(1)
    }, 400)
    return () => clearTimeout(handle)
  }, [filters])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listProducts({
      page,
      limit: LIMIT,
      name: appliedFilters.name.trim() || undefined,
      category: appliedFilters.category.trim() || undefined,
      minPriceCents: toCents(appliedFilters.minPrice),
      maxPriceCents: toCents(appliedFilters.maxPrice),
    })
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
  }, [page, appliedFilters])

  const handleFilterChange = (field) => (e) => {
    setFilters((f) => ({ ...f, [field]: e.target.value }))
  }

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS)
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  const products = result?.data ?? []
  const meta = result?.meta

  return (
    <div className="page">
      <h1>Products</h1>

      <div className="card">
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="filter-name">Name</label>
            <input
              id="filter-name"
              type="text"
              placeholder="Search by name…"
              value={filters.name}
              onChange={handleFilterChange('name')}
            />
          </div>
          <div className="form-field">
            <label htmlFor="filter-category">Category</label>
            <select id="filter-category" value={filters.category} onChange={handleFilterChange('category')}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="filter-min-price">Min price</label>
            <input
              id="filter-min-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={filters.minPrice}
              onChange={handleFilterChange('minPrice')}
            />
          </div>
          <div className="form-field">
            <label htmlFor="filter-max-price">Max price</label>
            <input
              id="filter-max-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={filters.maxPrice}
              onChange={handleFilterChange('maxPrice')}
            />
          </div>
        </div>
        {hasActiveFilters && (
          <button type="button" className="btn btn-secondary btn-small" onClick={handleClearFilters}>
            Clear filters
          </button>
        )}
      </div>

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
