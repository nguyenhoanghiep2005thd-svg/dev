import { BadgeCheck, Zap, HeartHandshake, Award } from 'lucide-react'

const items = [
  {
    icon: BadgeCheck,
    color: 'bg-blue-100 text-blue-600',
    title: '100% Hàng Chính Hãng',
    desc: 'Tất cả sản phẩm đều có tem chính hãng, hoá đơn VAT đầy đủ, nguồn gốc rõ ràng từ nhà phân phối chính thức.',
  },
  {
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-600',
    title: 'Giao Hàng Siêu Tốc',
    desc: 'Giao trong 2 giờ nội thành TP.HCM và Hà Nội. Toàn quốc trong 1–3 ngày làm việc qua đối tác vận chuyển uy tín.',
  },
  {
    icon: HeartHandshake,
    color: 'bg-green-100 text-green-600',
    title: 'Bảo Hành 12 Tháng',
    desc: 'Bảo hành chính hãng 12 tháng. Lỗi trong 7 ngày đầu đổi máy mới ngay tại cửa hàng, không câu hỏi.',
  },
  {
    icon: Award,
    color: 'bg-purple-100 text-purple-600',
    title: 'Giá Tốt Nhất Thị Trường',
    desc: 'Cam kết giá tốt nhất. Tìm thấy nơi rẻ hơn, chúng tôi hoàn tiền phần chênh lệch ngay lập tức.',
  },
]

export default function WhyUs() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="section-title">Tại sao chọn PhoneStore?</h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">
            Hơn 10 năm kinh nghiệm, hơn 500.000 khách hàng tin tưởng
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="card p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-base">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
            {[
              { value: '500K+', label: 'Khách hàng' },
              { value: '10+',   label: 'Năm kinh nghiệm' },
              { value: '50+',   label: 'Chi nhánh' },
              { value: '4.9★',  label: 'Đánh giá trung bình' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-extrabold mb-1">{value}</div>
                <div className="text-white/70 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
