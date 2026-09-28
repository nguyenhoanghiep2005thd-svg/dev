import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Smartphone, Eye, EyeOff, Mail, Lock, ShoppingCart } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const login     = useAuthStore(s => s.login)
  const cartItems = useCartStore(s => s.items)
  const from      = location.state?.from || '/'

  const [form,     setForm]     = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const hasPendingCart = cartItems.length > 0

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.')
      return
    }
    setLoading(true)
    setError('')

    try {
      // ── Gọi API thật ──────────────────────────────────
      let user, tokens
      try {
        const { data } = await api.post('/auth/login/', {
          email:    form.email.trim(),
          password: form.password,
        })
        tokens = { access: data.access, refresh: data.refresh }

        // Lấy thông tin user
        const profileRes = await api.get('/auth/profile/', {
          headers: { Authorization: `Bearer ${tokens.access}` },
        })
        user = profileRes.data
      } catch (apiErr) {
        // ── Fallback demo (khi backend chưa chạy) ──────
        if (apiErr?.code === 'ERR_NETWORK' || apiErr?.code === 'ECONNREFUSED') {
          await new Promise(r => setTimeout(r, 600))
          if (form.email === 'admin@phonestore.vn' && form.password === 'admin123456') {
            user   = { id: 1, email: form.email, full_name: 'Admin', role: 'admin', phone: '' }
            tokens = { access: 'demo-token', refresh: 'demo-refresh' }
          } else if (form.email && form.password.length >= 6) {
            user   = { id: 2, email: form.email, full_name: form.email.split('@')[0], role: 'user', phone: '' }
            tokens = { access: 'demo-token', refresh: 'demo-refresh' }
          } else {
            throw new Error('Email hoặc mật khẩu không đúng.')
          }
        } else {
          const msg = apiErr?.response?.data?.detail
            || apiErr?.response?.data?.non_field_errors?.[0]
            || 'Email hoặc mật khẩu không đúng.'
          throw new Error(msg)
        }
      }

      // Login — authStore tự động sync cart
      await login(user, tokens)

      toast.success(`Chào mừng ${user.full_name}! 👋`)
      navigate(from, { replace: true })

    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-primary-50 via-white to-blue-50
                    flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">

          {/* Logo */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center
                            mx-auto mb-4 shadow-lg shadow-primary-200">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
            <p className="text-gray-500 text-sm mt-1">Chào mừng bạn trở lại PhoneStore</p>
          </div>

          {/* Pending cart notice */}
          {hasPendingCart && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200
                            rounded-xl p-3.5 mb-5">
              <ShoppingCart className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Bạn có <strong>{cartItems.length} sản phẩm</strong> trong giỏ hàng.
                Đăng nhập để lưu và tiếp tục thanh toán.
              </p>
            </div>
          )}

          {/* Demo hint */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-xs text-blue-700">
            <strong>Demo:</strong> admin@phonestore.vn / admin123456
            <span className="text-blue-500"> (hoặc bất kỳ email + mật khẩu ≥6 ký tự)</span>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                            px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <span className="text-red-500 text-base">⚠</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="email" type="email" name="email" required
                  value={form.email} onChange={handleChange}
                  placeholder="ban@example.com"
                  autoComplete="email"
                  className={`input pl-10 ${error ? 'border-red-300' : ''}`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  className="text-xs text-primary-600 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  name="password" required
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`input pl-10 pr-10 ${error ? 'border-red-300' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                             hover:text-gray-600 transition-colors"
                  aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" className="accent-primary-600 w-4 h-4 rounded" />
              <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-1
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
