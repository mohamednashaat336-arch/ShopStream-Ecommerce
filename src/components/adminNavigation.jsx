import { Link, NavLink } from 'react-router-dom'
import { FaBoxOpen, FaUsers, FaClipboardList } from 'react-icons/fa'
import { useAuth } from '../hooks/useAuth'
import './adminNavigation.css'

const links = [
  { to: '/admin/inventory', label: 'Inventory', icon: FaBoxOpen },
  { to: '/admin/orders', label: 'Orders', icon: FaClipboardList },
  { to: '/admin/customers', label: 'Customers', icon: FaUsers },
]

export function AdminNavigation({ linksToShow }) {
  const { user } = useAuth()
  const visibleLinks = links.filter((link) => (!linksToShow || linksToShow.includes(link.to)) && (link.to !== '/admin/customers' || user?.role === 'admin'))
  return <aside className="admin-sidebar">
    <Link to="/" className="admin-sidebar-brand"><strong>ShopStream</strong><span>ADMIN PANEL</span></Link>
    <nav className="admin-navigation" aria-label="Admin sections">
      {visibleLinks.map(({ icon: Icon, ...link }) => <NavLink key={link.to} to={link.to} end={link.end}><Icon aria-hidden="true" /><span>{link.label}</span></NavLink>)}
    </nav>
    <Link className="admin-sidebar-user" to="/profile" aria-label="Open administrator profile">
      {user?.image ? <img src={user.image} alt="" /> : <span className="admin-sidebar-avatar">{user?.name?.charAt(0) || 'A'}</span>}
      <div><strong>{user?.name || 'Administrator'}</strong><span>Administrator</span></div>
    </Link>
  </aside>
}
