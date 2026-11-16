import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2, ArrowLeft, Zap, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import useWishlistStore from '../store/wishlistStore'
import useCartStore from '../store/cartStore'

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlistStore()
  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = async (product) => {
    const ok = await addItem(product, 1)
    if (ok) {
      toast.success(`Đã thêm ${product.name} vào giỏ hàng!`)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Danh sách yêu thích</h1>
              <p className="text-sm text-gray-500">Bạn đã lưu {items.length} sản phẩm</p>
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Bạn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?')) {
                clearWishlist()
                toast.success('Đã xóa danh sách yêu thích')
              }
            }}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
          </button>
        )}
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="text-center py-20 card p-8 my-8 space-y-4">
          <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Chưa có sản phẩm yêu thích nào</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Hãy khám phá các mẫu điện thoại mới nhất và bấm vào biểu tượng trái tim để lưu lại nhé!
          </p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2 px-6 py-3 mt-4">
            <ShoppingBag className="w-4 h-4" /> Khám phá sản phẩm ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {items.map((product) => {
            const price = product.current_price ?? product.price ?? 0
            const originalPrice = product.price ?? price
            const discount = product.discount_percent ?? (originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0)
            const imgUrl = product.primary_image || product.image_url || 'https://placehold.co/300x300/f5f5f5/999?text=Phone'

            return (
              <div
                key={product.id}
                className="card group hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden border border-gray-100"
              >
                <div className="relative p-4 pb-0">
                  {discount > 0 && (
                    <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      -{discount}%
                    </span>
                  )}
                  <button
                    onClick={() => {
                      removeFromWishlist(product.id)
                      toast.success(`Đã bỏ ${product.name} khỏi yêu thích`)
                    }}
                    title="Bỏ khỏi yêu thích"
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center shadow-sm transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link to={`/products/${product.id}`} className="block overflow-hidden rounded-xl bg-gray-50 aspect-square">
                    <img
                      src={imgUrl}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-primary-600 uppercase tracking-wider">
                      {product.brand_name || 'Smartphone'}
                    </span>
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2 text-sm mt-0.5">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-bold text-base text-red-600">{fmt(price)}</span>
                      {originalPrice > price && (
                        <span className="text-xs text-gray-400 line-through">{fmt(originalPrice)}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="btn-primary flex-1 py-2 text-xs gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Thêm vào giỏ
                    </button>
                    <Link
                      to={`/products/${product.id}`}
                      className="btn-outline px-3 py-2 text-xs"
                      title="Xem chi tiết"
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
