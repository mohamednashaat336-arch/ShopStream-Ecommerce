import { useCallback, useEffect, useState } from 'react'
import { fetchProductCatalogPage, getLocalCatalogPage } from '../services/products'

export function useProductCatalog({ page, search, category, sortBy, order }) {
  const [requestId, setRequestId] = useState(0)
  const [result, setResult] = useState({ key: '', products: [], total: 0, error: '' })
  const key = JSON.stringify([page, search, category, sortBy, order, requestId])
  const retry = useCallback(() => setRequestId((id) => id + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    fetchProductCatalogPage({ page, search, category, sortBy, order }, controller.signal)
      .then((data) => setResult({ key, ...data, error: '' }))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          const fallback = getLocalCatalogPage({ page, search, category, sortBy, order })
          setResult({ key, ...fallback, error: 'Online products could not be loaded. Your local products are still available.' })
        }
      })
    return () => controller.abort()
  }, [key, page, search, category, sortBy, order])

  const current = result.key === key
  return {
    products: current ? result.products : [],
    total: current ? result.total : 0,
    error: current ? result.error : '',
    loading: !current,
    retry,
  }
}
