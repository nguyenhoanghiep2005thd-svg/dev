import axios from 'axios'
import useAuthStore from '../store/authStore'

// Production (Render): VITE_API_URL = https://phonestore-backend.onrender.com
// Local Docker:        VITE_API_URL không set → dùng relative '/api/v1' (nginx proxy)
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

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
        const { data } = await axios.post('/api/v1/auth/login/refresh/', { refresh })
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
