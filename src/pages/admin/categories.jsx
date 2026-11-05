import { useEffect, useMemo, useState } from 'react'
import { AdminNavigation } from '../../components/adminNavigation'
import { useProducts } from '../../hooks/useProducts'
import { addAdminCategory, deleteAdminCategory, getAdminCategories } from '../../services/adminCategories'
import { fetchProductCategories } from '../../services/products'
import './admin.css'

export function AdminCategoriesPage() {
  const [apiCategories, setApiCategories] = useState([])
  const [localCategories, setLocalCategories] = useState(getAdminCategories)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { products } = useProducts()

  useEffect(() => {
    const controller = new AbortController()
    fetchProductCategories(controller.signal)
      .then(setApiCategories)
      .catch((loadError) => { if (loadError.name !== 'AbortError') setError('DummyJSON categories could not be loaded.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])

  const rows = useMemo(() => {
    const mappedApi = apiCategories.map((slug) => ({ slug, name: slug.split('-').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' '), source: 'DummyJSON' }))
    return [...mappedApi, ...localCategories.map((category) => ({ ...category, source: 'Local' }))]
  }, [apiCategories, localCategories])

  const submit = (event) => {
    event.preventDefault()
    try {
      const category = addAdminCategory(name)
      setLocalCategories((current) => [...current, category])
      setName('')
      setError('')
    } catch (submitError) { setError(submitError.message) }
  }

  const remove = (slug) => {
    deleteAdminCategory(slug)
    setLocalCategories(getAdminCategories())
  }

  return <>
    <main className="admin-page">
      <header className="admin-heading"><div><p>SHOPSTREAM ADMIN</p><h1>Categories</h1><span>Browse DummyJSON categories and manage local catalog labels.</span></div></header>
      <AdminNavigation />
      <section className="admin-add-section">
        <div className="admin-section-heading"><div><h2>Add category</h2><p>Local categories can be assigned when creating or editing products.</p></div></div>
        <form className="admin-category-form" onSubmit={submit}>
          <label>Category name<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={60} placeholder="e.g. Home Office" /></label>
          <button type="submit">Add category</button>
          {error && <p className="admin-form-error" role="alert">{error}</p>}
        </form>
      </section>
      <section className="admin-catalog-section">
        <div className="admin-section-heading"><div><h2>Category directory</h2><p>{rows.length} categories</p></div></div>
        {loading && <p className="admin-loading" role="status">Loading DummyJSON categories...</p>}
        <div className="admin-category-grid">{rows.map((category) => {
          const count = products.filter((product) => String(product.category || '').toLowerCase() === category.slug.toLowerCase()).length
          return <article className="admin-category-card" key={`${category.source}-${category.slug}`}>
            <div><strong>{category.name}</strong><span>{category.source} · {count} products</span></div>
            {category.source === 'Local' && <button className="admin-delete-button" type="button" onClick={() => remove(category.slug)} disabled={count > 0} title={count > 0 ? 'Reassign products before removing this category.' : ''}>Remove</button>}
          </article>
        })}</div>
        {!loading && rows.length === 0 && <p className="admin-empty-state">No categories are available.</p>}
      </section>
    </main>
  </>
}
