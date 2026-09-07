import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { StarDisplay } from './StarRating'
import ProductImage from './ProductImage'

const LOW_STOCK_THRESHOLD = 5

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist()

  const wishlisted = user && isWishlisted(product.id)
  const lowStock = product.stock > 0 && product.stock < LOW_STOCK_THRESHOLD

  function toggleWishlist() {
    if (!user) return
    wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)
  }

  return (
    <div className="product-card">
      <div className="product-card-img-wrap">
        <Link to={`/products/${product.id}`}>
          <ProductImage src={product.image_url} alt={product.name} className="product-card-img" />
        </Link>
        {user && (
          <button
            className={`wishlist-btn ${wishlisted ? 'wishlist-btn-active' : ''}`}
            onClick={toggleWishlist}
            aria-label="Toggle wishlist"
          >
            {wishlisted ? '♥' : '♡'}
          </button>
        )}
        {lowStock && <span className="badge badge-low-stock">Only {product.stock} left</span>}
      </div>

      <div className="product-card-body">
        <span className="product-card-category">{product.category_name}</span>
        <Link to={`/products/${product.id}`} className="product-card-name">
          {product.name}
        </Link>
        <StarDisplay rating={product.avg_rating} count={product.rating_count} />
        <div className="product-card-price">${Number(product.price).toFixed(2)}</div>
        {product.stock === 0 ? (
          <span className="badge badge-out">Out of Stock</span>
        ) : (
          <button
            className="btn btn-primary btn-block"
            onClick={() => addToCart(product, 1)}
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  )
}
