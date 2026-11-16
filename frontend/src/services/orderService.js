import api from './api'

export const fetchOrders = (params = {}) =>
  api.get('/orders/', { params }).then((res) => res.data)

export const fetchOrderDetail = (id) =>
  api.get(`/orders/${id}/`).then((res) => res.data)

export const createOrder = (data) =>
  api.post('/orders/create/', data).then((res) => res.data)

export const cancelOrder = (id) =>
  api.post(`/orders/${id}/cancel/`).then((res) => res.data)

export const fetchAvailableCoupons = () =>
  api.get('/orders/validate-coupon/').then((res) => res.data)

export const validateCoupon = (code, subtotal) =>
  api.post('/orders/validate-coupon/', { code, subtotal }).then((res) => res.data)
