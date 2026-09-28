import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Smartphone, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const login    = useAuthStore(s => s.login)
  const [form, setForm]       = useState({ full_name: '', email: '', phone: '', password: '', password2: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(err => ({ ...err, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.full_name.trim())        errs.full_name = 'Vui lòng nhập họ tên'
    if (!form.email.includes('@'))     errs.email     = 'Email không hợp lệ'
    if (form.password.length < 8)      errs.password  = 'Mật khẩu ít nhất 8 ký tự'
    if (form.password !== form.password2) errs.password2 = 'Mật khẩu xác nhận không khớp'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 800))
      // TODO: Replace with real API → api.post('/auth/register/', form)
      login(
        { id: Date.now(), email: form.email, full_name: form.full_name, phone: form.phone, role: 'user' },
        { access: 'demo-access-token', refresh: 'demo-refresh-token' }
      )
      toast.success('Đăng ký thành công! Chào mừng bạn đến PhoneStore 🎉')
      navigate('/')
    } catch {
      toast.error('Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ icon: Icon, name, type = 'text', placeholder, label, extra }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type={name.includes('password') ? (showPass ? 'text' : 'password') : type}
          name={name} value={form[name]} onChange={handleChange}
          placeholder={placeholder}
          className={`input pl-10 ${errors[name] ? 'border-red-400 focus:ring-red-400' : ''} ${name === 'password2' ? 'pr-10' : ''}`}
          autoComplete={name === 'password' ? 'new-password' : name}
        />
        {name === 'password' && (
          <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
            <p className="text-gray-500 text-sm mt-1">Tham gia PhoneStore ngay hôm nay</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field icon={User}  name="full_name" placeholder="Nguyễn Văn A"       label="Họ và tên *" />
            <Field icon={Mail}  name="email"     type="email" placeholder="ban@example.com" label="Email *" />
            <Field icon={Phone} name="phone"     type="tel" placeholder="0901234567" label="Số điện thoại" />
            <Field icon={Lock}  name="password"  placeholder="Tối thiểu 8 ký tự"  label="Mật khẩu *" />
            <Field icon={Lock}  name="password2" placeholder="Nhập lại mật khẩu"  label="Xác nhận mật khẩu *" />

            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input type="checkbox" required className="accent-primary-600 w-4 h-4 mt-0.5 rounded flex-shrink-0" />
              <span className="text-sm text-gray-600">
                Tôi đồng ý với{' '}
                <a href="#" className="text-primary-600 hover:underline">Điều khoản dịch vụ</a>
                {' '}và{' '}
                <a href="#" className="text-primary-600 hover:underline">Chính sách bảo mật</a>
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Đang đăng ký...
                </span>
              ) : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
