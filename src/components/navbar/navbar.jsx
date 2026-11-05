import { Link } from 'react-router-dom'
import './navbar.css'
import { FaCartArrowDown, FaUser } from 'react-icons/fa'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export function Navbar(){
    const { itemCount } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const submitSearch = (event) => {
        event.preventDefault()
        const query = search.trim()
        navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products')
    }
    return(
        <>
            <div>
                <nav className="navbar navbar-expand-lg bg-body-tertiary">
                    <div className="container-fluid">
                        <Link to={'/'} className="navbar-brand me-5 ms-4 nav-logo">ShopStream</Link>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                            <Link to={'/'} className="nav-link active">Home</Link>
                            </li>
                            <li className="nav-item">
                            <Link to={'/products'} className="nav-link">Products</Link>
                            </li>
                            <li className="nav-item dropdown">
                            <Link to={'/categories'} className="nav-link">Categories</Link>
                            </li>
                        </ul>
                        <form className="d-flex" role="search" onSubmit={submitSearch}>
                            <input className="form-control me-2" type="search" placeholder="Search products..." aria-label="Search products" value={search} onChange={(event) => setSearch(event.target.value)}/>
                        </form>
                        <Link to={'/cart'} className="nav-link mx-4 cart-nav-link" aria-label={`Cart with ${itemCount} items`}>
                            <FaCartArrowDown/>{itemCount > 0 && <span className="cart-count">{itemCount}</span>}
                        </Link>
                        <Link to={user ? (['admin', 'moderator'].includes(user.role) ? '/admin/inventory' : '/profile') : '/login'} className="nav-link me-4 profile-nav-link" aria-label={user ? (['admin', 'moderator'].includes(user.role) ? 'Open inventory' : 'My profile') : 'Sign in'}>
                            <FaUser />{user && <span className="profile-nav-label">{user.name}</span>}
                        </Link>
                        </div>
                    </div>
                </nav>
            </div>
        </>
    )
}
