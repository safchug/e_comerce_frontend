import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { createProduct, deleteProduct, updateProduct } from '../api/products'
import { extractErrorMessage } from '../context/AuthContext'
import { formatPrice } from '../utils/formatPrice'
import type { Product } from '../types'

const emptyForm = { sku: '', name: '', description: '', price: '', currency: 'USD', active: true }
type ProductForm = typeof emptyForm

function toCents(priceStr: string) {
  const value = Math.round(parseFloat(priceStr) * 100)
  return Number.isFinite(value) ? value : 0
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])

  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ProductForm>(emptyForm)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [rowError, setRowError] = useState<Record<string, string | null>>({})

  const handleCreateChange = (field: keyof ProductForm) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = field === 'active' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
  }

  const handleCreateSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreateError(null)
    setCreating(true)
    try {
      const payload = {
        sku: form.sku.trim(),
        name: form.name.trim(),
        priceCents: toCents(form.price),
        currency: form.currency.trim() || 'USD',
        active: form.active,
        description: form.description.trim() || undefined,
      }
      const created = await createProduct(payload)
      setProducts((prev) => [created, ...prev])
      setForm(emptyForm)
    } catch (err) {
      setCreateError(extractErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setEditError(null)
    setEditForm({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      price: (product.priceCents / 100).toFixed(2),
      currency: product.currency,
      active: product.active,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(emptyForm)
    setEditError(null)
  }

  const handleEditChange = (field: keyof ProductForm) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = field === 'active' ? e.target.checked : e.target.value
    setEditForm((f) => ({ ...f, [field]: value }))
  }

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault()
    setEditError(null)
    setSavingId(id)
    try {
      const payload = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        priceCents: toCents(editForm.price),
        currency: editForm.currency.trim() || 'USD',
        active: editForm.active,
      }
      const updated = await updateProduct(id, payload)
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
      setEditingId(null)
    } catch (err) {
      setEditError(extractErrorMessage(err))
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    setDeletingId(id)
    setRowError((prev) => ({ ...prev, [id]: null }))
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setRowError((prev) => ({ ...prev, [id]: extractErrorMessage(err) }))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="page">
      <h1>Products (admin)</h1>

      <div className="card">
        <h2 className="card-title">Create product</h2>
        {createError && <div className="alert alert-error">{createError}</div>}
        <form className="product-form" onSubmit={handleCreateSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="sku">SKU</label>
              <input id="sku" value={form.sku} onChange={handleCreateChange('sku')} required />
            </div>
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input id="name" value={form.name} onChange={handleCreateChange('name')} required />
            </div>
            <div className="form-field form-field-wide">
              <label htmlFor="description">Description</label>
              <input id="description" value={form.description} onChange={handleCreateChange('description')} />
            </div>
            <div className="form-field">
              <label htmlFor="price">Price</label>
              <input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="29.99"
                value={form.price}
                onChange={handleCreateChange('price')}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="currency">Currency</label>
              <input id="currency" value={form.currency} onChange={handleCreateChange('currency')} />
            </div>
            <div className="form-field form-field-checkbox">
              <label htmlFor="active">
                <input id="active" type="checkbox" checked={form.active} onChange={handleCreateChange('active')} />
                Active
              </label>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={creating}>
            {creating ? 'Creating…' : 'Create product'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="card-title">Products created this session</h2>
        <p className="field-hint">
          The API only exposes create, update, and delete for products, so this list only shows products
          created or edited here — it isn't a full catalog.
        </p>

        {products.length === 0 ? (
          <p className="page-status">No products yet.</p>
        ) : (
          <table className="product-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Price</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) =>
                editingId === product.id ? (
                  <tr key={product.id}>
                    <td colSpan={5}>
                      <form className="product-edit-form" onSubmit={(e) => handleEditSubmit(e, product.id)}>
                        {editError && <div className="alert alert-error">{editError}</div>}
                        <div className="form-grid">
                          <div className="form-field">
                            <label>SKU</label>
                            <input value={product.sku} disabled />
                          </div>
                          <div className="form-field">
                            <label htmlFor={`name-${product.id}`}>Name</label>
                            <input
                              id={`name-${product.id}`}
                              value={editForm.name}
                              onChange={handleEditChange('name')}
                              required
                            />
                          </div>
                          <div className="form-field form-field-wide">
                            <label htmlFor={`description-${product.id}`}>Description</label>
                            <input
                              id={`description-${product.id}`}
                              value={editForm.description}
                              onChange={handleEditChange('description')}
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor={`price-${product.id}`}>Price</label>
                            <input
                              id={`price-${product.id}`}
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={editForm.price}
                              onChange={handleEditChange('price')}
                              required
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor={`currency-${product.id}`}>Currency</label>
                            <input
                              id={`currency-${product.id}`}
                              value={editForm.currency}
                              onChange={handleEditChange('currency')}
                            />
                          </div>
                          <div className="form-field form-field-checkbox">
                            <label htmlFor={`active-${product.id}`}>
                              <input
                                id={`active-${product.id}`}
                                type="checkbox"
                                checked={editForm.active}
                                onChange={handleEditChange('active')}
                              />
                              Active
                            </label>
                          </div>
                        </div>
                        <div className="product-edit-actions">
                          <button type="submit" className="btn btn-primary" disabled={savingId === product.id}>
                            {savingId === product.id ? 'Saving…' : 'Save'}
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={product.id}>
                    <td>{product.sku}</td>
                    <td>{product.name}</td>
                    <td>{formatPrice(product.priceCents, product.currency)}</td>
                    <td>
                      <span className={`badge ${product.active ? 'badge-ok' : 'badge-inactive'}`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="product-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() => startEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                      >
                        {deletingId === product.id ? 'Deleting…' : 'Delete'}
                      </button>
                      {rowError[product.id] && (
                        <div className="alert alert-error alert-inline">{rowError[product.id]}</div>
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
