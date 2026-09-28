import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-extrabold text-primary-100 mb-4 select-none">404</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Trang không tồn tại</h1>
      <p className="text-gray-500 mb-8 max-w-sm text-sm">
        Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/" className="btn-primary gap-2 px-6 py-3">
          <Home className="w-4 h-4" /> Về trang chủ
        </Link>
        <Link to="/products" className="btn-outline gap-2 px-6 py-3">
          <Search className="w-4 h-4" /> Tìm sản phẩm
        </Link>
      </div>
    </div>
  )
}
