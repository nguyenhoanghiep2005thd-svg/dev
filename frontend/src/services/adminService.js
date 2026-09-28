import api from './api'

/* ── Dashboard ── */
export const fetchStats = () =>
  api.get('/orders/admin/stats/').then(r => r.data)

/* ── Products ── */
export const adminFetchProducts = (params = {}) =>
  api.get('/products/', { params: { page_size: 20, ...params } }).then(r => r.data)

export const adminCreateProduct = (data) =>
  api.post('/products/', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)

export const adminUpdateProduct = (id, data) =>
  api.patch(`/products/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)

export const adminDeleteProduct = (id) =>
  api.delete(`/products/${id}/`).then(r => r.data)

export const adminUploadImage = (productId, formData) =>
  api.post(`/products/${productId}/images/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)

export const adminDeleteImage = (imageId) =>
  api.delete(`/products/images/${imageId}/`).then(r => r.data)

export const adminFetchBrands = () =>
  api.get('/products/brands/?page_size=100').then(r => r.data.results ?? r.data)

export const adminFetchCategories = () =>
  api.get('/products/categories/?page_size=100').then(r => r.data.results ?? r.data)

/* ── Orders ── */
export const adminFetchOrders = (params = {}) =>
  api.get('/orders/admin/', { params: { page_size: 20, ...params } }).then(r => r.data)

export const adminFetchOrder = (id) =>
  api.get(`/orders/admin/${id}/`).then(r => r.data)

export const adminUpdateOrderStatus = (id, status) =>
  api.patch(`/orders/admin/${id}/`, { status }).then(r => r.data)

/* ── Users ── */
export const adminFetchUsers = (params = {}) =>
  api.get('/auth/admin/users/', { params: { page_size: 20, ...params } }).then(r => r.data)

export const adminUpdateUser = (id, data) =>
  api.patch(`/auth/admin/users/${id}/`, data).then(r => r.data)

export const adminDeleteUser = (id) =>
  api.delete(`/auth/admin/users/${id}/`).then(r => r.data)
