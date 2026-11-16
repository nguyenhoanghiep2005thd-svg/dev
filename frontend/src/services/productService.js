import api from './api'

export const fetchProducts = (params = {}) =>
  api.get('/products/', { params }).then((res) => res.data)

export const fetchProductDetail = (id) =>
  api.get(`/products/${id}/`).then((res) => res.data)

export const fetchBrands = () =>
  api.get('/products/brands/').then((res) => res.data.results ?? res.data)

export const fetchCategories = () =>
  api.get('/products/categories/').then((res) => res.data.results ?? res.data)

export const fetchProductReviews = (productId) =>
  api.get(`/products/${productId}/reviews/`).then((res) => res.data.results ?? res.data)

export const createProductReview = (productId, data) =>
  api.post(`/products/${productId}/reviews/`, data).then((res) => res.data)
