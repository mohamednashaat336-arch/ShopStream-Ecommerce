import { useEffect, useState } from 'react'
import { AdminNavigation } from '../../components/adminNavigation'
import { getOrders, updateOrderStatus } from '../../services/commerce'
import './admin.css'

const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

export function OrdersPage() {
  const [orders, setOrders] = useState(getOrders)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    const refresh = () => setOrders(getOrders())
    window.addEventListener('shopstream-commerce-updated', refresh)
    return () => window.removeEventListener('shopstream-commerce-updated', refresh)
  }, [])

  const changeStatus = (orderId, status) => {
    try {
      updateOrderStatus(orderId, status)
      setOrders(getOrders())
      setError('')
    } catch (updateError) {
      setError(updateError.message)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = `${order.id} ${order.customer.name} ${order.customer.email}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (!statusFilter || order.status === statusFilter)
  })
  const pendingCount = orders.filter((order) => ['Pending', 'Processing'].includes(order.status)).length
  const completedRevenue = orders.filter((order) => order.status !== 'Cancelled').reduce((sum, order) => sum + order.total, 0)

  return <>
    <main className="admin-page">
      <header className="admin-heading"><div><p>SHOPSTREAM ADMIN</p><h1>Orders</h1><span>Review customer orders and update their fulfillment status.</span></div></header>
      <AdminNavigation />
      {error && <p className="admin-form-error" role="alert">{error}</p>}
      <section className="orders-summary" aria-label="Order summary"><article><span>Total orders</span><strong>{orders.length}</strong></article><article><span>Needs fulfillment</span><strong>{pendingCount}</strong></article><article><span>Order value</span><strong>${completedRevenue.toFixed(2)}</strong></article></section>
      <div className="orders-filters"><label className="admin-search">Search orders<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Order ID, customer, email" /></label><label className="admin-search">Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></label></div>
      {orders.length ? filteredOrders.length ? <section className="orders-list" aria-label="Customer orders">
        {filteredOrders.map((order) => <article className="order-card" key={order.id}>
          <div className="order-card-heading"><div><strong>{order.id}</strong><span>{new Date(order.createdAt).toLocaleString()}</span></div>
            <label>Status<select value={order.status} onChange={(event) => changeStatus(order.id, event.target.value)} disabled={order.status === 'Cancelled'}>{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
          </div>
          <div className="order-customer"><strong>{order.customer.name}</strong><span>{order.customer.email}</span><span>{order.customer.phone}</span></div>
          <div className="order-items-list">{order.items.map((item) => <p key={`${item.source}-${item.id}`}>{item.quantity} × {item.name} <strong>${(item.price * item.quantity).toFixed(2)}</strong></p>)}</div>
          <div className="order-card-total"><span>{order.paymentMethod}</span><strong>Total: ${order.total.toFixed(2)}</strong></div>
          <p className="order-shipping-address">Deliver to: {order.shipping.address}, {order.shipping.city} {order.shipping.postalCode}</p>
        </article>)}
      </section> : <div className="admin-empty-state order-empty-state"><h2>No matching orders</h2><p>Try another name or order status.</p></div> : <div className="admin-empty-state order-empty-state"><h2>No orders yet</h2><p>Orders placed through checkout will appear here.</p></div>}
    </main>
  </>
}
