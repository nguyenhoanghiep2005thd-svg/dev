import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag, Trash2, ArrowLeft, ArrowRight, ShieldCheck,
  Truck, Tag, CheckCircle, XCircle, Plus, Minus, Ticket,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useCartStore from '../store/cartStore'
import { validateCoupon } from '../services/orderService'

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const SUGGESTED_COUPONS = [
  { code: 'PHONESTORE10', desc: 'Giảm 10% (tối đa 1 triệu)' },
  { code: 'FREESHIP', desc: 'Miễn phí vận chuyển' },
  { code: 'CHAOBANMOI', desc: 'Giảm 200k (đơn từ 2tr)' },
  { code: 'VIP500', desc: 'Giảm 500k (đơn từ 10tr)' },
]

export default function CartPage() {
  const navigate = useNavigate()
  const {
    items, updateQuantity, removeItem, clearCart,
    subtotal, shippingFee, appliedCoupon, applyCoupon, removeCoupon,
    discountAmount, finalTotal,
  } = useCartStore()

  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase()
    if (!code) {
      toast.error('Vui lòng nhập mã giảm giá')
      return
    }

    try {
      setCouponLoading(true)
      const res = await validateCoupon(code, subtotal())
      applyCoupon(res)
      setCouponCode('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Mã giảm giá không hợp lệ')
    } finally {
      setCouponLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 animate-fade-in">
        <div className="w-20 h-20 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Giỏ hàng của bạn đang trống</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Hãy tìm kiếm sản phẩm điện thoại yêu thích và thêm vào giỏ nhé!
        </p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2 mt-4 px-6 py-3">
          <ArrowLeft className="w-4 h-4" /> Mua sắm ngay
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
          <p className="text-sm text-gray-500">Đang có {items.length} mặt hàng</p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Bạn muốn xóa tất cả sản phẩm khỏi giỏ?')) {
              clearCart()
              toast.success('Đã xóa toàn bộ giỏ hàng')
            }
          }}
          className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product
            const price = product?.current_price ?? product?.price ?? 0
            const img = product?.primary_image || product?.image_url || 'https://placehold.co/100x100/f5f5f5/999?text=SP'

            return (
              <div
                key={item.id}
                className="card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-100"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={img}
                    alt={product?.name}
                    className="w-20 h-20 object-contain bg-gray-50 rounded-xl p-2 border border-gray-100 flex-shrink-0"
                  />
                  <div className="min-w-0 space-y-1">
                    <Link
                      to={`/products/${product?.id}`}
                      className="text-sm font-bold text-gray-800 hover:text-primary-600 line-clamp-1"
                    >
                      {product?.name}
                    </Link>
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-gray-500">
                      {item.color && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">Màu: {item.color}</span>
                      )}
                      {item.storage && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">{item.storage}</span>
                      )}
                    </div>
                    <p className="text-sm font-extrabold text-red-600 sm:hidden">{fmt(price)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-extrabold text-red-600">{fmt(price)}</p>
                    <p className="text-[11px] text-gray-400">Đơn giá</p>
                  </div>

                  {/* Quantity control */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[90px]">
                    <p className="text-sm font-extrabold text-gray-900">{fmt(price * item.quantity)}</p>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    title="Xóa sản phẩm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}

          <Link to="/products" className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-semibold hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Tiếp tục chọn thêm sản phẩm khác
          </Link>
        </div>

        {/* Order Summary & Coupon */}
        <div className="space-y-4">
          {/* Coupon Box */}
          <div className="card p-5 space-y-3 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary-600" /> Mã giảm giá / Voucher
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                    {appliedCoupon.code}
                  </span>
                  <p className="text-xs text-green-600 mt-1">{appliedCoupon.description}</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-500 hover:underline font-semibold ml-2"
                >
                  Gỡ bỏ
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Nhập mã giảm giá..."
                  className="input flex-1 text-xs uppercase"
                />
                <button
                  onClick={() => handleApplyCoupon()}
                  disabled={couponLoading}
                  className="btn-primary text-xs px-4"
                >
                  {couponLoading ? 'Đang kiểm tra...' : 'Áp dụng'}
                </button>
              </div>
            )}

            {/* Suggested coupons */}
            <div className="space-y-1.5 pt-2">
              <p className="text-[11px] font-semibold text-gray-400">MÃ KHUYẾN MÃI DÀNH CHO BẠN:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_COUPONS.map((sc) => (
                  <button
                    key={sc.code}
                    onClick={() => handleApplyCoupon(sc.code)}
                    className="text-[11px] font-medium bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-700 border border-gray-200 px-2 py-1 rounded-md transition-colors"
                  >
                    {sc.code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing summary */}
          <div className="card p-5 space-y-4 border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Tóm tắt đơn hàng</h3>

            <div className="space-y-2 text-sm border-b border-gray-100 pb-3">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính hàng:</span>
                <span className="font-semibold text-gray-800">{fmt(subtotal())}</span>
              </div>

              {discountAmount() > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá khuyến mãi:</span>
                  <span className="font-semibold">-{fmt(discountAmount())}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-gray-800">
                  {shippingFee() === 0 ? <span className="text-green-600 font-bold">Miễn phí</span> : fmt(shippingFee())}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="font-bold text-gray-900">Tổng thanh toán:</span>
              <span className="text-2xl font-extrabold text-red-600">{fmt(finalTotal())}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full py-3.5 font-bold text-sm shadow-md shadow-primary-200 gap-2 justify-center"
            >
              Tiến hành thanh toán <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
