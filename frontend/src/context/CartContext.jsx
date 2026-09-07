import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

const STORAGE_KEY = 'ecommerce_cart'

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  })

  // keep cart in localStorage so a page refresh doesn't wipe it
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  function addToCart(product, quantity) {
    setCartItems(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) {
        return prev.map(i =>
          i.id === product.id ? { ...i, qty: i.qty + quantity } : i
        )
      }
      return [...prev, { ...product, qty: quantity }]
    })
  }

  function updateQty(id, qty) {
    if (qty <= 0) {
      removeFromCart(id)
      return
    }
    setCartItems(prev => prev.map(i => (i.id === id ? { ...i, qty } : i)))
  }

  function removeFromCart(id) {
    setCartItems(prev => prev.filter(i => i.id !== id))
  }

  function clearCart() {
    setCartItems([])
  }

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)
  const cartTotal = cartItems.reduce((sum, i) => sum + i.qty * Number(i.price), 0)

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, updateQty, removeFromCart, clearCart,
      cartCount, cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
