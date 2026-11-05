const ADMIN_CATEGORIES_KEY = 'shopstream-admin-categories'

export function getAdminCategories() {
  try {
    const value = JSON.parse(localStorage.getItem(ADMIN_CATEGORIES_KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function addAdminCategory(name) {
  const categories = getAdminCategories()
  const normalized = name.trim().toLowerCase().replace(/\s+/g, '-')
  if (!normalized) throw new Error('Enter a category name.')
  if (categories.some((category) => category.slug === normalized)) throw new Error('This category already exists.')
  const category = { slug: normalized, name: name.trim(), source: 'local' }
  localStorage.setItem(ADMIN_CATEGORIES_KEY, JSON.stringify([...categories, category]))
  return category
}

export function deleteAdminCategory(slug) {
  localStorage.setItem(ADMIN_CATEGORIES_KEY, JSON.stringify(getAdminCategories().filter((category) => category.slug !== slug)))
}
