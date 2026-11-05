import { Link, Navigate } from 'react-router-dom'
import { FaUserCircle } from 'react-icons/fa'
import { Navbar } from '../../components/navbar/navbar'
import { useAuth } from '../../hooks/useAuth'
import './profile.css'

export function ProfilePage() {
  const { user, logout } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  return (
    <>
      <Navbar />
      <main className="profile-page">
        <section className="profile-card">
          <div className="profile-heading">
            <FaUserCircle aria-hidden="true" />
            <div><p>SHOPSTREAM ACCOUNT</p><h1>My Profile</h1></div>
          </div>
          <dl className="profile-details">
            <div><dt>Name</dt><dd>{user.name}</dd></div>
            <div><dt>Email</dt><dd>{user.email}</dd></div>
            <div><dt>Username</dt><dd>{user.username}</dd></div>
            <div><dt>Account type</dt><dd>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</dd></div>
          </dl>
          <div className="profile-actions">
            {['admin', 'moderator'].includes(user.role) && <Link to="/admin/inventory" className="profile-admin-link">Open Inventory</Link>}
            <Link to="/my-orders" className="profile-shop-link">My orders</Link>
            <Link to="/products" className="profile-shop-link">Continue shopping</Link>
            <button type="button" onClick={logout}>Sign out</button>
          </div>
        </section>
      </main>
    </>
  )
}
