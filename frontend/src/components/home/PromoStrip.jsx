import { Truck, ShieldCheck, RefreshCcw, Headphones } from 'lucide-react'

const promos = [
  { icon: Truck,        title: 'Miễn phí vận chuyển',  desc: 'Đơn hàng từ 1 triệu VNĐ' },
  { icon: ShieldCheck,  title: 'Hàng chính hãng 100%', desc: 'Cam kết không hàng nhái' },
  { icon: RefreshCcw,   title: 'Đổi trả trong 7 ngày',  desc: 'Lỗi 1 đổi 1 trong 12 tháng' },
  { icon: Headphones,   title: 'Hỗ trợ 24/7',           desc: 'Hotline: 1800 1234' },
]

export default function PromoStrip() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          {promos.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 px-4 py-4 md:py-5 hover:bg-primary-50 transition-colors group">
              <div className="w-10 h-10 bg-primary-100 group-hover:bg-primary-200 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
