import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/navbar/navbar'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { placeOrder } from '../services/commerce'
import './checkout.css'

export function CheckoutPage() {
  const { user } = useAuth()
  const { items, subtotal, clearCart } = useCart()
  const [shipping, setShipping] = useState({ name: user.name, email: user.email, phone: user.phone || '', address: '', city: '', postalCode: '' })
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)

  const updateField = (event) => setShipping((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submitOrder = (event) => {
    event.preventDefault()
    setError('')
    try {
      const createdOrder = placeOrder({ user, items, shipping })
      clearCart()
      setOrder(createdOrder)
    } catch (orderError) {
      setError(orderError.message || 'The order could not be completed.')
    }
  }

  return <>
    <Navbar />
    <main className="checkout-page">
      {order ? <section className="checkout-success">
        <span className="checkout-success-mark" aria-hidden="true">&#10003;</span>
        <p className="checkout-eyebrow">ORDER RECEIVED</p>
        <h1>Thank you, {order.customer.name}</h1>
        <p>Your order is saved. Payment is due on delivery.</p>
        <div className="checkout-order-number"><span>Order number</span><strong>{order.id}</strong></div>
        <div className="checkout-success-actions"><Link to="/products">Continue shopping</Link><Link to="/profile">My profile</Link></div>
      </section> : items.length === 0 ? <section className="checkout-empty">
        <h1>Your cart is empty</h1><p>Add products before checking out.</p><Link to="/products">Browse products</Link>
      </section> : <>
        <header className="checkout-heading"><p>SHOPSTREAM CHECKOUT</p><h1>Complete your order</h1><span>Delivery and cash on delivery</span></header>
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={submitOrder}>
            <section><h2>Delivery details</h2>
              <div className="checkout-fields">
                <label>Full name<input name="name" value={shipping.name} onChange={updateField} autoComplete="name" required /></label>
                <label>Email<input name="email" type="email" value={shipping.email} onChange={updateField} autoComplete="email" required /></label>
                <label>Phone<input name="phone" type="tel" value={shipping.phone} onChange={updateField} autoComplete="tel" required /></label>
                <label>Address<input name="address" value={shipping.address} onChange={updateField} autoComplete="street-address" required /></label>
                <label>City<input name="city" value={shipping.city} onChange={updateField} autoComplete="address-level2" required /></label>
                <label>Postal code<input name="postalCode" value={shipping.postalCode} onChange={updateField} autoComplete="postal-code" required /></label>
              </div>
            </section>
            <section className="checkout-payment"><h2>Payment</h2><label className="checkout-cod"><input type="radio" checked readOnly /> Cash on delivery</label><p>This demo does not process card payments.</p></section>
            {error && <p className="checkout-error" role="alert">{error}</p>}
            <button className="checkout-submit" type="submit">Place order</button>
          </form>
          <aside className="checkout-summary"><h2>Order summary</h2>
            {items.map((item) => <div className="checkout-item" key={`${item.source}-${item.id}`}><img src={item.image} alt="" /><div><strong>{item.name}</strong><span>Qty {item.quantity}</span></div><b>${(item.price * item.quantity).toFixed(2)}</b></div>)}
            <div className="checkout-total"><span>Total</span><strong>${subtotal.toFixed(2)}</strong></div>
            <Link to="/cart">Back to cart</Link>
          </aside>
        </div>
      </>}
    </main>
  </>
}
