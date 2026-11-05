import { Link } from 'react-router-dom'
import { FaCcMastercard, FaCcVisa, FaCreditCard, FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa'
import './footer.css'

export function Footer({ variant = 'compact' }) {
  if (variant === 'home') return <footer className="shopstream-footer shopstream-footer-home">
    <div className="shopstream-footer-main">
      <section className="shopstream-footer-about"><Link className="shopstream-footer-brand" to="/"><strong>ShopStream</strong></Link><p>A premium e-commerce experience dedicated to delivering the world's most innovative electronics right to your doorstep.</p><div className="shopstream-social-links" aria-label="Social media"><span aria-label="Instagram"><FaInstagram /></span><span aria-label="Facebook"><FaFacebookF /></span><span aria-label="Twitter"><FaTwitter /></span></div></section>
      <nav className="shopstream-footer-column" aria-label="Shop"><strong>SHOP</strong><Link to="/products">All Electronics</Link><Link to="/categories">Wearables</Link><Link to="/categories">Home Office</Link><Link to="/products">New Arrivals</Link></nav>
      <nav className="shopstream-footer-column" aria-label="Support"><strong>SUPPORT</strong><span>Contact Us</span><span>Shipping Info</span><span>Returns</span><span>FAQs</span></nav>
      <nav className="shopstream-footer-column" aria-label="Legal"><strong>LEGAL</strong><span>Privacy Policy</span><span>Terms of Service</span></nav>
    </div>
    <div className="shopstream-footer-bottom"><span>© 2024 ShopStream Inc. All rights reserved.</span><div className="shopstream-payment-icons" aria-label="Accepted payment methods"><FaCcVisa /><FaCreditCard /><FaCcMastercard /></div></div>
  </footer>

  return <footer className="shopstream-footer shopstream-footer-compact">
    <Link className="shopstream-footer-brand" to="/" aria-label="ShopStream home"><strong>ShopStream</strong></Link>
    <nav className="shopstream-footer-links" aria-label="Footer links"><span>Privacy Policy</span><span>Terms of Service</span><span>Contact Us</span><span>Shipping Info</span></nav>
    <span className="shopstream-footer-copyright">© 2024 ShopStream Inc. All rights reserved.</span>
  </footer>
}
