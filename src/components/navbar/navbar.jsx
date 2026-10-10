import { Link } from 'react-router-dom'
import './navbar.css'
import { FaCartArrowDown, FaUser } from 'react-icons/fa'

export function Navbar(){
    return(
        <>
            <div>
                <nav class="navbar navbar-expand-lg bg-body-tertiary">
                    <div class="container-fluid">
                        <Link to={'/'} class="navbar-brand me-5 ms-4 nav-logo" href="">ShopStream</Link>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                            <Link to={'/'} class="nav-link active  " aria-current="page" href="">Home</Link>
                            </li>
                            <li class="nav-item">
                            <Link to={'/products'} class="nav-link" href="">Products</Link>
                            </li>
                            <li class="nav-item dropdown">
                            <Link to={'/categories'} class="nav-link " href="" >Categories</Link>
                            </li>
                        </ul>
                        <form class="d-flex" role="search">
                            <input class="form-control me-2" type="search" placeholder="Search products..." aria-label="Search"/>
                        </form>
                        <Link to={'/cart'} class="nav-link mx-4" href=""><FaCartArrowDown/></Link>
                        <Link to={'/products'} class="nav-link me-4" href=""><FaUser/></Link>
                        </div>
                    </div>
                </nav>
            </div>
        </>
    )
}