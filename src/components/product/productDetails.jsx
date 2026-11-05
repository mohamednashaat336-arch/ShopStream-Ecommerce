import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Navbar } from '../navbar/navbar'
import { fetchApiProduct, getManagedLocalProduct } from '../../services/products'
import { useCart } from '../../hooks/useCart'
import './productDetails.css'

export function ProductsDetails() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const localProduct = useMemo(() => getManagedLocalProduct(id), [id])
  const [remoteProduct, setRemoteProduct] = useState({ id: null, product: null, error: '' })
  const [quantityForRoute, setQuantityForRoute] = useState({ id: null, quantity: 1 })
  const remoteMatchesRoute = remoteProduct.id === id
  const product = localProduct || (remoteMatchesRoute ? remoteProduct.product : null)
  const loading = !localProduct && !remoteMatchesRoute
  const error = remoteMatchesRoute ? remoteProduct.error : ''
  const quantity = quantityForRoute.id === id ? quantityForRoute.quantity : 1

  useEffect(() => {
    const controller = new AbortController()
    if (localProduct) {
      return () => controller.abort()
    }

    fetchApiProduct(id, controller.signal)
      .then((loadedProduct) => setRemoteProduct({ id, product: loadedProduct, error: '' }))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setRemoteProduct({ id, product: null, error: 'This product could not be found. Please return to the catalog and try again.' })
        }
      })

    return () => controller.abort()
  }, [id, localProduct])

  const changeQuantity = (delta) => setQuantityForRoute((current) => ({
    id,
    quantity: Math.max(1, (current.id === id ? current.quantity : 1) + delta),
  }))

  return (
    <>
      <Navbar />
      <main className="product-detail-page">
        <Link className="detail-back" to="/products">Back to products</Link>
        {loading && <p role="status">Loading product...</p>}
        {error && <p role="alert" className="detail-error">{error}</p>}
        {product && (
          <section className="product-detail-card">
            <div className="product-detail-image"><img src={product.image} alt={product.name} /></div>
            <div className="product-detail-info">
              {Number.isFinite(Number(product.rating)) && <span className="detail-rating">Rating: {Number(product.rating).toFixed(1)} / 5</span>}
              <h1>{product.name}</h1>
              {product.description && <p>{product.description}</p>}
              <strong className="detail-price">${Number(product.price).toFixed(2)}</strong>
              <div className="detail-actions">
                <div className="quantity-control" aria-label="Quantity">
                  <button type="button" onClick={() => changeQuantity(-1)} aria-label="Decrease quantity">-</button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => changeQuantity(1)} aria-label="Increase quantity">+</button>
                </div>
                <button className="detail-add-btn" type="button" onClick={() => addToCart(product, quantity)}>Add to Cart</button>
              </div>
              <Link to="/products" className="continue-shopping">Continue shopping</Link>
            </div>
          </section>
        )}
      </main>
    </>
  )
}
