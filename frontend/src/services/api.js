import axios from 'axios'
import useAuthStore from '../store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s — Render free tier spin-up mất ~30-40s
})

// Auto retry 1 lần nếu timeout (server đang wake up)
api.interceptors.response.use(
  res => res,
  async err => {
    const isTimeout = err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')
    if (isTimeout && !err.config._retried) {
      err.config._retried = true
      err.config.timeout  = 90000 // retry với timeout dài hơn
      return api(err.config)
    }
    return Promise.reject(err)
  }
)

// Gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Xử lý 401 — thử refresh token
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = useAuthStore.getState().refreshToken
        const refreshBase = import.meta.env.VITE_API_URL
          ? `${import.meta.env.VITE_API_URL}/api/v1`
          : '/api/v1'
        const { data } = await axios.post(`${refreshBase}/auth/login/refresh/`, { refresh })
        useAuthStore.getState().login(
          useAuthStore.getState().user,
          { access: data.access, refresh: data.refresh ?? refresh }
        )
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
