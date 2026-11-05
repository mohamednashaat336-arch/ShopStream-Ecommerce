import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from '../../components/navbar/navbar'
import { SocialAuthButtons } from '../../components/auth/SocialAuthButtons'
import { FaAt, FaEnvelope, FaLock, FaShieldAlt, FaUser } from 'react-icons/fa'
import { useAuth } from '../../hooks/useAuth'
import './auth.css'

export function RegisterPage() {
  const { user, ready, register } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={['admin', 'moderator'].includes(user.role) ? '/admin/inventory' : '/profile'} replace />

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (form.password.length < 8) { setError('Use a password with at least 8 characters.'); return }
    if (form.password !== form.confirmPassword) { setError('The passwords do not match.'); return }
    setBusy(true)
    try {
      await register({ name: form.name, email: form.email, username: form.username, password: form.password })
      navigate(location.state?.from?.pathname || '/profile', { replace: true })
    } catch (registerError) {
      setError(registerError.message || 'We could not create your account.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="auth-shell">
    <Navbar />
    <main className="auth-page">
      <section className="auth-card auth-register-card">
        <Link to="/" className="auth-back">Back to ShopStream</Link>
        <p className="auth-eyebrow">SHOPSTREAM ACCOUNT</p>
        <h1>Create your account</h1>
        <p className="auth-intro">Sign up to save your profile, checkout, and view your orders.</p>
        <form className="auth-form" onSubmit={submit}>
          <label className="auth-field-wide">Full name<span className="auth-input-wrap"><FaUser aria-hidden="true" /><input name="name" autoComplete="name" value={form.name} onChange={updateField} required minLength={2} /></span></label>
          <label>Username<span className="auth-input-wrap"><FaAt aria-hidden="true" /><input name="username" autoComplete="username" value={form.username} onChange={updateField} required minLength={3} /></span></label>
          <label>Email address<span className="auth-input-wrap"><FaEnvelope aria-hidden="true" /><input name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} required /></span></label>
          <label className="auth-field-wide">Password<span className="auth-input-wrap"><FaLock aria-hidden="true" /><input name="password" type="password" autoComplete="new-password" value={form.password} onChange={updateField} required minLength={8} /></span></label>
          <label className="auth-field-wide">Confirm password<span className="auth-input-wrap"><FaShieldAlt aria-hidden="true" /><input name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={updateField} required minLength={8} /></span></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={busy || !ready}>{busy ? 'Creating account...' : 'Create account'}</button>
        </form>
        <SocialAuthButtons action="register" />
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        <aside className="auth-demo-note"><strong>About registration</strong><small>DummyJSON provides sample-account login but does not persist new registrations. ShopStream saves this account in this browser only. Passwords are stored as salted hashes and are never sent to DummyJSON.</small></aside>
      </section>
    </main>
  </div>
}
