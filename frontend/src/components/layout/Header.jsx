import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Smartphone, ShoppingCart, User, Search, Menu, X,
  ChevronDown, LogOut, Package, Settings, Heart,
} from 'lucide-react'
import useCartStore from '../../store/cartStore'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const navLinks = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Sản phẩm',  to: '/products' },
]

export default function Header() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled,    setScrolled]    = useState(false)
  const userMenuRef = useRef(null)

  const totalItems = useCartStore((s) => s.totalItems())
  const openCart   = useCartStore((s) => s.openCart)
  const { user, isAuthenticated, logout } = useAuthStore()

  // Sticky header shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    toast.success('Đăng xuất thành công!')
    navigate('/')
  }

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm border-b border-gray-100'}`}>

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="bg-primary-700 text-white text-xs py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>🚚 Miễn phí vận chuyển đơn hàng từ 1 triệu VNĐ</span>
          <span>📞 Hotline: <strong>1800 1234</strong> | 8:00 - 22:00 mỗi ngày</span>
        </div>
      </div>

      {/* ── Main header ──────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center group-hover:bg-primary-700 transition-colors">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Phone<span className="text-primary-600">Store</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm iPhone, Samsung, Xiaomi..."
                className="input pl-10 pr-4 h-10 bg-gray-50 border-gray-200 text-sm"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">

            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative btn-ghost p-2.5"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-fade-in">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* User menu */}
            {isAuthenticated() ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600">
                      {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user?.full_name?.split(' ').pop()}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 animate-fade-in z-50">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    {[
                      { icon: User,    label: 'Tài khoản',    to: '/profile' },
                      { icon: Package, label: 'Đơn hàng',     to: '/orders' },
                      { icon: Heart,   label: 'Yêu thích',    to: '/wishlist' },
                      ...(user?.role === 'admin' ? [{ icon: Settings, label: 'Quản trị', to: '/admin' }] : []),
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <item.icon className="w-4 h-4 text-gray-400" />
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm px-4 py-2">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden btn-ghost p-2.5"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm điện thoại..."
              className="input pl-10 h-10 bg-gray-50 text-sm"
            />
          </div>
        </form>
      </div>

      {/* ── Mobile Menu ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 flex gap-2">
              {isAuthenticated() ? (
                <>
                  <Link to="/profile" className="flex-1 btn-outline text-sm py-2.5">Tài khoản</Link>
                  <button onClick={handleLogout} className="flex-1 btn-ghost text-sm text-red-500 py-2.5">Đăng xuất</button>
                </>
              ) : (
                <>
                  <Link to="/login"    className="flex-1 btn-outline text-sm py-2.5">Đăng nhập</Link>
                  <Link to="/register" className="flex-1 btn-primary text-sm py-2.5">Đăng ký</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
