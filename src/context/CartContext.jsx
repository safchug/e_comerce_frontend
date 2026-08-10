import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as cartApi from '../api/cart'
import { extractErrorMessage } from './AuthContext'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await cartApi.getCart()
      setCart(data)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const addItem = async (productId, quantity) => {
    setError(null)
    try {
      const data = await cartApi.addItem(productId, quantity)
      setCart(data)
      return data
    } catch (err) {
      setError(extractErrorMessage(err))
      throw err
    }
  }

  const setItemQuantity = async (productId, quantity) => {
    setError(null)
    try {
      const data = await cartApi.setItemQuantity(productId, quantity)
      setCart(data)
      return data
    } catch (err) {
      setError(extractErrorMessage(err))
      throw err
    }
  }

  const removeItem = async (productId) => {
    setError(null)
    try {
      await cartApi.removeItem(productId)
      setCart((prev) => (prev ? { ...prev, items: prev.items.filter((i) => i.productId !== productId) } : prev))
    } catch (err) {
      setError(extractErrorMessage(err))
      throw err
    }
  }

  const items = cart?.items ?? []
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const value = {
    cart,
    items,
    itemCount,
    loading,
    error,
    clearError: () => setError(null),
    refresh: loadCart,
    addItem,
    setItemQuantity,
    removeItem,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
