import axios from 'axios'
import useAuthStore from '../store/authStore'

const api = axios.create({
  baseURL: '/api/v1',
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
