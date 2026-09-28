import { useState, useEffect, useCallback } from 'react'
import {
  Search, Shield, ShieldOff, Trash2, RefreshCcw,
  Users, Loader2, X, CheckCircle, XCircle, Crown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminFetchUsers, adminUpdateUser, adminDeleteUser } from '../../services/adminService'
import useAuthStore from '../../store/authStore'

const DEMO_USERS = [
  { id:1, email:'admin@phonestore.vn', full_name:'Admin',        phone:'0901234567', role:'admin', is_active:true,  created_at:'2024-01-01T00:00:00Z' },
  { id:2, email:'nguyenvana@gmail.com',full_name:'Nguyễn Văn A', phone:'0912345678', role:'user',  is_active:true,  created_at:'2024-05-10T10:00:00Z' },
  { id:3, email:'tranthib@gmail.com',  full_name:'Trần Thị B',   phone:'0923456789', role:'user',  is_active:true,  created_at:'2024-05-15T14:00:00Z' },
  { id:4, email:'levanc@gmail.com',    full_name:'Lê Văn C',     phone:'0934567890', role:'user',  is_active:false, created_at:'2024-06-01T09:00:00Z' },
  { id:5, email:'phamthid@gmail.com',  full_name:'Phạm Thị D',   phone:'0945678901', role:'user',  is_active:true,  created_at:'2024-06-10T11:00:00Z' },
]

export default function AdminUsers() {
  const currentUser = useAuthStore(s => s.user)

  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all') // all | admin | user | inactive

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      const data = await adminFetchUsers(params)
      setUsers(Array.isArray(data) ? data : data.results ?? DEMO_USERS)
    } catch {
      setUsers(DEMO_USERS)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  /* Toggle active */
  const handleToggleActive = async (user) => {
    if (user.id === currentUser?.id) { toast.error('Không thể tự khóa tài khoản của mình.'); return }
    const newVal = !user.is_active
    try {
      try {
        await adminUpdateUser(user.id, { is_active: newVal })
      } catch (err) {
        if (err?.code !== 'ERR_NETWORK') throw err
      }
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newVal } : u))
      toast.success(newVal ? `Đã mở khóa ${user.full_name}` : `Đã khóa ${user.full_name}`)
    } catch {
      toast.error('Không thể cập nhật trạng thái tài khoản.')
    }
  }

  /* Toggle role */
  const handleToggleRole = async (user) => {
    if (user.id === currentUser?.id) { toast.error('Không thể đổi quyền của chính mình.'); return }
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    if (!window.confirm(`Đổi quyền ${user.full_name} thành "${newRole === 'admin' ? 'Admin' : 'User'}"?`)) return
    try {
      try {
        await adminUpdateUser(user.id, { role: newRole })
      } catch (err) {
        if (err?.code !== 'ERR_NETWORK') throw err
      }
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
      toast.success(`Đã đổi quyền thành ${newRole}`)
    } catch {
      toast.error('Không thể đổi quyền tài khoản.')
    }
  }

  /* Delete */
  const handleDelete = async (user) => {
    if (user.id === currentUser?.id) { toast.error('Không thể xóa tài khoản của mình.'); return }
    if (!window.confirm(`Xóa tài khoản "${user.full_name}" (${user.email})? Không thể hoàn tác.`)) return
    try {
      try {
        await adminDeleteUser(user.id)
      } catch (err) {
        if (err?.code !== 'ERR_NETWORK') throw err
      }
      setUsers(prev => prev.filter(u => u.id !== user.id))
      toast.success('Đã xóa tài khoản.')
    } catch {
      toast.error('Không thể xóa tài khoản.')
    }
  }

  const filtered = users.filter(u => {
    if (filter === 'admin')    return u.role === 'admin'
    if (filter === 'user')     return u.role === 'user'
    if (filter === 'inactive') return !u.is_active
    return true
  })

  const counts = {
    all:      users.length,
    admin:    users.filter(u => u.role === 'admin').length,
    user:     users.filter(u => u.role === 'user').length,
    inactive: users.filter(u => !u.is_active).length,
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500">{users.length} tài khoản</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600
                     px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <RefreshCcw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm email, tên..."
            className="input pl-9 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { k: 'all',      l: 'Tất cả' },
            { k: 'admin',    l: 'Admin' },
            { k: 'user',     l: 'User' },
            { k: 'inactive', l: 'Bị khóa' },
          ].map(({ k, l }) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                         border transition-all
                         ${filter === k ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 bg-white hover:border-primary-300'}`}>
              {l}
              {counts[k] > 0 && (
                <span className={`text-[10px] font-bold px-1 rounded-full
                                 ${filter === k ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {counts[k]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary-500" />Đang tải...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Người dùng', 'Email', 'Điện thoại', 'Quyền', 'Trạng thái', 'Ngày đăng ký', 'Thao tác'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => {
                  const isSelf = user.id === currentUser?.id
                  return (
                    <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors ${!user.is_active ? 'opacity-60' : ''}`}>
                      {/* Avatar + name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                          text-white font-bold text-xs flex-shrink-0
                                          ${user.role === 'admin' ? 'bg-purple-600' : 'bg-primary-500'}`}>
                            {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 flex items-center gap-1">
                              {user.full_name}
                              {isSelf && <span className="text-[10px] bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full font-medium">Bạn</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4 text-gray-600">{user.phone || '—'}</td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold
                                         px-2 py-1 rounded-full
                                         ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                          {user.role === 'admin' ? <Crown className="w-3 h-3" /> : null}
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold
                                         px-2 py-1 rounded-full
                                         ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {user.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {user.is_active ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {/* Lock / Unlock */}
                          <button
                            onClick={() => handleToggleActive(user)}
                            disabled={isSelf}
                            title={user.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors
                                       disabled:opacity-30 disabled:cursor-not-allowed
                                       ${user.is_active
                                         ? 'bg-orange-50 text-orange-500 hover:bg-orange-100'
                                         : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          >
                            {user.is_active ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                          </button>

                          {/* Role toggle */}
                          <button
                            onClick={() => handleToggleRole(user)}
                            disabled={isSelf}
                            title={user.role === 'admin' ? 'Hạ xuống User' : 'Nâng lên Admin'}
                            className="w-7 h-7 flex items-center justify-center rounded-lg
                                       bg-purple-50 text-purple-600 hover:bg-purple-100
                                       transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Crown className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={isSelf}
                            title="Xóa tài khoản"
                            className="w-7 h-7 flex items-center justify-center rounded-lg
                                       bg-red-50 text-red-500 hover:bg-red-100
                                       transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                <p>Không có người dùng nào</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
