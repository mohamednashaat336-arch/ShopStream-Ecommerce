import { useMemo, useState } from 'react'
import './allProducts.css'
import { ProductCard } from './productCard'
import { useProducts } from '../../hooks/useProducts'

const PRODUCTS_PER_PAGE = 6

export function AllProducts() {
  const [currentPage, setCurrentPage] = useState(1)
  const { products, loading, error, retry } = useProducts()
  const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE))
  const pageProducts = useMemo(() => products.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE), [products, currentPage])

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="products-page">
      <aside className="filters-sidebar">
        <div className="filter-group">
          <h4>CATEGORY</h4>
          <label><input type="checkbox" /> Electronics</label>
          <label><input type="checkbox" defaultChecked /> Fashion</label>
          <label><input type="checkbox" /> Home &amp; Living</label>
          <label><input type="checkbox" /> Beauty</label>
        </div>
        <div className="filter-group"><h4>PRICE RANGE</h4><div className="price-range"><span>$0</span><span>$1,000+</span></div></div>
        <div className="filter-group"><h4>RATING</h4><div>★★★★☆ &amp; Up</div></div>
        <div className="filter-group"><h4>BRAND</h4><select aria-label="Brand"><option>All Brands</option></select></div>
        <button className="clear-filters" type="button">Clear Filters</button>
      </aside>
      <main className="products-main">
        <div className="products-header">
          <h2>All Products</h2>
          <span className="results-count">{products.length ? `Showing ${(currentPage - 1) * PRODUCTS_PER_PAGE + 1}-${Math.min(currentPage * PRODUCTS_PER_PAGE, products.length)} of ${products.length} results` : 'Products'}</span>
          <div className="sort-by"><label htmlFor="sort-products">Sort by:</label><select id="sort-products"><option>Newest Arrivals</option></select></div>
        </div>
        {loading && <p role="status" className="products-loading">Loading additional products...</p>}
        {error && <div className="products-error" role="alert"><p>{error}</p><button type="button" onClick={retry}>Try again</button></div>}
        {!loading && products.length === 0 && !error && <p>No products are available right now.</p>}
        {pageProducts.length > 0 && <div className="products-grid">{pageProducts.map((product) => <ProductCard key={`${product.source}-${product.id}`} product={product} />)}</div>}
        {totalPages > 1 && (
          <nav className="pagination" aria-label="Product pages">
            <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">‹</button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <button key={page} type="button" className={page === currentPage ? 'active' : ''} aria-current={page === currentPage ? 'page' : undefined} onClick={() => goToPage(page)}>{page}</button>)}
            <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page">›</button>
          </nav>
        )}
      </main>
    </div>
  )
}
