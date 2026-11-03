import axios from 'axios'
import useAuthStore from '../store/authStore'

// API luôn cùng origin với trang: dev → vite proxy, Docker/Render → nginx proxy (/api/).
// Không đọc VITE_API_URL lúc build: một giá trị sai trên dashboard Render bị nhúng thẳng
// vào bundle và làm MỌI request treo vô hạn (đăng nhập/đăng ký không bao giờ trả lời).
const BASE_URL = '/api/v1'

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

    // Render free tier: request tới instance đang ngủ bị edge trả 429 ngay,
    // nhưng chính request đó đã đánh thức service → chờ 1 nhịp rồi thử lại 1 lần.
    if (err?.response?.status === 429 && err.config && !err.config._retried429) {
      err.config._retried429 = true
      await new Promise(r => setTimeout(r, 12000))
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
  const body = err?.response?.data

  // Render đứng sau Cloudflare. Khi host bị giới hạn request, edge trả về trang
  // "Just a moment…" (HTML) thay vì JSON của Django — triệu chứng: đăng nhập/đăng ký
  // báo lỗi lạ dù backend vẫn sống.
  if (typeof body === 'string' && body.includes('Just a moment')) {
    return 'Cloudflare đang chặn request (chưa tới được backend). Chờ 1–2 phút rồi thử lại.'
  }

  if (!status) {
    if (code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
      return 'Server phản hồi quá chậm (Render đang khởi động lại). Đợi ~30 giây rồi thử lại.'
    }
    if (code === 'ERR_NETWORK') {
      return 'Không kết nối được backend. Kiểm tra service backend còn chạy trên Render.'
    }
    return fallback
  }

  if (status === 429) {
    return 'Quá nhiều request nên Render tạm chặn (HTTP 429). Chờ 1–2 phút rồi thử lại.'
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
