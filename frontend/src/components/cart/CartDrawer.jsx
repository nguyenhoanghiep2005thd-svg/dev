import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  X, ShoppingCart, Trash2, Plus, Minus,
  ShoppingBag, LogIn, ArrowRight, Tag,
  AlertCircle,
} from 'lucide-react'
import { useCart } from '../../hooks/useCart'

const fmt = n =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

export default function CartDrawer() {
  const navigate = useNavigate()
  const {
    items, isOpen, loading,
    totalItems, totalPrice, shippingFee, finalTotal,
    closeCart, updateQuantity, removeItem, clearCart,
    isAuthenticated,
  } = useCart()

  /* Lock scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  /* Escape to close */
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') closeCart() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [closeCart])

  const handleCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        aria-hidden
        onClick={closeCart}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* ── Drawer ── */}
      <aside
        role="dialog"
        aria-label="Giỏ hàng"
        aria-modal="true"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl
                    flex flex-col transform transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-gray-900 text-lg">Giỏ hàng</h2>
            {totalItems > 0 && (
              <span className="bg-primary-100 text-primary-700 text-xs font-bold
                               px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {items.length > 0 && (
              <button
                onClick={() => clearCart()}
                className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg
                           hover:bg-red-50 transition-colors mr-1"
              >
                Xóa tất cả
              </button>
            )}
            <button
              onClick={closeCart}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                         hover:bg-gray-100 transition-colors"
              aria-label="Đóng giỏ hàng"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* ── Guest notice ── */}
        {!isAuthenticated && items.length > 0 && (
          <div className="mx-4 mt-3 px-3.5 py-3 bg-amber-50 border border-amber-200
                          rounded-xl flex items-start gap-2.5 flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-amber-700 font-medium">Bạn chưa đăng nhập</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Giỏ hàng sẽ được lưu khi bạn đăng nhập.{' '}
                <Link
                  to="/login"
                  onClick={closeCart}
                  className="font-semibold underline hover:text-amber-800"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent
                              rounded-full animate-spin" />
            </div>
          )}

          {/* Empty */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 px-6 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-gray-200" />
              </div>
              <div>
                <p className="font-bold text-gray-700 text-lg mb-1">Giỏ hàng trống</p>
                <p className="text-sm text-gray-400">Hãy thêm sản phẩm để bắt đầu mua sắm</p>
              </div>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={closeCart}
                  className="flex items-center gap-2 text-sm text-primary-600 font-semibold
                             hover:text-primary-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Đăng nhập để xem giỏ hàng đã lưu
                </Link>
              )}
              <Link
                to="/products"
                onClick={closeCart}
                className="btn-primary px-7 py-2.5 text-sm"
              >
                Mua sắm ngay
              </Link>
            </div>
          ) : (
            /* Items list */
            <ul className="divide-y divide-gray-50 px-4">
              {items.map(({ id, product, quantity }) => {
                const price      = product?.current_price ?? product?.price ?? 0
                const isLow      = product?.stock > 0 && product?.stock <= 3
                const isMaxed    = quantity >= (product?.stock ?? 99)

                return (
                  <li key={product?.id ?? id} className="py-4 flex gap-3">
                    {/* Image */}
                    <Link
                      to={`/products/${product?.id}`}
                      onClick={closeCart}
                      className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden
                                 border border-gray-100 flex items-center justify-center"
                    >
                      <img
                        src={product?.primary_image || `https://placehold.co/64x64/f5f5f5/999?text=${encodeURIComponent(product?.name ?? '')}`}
                        alt={product?.name}
                        className="w-full h-full object-contain p-1.5"
                        loading="lazy"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex justify-between gap-1.5">
                        <Link
                          to={`/products/${product?.id}`}
                          onClick={closeCart}
                          className="text-sm font-semibold text-gray-800 hover:text-primary-600
                                     line-clamp-2 leading-snug"
                        >
                          {product?.name}
                        </Link>
                        <button
                          onClick={() => removeItem(product?.id)}
                          aria-label="Xóa sản phẩm"
                          className="flex-shrink-0 w-6 h-6 flex items-center justify-center
                                     rounded-lg text-gray-300 hover:text-red-500
                                     hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[11px] text-primary-500 font-medium">
                        {product?.brand_name}
                      </span>

                      {/* Stock warnings */}
                      {isLow && (
                        <span className="text-[10px] text-orange-500 font-medium">
                          ⚠ Chỉ còn {product.stock} sản phẩm
                        </span>
                      )}

                      {/* Quantity + price row */}
                      <div className="flex items-center justify-between mt-1">
                        {/* Qty controls */}
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(product?.id, quantity - 1)}
                            disabled={quantity <= 1}
                            aria-label="Giảm số lượng"
                            className="w-7 h-7 flex items-center justify-center text-gray-500
                                       hover:bg-gray-50 disabled:opacity-30 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-800 select-none">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product?.id, quantity + 1)}
                            disabled={isMaxed}
                            aria-label="Tăng số lượng"
                            className="w-7 h-7 flex items-center justify-center text-gray-500
                                       hover:bg-gray-50 disabled:opacity-30 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-primary-600">
                            {fmt(price * quantity)}
                          </p>
                          {quantity > 1 && (
                            <p className="text-[10px] text-gray-400">
                              {fmt(price)} / cái
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Discount badge */}
                      {product?.discount_percent > 0 && product?.sale_price && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400 line-through">
                            {fmt(product.price)}
                          </span>
                          <span className="badge-sale text-[10px] px-1.5 py-0.5">
                            -{product.discount_percent}%
                          </span>
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 bg-white flex-shrink-0">
            {/* Summary */}
            <div className="px-5 pt-4 pb-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tạm tính ({totalItems} SP)</span>
                <span className="font-semibold text-gray-800">{fmt(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phí vận chuyển</span>
                {shippingFee === 0 ? (
                  <span className="font-semibold text-green-600">Miễn phí</span>
                ) : (
                  <span className="font-semibold text-gray-800">{fmt(shippingFee)}</span>
                )}
              </div>
              {shippingFee > 0 && (
                <p className="text-[11px] text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                  💡 Mua thêm {fmt(1_000_000 - totalPrice)} để miễn phí vận chuyển
                </p>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-900">Tổng thanh toán</span>
                <span className="text-xl font-extrabold text-primary-600">{fmt(finalTotal)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-2.5">
              <Link
                to="/cart"
                onClick={closeCart}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl
                           border-2 border-primary-600 text-primary-600 text-sm font-semibold
                           hover:bg-primary-50 transition-colors"
              >
                Xem giỏ hàng
              </Link>
              {isAuthenticated ? (
                <button
                  onClick={handleCheckout}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl
                             bg-primary-600 text-white text-sm font-semibold
                             hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg
                             shadow-primary-200"
                >
                  Thanh toán <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={closeCart}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl
                             bg-primary-600 text-white text-sm font-semibold
                             hover:bg-primary-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Đăng nhập để đặt
                </Link>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
