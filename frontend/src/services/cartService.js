/**
 * Cart API service — tất cả calls đến /api/v1/orders/cart/
 */
import api from './api'

/** Lấy giỏ hàng từ server */
export async function fetchCart() {
  const { data } = await api.get('/orders/cart/')
  return data   // { items, total_items, total_price, shipping_fee, final_total }
}

/** Thêm sản phẩm vào giỏ */
export async function addToCart(productId, quantity = 1) {
  const { data } = await api.post('/orders/cart/add/', { product_id: productId, quantity })
  return data
}

/** Cập nhật số lượng 1 item */
export async function updateCartItem(itemId, quantity) {
  const { data } = await api.patch(`/orders/cart/${itemId}/update/`, { quantity })
  return data
}

/** Xóa 1 item */
export async function deleteCartItem(itemId) {
  const { data } = await api.delete(`/orders/cart/${itemId}/delete/`)
  return data
}

/** Xóa toàn bộ giỏ */
export async function clearCartApi() {
  const { data } = await api.delete('/orders/cart/clear/')
  return data
}

/** Đồng bộ giỏ hàng local lên server sau khi đăng nhập */
export async function syncCart(items) {
  const payload = items.map(({ product, quantity }) => ({
    product_id: product.id,
    quantity,
  }))
  const { data } = await api.post('/orders/cart/sync/', { items: payload })
  return data
}
