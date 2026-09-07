import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { StarDisplay, StarInput } from '../components/StarRating'
import ProductImage from '../components/ProductImage'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist()

  const [product, setProduct] = useState(null)
  const [ratings, setRatings] = useState([])
  const [qty, setQty] = useState(1)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  const [myRating, setMyRating] = useState(0)
  const [myReview, setMyReview] = useState('')
  const [ratingError, setRatingError] = useState('')
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const [ratingSaved, setRatingSaved] = useState(false)

  function loadProduct() {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => setError('Product not found'))
  }

  function loadRatings() {
    api.get(`/products/${id}/ratings`).then(res => setRatings(res.data)).catch(() => {})
  }

  useEffect(() => {
    loadProduct()
    loadRatings()
  }, [id])

  if (error) return <div className="page"><p className="error-text">{error}</p></div>
  if (!product) return <div className="page"><p>Loading...</p></div>

  const outOfStock = product.stock === 0
  const wishlisted = user && isWishlisted(product.id)

  function handleAdd() {
    addToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  function toggleWishlist() {
    if (!user) return
    wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)
  }

  async function handleRatingSubmit(e) {
    e.preventDefault()
    setRatingError('')
    if (myRating === 0) {
      setRatingError('Select a star rating first')
      return
    }
    setRatingSubmitting(true)
    try {
      await api.post(`/products/${id}/ratings`, { rating: myRating, review: myReview })
      setRatingSaved(true)
      loadProduct()
      loadRatings()
    } catch (err) {
      setRatingError(err.response?.data?.error || 'Could not save your rating')
    } finally {
      setRatingSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="product-detail">
        <div className="product-detail-img-wrap">
          <ProductImage src={product.image_url} alt={product.name} className="product-detail-img" />
          {user && (
            <button
              className={`wishlist-btn ${wishlisted ? 'wishlist-btn-active' : ''}`}
              onClick={toggleWishlist}
              aria-label="Toggle wishlist"
            >
              {wishlisted ? '♥' : '♡'}
            </button>
          )}
        </div>

        <div className="product-detail-info">
          <span className="product-card-category">{product.category_name}</span>
          <h1>{product.name}</h1>
          <StarDisplay rating={product.avg_rating} count={product.rating_count} />
          <p className="product-detail-desc">{product.description}</p>
          <div className="product-detail-price">${Number(product.price).toFixed(2)}</div>

          {outOfStock ? (
            <span className="badge badge-out">Out of Stock</span>
          ) : (
            <>
              {product.stock < 5 && (
                <span className="badge badge-low-stock">Only {product.stock} left in stock</span>
              )}
              <div className="qty-selector">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <button className="btn btn-primary" onClick={handleAdd}>
                {added ? 'Added ✓' : 'Add to Cart'}
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/cart')}>
                Go to Cart
              </button>
            </>
          )}
        </div>
      </div>

      <div className="reviews-section">
        <h2>Customer Reviews</h2>

        {user && !ratingSaved && (
          <form className="rating-form" onSubmit={handleRatingSubmit}>
            <p>Rate this product:</p>
            <StarInput value={myRating} onChange={setMyRating} />
            <textarea
              rows={2}
              placeholder="Write a short review (optional)"
              value={myReview}
              onChange={e => setMyReview(e.target.value)}
            />
            {ratingError && <p className="error-text">{ratingError}</p>}
            <button className="btn btn-primary btn-sm" disabled={ratingSubmitting}>
              {ratingSubmitting ? 'Saving...' : 'Submit Rating'}
            </button>
            <p className="form-hint">You can only rate products you've purchased.</p>
          </form>
        )}
        {ratingSaved && <p className="success-banner">Thanks for your review! 🎉</p>}

        {ratings.length === 0 ? (
          <p className="form-hint">No reviews yet.</p>
        ) : (
          <div className="review-list">
            {ratings.map(r => (
              <div className="review-row" key={r.id}>
                <div className="review-row-header">
                  <strong>{r.customer_name}</strong>
                  <StarDisplay rating={r.rating} hideCount />
                </div>
                {r.review && <p className="review-text">{r.review}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
