import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { listCategories, listProducts } from '../api/products'
import { extractErrorMessage, useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/formatPrice'
import type { PaginatedProductsResponse } from '../types'

const LIMIT = 20
const EMPTY_FILTERS = { name: '', category: '', minPrice: '', maxPrice: '' }

// Converts a whole-dollar string from the price inputs into whole cents for the API.
const toCents = (dollars: string | undefined) => {
  if (dollars === '' || dollars === undefined) return undefined
  const value = Number(dollars)
  return Number.isFinite(value) ? Math.round(value * 100) : undefined
}

export default function ProductsPage() {
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)
  const [result, setResult] = useState<PaginatedProductsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [addingId, setAddingId] = useState<string | null>(null)
  const [addError, setAddError] = useState<Record<string, string | null>>({})
  const [addedId, setAddedId] = useState<string | null>(null)

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

  const handleFilterChange = (field: keyof typeof EMPTY_FILTERS) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters((f) => ({ ...f, [field]: e.target.value }))
  }

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS)
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  const handleAddToCart = async (productId: string) => {
    setAddingId(productId)
    setAddError((prev) => ({ ...prev, [productId]: null }))
    setAddedId(null)
    try {
      await addItem(productId, 1)
      setAddedId(productId)
    } catch (err) {
      setAddError((prev) => ({ ...prev, [productId]: extractErrorMessage(err) }))
    } finally {
      setAddingId(null)
    }
  }

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
                <th>Category</th>
                <th>Description</th>
                <th>Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.description || '—'}</td>
                  <td>{formatPrice(product.priceCents, product.currency)}</td>
                  <td>
                    {isAuthenticated ? (
                      product.stockQuantity <= 0 ? (
                        <span className="badge badge-inactive">Out of stock</span>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn btn-secondary btn-small"
                            disabled={addingId === product.id}
                            onClick={() => handleAddToCart(product.id)}
                          >
                            {addingId === product.id
                              ? 'Adding…'
                              : addedId === product.id
                                ? 'Added ✓'
                                : 'Add to cart'}
                          </button>
                          {addError[product.id] && (
                            <div className="alert alert-error alert-inline">{addError[product.id]}</div>
                          )}
                        </>
                      )
                    ) : (
                      <Link to="/login">Log in to buy</Link>
                    )}
                  </td>
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
