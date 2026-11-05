import { useEffect, useMemo, useState } from 'react'
import { FaDownload, FaEdit, FaExclamationTriangle, FaFilter, FaPlus, FaSearch, FaShoppingBag, FaTrash, FaUsers } from 'react-icons/fa'
import { AdminNavigation } from '../../components/adminNavigation'
import { useProducts } from '../../hooks/useProducts'
import { getInventoryStock, getOrders, setInventoryStock } from '../../services/commerce'
import { addAdminProduct, deleteManagedProduct, updateManagedProduct } from '../../services/products'
import { fetchCustomers } from '../../services/customers'
import { AddProductModal } from '../../components/AddProductModal'
import { DeleteProductDialog } from '../../components/DeleteProductDialog'
import { EditProductModal } from './admin'
import './admin.css'

export function InventoryPage() {
  const { products, loading, error, retry } = useProducts()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [customerCount, setCustomerCount] = useState(0)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [addProductOpen, setAddProductOpen] = useState(false)
  const pageSize = 4

  useEffect(() => {
    const controller = new AbortController()
    fetchCustomers(controller.signal, { page: 1, limit: 1 })
      .then((result) => setCustomerCount(result.total))
      .catch(() => setCustomerCount(0))
    return () => controller.abort()
  }, [])

  const categories = useMemo(() => [...new Set(products.map((product) => product.category).filter(Boolean))].sort(), [products])
  const lowStockCount = products.filter((product) => { const stock = getInventoryStock(product); return stock !== null && stock <= 5 }).length
  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesSearch = `${product.name} ${product.category || ''} ${product.sku || ''}`.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !categoryFilter || product.category === categoryFilter
    const stock = getInventoryStock(product)
    const matchesStock = stockFilter === 'all' || (stockFilter === 'low' && stock !== null && stock > 0 && stock <= 5) || (stockFilter === 'out' && stock === 0) || (stockFilter === 'in' && stock !== null && stock > 5) || (stockFilter === 'untracked' && stock === null)
    return matchesSearch && matchesCategory && matchesStock
  }), [products, search, categoryFilter, stockFilter])
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const visibleProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize)
  const paginationPages = pageCount <= 4 ? Array.from({ length: pageCount }, (_, index) => index + 1)
    : page <= 2 ? [1, 2, 3, 'ellipsis', pageCount]
      : page >= pageCount - 1 ? [1, 'ellipsis', pageCount - 2, pageCount - 1, pageCount]
        : [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis-end', pageCount]
  const sales = getOrders().filter((order) => order.status !== 'Cancelled').reduce((sum, order) => sum + Number(order.total || 0), 0)

  const exportCsv = () => {
    const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const rows = [['Product', 'SKU', 'Category', 'Price', 'Stock'], ...filteredProducts.map((product) => [product.name, product.sku || product.id, product.category, product.price, getInventoryStock(product)])]
    const csv = rows.map((row) => row.map(escape).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'shopstream-inventory.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const saveProduct = (updates) => {
    updateManagedProduct({ ...editingProduct, ...updates })
    setInventoryStock(editingProduct, Number(updates.stock))
    setEditingProduct(null)
  }

  const confirmDelete = () => {
    try {
      const deleted = deleteManagedProduct(deleteTarget)
      if (!deleted) {
        setDeleteError('This original design product is protected from deletion.')
        return
      }
      setDeleteTarget(null)
      setDeleteError('')
    } catch {
      setDeleteError('The product could not be deleted. Please try again.')
    }
  }

  const createProduct = (product) => addAdminProduct(product)

  return <>
    <main className="admin-page">
      <header className="inventory-page-heading"><div><p>SHOPSTREAM ADMIN</p><h1>Product Inventory</h1><span>Manage your catalog, stock levels, and pricing.</span></div><button className="inventory-add-button" type="button" onClick={() => setAddProductOpen(true)}><FaPlus /> Add New Product</button></header>
      <AdminNavigation />
      {loading && <p className="admin-loading" role="status">Loading catalog stock...</p>}
      {error && <div className="admin-api-error" role="alert"><span>{error}</span><button type="button" onClick={retry}>Retry</button></div>}
      <div className="inventory-toolbar"><label className="inventory-search"><FaSearch aria-hidden="true" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search products by name, SKU, or category..." /></label><div className="inventory-toolbar-actions"><div className="inventory-filter-wrap"><button type="button" className="inventory-tool-button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}><FaFilter /> Filters</button>{filtersOpen && <div className="inventory-filter-popover"><label>Category<select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setPage(1) }}><option value="">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Stock status<select value={stockFilter} onChange={(event) => { setStockFilter(event.target.value); setPage(1) }}><option value="all">All stock</option><option value="in">In stock</option><option value="low">Low stock</option><option value="out">Out of stock</option><option value="untracked">Not tracked</option></select></label></div>}</div><button type="button" className="inventory-tool-button" onClick={exportCsv}><FaDownload /> Export CSV</button></div></div>
      <section className="inventory-table-wrap" aria-label="Inventory products">
        <table className="inventory-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock Status</th><th>Actions</th></tr></thead><tbody>
        {visibleProducts.map((product) => {
          const key = `${product.source}-${product.id}`
          const stock = getInventoryStock(product)
          const status = product.visible === false ? 'Hidden from Store' : stock === null ? 'Not tracked' : stock === 0 ? 'Out of Stock' : stock <= 5 ? `Only ${stock} Left` : `${stock} In Stock`
          return <tr key={key}>
            <td><div className="inventory-table-product"><img src={product.image} alt="" loading="lazy" /><div><strong>{product.name}</strong><small>SKU: {product.sku || product.id}</small></div></div></td>
            <td><span className={`inventory-category-tag inventory-category-${Math.abs(String(product.category || 'other').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 4}`}>{product.category || 'Uncategorized'}</span></td>
            <td className="inventory-table-price">${Number(product.price).toFixed(2)}</td>
            <td><span className={`inventory-stock-status ${product.visible === false ? 'stock-hidden' : stock === null ? 'stock-untracked' : stock === 0 ? 'stock-out' : stock <= 5 ? 'stock-low' : 'stock-ok'}`}><i />{status}</span></td>
            <td><div className="inventory-row-actions"><button type="button" title="Edit product" aria-label={`Edit ${product.name}`} onClick={() => setEditingProduct(product)}><FaEdit /></button>{product.source === 'local' ? <button type="button" disabled title="Original design product is protected from deletion" aria-label={`${product.name} is protected from deletion`}><FaTrash /></button> : <button type="button" className="inventory-delete-action" title="Remove product" aria-label={`Remove ${product.name}`} onClick={() => setDeleteTarget(product)}><FaTrash /></button>}</div></td>
          </tr>
        })}
        </tbody></table>
        {!loading && filteredProducts.length === 0 && <p className="admin-empty-state">No products match these filters.</p>}
        <div className="inventory-table-footer"><span>Showing {filteredProducts.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredProducts.length)} of {filteredProducts.length} products</span><div className="inventory-pagination"><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} aria-label="Previous page">‹</button>{paginationPages.map((pageNumber, index) => pageNumber.toString().startsWith('ellipsis') ? <span key={`${pageNumber}-${index}`}>…</span> : <button key={pageNumber} type="button" className={page === pageNumber ? 'active' : ''} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}<button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page >= pageCount} aria-label="Next page">›</button></div></div>
      </section>
      <section className="inventory-summary" aria-label="Inventory summary"><article className="summary-sales"><span><FaShoppingBag /> SALES TOTAL</span><strong>${sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><small>From orders placed in this browser</small></article><article className="summary-customers"><span><FaUsers /> CUSTOMER RECORDS</span><strong>{customerCount.toLocaleString('en-US')}</strong><small>DummyJSON and local account records</small></article><article className="summary-alerts"><span><FaExclamationTriangle /> LOW STOCK ALERTS</span><strong>{lowStockCount}</strong><small>Products with 5 units or fewer</small></article></section>
    </main>
    {addProductOpen && <AddProductModal categories={categories} onClose={() => setAddProductOpen(false)} onCreate={createProduct} />}
    {editingProduct && <EditProductModal key={`${editingProduct.source}-${editingProduct.id}`} product={{ ...editingProduct, stock: getInventoryStock(editingProduct) ?? 0 }} categories={categories} onClose={() => setEditingProduct(null)} onSave={saveProduct} onDuplicate={(product) => { addAdminProduct(product); setEditingProduct(null) }} />}
    {deleteTarget && <DeleteProductDialog product={deleteTarget} error={deleteError} onCancel={() => { setDeleteTarget(null); setDeleteError('') }} onConfirm={confirmDelete} />}
  </>
}
