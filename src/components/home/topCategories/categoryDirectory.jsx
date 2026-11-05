import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProductCategories } from '../../../services/products'
import './categoryDirectory.css'

function prettyName(slug) {
  return slug.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export function CategoryDirectory() {
  const [state, setState] = useState({ categories: [], error: '', loading: true })

  useEffect(() => {
    const controller = new AbortController()
    fetchProductCategories(controller.signal)
      .then((categories) => setState({ categories, error: '', loading: false }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ categories: [], error: 'Categories could not be loaded.', loading: false })
      })
    return () => controller.abort()
  }, [])

  return <section className="api-category-directory">
    <div className="api-category-heading"><h2>Shop by category</h2><p>Browse products by category.</p></div>
    {state.loading && <p role="status">Loading categories...</p>}
    {state.error && <p role="alert">{state.error}</p>}
    <div className="api-category-grid">{state.categories.map((category) => <Link key={category} to={`/products?category=${encodeURIComponent(category)}`}>
      <span>{prettyName(category)}</span><span aria-hidden="true">&rarr;</span>
    </Link>)}</div>
  </section>
}
