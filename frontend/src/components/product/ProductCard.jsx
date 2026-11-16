import { Link } from 'react-router-dom'
import { ShoppingCart, Eye, Heart, Star, Zap, CheckCircle, XCircle } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import useWishlistStore from '../../store/wishlistStore'
import toast from 'react-hot-toast'

const fmt = n =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

function specTag(val) {
  if (!val) return null
  return Array.isArray(val) ? val[0] : String(val)
}

export default function ProductCard({ product, className = '' }) {
  const { addItem } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlistStore()

  const currentPrice = product.current_price ?? product.price
  const hasDiscount  = (product.discount_percent ?? 0) > 0
  const isOutOfStock = !product.in_stock || product.stock === 0
  const ram          = specTag(product.specs?.ram)
  const storage      = specTag(product.specs?.storage)
  const isFav        = isWishlisted(product.id)
  const rating       = product.avg_rating || 5.0
  const reviewsCount = product.review_count || 12

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    await addItem(product, 1)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleWishlist(product)
    toast.success(added ? `Đã lưu "${product.name}" vào yêu thích!` : `Đã bỏ "${product.name}" khỏi yêu thích!`)
  }

  return (
    <div className={`card group flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 ${isOutOfStock ? 'opacity-75' : ''} ${className}`}>

      {/* Image */}
      <Link
        to={`/products/${product.id}`}
        className="relative block bg-gray-50 overflow-hidden aspect-square"
      >
        <img
          src={product.primary_image || `https://placehold.co/300x300/f5f5f5/999999?text=${encodeURIComponent(product.name ?? 'SP')}`}
          alt={product.name}
          loading="lazy"
          onError={e => { e.target.src = `https://placehold.co/300x300/f5f5f5/999999?text=${encodeURIComponent(product.name ?? 'SP')}` }}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {hasDiscount && <span className="badge-sale">-{product.discount_percent}%</span>}
          {product.is_new && !hasDiscount && <span className="badge-new">MỚI</span>}
          {product.is_hot && (
            <span className="badge-hot inline-flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" />HOT
            </span>
          )}
        </div>

        {/* Wishlist toggle */}
        <button
          onClick={handleWishlist}
          aria-label="Yêu thích"
          title={isFav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full shadow-sm z-10
                     flex items-center justify-center transition-all ${
                       isFav
                         ? 'bg-red-50 text-red-500 opacity-100'
                         : 'bg-white/90 backdrop-blur-sm text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-white'
                     }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              Hết hàng
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5 justify-between">
        <div>
          <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wide mb-1 block">
            {product.brand_name || 'Smartphone'}
          </span>

          <Link
            to={`/products/${product.id}`}
            className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-2
                       hover:text-primary-600 transition-colors"
          >
            {product.name}
          </Link>

          {/* Spec chips */}
          {(ram || storage) && (
            <div className="flex flex-wrap gap-1 mb-2">
              {ram && (
                <span className="text-[10px] bg-blue-50 text-blue-600 font-medium px-1.5 py-0.5 rounded border border-blue-100">
                  RAM {ram}
                </span>
              )}
              {storage && (
                <span className="text-[10px] bg-purple-50 text-purple-600 font-medium px-1.5 py-0.5 rounded border border-purple-100">
                  {storage}
                </span>
              )}
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-semibold text-gray-700">{rating}</span>
            <span className="text-[11px] text-gray-400">({reviewsCount} đánh giá)</span>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-1 mb-2">
            {isOutOfStock
              ? <XCircle className="w-3 h-3 text-red-400" />
              : <CheckCircle className="w-3 h-3 text-green-500" />
            }
            <span className={`text-[10px] font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
              {isOutOfStock ? 'Tạm hết hàng' : `Còn hàng (${product.stock})`}
            </span>
          </div>
        </div>

        {/* Price & Actions */}
        <div>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-base font-extrabold text-red-600">{fmt(currentPrice)}</span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">{fmt(product.price)}</span>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                          text-xs font-semibold transition-all duration-200
                          ${isOutOfStock
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95 shadow-sm shadow-primary-200'
                          }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Thêm vào giỏ</span>
            </button>

            <Link
              to={`/products/${product.id}`}
              title="Xem chi tiết"
              className="flex items-center justify-center p-2.5 rounded-xl
                         border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-all"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
