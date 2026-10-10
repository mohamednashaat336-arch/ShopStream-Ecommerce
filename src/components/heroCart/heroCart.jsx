import './heroCart.css'
import hero_cart_empty from '../../assets/hero_cart_empty.jpg'
import { FaHome } from 'react-icons/fa'

export function HeroCart(){
    return(
        <>
            <div className='hero-cart-main'>
                <div className='hero-cart'>
                    <div>
                        <span><FaHome /></span>
                        <div className='hero-cart-img'>
                            
                            <img src={hero_cart_empty} alt="" />
                        </div>
                        
                        <h2>Your cart is feeling light</h2>
                        <p>It looks like you haven't added anything to your cart yet.Let's find something special for you.</p>
                        <div>
                            <button>Start Shopping</button>
                            <button>View Saved Items</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}