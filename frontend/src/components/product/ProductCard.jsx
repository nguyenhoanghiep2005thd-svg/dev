import { Link } from 'react-router-dom'
import { ShoppingCart, Eye, Heart, Star, Zap, CheckCircle, XCircle } from 'lucide-react'
import { useCart } from '../../hooks/useCart'

const fmt = n =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

function specTag(val) {
  if (!val) return null
  return Array.isArray(val) ? val[0] : String(val)
}

export default function ProductCard({ product, className = '' }) {
  const { addItem, openCart } = useCart()

  const currentPrice = product.current_price ?? product.price
  const hasDiscount  = (product.discount_percent ?? 0) > 0
  const isOutOfStock = !product.in_stock || product.stock === 0
  const ram          = specTag(product.specs?.ram)
  const storage      = specTag(product.specs?.storage)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    await addItem(product, 1)
  }

  return (
    <div className={`card group flex flex-col overflow-hidden ${isOutOfStock ? 'opacity-75' : ''} ${className}`}>

      {/* Image */}
      <Link
        to={`/products/${product.id}`}
        className="relative block bg-gray-50 overflow-hidden aspect-square"
      >
        <img
          src={product.primary_image || `https://placehold.co/300x300/f5f5f5/999?text=${encodeURIComponent(product.name ?? '')}`}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && <span className="badge-sale">-{product.discount_percent}%</span>}
          {product.is_new && !hasDiscount && <span className="badge-new">MỚI</span>}
          {product.is_hot && (
            <span className="badge-hot inline-flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" />HOT
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation() }}
          aria-label="Yêu thích"
          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow-sm
                     flex items-center justify-center text-gray-300
                     opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
        >
          <Heart className="w-3.5 h-3.5" />
        </button>

        {/* Out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full">
              Hết hàng
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3">
        <span className="text-[11px] font-semibold text-primary-600 uppercase tracking-wide mb-1">
          {product.brand_name}
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
              <span className="text-[10px] bg-blue-50 text-blue-600 font-medium
                               px-1.5 py-0.5 rounded border border-blue-100">
                RAM {ram}
              </span>
            )}
            {storage && (
              <span className="text-[10px] bg-purple-50 text-purple-600 font-medium
                               px-1.5 py-0.5 rounded border border-purple-100">
                {storage}
              </span>
            )}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
          ))}
          <span className="text-[10px] text-gray-400 ml-0.5">(24)</span>
        </div>

        {/* Stock */}
        <div className="flex items-center gap-1 mb-2">
          {isOutOfStock
            ? <XCircle className="w-3 h-3 text-red-400" />
            : <CheckCircle className="w-3 h-3 text-green-500" />
          }
          <span className={`text-[10px] font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
            {isOutOfStock ? 'Hết hàng' : `Còn hàng (${product.stock})`}
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-2 border-t border-gray-50">
          <div className="flex items-end gap-2 flex-wrap">
            <span className="text-base font-extrabold text-primary-600">{fmt(currentPrice)}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">{fmt(product.price)}</span>
            )}
          </div>
          {hasDiscount && (
            <p className="text-[10px] text-green-600 font-medium mt-0.5">
              Tiết kiệm {fmt(product.price - currentPrice)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                        text-xs font-semibold transition-all duration-200
                        ${isOutOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
                        }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thêm vào giỏ</span>
            <span className="sm:hidden">Giỏ hàng</span>
          </button>

          <Link
            to={`/products/${product.id}`}
            title="Xem chi tiết"
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl
                       border border-gray-200 text-gray-600 text-xs font-semibold
                       hover:border-primary-400 hover:text-primary-600 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chi tiết</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
