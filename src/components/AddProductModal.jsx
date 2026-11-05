import { useState } from 'react'
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa'
import { AdminModal } from './AdminModal'

const initialForm = { name: '', sku: '', category: '', price: '', stock: '0', description: '', images: [] }

export function AddProductModal({ categories = [], onClose, onCreate }) {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const addFiles = async (files) => {
    const imageFiles = [...files].filter((file) => file.type.startsWith('image/'))
    if (!imageFiles.length) return setError('Choose image files to upload.')
    if (imageFiles.some((file) => file.size > 600 * 1024)) return setError('Each image must be 600 KB or smaller for browser storage.')
    const toDataUrl = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('An image could not be read.'))
      reader.readAsDataURL(file)
    })
    try {
      const images = await Promise.all(imageFiles.slice(0, 4 - form.images.length).map(toDataUrl))
      setForm((current) => ({ ...current, images: [...current.images, ...images] }))
      setError('')
    } catch (readError) { setError(readError.message) }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!form.images.length) { setError('Add at least one product image.'); return }
    setBusy(true)
    setError('')
    try {
      await onCreate({
        name: form.name.trim(), sku: form.sku.trim(), category: form.category.trim(),
        price: Number(form.price), stock: Number(form.stock), description: form.description.trim(),
        image: form.images[0], images: form.images, visible: true,
      })
      onClose()
    } catch (createError) {
      setError(createError.message || 'Product could not be saved in this browser.')
    } finally { setBusy(false) }
  }

  return <AdminModal title="Add New Product" subtitle="Manage your catalog, stock levels, and pricing." className="admin-modal-product admin-modal-add-product" onClose={onClose} footer={<><button className="admin-modal-button" type="button" onClick={onClose} disabled={busy}>Cancel</button><button className="admin-modal-button admin-modal-button-primary" type="submit" form="admin-add-product-form" disabled={busy}>{busy ? 'Creating…' : 'Create Product'}</button></>}>
    <form id="admin-add-product-form" className="admin-modal-form admin-add-product-form" onSubmit={submit}>
      <label>Product Name<input name="name" value={form.name} onChange={update} placeholder="e.g. SonicWave Pro 2" required maxLength={100} /></label>
      <label>SKU<input name="sku" value={form.sku} onChange={update} placeholder="SKU-000-XX" required maxLength={40} /></label>
      <label>Category<select name="category" value={form.category} onChange={update} required><option value="">Select category</option>{[...new Set(categories)].sort().map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
      <label>Price ($)<input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={update} placeholder="0.00" required /></label>
      <label>Stock Quantity<input name="stock" type="number" min="0" step="1" value={form.stock} onChange={update} required /></label>
      <label className="modal-field-wide">Description<textarea name="description" rows="3" value={form.description} onChange={update} placeholder="Enter product details..." maxLength={600} /></label>
      <div className="admin-upload-section modal-field-wide">
        <span className="admin-upload-label">Product Images</span>
        <label className="admin-upload-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files) }}>
          <FaCloudUploadAlt aria-hidden="true" /><span>Click or drag images to upload</span><small>Up to 4 images · 600 KB max each</small>
          <input type="file" accept="image/*" multiple onChange={(event) => { addFiles(event.target.files); event.target.value = '' }} />
        </label>
        {form.images.length > 0 && <div className="admin-upload-preview-list">{form.images.map((image, index) => <div key={`${index}-${image.slice(-20)}`}><img src={image} alt={`Product preview ${index + 1}`} /><button type="button" onClick={() => setForm((current) => ({ ...current, images: current.images.filter((_, imageIndex) => imageIndex !== index) }))} aria-label={`Remove image ${index + 1}`}><FaTimes /></button></div>)}</div>}
      </div>
      {error && <p className="admin-modal-error" role="alert">{error}</p>}
    </form>
  </AdminModal>
}
