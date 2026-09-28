import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchProducts, fetchBrands } from '../services/productService'
import { products as mockProducts, brands as mockBrands } from '../data/mockData'

const PAGE_SIZE = 12

/**
 * Custom hook gọi API sản phẩm.
 * Tự động fallback về mockData khi backend chưa chạy.
 *
 * Trả về:
 *   products, brands, loading, error,
 *   totalCount, totalPages, currentPage,
 *   refetch
 */
export function useProducts(params) {
  const [products, setProducts]   = useState([])
  const [brands,   setBrands]     = useState([])
  const [loading,  setLoading]    = useState(true)
  const [error,    setError]      = useState(null)
  const [totalCount, setTotal]    = useState(0)
  const abortRef = useRef(null)

  const page     = Number(params.page)     || 1
  const pageSize = Number(params.page_size) || PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // Fetch brands một lần
  useEffect(() => {
    fetchBrands()
      .then(data => setBrands(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => setBrands(mockBrands))
  }, [])

  const fetchData = useCallback(async () => {
    // Huỷ request cũ nếu đang chạy
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const result = await fetchProducts({ ...params, page_size: PAGE_SIZE })
      // Django REST Framework trả về { count, results }
      if (result && typeof result === 'object' && 'results' in result) {
        setProducts(result.results)
        setTotal(result.count ?? result.results.length)
      } else if (Array.isArray(result)) {
        setProducts(result)
        setTotal(result.length)
      }
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError') return
      // Backend chưa chạy → dùng mock data + lọc local
      console.warn('[useProducts] Backend unavailable, using mock data')
      const filtered = applyLocalFilters(mockProducts, params)
      const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
      setProducts(paginated)
      setTotal(filtered.length)
      setError(null) // không hiển thị lỗi khi mock
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)]) // eslint-disable-line

  useEffect(() => {
    fetchData()
    return () => abortRef.current?.abort()
  }, [fetchData])

  return { products, brands, loading, error, totalCount, totalPages, currentPage: page, refetch: fetchData }
}

// ── Local filter (fallback khi backend chưa sẵn sàng) ─────────────────────
function applyLocalFilters(list, params) {
  const {
    search, brand_slug, price_min, price_max,
    ram, storage, ordering,
  } = params

  let result = [...list]

  if (search) {
    const q = search.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand_name?.toLowerCase().includes(q)
    )
  }
  if (brand_slug) {
    result = result.filter(p => {
      const slug = p.brand_name?.toLowerCase()
      return slug === brand_slug.toLowerCase()
    })
  }
  if (price_min) result = result.filter(p => p.current_price >= Number(price_min))
  if (price_max) result = result.filter(p => p.current_price <= Number(price_max))
  if (ram)       result = result.filter(p => p.specs?.ram === ram)
  if (storage)   result = result.filter(p => {
    const s = p.specs?.storage
    return Array.isArray(s) ? s.includes(storage) : s === storage
  })

  // Sort
  if (ordering === 'price')     result.sort((a, b) => a.current_price - b.current_price)
  if (ordering === '-price')    result.sort((a, b) => b.current_price - a.current_price)
  if (ordering === '-discount') result.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0))
  if (!ordering || ordering === '-created_at') result.sort((a, b) => b.id - a.id)

  return result
}
