import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from '../../components/navbar/navbar'
import { SocialAuthButtons } from '../../components/auth/SocialAuthButtons'
import { FaEnvelope, FaLock } from 'react-icons/fa'
import { useAuth } from '../../hooks/useAuth'
import './auth.css'

export function LoginPage() {
  const { user, ready, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={['admin', 'moderator'].includes(user.role) ? '/admin/inventory' : '/profile'} replace />

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const signedInUser = await login(form.username, form.password)
      const target = location.state?.from?.pathname || (['admin', 'moderator'].includes(signedInUser.role) ? '/admin/inventory' : '/profile')
      navigate(target, { replace: true })
    } catch (submitError) {
      setError(submitError.message || 'We could not complete your request.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell">
      <Navbar />
      <main className="auth-page">
        <section className="auth-card">
          <Link to="/" className="auth-back">Back to ShopStream</Link>
          <p className="auth-eyebrow">SHOPSTREAM ACCOUNT</p>
          <h1>Welcome back</h1>
          <p className="auth-intro">Sign in to continue to your ShopStream account.</p>

          <form className="auth-form" onSubmit={submit}>
            <label>Username or registered email<span className="auth-input-wrap"><FaEnvelope aria-hidden="true" /><input name="username" autoComplete="username" value={form.username} onChange={updateField} required /></span></label>
            <label>Password<span className="auth-input-wrap"><FaLock aria-hidden="true" /><input name="password" type="password" autoComplete="current-password" value={form.password} onChange={updateField} required /></span></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={busy || !ready}>{busy ? 'Please wait...' : 'Sign in'}</button>
          </form>

          <SocialAuthButtons />

          <p className="auth-switch">New to ShopStream? <Link to="/register">Create an account</Link></p>

          <aside className="auth-demo-note">
            <strong>DummyJSON sample account</strong>
            <span>Username: emilys</span>
            <span>Password: emilyspass</span>
            <small>You can also sign in with an account registered in this browser. DummyJSON only provides sample-account login; it does not save new registrations.</small>
            <small>For DummyJSON sample accounts, enter the username shown above. Registered ShopStream accounts can use their username or email.</small>
          </aside>
        </section>
      </main>
    </div>
  )
}
