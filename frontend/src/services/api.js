import axios from 'axios'
import useAuthStore from '../store/authStore'

// Production Docker: ưu tiên relative /api/v1 (nginx proxy) nếu không set VITE_API_URL
// Dev: Vite proxy /api → localhost:8000
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/v1`
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

const isAuthEndpoint = (url = '') =>
  /\/auth\/(login|register|login\/refresh)\/?/.test(url)

/**
 * Đổi lỗi axios thành thông báo đúng nguyên nhân.
 * Mặc định các trang auth báo "Email hoặc mật khẩu không đúng" cho MỌI lỗi —
 * khiến backend chết (502) cũng bị tưởng là sai mật khẩu.
 */
export function describeApiError(err, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') {
  const status = err?.response?.status
  const code = err?.code

  if (!status) {
    if (code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
      return 'Server phản hồi quá chậm (Render đang khởi động lại). Đợi ~30 giây rồi thử lại.'
    }
    if (code === 'ERR_NETWORK') {
      return 'Không kết nối được backend. Kiểm tra service backend còn chạy trên Render.'
    }
    return fallback
  }

  if (status === 401) return 'Email hoặc mật khẩu không đúng.'
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.'
  if (status === 404 && typeof err.response.data === 'string') {
    return 'Backend không trả về API (404) — biến BACKEND_URL của frontend đang trỏ sai tên service.'
  }
  if ([500, 502, 503, 504].includes(status)) {
    return `Backend đang lỗi (HTTP ${status}). Mở log service backend trên Render để xem nguyên nhân.`
  }
  return fallback
}

// Xử lý 401 — thử refresh token (bỏ qua login/register để không nuốt lỗi đăng nhập)
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
