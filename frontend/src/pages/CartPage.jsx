import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag,
  Truck, ShieldCheck, RefreshCcw, AlertCircle, LogIn,
  ChevronRight, Home, Loader2,
} from 'lucide-react'
import { useCart } from '../hooks/useCart'
import toast from 'react-hot-toast'

const fmt = n =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

/* ── Skeleton ── */
function CartSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="card p-4 flex gap-4 animate-pulse">
          <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mt-4" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Coupon ── */
function CouponInput() {
  const [code,    setCode]    = useState('')
  const [applied, setApplied] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleApply = async () => {
    if (!code.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn.')  // demo
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã giảm giá"
            className="input pl-9 py-2.5 text-sm uppercase tracking-widest"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={!code.trim() || loading}
          className="btn-outline py-2.5 px-4 text-sm flex-shrink-0 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Áp dụng'}
        </button>
      </div>
    </div>
  )
}

/* ── Main ── */
export default function CartPage() {
  const navigate = useNavigate()
  const {
    items, loading,
    totalItems, totalPrice, shippingFee, finalTotal,
    updateQuantity, removeItem, clearCart,
    isAuthenticated,
  } = useCart()

  /* Xử lý thay đổi số lượng */
  const handleQtyChange = async (productId, newQty, stock) => {
    if (newQty < 1) {
      // Xác nhận xóa
      if (window.confirm('Xóa sản phẩm này khỏi giỏ hàng?')) {
        await removeItem(productId)
      }
      return
    }
    if (newQty > stock) {
      toast.error(`Chỉ còn ${stock} sản phẩm trong kho.`)
      return
    }
    await updateQuantity(productId, newQty)
  }

  /* ── Empty ── */
  if (!loading && items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="w-28 h-28 bg-gray-50 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-14 h-14 text-gray-200" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 text-sm">Hãy chọn sản phẩm bạn yêu thích để tiếp tục</p>
        </div>
        {!isAuthenticated && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200
                          rounded-xl px-4 py-3 text-sm text-amber-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              <Link to="/login" className="font-semibold underline">Đăng nhập</Link>
              {' '}để xem lại giỏ hàng đã lưu trước đó
            </span>
          </div>
        )}
        <div className="flex gap-3">
          {!isAuthenticated && (
            <Link to="/login" className="btn-outline px-6 py-3 gap-2">
              <LogIn className="w-4 h-4" /> Đăng nhập
            </Link>
          )}
          <Link to="/products" className="btn-primary px-8 py-3">
            Mua sắm ngay
          </Link>
        </div>
      </div>
    )
  }

  /* ── Main content ── */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900 font-medium">Giỏ hàng</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            Giỏ hàng
            {!loading && totalItems > 0 && (
              <span className="text-base font-normal text-gray-400">({totalItems} sản phẩm)</span>
            )}
          </h1>
          {items.length > 0 && (
            <button
              onClick={() => clearCart()}
              className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1.5
                         font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Xóa tất cả
            </button>
          )}
        </div>

        {/* Guest warning */}
        {!isAuthenticated && items.length > 0 && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200
                          rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Bạn đang mua hàng với tư cách khách</p>
              <p className="text-sm text-amber-600 mt-0.5">
                Giỏ hàng chỉ được lưu trên thiết bị này.{' '}
                <Link to="/login" className="font-bold underline hover:text-amber-800">
                  Đăng nhập
                </Link>
                {' '}để lưu giỏ hàng và đặt hàng.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Items column ── */}
          <div className="lg:col-span-2 space-y-3">

            {loading ? <CartSkeleton /> : items.map(({ id, product, quantity }) => {
              const price       = product?.current_price ?? product?.price ?? 0
              const hasDiscount = (product?.discount_percent ?? 0) > 0
              const stock       = product?.stock ?? 99
              const isLowStock  = stock > 0 && stock <= 5
              const isMaxQty    = quantity >= stock

              return (
                <article key={product?.id ?? id} className="card p-4 sm:p-5">
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link
                      to={`/products/${product?.id}`}
                      className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-50 rounded-xl
                                 overflow-hidden border border-gray-100"
                    >
                      <img
                        src={product?.primary_image || `https://placehold.co/96x96/f5f5f5/999?text=No+Image`}
                        alt={product?.name}
                        className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      {/* Top row: name + delete */}
                      <div className="flex justify-between gap-2">
                        <Link
                          to={`/products/${product?.id}`}
                          className="font-semibold text-gray-900 hover:text-primary-600
                                     transition-colors text-sm sm:text-base line-clamp-2 leading-snug"
                        >
                          {product?.name}
                        </Link>
                        <button
                          onClick={() => removeItem(product?.id)}
                          aria-label="Xóa sản phẩm"
                          className="flex-shrink-0 w-8 h-8 flex items-center justify-center
                                     rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-500
                                     transition-all border border-transparent hover:border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <span className="text-xs text-primary-600 font-semibold uppercase tracking-wide">
                        {product?.brand_name}
                      </span>

                      {/* Stock warning */}
                      {isLowStock && (
                        <p className="text-xs text-orange-500 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Chỉ còn {stock} sản phẩm — đặt ngay!
                        </p>
                      )}

                      {/* Bottom row: qty + price */}
                      <div className="flex items-center justify-between flex-wrap gap-3 mt-auto">

                        {/* Quantity stepper */}
                        <div className="flex items-center border-2 border-gray-200 rounded-xl
                                        overflow-hidden hover:border-primary-300 transition-colors">
                          <button
                            onClick={() => handleQtyChange(product?.id, quantity - 1, stock)}
                            aria-label="Giảm số lượng"
                            className="w-9 h-9 flex items-center justify-center text-gray-500
                                       hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            value={quantity}
                            min={1}
                            max={stock}
                            onChange={e => {
                              const v = parseInt(e.target.value, 10)
                              if (!isNaN(v)) handleQtyChange(product?.id, v, stock)
                            }}
                            className="w-12 text-center text-sm font-bold text-gray-900
                                       border-x border-gray-200 bg-white focus:outline-none
                                       focus:bg-primary-50 transition-colors py-2"
                          />
                          <button
                            onClick={() => handleQtyChange(product?.id, quantity + 1, stock)}
                            disabled={isMaxQty}
                            aria-label="Tăng số lượng"
                            className="w-9 h-9 flex items-center justify-center text-gray-500
                                       hover:bg-gray-50 disabled:opacity-30 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Prices */}
                        <div className="text-right">
                          <p className="text-lg font-extrabold text-primary-600">
                            {fmt(price * quantity)}
                          </p>
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-xs text-gray-400">{fmt(price)} / cái</span>
                            {hasDiscount && (
                              <>
                                <span className="text-xs text-gray-300 line-through">
                                  {fmt(product.price)}
                                </span>
                                <span className="badge-sale text-[10px] px-1.5">
                                  -{product.discount_percent}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}

            {/* Back to shop */}
            <Link
              to="/products"
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700
                         font-semibold py-2 px-1 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Tiếp tục mua sắm
            </Link>

            {/* Policies strip */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { icon: ShieldCheck, text: 'Hàng chính hãng', color: 'text-blue-500' },
                { icon: Truck,       text: 'Giao hàng toàn quốc', color: 'text-green-500' },
                { icon: RefreshCcw,  text: 'Đổi trả 7 ngày', color: 'text-orange-500' },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text}
                  className="flex flex-col items-center gap-1.5 bg-white rounded-xl p-3
                             border border-gray-100 text-center">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-xs text-gray-600 font-medium leading-snug">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Summary column ── */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24 space-y-5">
              <h2 className="font-bold text-gray-900 text-lg">Tóm tắt đơn hàng</h2>

              {/* Coupon */}
              <CouponInput />

              {/* Breakdown */}
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Tạm tính ({totalItems} sản phẩm)
                  </span>
                  <span className="font-semibold text-gray-800">{fmt(totalPrice)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  {shippingFee === 0 ? (
                    <span className="font-semibold text-green-600 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Miễn phí
                    </span>
                  ) : (
                    <span className="font-semibold text-gray-800">{fmt(shippingFee)}</span>
                  )}
                </div>

                {shippingFee === 0 ? (
                  <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-xl
                                flex items-center gap-1.5">
                    🎉 Bạn được miễn phí vận chuyển!
                  </p>
                ) : (
                  <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-xl">
                    💡 Mua thêm{' '}
                    <strong>{fmt(1_000_000 - totalPrice)}</strong>
                    {' '}để miễn phí vận chuyển
                  </p>
                )}

                <div className="h-px bg-gray-100" />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-base">Tổng thanh toán</span>
                  <span className="text-2xl font-extrabold text-primary-600">{fmt(finalTotal)}</span>
                </div>

                <p className="text-xs text-gray-400 text-right">
                  (Đã bao gồm VAT nếu có)
                </p>
              </div>

              {/* CTA */}
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/checkout')}
                  disabled={loading}
                  className="btn-primary w-full py-4 text-base gap-2 disabled:opacity-60
                             shadow-lg shadow-primary-200"
                >
                  Tiến hành thanh toán
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="space-y-2.5">
                  <Link
                    to="/login"
                    state={{ from: '/cart' }}
                    className="btn-primary w-full py-4 text-base gap-2 flex items-center
                               justify-center"
                  >
                    <LogIn className="w-5 h-5" /> Đăng nhập để đặt hàng
                  </Link>
                  <p className="text-center text-xs text-gray-400">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-primary-600 font-semibold hover:underline">
                      Đăng ký miễn phí
                    </Link>
                  </p>
                </div>
              )}

              {/* Payment badges */}
              <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                {['VISA', 'Mastercard', 'COD', 'MoMo', 'ZaloPay'].map(p => (
                  <span
                    key={p}
                    className="text-[10px] font-bold text-gray-400 border border-gray-200
                               px-2 py-0.5 rounded"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
