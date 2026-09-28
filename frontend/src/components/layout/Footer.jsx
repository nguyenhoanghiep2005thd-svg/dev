import { Link } from 'react-router-dom'
import { Smartphone, Phone, Mail, MapPin, Facebook, Youtube, Instagram } from 'lucide-react'

const footerLinks = {
  'Sản phẩm': [
    { label: 'iPhone',         to: '/products?brand_slug=apple' },
    { label: 'Samsung Galaxy', to: '/products?brand_slug=samsung' },
    { label: 'Xiaomi',         to: '/products?brand_slug=xiaomi' },
    { label: 'OPPO',           to: '/products?brand_slug=oppo' },
    { label: 'Google Pixel',   to: '/products?brand_slug=google' },
  ],
  'Hỗ trợ': [
    { label: 'Hướng dẫn mua hàng', to: '/' },
    { label: 'Chính sách đổi trả', to: '/' },
    { label: 'Bảo hành sản phẩm',  to: '/' },
    { label: 'Câu hỏi thường gặp', to: '/' },
  ],
  'Tài khoản': [
    { label: 'Đăng nhập',       to: '/login' },
    { label: 'Đăng ký',         to: '/register' },
    { label: 'Đơn hàng của tôi', to: '/orders' },
    { label: 'Thông tin cá nhân', to: '/profile' },
  ],
}

const socials = [
  { icon: Facebook,  href: '#', label: 'Facebook' },
  { icon: Youtube,   href: '#', label: 'Youtube' },
  { icon: Instagram, href: '#', label: 'Instagram' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">

      {/* ── Main footer ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Phone<span className="text-primary-400">Store</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              Cửa hàng điện thoại chính hãng — cam kết giá tốt nhất, giao hàng nhanh toàn quốc, bảo hành 12 tháng.
            </p>

            <div className="space-y-2.5 text-sm">
              {[
                { icon: MapPin, text: '123 Nguyễn Huệ, Quận 1, TP.HCM' },
                { icon: Phone,  text: '1800 1234 (miễn phí)' },
                { icon: Mail,   text: 'support@phonestore.vn' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2.5">
                  <Icon className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="flex gap-3 pt-1">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold text-sm mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <span>© 2024 PhoneStore. Bảo lưu mọi quyền.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300 transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Chính sách bảo mật</a>
          </div>
          {/* Payment badges */}
          <div className="flex items-center gap-2">
            {['VISA', 'MC', 'COD', 'MOMO'].map((p) => (
              <span key={p} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-[10px] font-bold">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
