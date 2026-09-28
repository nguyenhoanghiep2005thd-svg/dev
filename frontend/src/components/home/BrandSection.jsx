import { Link } from 'react-router-dom'
import { brands } from '../../data/mockData'

// SVG logos inline để không cần file ảnh ngoài
const BrandLogo = ({ name }) => {
  const logos = {
    Apple: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
    Samsung: (
      <svg viewBox="0 0 100 30" className="w-20 h-6" fill="currentColor">
        <text x="0" y="24" fontSize="24" fontWeight="700" fontFamily="Arial">SAMSUNG</text>
      </svg>
    ),
    Xiaomi: (
      <svg viewBox="0 0 80 30" className="w-16 h-7" fill="currentColor">
        <text x="0" y="24" fontSize="22" fontWeight="700" fontFamily="Arial">Xiaomi</text>
      </svg>
    ),
    OPPO: (
      <svg viewBox="0 0 60 30" className="w-14 h-7" fill="currentColor">
        <text x="0" y="24" fontSize="22" fontWeight="700" fontFamily="Arial">OPPO</text>
      </svg>
    ),
    Vivo: (
      <svg viewBox="0 0 50 30" className="w-12 h-7" fill="currentColor">
        <text x="0" y="24" fontSize="22" fontWeight="700" fontFamily="Arial">vivo</text>
      </svg>
    ),
    Google: (
      <svg viewBox="0 0 74 24" className="w-16 h-6">
        <text x="0" y="20" fontSize="20" fontWeight="700" fontFamily="Arial" fill="#4285F4">G</text>
        <text x="16" y="20" fontSize="20" fontWeight="400" fontFamily="Arial" fill="#EA4335">o</text>
        <text x="28" y="20" fontSize="20" fontWeight="400" fontFamily="Arial" fill="#FBBC05">o</text>
        <text x="40" y="20" fontSize="20" fontWeight="400" fontFamily="Arial" fill="#4285F4">g</text>
        <text x="52" y="20" fontSize="20" fontWeight="400" fontFamily="Arial" fill="#34A853">l</text>
        <text x="59" y="20" fontSize="20" fontWeight="400" fontFamily="Arial" fill="#EA4335">e</text>
      </svg>
    ),
  }
  return logos[name] || <span className="text-lg font-bold">{name}</span>
}

export default function BrandSection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="section-title">Thương hiệu nổi bật</h2>
          <p className="text-gray-500 mt-2 text-sm">Chọn thương hiệu yêu thích của bạn</p>
        </div>

        {/* Brand grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/products?brand_slug=${brand.slug}`}
              className="group card flex flex-col items-center justify-center gap-3 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Logo container */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: brand.bg, color: brand.color }}
              >
                <BrandLogo name={brand.name} />
              </div>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
