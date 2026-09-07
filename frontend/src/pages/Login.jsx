import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'admin' ? '/admin/products' : '/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} required
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)} required
        />
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Login'}
        </button>
        <p>No account? <Link to="/register">Register here</Link></p>
        <p className="demo-hint">
          Demo admin: admin@example.com / admin123<br />
          Demo customer: customer@example.com / customer123
        </p>
      </form>
    </div>
  )
}
