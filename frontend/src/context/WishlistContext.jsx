import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api'
import { useAuth } from './AuthContext'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState([])

  const refreshWishlist = useCallback(() => {
    if (!user) {
      setWishlist([])
      return
    }
    api.get('/wishlist').then(res => setWishlist(res.data)).catch(() => {})
  }, [user])

  useEffect(() => { refreshWishlist() }, [refreshWishlist])

  async function addToWishlist(product) {
    if (!user) return
    setWishlist(prev => [product, ...prev]) // optimistic
    try {
      await api.post('/wishlist', { product_id: product.id })
    } catch {
      refreshWishlist() // revert on failure
    }
  }

  async function removeFromWishlist(productId) {
    setWishlist(prev => prev.filter(p => p.id !== productId)) // optimistic
    try {
      await api.delete(`/wishlist/${productId}`)
    } catch {
      refreshWishlist()
    }
  }

  function isWishlisted(productId) {
    return wishlist.some(p => p.id === productId)
  }

  return (
    <WishlistContext.Provider value={{
      wishlist, addToWishlist, removeFromWishlist, isWishlisted,
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
