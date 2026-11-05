import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/navbar/navbar'
import { useAuth } from '../hooks/useAuth'
import { getOrders } from '../services/commerce'
import './myOrders.css'

export function MyOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState(getOrders)
  const myOrders = useMemo(() => orders.filter((order) => String(order.userId) === String(user.id)), [orders, user.id])

  useEffect(() => {
    const refresh = () => setOrders(getOrders())
    window.addEventListener('shopstream-commerce-updated', refresh)
    return () => window.removeEventListener('shopstream-commerce-updated', refresh)
  }, [])

  return <>
    <Navbar />
    <main className="my-orders-page">
      <header><p>SHOPSTREAM ACCOUNT</p><h1>My Orders</h1><span>Track orders placed from this browser.</span></header>
      {myOrders.length ? <div className="my-orders-list">{myOrders.map((order) => <article className="my-order-card" key={order.id}>
        <div className="my-order-heading"><div><strong>{order.id}</strong><span>{new Date(order.createdAt).toLocaleDateString()}</span></div><span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span></div>
        <div className="my-order-items">{order.items.map((item) => <p key={`${item.source}-${item.id}`}>{item.quantity} × {item.name} <strong>${(item.price * item.quantity).toFixed(2)}</strong></p>)}</div>
        <div className="my-order-footer"><span>{order.paymentMethod}</span><strong>Total: ${order.total.toFixed(2)}</strong></div>
      </article>)}</div> : <section className="my-orders-empty"><h2>No orders yet</h2><p>When you place an order, it will show up here.</p><Link to="/products">Browse products</Link></section>}
    </main>
  </>
}
