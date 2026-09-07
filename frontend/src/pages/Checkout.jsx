import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import api from '../api'

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [placing, setPlacing] = useState(false)
  const navigate = useNavigate()

  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(null) // { code, discount_percent, discount_amount }
  const [couponError, setCouponError] = useState('')
  const [checkingCoupon, setCheckingCoupon] = useState(false)

  if (cartItems.length === 0) {
    return <Navigate to="/cart" replace />
  }

  const discountAmount = couponApplied?.discount_amount || 0
  const finalTotal = Math.max(0, cartTotal - discountAmount)

  async function handleApplyCoupon() {
    setCouponError('')
    setCouponApplied(null)
    if (!couponCode.trim()) {
      setCouponError('Enter a coupon code')
      return
    }
    setCheckingCoupon(true)
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode, subtotal: cartTotal,
      })
      setCouponApplied(res.data)
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Could not validate coupon')
    } finally {
      setCheckingCoupon(false)
    }
  }

  function handleRemoveCoupon() {
    setCouponApplied(null)
    setCouponCode('')
    setCouponError('')
  }

  async function handlePlaceOrder(e) {
    e.preventDefault()
    setError('')

    if (!address.trim()) {
      setError('Please enter a delivery address')
      return
    }

    setPlacing(true)
    try {
      const items = cartItems.map(i => ({ product_id: i.id, quantity: i.qty }))
      await api.post('/orders', {
        items,
        address,
        coupon_code: couponApplied?.code || undefined,
      })
      clearCart()
      navigate('/orders', { state: { justOrdered: true } })
    } catch (err) {
      setError(err.response?.data?.error || 'Could not place order')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="page">
      <h1>Checkout</h1>

      <div className="checkout-grid">
        <form onSubmit={handlePlaceOrder} className="checkout-form">
          <h2>Delivery Address</h2>
          <textarea
            rows={4}
            placeholder="Street, city, state, zip..."
            value={address}
            onChange={e => setAddress(e.target.value)}
          />

          <h2>Coupon Code</h2>
          {couponApplied ? (
            <div className="coupon-applied">
              <span>
                <strong>{couponApplied.code}</strong> applied — {couponApplied.discount_percent}% off
              </span>
              <button type="button" className="btn btn-link btn-danger" onClick={handleRemoveCoupon}>
                Remove
              </button>
            </div>
          ) : (
            <div className="coupon-row">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleApplyCoupon}
                disabled={checkingCoupon}
              >
                {checkingCoupon ? 'Checking...' : 'Apply'}
              </button>
            </div>
          )}
          {couponError && <p className="error-text">{couponError}</p>}

          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary btn-block" disabled={placing}>
            {placing ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        <div className="checkout-summary">
          <h2>Order Summary</h2>
          {cartItems.map(item => (
            <div className="summary-row" key={item.id}>
              <span>{item.name} × {item.qty}</span>
              <span>${(item.qty * Number(item.price)).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="summary-row summary-discount">
              <span>Discount ({couponApplied.code})</span>
              <span>−${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
