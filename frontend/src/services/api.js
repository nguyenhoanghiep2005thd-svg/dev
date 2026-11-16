import axios from 'axios'
import useAuthStore from '../store/authStore'

// Nếu có biến VITE_API_URL thì dùng trực tiếp (hỗ trợ static hosting Vercel/Render static)
// Nếu không thì dùng relative '/api/v1' (nginx proxy trên Render docker / dev proxy)
const ENV_API_URL = import.meta.env.VITE_API_URL
const BASE_URL = ENV_API_URL ? `${ENV_API_URL.replace(/\/+$/, '')}/api/v1` : '/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
})

api.interceptors.response.use(
  res => res,
  async err => {
    const isTimeout = err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')
    if (isTimeout && !err.config._retried) {
      err.config._retried = true
      err.config.timeout = 90000
      return api(err.config)
    }

    if (err?.response?.status === 429 && err.config && !err.config._retried429) {
      err.config._retried429 = true
      await new Promise(r => setTimeout(r, 12000))
      return api(err.config)
    }

    return Promise.reject(err)
  }
)

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const isAuthEndpoint = (url = '') =>
  /\/auth\/(login|register|login\/refresh)\/?/.test(url)

export function describeApiError(err, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') {
  const status = err?.response?.status
  const code = err?.code
  const body = err?.response?.data

  if (typeof body === 'string' && body.includes('Just a moment')) {
    return 'Hệ thống bảo mật đang kiểm tra. Vui lòng thử lại sau 1 phút.'
  }

  if (!status) {
    if (code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
      return 'Server phản hồi chậm do đang khởi động lại. Vui lòng đợi ~30 giây rồi thử lại.'
    }
    if (code === 'ERR_NETWORK') {
      return 'Không kết nối được server backend. Kiểm tra kết nối mạng hoặc dịch vụ backend.'
    }
    return fallback
  }

  if (status === 429) {
    return 'Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.'
  }
  if (status === 401) return 'Email hoặc mật khẩu không đúng.'
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.'
  if (status === 404 && typeof err.response.data === 'string') {
    return 'Không tìm thấy API backend (404).'
  }
  if ([500, 502, 503, 504].includes(status)) {
    return `Server backend đang bảo trì hoặc gặp sự cố (HTTP ${status}).`
  }
  return fallback
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint(original.url)
    ) {
      original._retry = true
      try {
        const refresh = useAuthStore.getState().refreshToken
        if (!refresh || refresh === 'demo-refresh') throw new Error('no refresh')

        const { data } = await axios.post(`${BASE_URL}/auth/login/refresh/`, { refresh })
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
