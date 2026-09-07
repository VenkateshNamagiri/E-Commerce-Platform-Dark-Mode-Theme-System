import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import ProductImage from '../components/ProductImage'

export default function Cart() {
  const { cartItems, updateQty, removeFromCart, cartTotal } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  function handleCheckout() {
    if (!user) {
      navigate('/login')
      return
    }
    navigate('/checkout')
  }

  if (cartItems.length === 0) {
    return (
      <div className="page">
        <h1>Your Cart</h1>
        <p>Your cart is empty. <Link to="/">Browse products</Link></p>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Your Cart</h1>

      <div className="cart-list">
        {cartItems.map(item => (
          <div className="cart-row" key={item.id}>
            <ProductImage src={item.image_url} alt={item.name} className="cart-row-img" />
            <div className="cart-row-info">
              <div className="cart-row-name">{item.name}</div>
              <div className="cart-row-price">${Number(item.price).toFixed(2)} each</div>
            </div>

            <div className="qty-selector">
              <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
              <span>{item.qty}</span>
              <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
            </div>

            <div className="cart-row-subtotal">
              ${(item.qty * Number(item.price)).toFixed(2)}
            </div>

            <button className="btn btn-link btn-danger" onClick={() => removeFromCart(item.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-total">Total: ${cartTotal.toFixed(2)}</div>
        <button className="btn btn-primary" onClick={handleCheckout}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  )
}
