import { Link } from 'react-router-dom'
import { FaCartArrowDown } from 'react-icons/fa'
import { useCart } from '../../hooks/useCart'

export function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} state={{ source: product.source }} className="product-card-link">
        <div className="product-image">
          {product.badge && (
            <span className={`badge ${product.badge.includes('-') ? 'discount' : 'new'}`}>
              {product.badge}
            </span>
          )}
          <img src={product.image} alt={product.name} loading="lazy" />
        </div>
      </Link>
      <div className="product-info">
        <div className="product-title-row">
          <Link to={`/products/${product.id}`} state={{ source: product.source }} className="product-name-link">
            <h3>{product.name}</h3>
          </Link>
          {Number.isFinite(Number(product.rating)) && <span className="rating" aria-label={`Rated ${product.rating} out of 5`}>
            ★ {Number(product.rating).toFixed(1)}
          </span>}
        </div>
        {product.description && <p className="product-desc">{product.description}</p>}
        <div className="product-footer">
          <div className="price">
            {product.oldPrice && <span className="old-price">${Number(product.oldPrice).toFixed(2)}</span>}
            <span className="current-price">${Number(product.price).toFixed(2)}</span>
          </div>
          <button className="add-btn" type="button" onClick={() => addToCart(product)} aria-label={`Add ${product.name} to cart`}>
            <FaCartArrowDown aria-hidden="true" /> <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  )
}
