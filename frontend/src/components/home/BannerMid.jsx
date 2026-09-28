import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const banners = [
  {
    title: 'iPhone 15 Series',
    desc: 'Dynamic Island. USB-C. Camera 48MP.',
    cta: 'Khám phá ngay',
    to: '/products?brand_slug=apple',
    bg: 'from-slate-900 to-gray-800',
    img: 'https://images.unsplash.com/photo-1679761478891-50c4d3f0f69c?w=400&q=80',
    badge: 'Apple',
    badgeColor: 'bg-white/20 text-white',
  },
  {
    title: 'Samsung Galaxy AI',
    desc: 'Circle to Search. Live Translate. AI tích hợp.',
    cta: 'Mua ngay',
    to: '/products?brand_slug=samsung',
    bg: 'from-blue-900 to-indigo-800',
    img: 'https://images.unsplash.com/photo-1706789578150-4ebcc52e0e3d?w=400&q=80',
    badge: 'Samsung',
    badgeColor: 'bg-white/20 text-white',
  },
  {
    title: 'Giá tốt dưới 5 triệu',
    desc: 'Điện thoại phổ thông, chất lượng cao.',
    cta: 'Xem ngay',
    to: '/products?category_slug=gia-re',
    bg: 'from-orange-600 to-red-600',
    img: 'https://images.unsplash.com/photo-1603732551658-5fabbebb14ea?w=400&q=80',
    badge: 'Giá rẻ',
    badgeColor: 'bg-white/20 text-white',
  },
]

export default function BannerMid() {
  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {banners.map((b) => (
            <Link
              key={b.title}
              to={b.to}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${b.bg} p-6 flex gap-4 items-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}
            >
              {/* Text */}
              <div className="flex-1 text-white z-10">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${b.badgeColor} mb-2 inline-block`}>
                  {b.badge}
                </span>
                <h3 className="text-lg font-bold leading-tight mb-1">{b.title}</h3>
                <p className="text-white/70 text-xs mb-3 leading-relaxed">{b.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:gap-2.5 transition-all">
                  {b.cta} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Image */}
              <div className="w-24 flex-shrink-0">
                <img
                  src={b.img}
                  alt={b.title}
                  className="w-full h-24 object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Decorative circle */}
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full" />
              <div className="absolute -right-2 -bottom-8 w-24 h-24 bg-white/5 rounded-full" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
