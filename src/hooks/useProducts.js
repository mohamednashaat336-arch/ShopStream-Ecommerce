import { useCallback, useEffect, useState } from 'react'
import { fetchProducts, getAdminProducts, getLocalProducts } from '../services/products'

export function useProducts({ includeHidden = false } = {}) {
  const [products, setProducts] = useState(() => [...getLocalProducts(), ...getAdminProducts({ includeHidden })])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestId, setRequestId] = useState(0)
  const retry = useCallback(() => {
    setLoading(true)
    setError('')
    setRequestId((id) => id + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const refreshProducts = () => {
      setLoading(true)
      setError('')
      setRequestId((id) => id + 1)
    }

    window.addEventListener('shopstream-products-updated', refreshProducts)
    fetchProducts(controller.signal, { includeHidden })
      .then(setProducts)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setError('We could not load online products. Your saved local products are still available.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => {
      controller.abort()
      window.removeEventListener('shopstream-products-updated', refreshProducts)
    }
  }, [requestId, includeHidden])

  return { products, loading, error, retry }
}
