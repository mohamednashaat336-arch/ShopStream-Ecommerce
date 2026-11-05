import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AdminModal } from '../../components/AdminModal'
import { FaClone, FaPlus } from 'react-icons/fa'
import './admin.css'

export function AdminPage() {
  return <Navigate to="/admin/inventory" replace />
}

export function EditProductModal({ product, categories, onClose, onSave, onDuplicate }) {
  const [form, setForm] = useState({
    name: product.name || '', sku: product.sku || '', category: product.category || '',
    price: String(product.price ?? ''), stock: String(product.stock ?? 0), image: product.image || '',
    images: product.images?.length ? product.images : [product.image].filter(Boolean),
    description: product.description || '', visible: product.visible !== false,
  })
  const [extraImage, setExtraImage] = useState('')
  const [error, setError] = useState('')
  const update = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }
  const values = () => ({ ...form, name: form.name.trim(), sku: form.sku.trim(), category: form.category.trim(), price: Number(form.price), stock: Number(form.stock), image: form.image.trim(), images: [...new Set([form.image.trim(), ...(form.images || [])].filter(Boolean))], description: form.description.trim() })
  const addImage = () => {
    const image = extraImage.trim()
    if (!image) return
    try { new URL(image) } catch { setError('Enter a valid image URL.'); return }
    setForm((current) => ({ ...current, images: [...new Set([...(current.images || []), image])] }))
    setExtraImage('')
    setError('')
  }
  const setPrimaryImage = (image) => setForm((current) => ({ ...current, image, images: [image, ...(current.images || []).filter((item) => item !== image)] }))
  const removeImage = (image) => setForm((current) => {
    const images = (current.images || []).filter((item) => item !== image)
    return { ...current, images, image: current.image === image ? images[0] || '' : current.image }
  })
  const submit = (event) => {
    event.preventDefault()
    if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0 || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      setError('Enter a valid price and a whole number for stock.')
      return
    }
    onSave(values())
  }
  const duplicate = () => {
    if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0 || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      setError('Enter a valid price and a whole number for stock.')
      return
    }
    onDuplicate(values())
  }

  return <AdminModal title="Edit Product" subtitle={`Update details for ${product.name}`} className="admin-modal-product" onClose={onClose} footer={<><button className="admin-modal-button" type="button" onClick={onClose}>Discard</button><button className="admin-modal-button" type="button" onClick={duplicate}><FaClone /> Duplicate</button><button className="admin-modal-button admin-modal-button-primary" type="submit" form="admin-edit-product-form">Save Changes</button></>}>
    <form id="admin-edit-product-form" className="admin-product-modal-layout" onSubmit={submit}>
      <div className="admin-product-modal-images">
        <div className="admin-product-image-preview">{form.image ? <img src={form.image} alt={`${form.name} preview`} /> : <span>No product image</span>}</div>
        <label className="admin-product-image-url">Product image URL<input name="image" type="url" value={form.image} onChange={(event) => { update(event); setForm((current) => ({ ...current, images: [event.target.value, ...(current.images || []).slice(1)] })) }} required /></label>
        <div className="admin-product-image-thumbnails">{(form.images || []).map((image, index) => <div className="admin-product-image-thumb" key={`${image}-${index}`}><button type="button" onClick={() => setPrimaryImage(image)} aria-label={`Set image ${index + 1} as primary`}><img src={image} alt="" /></button><button type="button" onClick={() => removeImage(image)} aria-label={`Remove image ${index + 1}`}>×</button></div>)}<label className="admin-add-image"><FaPlus /><span>Add image</span><input type="url" value={extraImage} onChange={(event) => setExtraImage(event.target.value)} onBlur={addImage} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addImage() } }} aria-label="Additional image URL" /></label></div>
        <div className="admin-product-status"><span><strong>Product Status</strong><br />{product.source === 'local' ? 'Original design product · always visible' : form.visible ? 'Visible on storefront' : 'Hidden from storefront'}</span><label className="admin-switch"><input name="visible" type="checkbox" checked={product.source === 'local' || form.visible} onChange={update} disabled={product.source === 'local'} aria-label="Visible on storefront" /><span /></label></div>
      </div>
      <div className="admin-product-modal-fields">
        <div className="admin-modal-form">
          <label className="modal-field-wide">Product Name<input name="name" value={form.name} onChange={update} required maxLength={100} /></label>
          <label>SKU<input name="sku" value={form.sku} onChange={update} /></label>
          <label>Category<select name="category" value={form.category} onChange={update}><option value="">Select category</option>{[...new Set([...categories, form.category].filter(Boolean))].map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
          <label>Price (USD)<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={update} required /></label>
          <label>Current Stock<input name="stock" type="number" min="0" step="1" value={form.stock} onChange={update} required /></label>
          <label className="modal-field-description">Description<textarea name="description" value={form.description} onChange={update} rows="4" maxLength={600} /></label>
          <div className="admin-product-modal-notice modal-field-wide">Changes are saved in this browser and reflected in the catalog. DummyJSON sample records are not changed on the server.</div>
          {error && <p className="admin-modal-error" role="alert">{error}</p>}
        </div>
      </div>
    </form>
  </AdminModal>
}
