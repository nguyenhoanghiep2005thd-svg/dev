import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Smartphone, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import api from '../services/api'

/* ── Field component ở NGOÀI RegisterPage — tránh re-mount khi state thay đổi ── */
function Field({ icon: Icon, name, label, type = 'text', placeholder,
                 value, onChange, error, showToggle, showPass, onTogglePass }) {
  const inputType = showToggle
    ? (showPass ? 'text' : 'password')
    : type

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          id={name}
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={name === 'password' || name === 'password2' ? 'new-password' : name}
          className={`input pl-10 ${showToggle ? 'pr-10' : ''} ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onTogglePass}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

/* ── Main page ── */
export default function RegisterPage() {
  const navigate = useNavigate()
  const login    = useAuthStore(s => s.login)

  const [form,     setForm]     = useState({ full_name: '', email: '', phone: '', password: '', password2: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.full_name.trim())           errs.full_name = 'Vui lòng nhập họ tên.'
    if (!form.email.includes('@'))        errs.email     = 'Email không hợp lệ.'
    if (form.password.length < 8)         errs.password  = 'Mật khẩu ít nhất 8 ký tự.'
    if (form.password !== form.password2) errs.password2 = 'Mật khẩu xác nhận không khớp.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      // Gọi API thật
      const { data } = await api.post('/auth/register/', {
        email:     form.email.trim(),
        full_name: form.full_name.trim(),
        phone:     form.phone.trim(),
        password:  form.password,
        password2: form.password2,
      })
      // API trả về { user, tokens }
      login(data.user, data.tokens)
      toast.success('Đăng ký thành công! Chào mừng bạn đến PhoneStore 🎉')
      navigate('/')
    } catch (err) {
      if (err?.code === 'ERR_NETWORK' || err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
        // Timeout hoặc network — thử fallback demo
        if (import.meta.env.DEV || err?.code === 'ERR_NETWORK') {
          login(
            { id: Date.now(), email: form.email, full_name: form.full_name, phone: form.phone, role: 'user' },
            { access: 'demo-token', refresh: 'demo-refresh' }
          )
          toast.success('Đăng ký thành công! (demo mode)')
          navigate('/')
        } else {
          toast.error('Server đang khởi động, vui lòng thử lại sau 30 giây.')
        }
      } else {
        const data = err?.response?.data
        if (data && typeof data === 'object') {
          // Hiển thị lỗi từng field từ backend
          const fieldErrors = {}
          Object.entries(data).forEach(([k, v]) => {
            fieldErrors[k] = Array.isArray(v) ? v[0] : String(v)
          })
          setErrors(fieldErrors)
          toast.error('Vui lòng kiểm tra lại thông tin.')
        } else {
          toast.error('Đăng ký thất bại. Vui lòng thử lại.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { icon: User,  name: 'full_name', label: 'Họ và tên *',        type: 'text',     placeholder: 'Nguyễn Văn A' },
    { icon: Mail,  name: 'email',     label: 'Email *',             type: 'email',    placeholder: 'ban@example.com' },
    { icon: Phone, name: 'phone',     label: 'Số điện thoại',       type: 'tel',      placeholder: '0901234567' },
    { icon: Lock,  name: 'password',  label: 'Mật khẩu *',          type: 'password', placeholder: 'Tối thiểu 8 ký tự', showToggle: true },
    { icon: Lock,  name: 'password2', label: 'Xác nhận mật khẩu *', type: 'password', placeholder: 'Nhập lại mật khẩu', showToggle: true },
  ]

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
            <h1 className="text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
            <p className="text-gray-500 text-sm mt-1">Tham gia PhoneStore ngay hôm nay</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {fields.map(f => (
              <Field
                key={f.name}
                icon={f.icon}
                name={f.name}
                label={f.label}
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={handleChange}
                error={errors[f.name]}
                showToggle={f.showToggle}
                showPass={showPass}
                onTogglePass={() => setShowPass(s => !s)}
              />
            ))}

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox" required
                className="accent-primary-600 w-4 h-4 mt-0.5 rounded flex-shrink-0"
              />
              <span className="text-sm text-gray-600">
                Tôi đồng ý với{' '}
                <a href="#" className="text-primary-600 hover:underline">Điều khoản dịch vụ</a>
                {' '}và{' '}
                <a href="#" className="text-primary-600 hover:underline">Chính sách bảo mật</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Đang kết nối server...
                </span>
              ) : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
