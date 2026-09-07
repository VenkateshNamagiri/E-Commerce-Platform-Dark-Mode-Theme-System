import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(name, email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Register</h1>
        <input
          type="text" placeholder="Full Name" value={name}
          onChange={e => setName(e.target.value)} required
        />
        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} required
        />
        <input
          type="password" placeholder="Password (min 6 characters)" value={password}
          onChange={e => setPassword(e.target.value)} required
        />
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Register'}
        </button>
        <p>Already have an account? <Link to="/login">Login here</Link></p>
      </form>
    </div>
  )
}
