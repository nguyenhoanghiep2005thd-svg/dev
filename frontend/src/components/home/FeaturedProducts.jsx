import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SectionHeader from './SectionHeader'
import ProductGrid from './ProductGrid'
import { products, brands } from '../../data/mockData'

const TABS = [
  { key: 'all', label: 'Tất cả' },
  ...brands.map((b) => ({ key: b.slug, label: b.name })),
]

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState('all')

  const featured = products.filter((p) => p.is_featured)

  const filtered = activeTab === 'all'
    ? featured
    : featured.filter((p) => {
        const brand = brands.find((b) => b.id === p.brand_id)
        return brand?.slug === activeTab
      })

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Sản phẩm nổi bật"
          subtitle="Những sản phẩm được yêu thích nhất"
          viewAllTo="/products"
        />

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <ProductGrid products={filtered} cols={4} />
        ) : (
          <div className="text-center py-12 text-gray-400">
            Không có sản phẩm nổi bật cho hãng này
          </div>
        )}

        {/* Mobile view all */}
        <div className="mt-6 text-center sm:hidden">
          <Link to="/products" className="btn-outline px-8 py-3 text-sm">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    </section>
  )
}
