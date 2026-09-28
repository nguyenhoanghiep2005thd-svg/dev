import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Clock } from 'lucide-react'
import SectionHeader from './SectionHeader'
import ProductCard from '../product/ProductCard'
import { hotProducts } from '../../data/mockData'

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

// Countdown timer component
function CountdownTimer() {
  return (
    <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
      <Clock className="w-4 h-4 text-red-500" />
      <span className="text-xs text-red-600 font-medium">Flash sale kết thúc sau:</span>
      {['07', '23', '45'].map((n, i) => (
        <span key={i} className="flex items-center gap-0.5">
          <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded min-w-[26px] text-center">{n}</span>
          {i < 2 && <span className="text-red-400 font-bold text-xs">:</span>}
        </span>
      ))}
    </div>
  )
}

export default function HotProducts() {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? hotProducts : hotProducts.slice(0, 4)

  return (
    <section className="py-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header with countdown */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-6 bg-red-500 rounded-full" />
              <h2 className="section-title">
                <span className="flex items-center gap-2">
                  Bán chạy nhất
                  <Flame className="w-7 h-7 text-red-500 fill-red-400" />
                </span>
              </h2>
            </div>
            <p className="text-gray-500 text-sm ml-4">Được khách hàng mua nhiều nhất tuần này</p>
          </div>
          <CountdownTimer />
        </div>

        {/* Rank + product layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* #1 hero product */}
          {hotProducts[0] && (
            <div className="lg:col-span-1 card overflow-hidden group hover:shadow-lg transition-shadow">
              <Link to={`/products/${hotProducts[0].id}`} className="block">
                <div className="relative bg-gradient-to-br from-primary-50 to-blue-50 aspect-square sm:aspect-[4/3] lg:aspect-square overflow-hidden">
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                      🏆 #1 BÁN CHẠY
                    </span>
                    {hotProducts[0].discount_percent > 0 && (
                      <span className="badge-sale">-{hotProducts[0].discount_percent}%</span>
                    )}
                  </div>
                  <img
                    src={hotProducts[0].primary_image}
                    alt={hotProducts[0].name}
                    className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-primary-600 font-semibold uppercase mb-1">{hotProducts[0].brand_name}</p>
                  <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-primary-600 transition-colors">
                    {hotProducts[0].name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="price-current text-xl">{formatPrice(hotProducts[0].current_price)}</span>
                    {hotProducts[0].sale_price && (
                      <span className="price-original">{formatPrice(hotProducts[0].price)}</span>
                    )}
                  </div>
                  <div className="mt-3 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '73%' }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Đã bán: 73%</p>
                </div>
              </Link>
            </div>
          )}

          {/* Rest of hot products */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3">
            {visible.slice(1).map((product, idx) => (
              <div key={product.id} className="relative">
                <span className="absolute top-2 left-2 z-10 bg-gray-800/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  #{idx + 2}
                </span>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Show more / View all */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {!showAll && hotProducts.length > 4 && (
            <button
              onClick={() => setShowAll(true)}
              className="btn-outline px-8 py-3 text-sm"
            >
              Xem thêm ({hotProducts.length - 4} sản phẩm)
            </button>
          )}
          <Link to="/products" className="btn-primary px-8 py-3 text-sm">
            Xem tất cả sản phẩm bán chạy
          </Link>
        </div>
      </div>
    </section>
  )
}
