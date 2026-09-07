import { useEffect, useState } from 'react'
import api from '../../api'
import ProductImage from '../../components/ProductImage'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(() => setError('Could not load sales summary'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><p>Loading dashboard...</p></div>
  if (error) return <div className="page"><p className="error-text">{error}</p></div>

  return (
    <div className="page">
      <h1>Sales Summary</h1>

      <div className="stat-grid">
        <div className="stat-card stat-card-revenue">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">${stats.total_revenue.toFixed(2)}</div>
        </div>
        <div className="stat-card stat-card-orders">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.total_orders}</div>
        </div>
        <div className="stat-card stat-card-lowstock">
          <div className="stat-label">Low Stock Products</div>
          <div className="stat-value">{stats.low_stock_count}</div>
        </div>
      </div>

      <h2>Top Selling Products</h2>
      {stats.top_products.length === 0 ? (
        <p>No sales yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Image</th><th>Product</th><th>Units Sold</th><th>Revenue</th></tr>
          </thead>
          <tbody>
            {stats.top_products.map(p => (
              <tr key={p.id}>
                <td><ProductImage src={p.image_url} alt={p.name} className="admin-table-img" /></td>
                <td>{p.name}</td>
                <td>{p.units_sold}</td>
                <td>${Number(p.revenue).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
