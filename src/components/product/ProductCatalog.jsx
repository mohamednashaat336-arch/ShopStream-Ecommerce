import { useEffect, useState } from 'react'
import { Fragment } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchProductCategories } from '../../services/products'
import { useProductCatalog } from '../../hooks/useProductCatalog'
import { ProductCard } from './productCard'
import './allProducts.css'

const PRODUCTS_PER_PAGE = 6

function labelForCategory(value) {
  return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

export function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const category = searchParams.get('category') || ''
  const sortValue = searchParams.get('sort') || 'id:desc'
  const [categoryResult, setCategoryResult] = useState({ categories: [], error: '' })
  const [categoryRequest, setCategoryRequest] = useState(0)
  const [sortBy, order] = sortValue.split(':')
  const { products, total, loading, error, retry } = useProductCatalog({ page, search, category, sortBy, order })
  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE))
  const pageNumbers = totalPages <= 7
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : [...new Set([1, page - 1, page, page + 1, totalPages].filter((value) => value >= 1 && value <= totalPages))].sort((a, b) => a - b)

  useEffect(() => {
    const controller = new AbortController()
    fetchProductCategories(controller.signal)
      .then((categories) => setCategoryResult({ categories, error: '' }))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setCategoryResult({ categories: [], error: 'Categories could not be loaded.' })
      })
    return () => controller.abort()
  }, [categoryRequest])

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('page', String(nextPage))
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const changeCategory = (value) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set('category', value)
      else next.delete('category')
      next.delete('page')
      return next
    })
  }

  const clearFilters = () => {
    setCategory('')
    setPage(1)
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('search')
      next.delete('category')
      next.delete('page')
      return next
    })
  }

  return <div className="products-page">
    <aside className="filters-sidebar">
      <div className="filter-group">
        <h4>CATEGORY</h4>
        <label><input type="checkbox" checked={!category} onChange={() => changeCategory('')} /> All categories</label>
        {categoryResult.categories.map((item) => <label key={item}>
          <input type="checkbox" checked={category === item} onChange={() => changeCategory(category === item ? '' : item)} />
          {labelForCategory(item)}
        </label>)}
        {categoryResult.error && <button className="filter-retry" type="button" onClick={() => setCategoryRequest((value) => value + 1)}>{categoryResult.error} Retry</button>}
      </div>
      <div className="filter-group">
        <h4>PRICE RANGE</h4>
        <div className="price-range"><span>$0</span><span>$1,000+</span></div>
      </div>
      <div className="filter-group"><h4>RATING</h4><div>★★★★☆ &amp; Up</div></div>
      <div className="filter-group"><h4>BRAND</h4><select aria-label="Brand" disabled><option>All Brands</option></select></div>
      <button className="clear-filters" type="button" onClick={clearFilters}>Clear Filters</button>
    </aside>

    <main className="products-main">
      <div className="products-header">
        <h2>{search ? `Search results for “${search}”` : 'All Products'}</h2>
        <span className="results-count">{total ? `Showing ${(page - 1) * PRODUCTS_PER_PAGE + 1}-${Math.min(page * PRODUCTS_PER_PAGE, total)} of ${total} results` : 'Products'}</span>
        <div className="sort-by"><label htmlFor="sort-products">Sort by:</label><select id="sort-products" value={sortValue} onChange={(event) => setSearchParams((current) => {
          const next = new URLSearchParams(current)
          next.set('sort', event.target.value)
          next.delete('page')
          return next
        })}>
          <option value="id:desc">Newest Arrivals</option><option value="price:asc">Price: Low to High</option><option value="price:desc">Price: High to Low</option><option value="rating:desc">Top Rated</option><option value="title:asc">Name: A to Z</option>
        </select></div>
      </div>
      {loading && <p role="status" className="products-loading">Loading products...</p>}
      {error && <div className="products-error" role="alert"><p>{error}</p><button type="button" onClick={retry}>Try again</button></div>}
      {!loading && products.length === 0 && !error && <p>No products match the current filters.</p>}
      {products.length > 0 && <div className="products-grid">{products.map((product) => <ProductCard key={`${product.source}-${product.id}`} product={product} />)}</div>}
      {totalPages > 1 && <nav className="pagination" aria-label="Product pages">
        <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1} aria-label="Previous page">&lsaquo;</button>
        {pageNumbers.map((number, index) => <Fragment key={number}>
          {index > 0 && number - pageNumbers[index - 1] > 1 && <span className="pagination-ellipsis" aria-hidden="true">...</span>}
          <button type="button" className={number === page ? 'active' : ''} aria-current={number === page ? 'page' : undefined} onClick={() => goToPage(number)}>{number}</button>
        </Fragment>)}
        <button type="button" onClick={() => goToPage(page + 1)} disabled={page === totalPages} aria-label="Next page">&rsaquo;</button>
      </nav>}
    </main>
  </div>
}
