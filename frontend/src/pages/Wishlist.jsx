import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { StarDisplay } from '../components/StarRating'
import ProductImage from '../components/ProductImage'

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  if (wishlist.length === 0) {
    return (
      <div className="page">
        <h1>My Wishlist</h1>
        <p>Your wishlist is empty. <Link to="/">Browse products</Link></p>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>My Wishlist</h1>
      <div className="product-grid">
        {wishlist.map(product => (
          <div className="product-card" key={product.id}>
            <div className="product-card-img-wrap">
              <Link to={`/products/${product.id}`}>
                <ProductImage src={product.image_url} alt={product.name} className="product-card-img" />
              </Link>
              <button
                className="wishlist-btn wishlist-btn-active"
                onClick={() => removeFromWishlist(product.id)}
                aria-label="Remove from wishlist"
              >
                ♥
              </button>
            </div>
            <div className="product-card-body">
              <span className="product-card-category">{product.category_name}</span>
              <Link to={`/products/${product.id}`} className="product-card-name">{product.name}</Link>
              <StarDisplay rating={product.avg_rating} count={product.rating_count} />
              <div className="product-card-price">${Number(product.price).toFixed(2)}</div>
              {product.stock === 0 ? (
                <span className="badge badge-out">Out of Stock</span>
              ) : (
                <button className="btn btn-primary btn-block" onClick={() => addToCart(product, 1)}>
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
