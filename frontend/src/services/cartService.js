import api from './api'

/** Lấy giỏ hàng từ server */
export async function fetchCart() {
  const { data } = await api.get('/orders/cart/')
  return data
}

/** Thêm sản phẩm vào giỏ */
export async function addToCart(productId, quantity = 1, color = '', storage = '') {
  const { data } = await api.post('/orders/cart/add/', {
    product_id: productId,
    quantity,
    color,
    storage,
  })
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
  const payload = items.map((i) => ({
    product_id: i.product?.id || i.product_id,
    quantity: i.quantity,
    color: i.color || '',
    storage: i.storage || '',
  }))
  const { data } = await api.post('/orders/cart/sync/', { items: payload })
  return data
}

export { deleteCartItem as removeCartItem, clearCartApi as clearCart }
