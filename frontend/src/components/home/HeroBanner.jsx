import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

const slides = [
  {
    id: 1,
    badge: 'MỚI RA MẮT',
    title: 'iPhone 15 Pro Max',
    subtitle: 'Titanium. Nhẹ. Bền. Pro.',
    desc: 'Chip A17 Pro mạnh nhất từ trước đến nay. Camera 48MP zoom quang 5x. Cổng USB‑C 3.0.',
    price: '32.990.000₫',
    oldPrice: '34.990.000₫',
    discount: '-6%',
    cta: { label: 'Mua ngay', to: '/products/1' },
    ctaSecond: { label: 'Xem tất cả iPhone', to: '/products?brand_slug=apple' },
    bg: 'from-gray-900 via-slate-800 to-gray-900',
    accent: 'text-blue-400',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=85',
    tag: 'Apple',
  },
  {
    id: 2,
    badge: 'BÁN CHẠY #1',
    title: 'Samsung Galaxy S24 Ultra',
    subtitle: 'S Pen. Galaxy AI. 200MP.',
    desc: 'Snapdragon 8 Gen 3 dành riêng cho Galaxy. Camera 200MP. Zoom quang 10x. Galaxy AI thế hệ mới.',
    price: '30.990.000₫',
    oldPrice: '33.990.000₫',
    discount: '-9%',
    cta: { label: 'Mua ngay', to: '/products/5' },
    ctaSecond: { label: 'Xem tất cả Samsung', to: '/products?brand_slug=samsung' },
    bg: 'from-blue-950 via-indigo-900 to-blue-950',
    accent: 'text-indigo-300',
    image: 'https://images.unsplash.com/photo-1706789578150-4ebcc52e0e3d?w=600&q=85',
    tag: 'Samsung',
  },
  {
    id: 3,
    badge: 'CAMERA LEICA',
    title: 'Xiaomi 14 Ultra',
    subtitle: 'Nhiếp ảnh đỉnh cao.',
    desc: 'Leica Summilux 1 inch, 4 camera 50MP, chip Snapdragon 8 Gen 3, sạc siêu nhanh 90W.',
    price: '27.990.000₫',
    oldPrice: '29.990.000₫',
    discount: '-7%',
    cta: { label: 'Mua ngay', to: '/products/9' },
    ctaSecond: { label: 'Xem tất cả Xiaomi', to: '/products?brand_slug=xiaomi' },
    bg: 'from-orange-950 via-rose-900 to-orange-950',
    accent: 'text-orange-300',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=85',
    tag: 'Xiaomi',
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [paused,  setPaused]  = useState(false)

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next, paused])

  const slide = slides[current]

  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br ${slide.bg} transition-all duration-700`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Banner quảng cáo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center min-h-[480px] md:min-h-[520px] py-10 md:py-0 gap-8">

          {/* Text side */}
          <div className="flex-1 text-white space-y-5 text-center md:text-left animate-slide-up" key={slide.id}>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${slide.accent} border-current bg-white/10`}>
                {slide.badge}
              </span>
              <span className="text-sm text-white/60">{slide.tag}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              {slide.title}
            </h1>
            <p className={`text-xl md:text-2xl font-light ${slide.accent}`}>
              {slide.subtitle}
            </p>
            <p className="text-white/70 text-sm md:text-base max-w-md mx-auto md:mx-0 leading-relaxed">
              {slide.desc}
            </p>

            {/* Price */}
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <span className="text-3xl font-bold">{slide.price}</span>
              <div className="text-left">
                <span className="text-white/50 line-through text-sm block">{slide.oldPrice}</span>
                <span className="text-green-400 text-xs font-bold">{slide.discount}</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-1">
              <Link to={slide.cta.to} className="btn-primary bg-white text-gray-900 hover:bg-gray-100 px-8 py-3.5 text-base">
                {slide.cta.label}
              </Link>
              <Link to={slide.ctaSecond.to} className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium py-3.5 px-2 transition-colors">
                {slide.ctaSecond.label} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Image side */}
          <div className="flex-1 flex justify-center md:justify-end max-w-xs md:max-w-sm lg:max-w-md">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl opacity-30 bg-white rounded-full scale-75" />
              <img
                key={slide.id}
                src={slide.image}
                alt={slide.title}
                className="relative w-full max-h-96 object-contain drop-shadow-2xl animate-fade-in"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white transition-all"
        aria-label="Slide trước"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white transition-all"
        aria-label="Slide sau"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
