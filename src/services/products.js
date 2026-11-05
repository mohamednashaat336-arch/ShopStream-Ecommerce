import product_sonicpro from '../assets/product_sonicpro.png'
import product_vase from '../assets/product_vase.png'
import product_keyboard from '../assets/product_keyboard.png'
import product_watch from '../assets/product_watch.png'
import product_skincare from '../assets/product_skincare.png'
import product_backpack from '../assets/product_backpack.png'
import featured_products_audio from '../assets/featured_products_audio.png'
import featured_products_accessories from '../assets/featured_products_accessories.png'
import featured_products_drones from '../assets/featured_products_drones.png'
import featured_products_gaming from '../assets/featured_products_gaming.png'
import { getAdminCategories } from './adminCategories'

const ADMIN_PRODUCTS_KEY = 'shopstream-admin-products'
const PRODUCT_OVERRIDES_KEY = 'shopstream-product-overrides'
const HIDDEN_API_PRODUCTS_KEY = 'shopstream-hidden-api-products'

function readStoredList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function getAdminProducts({ includeHidden = false } = {}) {
  const products = readStoredList(ADMIN_PRODUCTS_KEY)
  return includeHidden ? products : products.filter((product) => product.visible !== false)
}

export function getLocalProducts() {
  const overrides = getProductOverrides()
  return localProducts.map((product) => ({ ...product, ...overrides[product.id], id: product.id, source: 'local', visible: true }))
}

function getHiddenApiProductIds() {
  const hidden = new Set(readStoredList(HIDDEN_API_PRODUCTS_KEY).map(String))
  for (const [id, override] of Object.entries(getProductOverrides())) {
    if (override.visible === false) hidden.add(String(id))
  }
  return hidden
}

function getProductOverrides() {
  try {
    const overrides = JSON.parse(localStorage.getItem(PRODUCT_OVERRIDES_KEY) || '{}')
    return overrides && typeof overrides === 'object' ? overrides : {}
  } catch {
    return {}
  }
}

export function getManagedLocalProduct(id) {
  return [...getLocalProducts(), ...getAdminProducts()].find((product) => String(product.id) === String(id)) || null
}

export function addAdminProduct(product) {
  const newProduct = { ...product, id: `custom-${crypto.randomUUID()}`, source: 'custom' }
  localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify([...getAdminProducts({ includeHidden: true }), newProduct]))
  notifyProductsUpdated()
  return newProduct
}

export function updateManagedProduct(product) {
  if (product.source === 'local') {
    const overrides = getProductOverrides()
    overrides[product.id] = { ...(overrides[product.id] || {}), name: product.name, category: product.category, description: product.description, price: Number(product.price), stock: Number(product.stock), image: product.image, images: product.images?.length ? product.images : [product.image], sku: product.sku, visible: true }
    localStorage.setItem(PRODUCT_OVERRIDES_KEY, JSON.stringify(overrides))
  } else if (product.source === 'custom') {
    const updated = getAdminProducts({ includeHidden: true }).map((item) => item.id === product.id ? { ...item, ...product } : item)
    localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(updated))
  } else if (product.source === 'api') {
    const overrides = getProductOverrides()
    overrides[product.id] = {
      title: product.name,
      name: product.name,
      category: product.category,
      description: product.description,
      price: Number(product.price),
      stock: Number(product.stock),
      thumbnail: product.image,
      image: product.image,
      images: product.images?.length ? product.images : [product.image],
      sku: product.sku,
      visible: product.visible !== false,
    }
    localStorage.setItem(PRODUCT_OVERRIDES_KEY, JSON.stringify(overrides))
  } else return false
  notifyProductsUpdated()
  return true
}

export function restoreManagedProduct(product) {
  if (product.source === 'custom') return updateManagedProduct({ ...product, visible: true })
  if (product.source === 'api') {
    const hiddenIds = readStoredList(HIDDEN_API_PRODUCTS_KEY).filter((id) => String(id) !== String(product.id))
    localStorage.setItem(HIDDEN_API_PRODUCTS_KEY, JSON.stringify(hiddenIds))
    const overrides = getProductOverrides()
    if (overrides[product.id]) overrides[product.id] = { ...overrides[product.id], visible: true }
    localStorage.setItem(PRODUCT_OVERRIDES_KEY, JSON.stringify(overrides))
    notifyProductsUpdated()
    return true
  }
  return false
}

export function deleteManagedProduct(product) {
  if (product.source === 'local') return false
  if (product.source === 'custom') {
    localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(getAdminProducts({ includeHidden: true }).filter((item) => item.id !== product.id)))
  } else if (product.source === 'api') {
    const hiddenIds = readStoredList(HIDDEN_API_PRODUCTS_KEY)
    localStorage.setItem(HIDDEN_API_PRODUCTS_KEY, JSON.stringify([...new Set([...hiddenIds, product.id])]))
  } else {
    return false
  }
  notifyProductsUpdated()
  return true
}

export function notifyProductsUpdated() {
  window.dispatchEvent(new Event('shopstream-products-updated'))
}

export const localProducts = [
  { id: 1001, source: 'local', badge: 'NEW', image: product_sonicpro, name: 'SonicPro Wireless...', rating: 4.8, description: 'Premium noise-canceling headphones with 40-hour battery', price: 299 },
  { id: 1002, source: 'local', image: product_vase, name: 'Nordic Ceramic Vase Set', rating: 4.9, description: 'Hand-crafted artisan vases with a textured matte finish for modern...', price: 85 },
  { id: 1003, source: 'local', badge: '-20%', image: product_keyboard, name: 'CyberType Mechanical...', rating: 4.7, description: 'Compact 65% layout with hot-swappable switches and...', price: 144, oldPrice: 180 },
  { id: 1004, source: 'local', image: product_watch, name: 'Horizon Smartwatch Gen 4', rating: 4.6, description: 'Advanced health tracking and 7-day battery life in a slim, durable...', price: 249 },
  { id: 1005, source: 'local', image: product_skincare, name: 'Essence Glow Skincare Set', rating: 5, description: 'A curated 3-step routine for radiant skin, featuring our...', price: 120 },
  { id: 1006, source: 'local', image: product_backpack, name: 'Urban Commuter Backpack', rating: 4.5, description: 'Weather-resistant tech backpack with dedicated laptop sleeve and...', price: 155 },
  { id: 2001, source: 'local', image: featured_products_audio, name: 'StreamPods Pro Gen 2', category: 'AUDIO', badge: 'BEST SELLER', price: 199 },
  { id: 2002, source: 'local', image: featured_products_accessories, name: 'StreamKey Ultra Slim', category: 'ACCESSORIES', price: 129 },
  { id: 2003, source: 'local', image: featured_products_drones, name: 'AeroStream V3', category: 'DRONES', badge: 'NEW', price: 849 },
  { id: 2004, source: 'local', image: featured_products_gaming, name: 'Nexus Glide Pro', category: 'GAMING', price: 89 },
]

export async function fetchProducts(signal, { includeHidden = false } = {}) {
  const response = await fetch('https://dummyjson.com/products?limit=0', { signal })
  if (!response.ok) throw new Error(`Products could not be loaded (${response.status}).`)
  const data = await response.json()
  if (!Array.isArray(data.products)) throw new Error('The product service returned an unexpected response.')

  const overrides = getProductOverrides()
  const hiddenIds = getHiddenApiProductIds()
  const apiProducts = data.products.map((product) => ({
    id: product.id,
    source: 'api',
    badge: product.discountPercentage > 10 ? `-${Math.round(product.discountPercentage)}%` : null,
    image: product.thumbnail || product.images?.[0] || '',
    images: product.images || [],
    name: product.title,
    category: product.category,
    brand: product.brand,
    sku: product.sku,
    stock: product.stock,
    rating: product.rating,
    description: product.description,
    price: product.price,
    ...overrides[product.id],
    visible: !hiddenIds.has(String(product.id)) && overrides[product.id]?.visible !== false,
  }))

  const distinctApiProducts = [...new Map(apiProducts.map((product) => [product.id, product])).values()]
  const visibleApiProducts = includeHidden ? distinctApiProducts : distinctApiProducts.filter((product) => !hiddenIds.has(String(product.id)))
  return [...getLocalProducts(), ...getAdminProducts({ includeHidden }), ...visibleApiProducts]
}

function mapApiProduct(product) {
  const overrides = getProductOverrides()
  return {
    id: product.id,
    source: 'api',
    badge: product.discountPercentage > 10 ? `-${Math.round(product.discountPercentage)}%` : null,
    image: product.thumbnail || product.images?.[0] || '',
    images: product.images || [],
    name: product.title,
    category: product.category,
    brand: product.brand,
    sku: product.sku,
    stock: product.stock,
    rating: product.rating,
    description: product.description,
    price: product.price,
    oldPrice: product.discountPercentage ? product.price / (1 - product.discountPercentage / 100) : null,
    ...overrides[product.id],
    visible: overrides[product.id]?.visible !== false,
  }
}

function matchesLocalProduct(product, search, category) {
  const matchesSearch = !search || `${product.name} ${product.description || ''} ${product.category || ''}`.toLowerCase().includes(search.toLowerCase())
  const matchesCategory = !category || product.category?.toLowerCase() === category.toLowerCase()
  return matchesSearch && matchesCategory
}

export function getLocalCatalogPage({ page = 1, limit = 6, search = '', category = '', sortBy = 'id', order = 'desc' }) {
  const localMatches = [...getLocalProducts(), ...getAdminProducts()]
    .filter((product) => matchesLocalProduct(product, search, category))
    .sort((left, right) => {
      const key = sortBy === 'title' ? 'name' : sortBy
      const first = left[key] ?? ''
      const second = right[key] ?? ''
      const comparison = typeof first === 'number' && typeof second === 'number' ? first - second : String(first).localeCompare(String(second))
      return order === 'asc' ? comparison : -comparison
    })
  const start = (page - 1) * limit
  return { products: localMatches.slice(start, start + limit), total: localMatches.length }
}

export async function fetchProductCatalogPage({ page = 1, limit = 6, search = '', category = '', sortBy = 'id', order = 'desc' }, signal) {
  const { products: localPage, total: localTotal } = getLocalCatalogPage({ page, limit, search, category, sortBy, order })
  const start = (page - 1) * limit
  const apiLimit = Math.max(0, limit - localPage.length)
  const apiSkip = Math.max(0, start - localTotal)
  const hiddenIds = getHiddenApiProductIds()
  const query = new URLSearchParams({ limit: String(Math.max(1, apiLimit + hiddenIds.size)), skip: String(apiSkip), sortBy, order })
  const endpoint = search
    ? `https://dummyjson.com/products/search?q=${encodeURIComponent(search)}`
    : category
      ? `https://dummyjson.com/products/category/${encodeURIComponent(category)}`
      : 'https://dummyjson.com/products'
  const separator = endpoint.includes('?') ? '&' : '?'
  const response = await fetch(`${endpoint}${separator}${query}`, { signal })
  if (!response.ok) throw new Error(`Products could not be loaded (${response.status}).`)
  const data = await response.json()
  if (!Array.isArray(data.products)) throw new Error('The product service returned an unexpected response.')

  const visibleApi = data.products.filter((product) => !hiddenIds.has(String(product.id))).slice(0, apiLimit).map(mapApiProduct)
  return {
    products: [...localPage, ...visibleApi],
    total: localTotal + Math.max(0, data.total - hiddenIds.size),
  }
}

export async function fetchProductCategories(signal) {
  const response = await fetch('https://dummyjson.com/products/category-list', { signal })
  if (!response.ok) throw new Error(`Categories could not be loaded (${response.status}).`)
  const categories = await response.json()
  if (!Array.isArray(categories)) throw new Error('The category service returned an unexpected response.')
  return [...new Set([...categories, ...getAdminCategories().map((category) => category.slug)])]
}

export async function fetchApiProduct(id, signal) {
  const response = await fetch(`https://dummyjson.com/products/${id}`, { signal })
  if (!response.ok) throw new Error(`Product details could not be loaded (${response.status}).`)
  const product = await response.json()
  return mapApiProduct(product)
}
