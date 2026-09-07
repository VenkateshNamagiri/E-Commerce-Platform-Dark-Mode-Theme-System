import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api, { API_BASE_URL } from '../../api'

const EMPTY = {
  name: '', description: '', price: '', stock: '',
  category_id: '', image_url: '',
}

export default function ProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('') // inline status, same pattern as elsewhere in the app
  const [submitting, setSubmitting] = useState(false)

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null) // local blob preview of a newly selected file

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    api.get(`/products/${id}`).then(res => {
      const p = res.data
      setForm({
        name: p.name,
        description: p.description || '',
        price: p.price,
        stock: p.stock,
        category_id: p.category_id || '',
        image_url: p.image_url || '',
      })
    })
  }, [id, isEdit])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleFileChange(e) {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected)) // shows instantly, before any upload happens
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!form.name || form.price === '' || form.stock === '') {
      setError('Name, price and stock are required')
      return
    }

    setSubmitting(true)
    try {
      let image_url = form.image_url

      // if the admin picked a new file, upload it first and use the path it returns
      if (file) {
        setMessage('Uploading image...')
        const formData = new FormData()
        formData.append('image', file)

        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        image_url = uploadRes.data.image_url
      }

      const payload = {
        ...form,
        image_url,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        category_id: form.category_id || null,
      }

      if (isEdit) {
        await api.put(`/products/${id}`, payload)
      } else {
        await api.post('/products', payload)
      }

      setMessage(isEdit ? 'Product updated successfully!' : 'Product added successfully!')
      navigate('/admin/products')
    } catch (err) {
      setMessage('')
      setError(err.response?.data?.error || 'Upload failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // what to show in the preview box: a newly chosen file takes priority,
  // otherwise fall back to the product's already-uploaded image
  const previewSrc = preview || (form.image_url ? `${API_BASE_URL}${form.image_url}` : null)

  return (
    <div className="page">
      <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      <form className="product-form" onSubmit={handleSubmit}>
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Description</label>
        <textarea name="description" rows={3} value={form.description} onChange={handleChange} />

        <div className="form-row">
          <div>
            <label>Price ($)</label>
            <input type="number" step="0.01" min="0" name="price" value={form.price} onChange={handleChange} required />
          </div>
          <div>
            <label>Stock</label>
            <input type="number" min="0" name="stock" value={form.stock} onChange={handleChange} required />
          </div>
        </div>

        <label>Category</label>
        <select name="category_id" value={form.category_id} onChange={handleChange}>
          <option value="">-- Select category --</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label>Product Image</label>
        {previewSrc ? (
          <img src={previewSrc} alt="Preview" className="admin-form-preview" />
        ) : (
          <div className="admin-form-preview no-image-box">No image</div>
        )}
        <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
        <p className="form-hint">
          {isEdit ? 'Choose a new file only if you want to replace the current image.' : 'PNG, JPG or WEBP, up to 2 MB.'}
        </p>

        {message && <p className="form-hint">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/products')}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
