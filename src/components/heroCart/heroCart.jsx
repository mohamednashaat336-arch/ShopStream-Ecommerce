import './heroCart.css'
import hero_cart_empty from '../../assets/hero_cart_empty.jpg'
import { FaHome } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'

export function HeroCart(){
    const { items, subtotal, updateQuantity, removeFromCart } = useCart()
    return(
        <>
            <div className={`hero-cart-main ${items.length ? 'has-cart-items' : ''}`}>
                {items.length > 0 ? (
                    <div className="cart-content">
                        <h1>Your Cart</h1>
                        <div className="cart-layout">
                            <div className="cart-items">
                                {items.map((item) => (
                                    <article className="cart-item" key={`${item.source}-${item.id}`}>
                                        <img src={item.image} alt={item.name} />
                                        <div className="cart-item-info">
                                            <h2>{item.name}</h2>
                                            <p>${Number(item.price).toFixed(2)} each</p>
                                            <div className="cart-item-actions">
                                                <label>Quantity <input type="number" min="1" value={item.quantity} onChange={(event) => updateQuantity(item.source, item.id, Number(event.target.value) || 1)} /></label>
                                                <button type="button" onClick={() => removeFromCart(item.source, item.id)}>Remove</button>
                                            </div>
                                        </div>
                                        <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                                    </article>
                                ))}
                            </div>
                            <aside className="cart-summary">
                                <h2>Order Summary</h2>
                                <p><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></p>
                                <p><span>Delivery</span><span>Free</span></p>
                                <div className="cart-total"><span>Total</span><strong>${subtotal.toFixed(2)}</strong></div>
                                <Link to="/checkout" className="cart-checkout-link">Continue to Checkout</Link>
                                <Link to="/products">Continue shopping</Link>
                            </aside>
                        </div>
                    </div>
                ) : <div className='hero-cart'>
                    <div>
                        <span><FaHome /></span>
                        <div className='hero-cart-img'>
                            
                            <img src={hero_cart_empty} alt="" />
                        </div>
                        
                        <h2>Your cart is feeling light</h2>
                        <p>It looks like you haven't added anything to your cart yet.Let's find something special for you.</p>
                        <div>
                            <Link to="/products" className="cart-shop-link">Start Shopping</Link>
                            <Link to="/products" className="cart-saved-link">View Saved Items</Link>
                        </div>
                    </div>
                </div>}
            </div>
        </>
    )
}
