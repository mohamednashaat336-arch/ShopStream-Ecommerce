const LOCAL_CUSTOMERS_KEY = 'shopstream-local-customers'
const HIDDEN_USERS_KEY = 'shopstream-hidden-users'
const USER_OVERRIDES_KEY = 'shopstream-user-overrides'
import { getRegisteredAccounts, updateRegisteredAccount, removeRegisteredAccount } from './localAccounts'

function getLocalCustomers() {
  try {
    const customers = JSON.parse(localStorage.getItem(LOCAL_CUSTOMERS_KEY) || '[]')
    return Array.isArray(customers) ? customers : []
  } catch {
    return []
  }
}

export async function fetchCustomers(signal, { page = 1, limit = 10, search = '', role = '' } = {}) {
  const params = new URLSearchParams({ limit: String(limit), skip: String((page - 1) * limit), select: 'id,firstName,lastName,email,username,phone,image,role,company' })
  let endpoint = 'https://dummyjson.com/users'
  if (search.trim()) { endpoint += '/search'; params.set('q', search.trim()) }
  else if (role) { endpoint += '/filter'; params.set('key', 'role'); params.set('value', role) }
  const response = await fetch(`${endpoint}?${params}`, { signal })
  if (!response.ok) throw new Error(`Customers could not be loaded (${response.status}).`)
  const data = await response.json()
  if (!Array.isArray(data.users)) throw new Error('The customer service returned an unexpected response.')
  const overrides = readUserOverrides()
  const apiCustomers = data.users.map((user) => ({
    id: user.id,
    source: 'api',
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    username: user.username,
    phone: user.phone,
    image: user.image,
    role: user.role,
    company: user.company?.name || '',
    ...(overrides[user.id] || {}),
  }))
  const hiddenIds = readHiddenUserIds()
  const localAccounts = getRegisteredAccounts().map((account) => ({ ...account, source: 'local', accountType: 'registered' }))
  const allLocalUsers = [...localAccounts, ...getLocalCustomers().map(normalizeLocalCustomer)]
  const matchingLocal = allLocalUsers.filter((customer) => {
    const matchesText = !search.trim() || `${customer.name} ${customer.email} ${customer.username}`.toLowerCase().includes(search.trim().toLowerCase())
    return matchesText && (!role || customer.role === role)
  })
  const visibleApiCustomers = apiCustomers.filter((customer) => !hiddenIds.includes(String(customer.id)))
  return { customers: [...(page === 1 ? matchingLocal : []), ...visibleApiCustomers], total: Math.max(0, data.total - hiddenIds.length) + matchingLocal.length, page, limit }
}

function normalizeLocalCustomer(customer) {
  return {
    ...customer,
    name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.username || 'New user',
    role: customer.role || 'user',
  }
}

function readHiddenUserIds() {
  try { return JSON.parse(localStorage.getItem(HIDDEN_USERS_KEY) || '[]').map(String) } catch { return [] }
}

function readUserOverrides() {
  try { return JSON.parse(localStorage.getItem(USER_OVERRIDES_KEY) || '{}') } catch { return {} }
}

export function getLocalCustomerRecords() {
  return [...getRegisteredAccounts().map((account) => ({ ...account, source: 'local', accountType: 'registered' })), ...getLocalCustomers().map(normalizeLocalCustomer)]
}

export function addLocalCustomer(customer) {
  const safeCustomer = { ...customer }
  delete safeCustomer.password
  const localCustomer = normalizeLocalCustomer({ ...safeCustomer, id: `local-${crypto.randomUUID()}`, source: 'local' })
  localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify([localCustomer, ...getLocalCustomers()]))
  return localCustomer
}

export function updateCustomerRecord(customer) {
  const safeCustomer = { ...customer }
  delete safeCustomer.password
  if (safeCustomer.source === 'local') {
    if (safeCustomer.accountType === 'registered') return updateRegisteredAccount(safeCustomer.id, safeCustomer)
    const updated = getLocalCustomers().map((item) => item.id === safeCustomer.id ? normalizeLocalCustomer({ ...item, ...safeCustomer }) : item)
    localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(updated))
    return updated.find((item) => item.id === safeCustomer.id)
  }
  const overrides = readUserOverrides()
  overrides[safeCustomer.id] = { ...(overrides[safeCustomer.id] || {}), ...safeCustomer }
  localStorage.setItem(USER_OVERRIDES_KEY, JSON.stringify(overrides))
  return safeCustomer
}

export function removeLocalCustomer(customerId) {
  localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(getLocalCustomers().filter((customer) => customer.id !== customerId)))
}

export function removeCustomerFromDirectory(customer) {
  if (customer.source === 'local') {
    if (customer.accountType === 'registered') return removeRegisteredAccount(customer.id)
    return removeLocalCustomer(customer.id)
  }
  const hiddenIds = readHiddenUserIds()
  localStorage.setItem(HIDDEN_USERS_KEY, JSON.stringify([...new Set([...hiddenIds, String(customer.id)])]))
}
