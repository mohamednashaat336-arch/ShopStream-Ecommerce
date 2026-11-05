import { useEffect } from 'react'
import { FaExclamationTriangle, FaTrash } from 'react-icons/fa'
import { getInventoryStock } from '../services/commerce'
import './deleteProductDialog.css'

export function DeleteProductDialog({ product, error = '', onCancel, onConfirm }) {
  const stock = getInventoryStock(product)
  const stockLabel = stock === null ? 'STOCK NOT TRACKED' : stock <= 0 ? 'OUT OF STOCK' : stock <= 5 ? `ONLY ${stock} LEFT` : 'IN STOCK'

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => { if (event.key === 'Escape') onCancel() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  return <div className="delete-product-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel() }}>
    <section className="delete-product-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title" aria-describedby="delete-product-warning">
      <span className="delete-product-handle" aria-hidden="true" />
      <div className="delete-product-warning-icon"><FaExclamationTriangle aria-hidden="true" /></div>
      <h2 id="delete-product-title">Delete Product?</h2>
      <p id="delete-product-warning">This action is permanent and cannot be undone. All data associated with this product will be removed from the store’s inventory.</p>
      <article className="delete-product-summary">
        <img src={product.image} alt="" />
        <div className="delete-product-summary-info"><small className={stock !== null && stock <= 5 ? 'delete-stock-low' : ''}>{stockLabel}</small><strong>{product.name}</strong><span>ID: {product.sku || product.id}</span></div>
        <b>${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
      </article>
      {error && <p className="delete-product-error" role="alert">{error}</p>}
      <div className="delete-product-actions"><button type="button" onClick={onCancel}>Cancel and Go Back</button><button type="button" onClick={onConfirm}><FaTrash /> Confirm Delete</button></div>
      <footer><span>Secure Action Required</span><small>© 2024 ShopStream Inc. Internal Admin Tool</small></footer>
    </section>
  </div>
}
