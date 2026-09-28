import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Menu, X, ChevronRight, LogOut, Bell, Smartphone,
  Tag, BarChart2, Settings,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/admin',          label: 'Dashboard',      Icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Sản phẩm',       Icon: Package },
  { to: '/admin/orders',   label: 'Đơn hàng',       Icon: ShoppingCart },
  { to: '/admin/users',    label: 'Người dùng',      Icon: Users },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate  = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    toast.success('Đã đăng xuất')
    navigate('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-800">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">PhoneStore</p>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
               transition-all duration-150
               ${isActive
                 ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50'
                 : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
            }
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-2">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center
                          text-white font-bold text-sm flex-shrink-0">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm
                     text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex lg:flex-col w-56 bg-gray-900 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar ── */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-60 bg-gray-900 lg:hidden flex flex-col
                            animate-fade-in">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 flex items-center
                           justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg
                         hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <NavLink
              to="/"
              className="text-xs text-gray-500 hover:text-primary-600 flex items-center gap-1"
            >
              ← Về website
            </NavLink>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative w-8 h-8 flex items-center justify-center rounded-lg
                               hover:bg-gray-100 transition-colors">
              <Bell className="w-4.5 h-4.5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center
                            text-white font-bold text-xs">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
