import { useCallback, useEffect, useMemo, useState } from 'react'
import { CartContext } from './cart'

const STORAGE_KEY = 'shopstream-cart'

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = useCallback((product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.source === product.source && item.id === product.id)
      if (existing) {
        return current.map((item) => (
          item.source === product.source && item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ))
      }
      return [...current, { ...product, quantity }]
    })
  }, [])

  const updateQuantity = useCallback((source, id, quantity) => {
    setItems((current) => current.map((item) => (
      item.source === source && item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    )))
  }, [])

  const removeFromCart = useCallback((source, id) => {
    setItems((current) => current.filter((item) => item.source !== source || item.id !== id))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const value = useMemo(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  }), [items, addToCart, updateQuantity, removeFromCart, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

