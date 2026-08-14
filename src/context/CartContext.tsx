import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import * as cartApi from '../api/cart'
import { extractErrorMessage } from './AuthContext'
import { useAuth } from './AuthContext'
import type { Cart, CartItem } from '../types'

interface CartContextValue {
  cart: Cart | null
  items: CartItem[]
  itemCount: number
  loading: boolean
  error: string | null
  clearError: () => void
  refresh: () => Promise<void>
  addItem: (productId: string, quantity: number) => Promise<Cart>
  setItemQuantity: (productId: string, quantity: number) => Promise<Cart>
  removeItem: (productId: string) => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const addItem = async (productId: string, quantity: number) => {
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

  const setItemQuantity = async (productId: string, quantity: number) => {
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

  const removeItem = async (productId: string) => {
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

  const value: CartContextValue = {
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
