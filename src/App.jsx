
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { FeaturedProducts } from './components/home/featuredProducts/featuredProducts'
import { Hero } from './components/home/hero/hero'
import { StayAhead } from './components/home/stayAhead/stayAhead'
import { TopCategories } from './components/home/topCategories/topCategories'
import { Home } from './pages/home/home'
import { Navbar } from './components/navbar/navbar'
import { Products } from './pages/products/product'
import { Categories } from './pages/categories/categories'
import { ProductsDetails } from './components/product/productDetails'
import { Cart } from './pages/cart/cart'


function App() {
  

  return (
    <>
      {/* <Navbar /> */}
      <Routes >
        <Route path='/' element={ <Home /> } />
        <Route path='/products' element={ <Products/> } />
        <Route path='/categories' element={ <Categories /> } />
        <Route path='/products/:id' element={ <ProductsDetails /> } />
        <Route path='/cart' element={<Cart />} />

      </Routes>
      
      
      
    
    </>
  )
}

export default App
