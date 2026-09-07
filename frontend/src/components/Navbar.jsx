import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const { cartCount } = useCart()
  const { wishlist } = useWishlist()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🛍️ ShopWorld</Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>

        {user && !isAdmin && <Link to="/orders">My Orders</Link>}
        {user && !isAdmin && (
          <Link to="/wishlist" className="navbar-wishlist">
            Wishlist
            {wishlist.length > 0 && <span className="cart-badge">{wishlist.length}</span>}
          </Link>
        )}

        {isAdmin && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/products">Manage Products</Link>
            <Link to="/admin/orders">All Orders</Link>
            <Link to="/admin/coupons">Coupons</Link>
          </>
        )}

        <Link to="/cart" className="navbar-cart">
          Cart
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {user ? (
          <div className="navbar-user">
            <span>Hi, {user.name}</span>
            <button className="btn btn-link" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}
