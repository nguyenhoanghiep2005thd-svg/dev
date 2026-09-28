import api from './api'

/**
 * Lấy danh sách sản phẩm với đầy đủ filter + phân trang.
 *
 * Params (tất cả optional):
 *   search, brand_slug, brand, category_slug, category,
 *   price_min, price_max, in_stock,
 *   ram, storage,            ← lọc trong specs (JSONB)
 *   ordering, page, page_size
 *
 * Trả về: { count, next, previous, results }
 */
export async function fetchProducts(params = {}) {
  // Lọc bỏ param rỗng / undefined trước khi gửi
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  )
  const { data } = await api.get('/products/', { params: clean })
  return data
}

/** Lấy 1 sản phẩm theo id */
export async function fetchProduct(id) {
  const { data } = await api.get(`/products/${id}/`)
  return data
}

/** Lấy danh sách hãng */
export async function fetchBrands() {
  const { data } = await api.get('/products/brands/')
  return data
}

/** Lấy danh sách danh mục */
export async function fetchCategories() {
  const { data } = await api.get('/products/categories/')
  return data
}
