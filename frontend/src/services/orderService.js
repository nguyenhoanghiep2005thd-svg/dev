import api from './api'

/**
 * Tạo đơn hàng mới từ giỏ hàng hiện tại trên server.
 * @param {Object} payload
 *   - shipping_full_name
 *   - shipping_phone
 *   - shipping_email
 *   - shipping_address
 *   - payment_method  'cod' | 'bank' | 'online'
 *   - note
 */
export async function createOrder(payload) {
  const { data } = await api.post('/orders/create/', payload)
  return data  // { id, status, total_price, message, items, ... }
}

/** Lấy danh sách đơn hàng của user */
export async function fetchOrders() {
  const { data } = await api.get('/orders/')
  return data
}

/** Lấy chi tiết 1 đơn hàng */
export async function fetchOrder(id) {
  const { data } = await api.get(`/orders/${id}/`)
  return data
}

/** Hủy đơn hàng */
export async function cancelOrder(id) {
  const { data } = await api.post(`/orders/${id}/cancel/`)
  return data
}
