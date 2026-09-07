import { useEffect, useState } from 'react'
import api from '../../api'

const EMPTY = { code: '', discount_percent: '', expires_at: '' }

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function loadCoupons() {
    setLoading(true)
    api.get('/coupons').then(res => setCoupons(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { loadCoupons() }, [])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.code || !form.discount_percent) {
      setError('Code and discount percent are required')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/coupons', {
        ...form,
        discount_percent: parseInt(form.discount_percent, 10),
        expires_at: form.expires_at || null,
      })
      setForm(EMPTY)
      loadCoupons()
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create coupon')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(id) {
    await api.put(`/coupons/${id}/toggle`)
    loadCoupons()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this coupon?')) return
    await api.delete(`/coupons/${id}`)
    loadCoupons()
  }

  return (
    <div className="page">
      <h1>Manage Coupons</h1>

      <form className="product-form" onSubmit={handleSubmit}>
        <h2>New Coupon</h2>
        <div className="form-row">
          <div>
            <label>Code</label>
            <input name="code" value={form.code} onChange={handleChange} placeholder="e.g. SAVE15" />
          </div>
          <div>
            <label>Discount %</label>
            <input type="number" min="1" max="100" name="discount_percent" value={form.discount_percent} onChange={handleChange} />
          </div>
        </div>
        <label>Expires On (optional)</label>
        <input type="date" name="expires_at" value={form.expires_at} onChange={handleChange} />
        {error && <p className="error-text">{error}</p>}
        <div className="form-actions">
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Coupon'}
          </button>
        </div>
      </form>

      <h2>Existing Coupons</h2>
      {loading ? (
        <p>Loading...</p>
      ) : coupons.length === 0 ? (
        <p>No coupons yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Code</th><th>Discount</th><th>Expires</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id}>
                <td><strong>{c.code}</strong></td>
                <td>{c.discount_percent}%</td>
                <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</td>
                <td>
                  <span className={`badge ${c.active ? 'badge-active' : 'badge-out'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="admin-table-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => handleToggle(c.id)}>
                    {c.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
