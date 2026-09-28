import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import SectionHeader from './SectionHeader'
import ProductGrid from './ProductGrid'
import { newProducts } from '../../data/mockData'

export default function NewProducts() {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Sản phẩm mới"
          subtitle="Những mẫu điện thoại vừa ra mắt"
          viewAllTo="/products?ordering=-created_at"
          accentColor="bg-green-500"
        />

        {/* Highlight strip */}
        <div className="flex items-center gap-2 mb-6 p-3 bg-green-50 rounded-xl border border-green-100">
          <Sparkles className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">
            Cập nhật liên tục — mẫu mới nhất từ Apple, Samsung, Xiaomi, OPPO, Vivo & Google
          </p>
        </div>

        <ProductGrid products={newProducts} cols={4} />

        <div className="mt-6 text-center sm:hidden">
          <Link to="/products" className="btn-outline px-8 py-3 text-sm">
            Xem tất cả sản phẩm mới
          </Link>
        </div>
      </div>
    </section>
  )
}
