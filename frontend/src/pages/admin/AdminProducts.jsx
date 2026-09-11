import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api'
import ProductImage from '../../components/ProductImage'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function loadProducts() {
    setLoading(true)
    // the admin management table isn't paginated per this task's spec -
    // just ask for a high limit so it still sees everything at once
    api.get('/products', { params: { limit: 1000 } })
      .then(res => setProducts(res.data.products))
      .catch(() => setError('Could not load products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadProducts() }, [])

  async function handleDelete(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return
    try {
      await api.delete(`/products/${id}`)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete product')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Manage Products</h1>
        <Link to="/admin/products/add" className="btn btn-primary">+ Add New Product</Link>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th><th>Name</th><th>Category</th>
              <th>Price</th><th>Stock</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td><ProductImage src={p.image_url} alt={p.name} className="admin-table-img" /></td>
                <td>{p.name}</td>
                <td>{p.category_name || '—'}</td>
                <td>${Number(p.price).toFixed(2)}</td>
                <td>
                  {p.stock === 0 ? (
                    <span className="badge badge-out">0</span>
                  ) : p.stock < 5 ? (
                    <span className="badge badge-low-stock">{p.stock} — Low</span>
                  ) : (
                    p.stock
                  )}
                </td>
                <td className="admin-table-actions">
                  <Link to={`/admin/products/edit/${p.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
