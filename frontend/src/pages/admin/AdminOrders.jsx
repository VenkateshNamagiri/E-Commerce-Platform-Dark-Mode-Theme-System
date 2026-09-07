import { useEffect, useState } from 'react'
import api from '../../api'

const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    api.get('/orders').then(res => setOrders(res.data)).finally(() => setLoading(false))
  }, [])

  async function handleStatusChange(orderId, status) {
    setUpdatingId(orderId)
    try {
      await api.put(`/orders/${orderId}/status`, { status })
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)))
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update status')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="page">
      <h1>All Orders</h1>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th><th>Customer</th><th>Date</th>
              <th>Items</th><th>Total</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customer_name}<br /><small>{order.customer_email}</small></td>
                <td>{new Date(order.ordered_at).toLocaleDateString()}</td>
                <td>
                  {order.items.map(item => (
                    <div key={item.id}>{item.product_name} × {item.quantity}</div>
                  ))}
                </td>
                <td>${Number(order.total_amount).toFixed(2)}</td>
                <td>
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    className={`status-select status-${order.status.toLowerCase()}`}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
