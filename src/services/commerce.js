const ORDERS_KEY = 'shopstream-orders'
const INVENTORY_KEY = 'shopstream-inventory'

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback
  } catch {
    return fallback
  }
}

function readInventory() {
  const inventory = readJson(INVENTORY_KEY, {})
  return inventory && typeof inventory === 'object' && !Array.isArray(inventory) ? inventory : {}
}

function inventoryKey(product) {
  return `${product.source}-${product.id}`
}

function notifyCommerceUpdated() {
  window.dispatchEvent(new Event('shopstream-commerce-updated'))
}

export function getOrders() {
  const orders = readJson(ORDERS_KEY, [])
  return Array.isArray(orders) ? orders : []
}

export function getInventoryStock(product) {
  const inventory = readInventory()
  const key = inventoryKey(product)
  if (Object.hasOwn(inventory, key)) return Number(inventory[key])
  return Number.isFinite(product.stock) ? product.stock : null
}

export function setInventoryStock(product, stock) {
  if (!Number.isInteger(stock) || stock < 0) throw new Error('Stock must be a whole number greater than or equal to zero.')
  const inventory = readInventory()
  inventory[inventoryKey(product)] = stock
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory))
  notifyCommerceUpdated()
}

export function placeOrder({ user, items, shipping }) {
  if (!items.length) throw new Error('Your cart is empty.')
  const inventory = readInventory()
  const updatedInventory = { ...inventory }
  const orderItems = items.map((item) => {
    const key = inventoryKey(item)
    const isTracked = Object.hasOwn(inventory, key) || Number.isFinite(item.stock)
    const available = Object.hasOwn(inventory, key) ? Number(inventory[key]) : item.stock
    if (isTracked && available < item.quantity) {
      throw new Error(`Only ${available} of ${item.name} remain in stock.`)
    }
    if (isTracked) updatedInventory[key] = available - item.quantity
    return {
      id: item.id,
      source: item.source,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      stockTracked: isTracked,
      stock: isTracked ? available : null,
    }
  })

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const order = {
    id: `SS-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    userId: user.id,
    customer: { name: shipping.name, email: shipping.email, phone: shipping.phone },
    shipping: { address: shipping.address, city: shipping.city, postalCode: shipping.postalCode },
    paymentMethod: 'Cash on delivery',
    items: orderItems,
    subtotal,
    shippingFee: 0,
    total: subtotal,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory))
  localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...getOrders()]))
  notifyCommerceUpdated()
  return order
}

export function updateOrderStatus(orderId, status) {
  const orders = getOrders()
  const order = orders.find((item) => item.id === orderId)
  if (!order) throw new Error('Order was not found.')
  if (order.status === 'Cancelled' && status !== 'Cancelled') {
    throw new Error('A cancelled order cannot be reopened in this demo.')
  }

  if (status === 'Cancelled' && order.status !== 'Cancelled') {
    const inventory = readInventory()
    for (const item of order.items) {
      if (item.stockTracked) {
        const key = inventoryKey(item)
        inventory[key] = Number(inventory[key] ?? item.stock - item.quantity) + item.quantity
      }
    }
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory))
  }

  const updatedOrders = orders.map((item) => item.id === orderId ? { ...item, status } : item)
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders))
  notifyCommerceUpdated()
  return updatedOrders.find((item) => item.id === orderId)
}
