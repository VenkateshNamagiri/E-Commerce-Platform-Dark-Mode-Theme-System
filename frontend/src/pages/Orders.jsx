import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const justOrdered = location.state?.justOrdered

  useEffect(() => {
    api.get('/orders/my')
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <h1>My Orders</h1>
      {justOrdered && <p className="success-banner">Order placed successfully! 🎉</p>}

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="order-list">
          {orders.map(order => (
            <div className="order-card" key={order.id}>
              <div className="order-card-header">
                <div>
                  <strong>Order #{order.id}</strong>
                  <span className="order-date">
                    {new Date(order.ordered_at).toLocaleDateString()}
                  </span>
                </div>
                <span className={`badge status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-items">
                {order.items.map(item => (
                  <div className="order-item-row" key={item.id}>
                    <span>{item.product_name} × {item.quantity}</span>
                    <span>${(item.quantity * Number(item.unit_price)).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-card-total">
                {order.discount_amount > 0 && (
                  <div className="order-discount-note">
                    Coupon {order.coupon_code} applied: −${Number(order.discount_amount).toFixed(2)}
                  </div>
                )}
                Total: ${Number(order.total_amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
