
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { Footer } from './components/footer/footer'
import { Home } from './pages/home/home'
import { Products } from './pages/products/product'
import { Categories } from './pages/categories/categories'
import { ProductsDetails } from './components/product/productDetails'
import { Cart } from './pages/cart/cart'
import { CartProvider } from './context/cartContext'
import { AuthProvider } from './context/authContext'
import { RequireAuth } from './components/auth/RequireAuth'
import { LoginPage } from './pages/auth/login'
import { RegisterPage } from './pages/auth/register'
import { ProfilePage } from './pages/profile/profile'
import { InventoryPage } from './pages/admin/inventory'
import { OrdersPage } from './pages/admin/ordersDashboard'
import { CustomersPage } from './pages/admin/customers'
import { AdminCategoriesPage } from './pages/admin/categories'
import { CheckoutPage } from './pages/checkout'
import { MyOrdersPage } from './pages/myOrders'


function App() {
  const { pathname } = useLocation()
  const adminShellClass = pathname.startsWith('/admin') ? ` app-shell-admin app-shell-admin-${pathname.split('/')[2] || 'overview'}` : ''

  return (
    <AuthProvider>
    <CartProvider>
      <div className={`app-shell${adminShellClass}`}>
      <div className="app-route-content">
      <Routes >
        <Route path='/' element={ <Home /> } />
        <Route path='/products' element={ <Products/> } />
        <Route path='/categories' element={ <Categories /> } />
        <Route path='/products/:id' element={ <ProductsDetails /> } />
        <Route path='/cart' element={<Cart />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/profile' element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path='/admin' element={<RequireAuth allowedRoles={['admin', 'moderator']}><Navigate to="/admin/inventory" replace /></RequireAuth>} />
        <Route path='/admin/categories' element={<RequireAuth allowedRoles={['admin', 'moderator']}><AdminCategoriesPage /></RequireAuth>} />
        <Route path='/admin/inventory' element={<RequireAuth allowedRoles={['admin', 'moderator']}><InventoryPage /></RequireAuth>} />
        <Route path='/admin/orders' element={<RequireAuth allowedRoles={['admin', 'moderator']}><OrdersPage /></RequireAuth>} />
        <Route path='/admin/customers' element={<RequireAuth adminOnly><CustomersPage /></RequireAuth>} />
        <Route path='/checkout' element={<RequireAuth><CheckoutPage /></RequireAuth>} />
        <Route path='/my-orders' element={<RequireAuth><MyOrdersPage /></RequireAuth>} />

      </Routes>
      </div>
      <Footer variant={pathname === '/' ? 'home' : 'compact'} />
      </div>
    </CartProvider>
    </AuthProvider>
  )
}

export default App
