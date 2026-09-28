import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Lock, Save, Package } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuthStore()
  const [form, setForm]   = useState({ full_name: user?.full_name || '', phone: user?.phone || '', address: user?.address || '' })
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated()) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500">Vui lòng đăng nhập để xem trang này.</p>
      <Link to="/login" className="btn-primary px-6 py-3">Đăng nhập</Link>
    </div>
  )

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    updateUser(form)
    toast.success('Cập nhật thông tin thành công!')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tài khoản của tôi</h1>

        <div className="space-y-4">
          {/* Avatar card */}
          <div className="card p-5 flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-primary-600">
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{user?.full_name}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                {user?.role === 'admin' ? 'Admin' : 'Khách hàng'}
              </span>
            </div>
          </div>

          {/* Edit form */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><User className="w-5 h-5 text-primary-500" /> Thông tin cá nhân</h2>
            <form onSubmit={handleSave} className="space-y-4">
              {[
                { icon: User,  name: 'full_name', label: 'Họ và tên',  placeholder: 'Nguyễn Văn A', type: 'text' },
                { icon: Phone, name: 'phone',     label: 'Số điện thoại', placeholder: '0901234567', type: 'tel' },
                { icon: MapPin,name: 'address',   label: 'Địa chỉ',     placeholder: 'Địa chỉ của bạn', type: 'text', isTextarea: true },
              ].map(({ icon: Icon, name, label, placeholder, type, isTextarea }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    {isTextarea ? (
                      <textarea name={name} value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} rows={2} placeholder={placeholder} className="input pl-10 resize-none" />
                    ) : (
                      <input type={type} name={name} value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} placeholder={placeholder} className="input pl-10" />
                    )}
                  </div>
                </div>
              ))}

              {/* Read-only email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (không thể thay đổi)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="email" value={user?.email} readOnly className="input pl-10 bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 gap-2 disabled:opacity-60">
                <Save className="w-4 h-4" />
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/orders" className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Đơn hàng</p>
                <p className="text-xs text-gray-400">3 đơn hàng</p>
              </div>
            </Link>
            <button className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow group text-left">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <Lock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Đổi mật khẩu</p>
                <p className="text-xs text-gray-400">Cập nhật bảo mật</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
