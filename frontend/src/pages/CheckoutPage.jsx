import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin, CreditCard, CheckCircle, ShoppingBag, User, Phone,
  Mail, FileText, Loader2, ShieldCheck, Truck, Building2,
  Wallet, ArrowLeft, Package, QrCode, Copy,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import { createOrder } from '../services/orderService'

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const PAYMENT_METHODS = [
  {
    value: 'cod',
    label: 'Thanh toán khi nhận hàng',
    sublabel: 'COD',
    desc: 'Kiểm tra hàng trước khi thanh toán. Nhân viên giao hàng thu tiền tận nơi.',
    icon: Truck,
  },
  {
    value: 'bank',
    label: 'Chuyển khoản VietQR',
    sublabel: 'Quét mã VietQR 24/7',
    desc: 'Quét mã QR qua app ngân hàng bất kỳ, tự động điền số tiền và nội dung.',
    icon: QrCode,
  },
  {
    value: 'online',
    label: 'Ví điện tử VNPay / MoMo',
    sublabel: 'Thanh toán trực tuyến tức thì',
    desc: 'Hỗ trợ VNPay, MoMo, ZaloPay, thẻ quốc tế Visa / Mastercard.',
    icon: Wallet,
  },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { items, subtotal, shippingFee, discountAmount, finalTotal, appliedCoupon, clearCart } = useCartStore()

  const [form, setForm] = useState({
    shipping_full_name: user?.full_name || '',
    shipping_phone: user?.phone || '',
    shipping_email: user?.email || '',
    shipping_address: user?.address || '',
    payment_method: 'cod',
    note: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [createdOrder, setCreatedOrder] = useState(null)
  const [showOnlineModal, setShowOnlineModal] = useState(false)
  const [onlineGateway, setOnlineGateway] = useState('vnpay')

  const total = finalTotal()

  if (items.length === 0 && !createdOrder) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Không có sản phẩm nào để thanh toán</h2>
        <Link to="/products" className="btn-primary inline-flex">Quay lại mua sắm</Link>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.shipping_full_name.trim()) return toast.error('Vui lòng nhập họ và tên')
    if (!form.shipping_phone.trim()) return toast.error('Vui lòng nhập số điện thoại')
    if (!form.shipping_address.trim()) return toast.error('Vui lòng nhập địa chỉ giao hàng')

    try {
      setSubmitting(true)
      const payload = {
        ...form,
        coupon_code: appliedCoupon?.code || '',
        discount_amount: discountAmount() || 0,
      }

      const res = await createOrder(payload)
      setCreatedOrder(res)
      clearCart()
      toast.success('Đặt hàng thành công!')
      if (form.payment_method === 'online') {
        setShowOnlineModal(true)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Không thể tạo đơn hàng. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  // Success Screen
  if (createdOrder) {
    const orderId = createdOrder.id
    const qrUrl = `https://img.vietqr.io/image/MB-1234567890-compact2.png?amount=${createdOrder.final_total || total}&addInfo=DH${orderId}&accountName=PHONESTORE%20VN`

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Đặt hàng thành công!</h1>
          <p className="text-sm text-gray-500">Mã đơn hàng: <strong className="text-primary-600 font-extrabold text-base">#{orderId}</strong></p>
        </div>

        {/* Bank transfer QR */}
        {createdOrder.payment_method === 'bank' && (
          <div className="card p-6 border-2 border-primary-200 bg-primary-50/30 text-center space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-primary-600" /> Quét mã VietQR để thanh toán
            </h3>
            <p className="text-xs text-gray-500">Mở ứng dụng ngân hàng bất kỳ để quét mã chuyển khoản nhanh</p>
            <div className="flex justify-center">
              <img
                src={qrUrl}
                alt="VietQR"
                className="w-56 h-auto rounded-xl shadow-md border border-gray-200 bg-white p-2"
              />
            </div>
            <div className="text-xs text-gray-600 space-y-1 bg-white p-3 rounded-xl border border-gray-100 text-left max-w-sm mx-auto">
              <p><strong>Ngân hàng:</strong> MB Bank (Quân Đội)</p>
              <p><strong>Số tài khoản:</strong> 1234567890</p>
              <p><strong>Chủ tài khoản:</strong> PHONESTORE VN</p>
              <p><strong>Số tiền:</strong> {fmt(createdOrder.final_total || total)}</p>
              <p><strong>Nội dung:</strong> DH{orderId}</p>
            </div>
          </div>
        )}

        {/* Order Details Summary */}
        <div className="card p-5 space-y-3 border border-gray-100">
          <h4 className="font-bold text-sm text-gray-800">Thông tin giao nhận</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Người nhận:</strong> {createdOrder.shipping_full_name} ({createdOrder.shipping_phone})</p>
            <p><strong>Địa chỉ:</strong> {createdOrder.shipping_address}</p>
            <p><strong>Tổng thanh toán:</strong> <span className="font-bold text-red-600 text-sm">{fmt(createdOrder.final_total || total)}</span></p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="/orders" className="btn-primary flex-1 py-3 justify-center text-sm font-bold">
            Xem lịch sử đơn hàng
          </Link>
          <Link to="/" className="btn-outline flex-1 py-3 justify-center text-sm font-bold">
            Về trang chủ
          </Link>
        </div>

        {/* Online Payment Simulator Modal */}
        {showOnlineModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 animate-fade-in">
              <h3 className="text-lg font-bold text-gray-900 text-center">Cổng thanh toán trực tuyến</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setOnlineGateway('vnpay')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 ${onlineGateway === 'vnpay' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200'}`}
                >
                  Cổng VNPay
                </button>
                <button
                  onClick={() => setOnlineGateway('momo')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 ${onlineGateway === 'momo' ? 'border-pink-600 bg-pink-50 text-pink-700' : 'border-gray-200'}`}
                >
                  Ví MoMo
                </button>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-xl space-y-2">
                <p className="text-xs text-gray-500">Số tiền cần thanh toán:</p>
                <p className="text-2xl font-extrabold text-red-600">{fmt(createdOrder.final_total || total)}</p>
                <div className="w-36 h-36 bg-white mx-auto rounded-lg border border-gray-200 flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-gray-700" />
                </div>
                <p className="text-[11px] text-gray-400">Mô phỏng quét mã thanh toán Sandbox</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowOnlineModal(false)
                    toast.success('Xác nhận thanh toán thành công!')
                  }}
                  className="btn-primary flex-1 py-2.5 text-xs font-bold justify-center"
                >
                  Giả lập thanh toán thành công
                </button>
                <button
                  onClick={() => setShowOnlineModal(false)}
                  className="btn-outline py-2.5 text-xs px-4"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      <div className="pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Thanh toán đơn hàng</h1>
        <p className="text-sm text-gray-500">Vui lòng kiểm tra kỹ thông tin nhận hàng</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-4 border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-600" /> 1. Thông tin giao hàng
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={form.shipping_full_name}
                  onChange={(e) => setForm({ ...form, shipping_full_name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="input text-sm w-full"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={form.shipping_phone}
                  onChange={(e) => setForm({ ...form, shipping_phone: e.target.value })}
                  placeholder="0912345678"
                  className="input text-sm w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Email (nhận thông báo đơn hàng)</label>
              <input
                type="email"
                value={form.shipping_email}
                onChange={(e) => setForm({ ...form, shipping_email: e.target.value })}
                placeholder="email@example.com"
                className="input text-sm w-full"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Địa chỉ nhận hàng cụ thể *</label>
              <input
                type="text"
                required
                value={form.shipping_address}
                onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                className="input text-sm w-full"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Ghi chú đơn hàng (nếu có)</label>
              <textarea
                rows={2}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Giao hàng vào giờ hành chính, gọi trước khi đến..."
                className="input text-sm w-full"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="card p-6 space-y-4 border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary-600" /> 2. Phương thức thanh toán
            </h3>

            <div className="space-y-3">
              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.value}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.payment_method === pm.value
                      ? 'border-primary-600 bg-primary-50/40 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={pm.value}
                    checked={form.payment_method === pm.value}
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                    className="mt-1 text-primary-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <pm.icon className="w-4 h-4 text-primary-600" />
                      <span className="font-bold text-sm text-gray-900">{pm.label}</span>
                      <span className="text-xs text-primary-700 bg-primary-100 px-2 py-0.5 rounded font-medium">
                        {pm.sublabel}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{pm.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Review Sidebar */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4 border border-gray-100 sticky top-24">
            <h3 className="font-bold text-gray-900 text-sm">Đơn hàng của bạn ({items.length} món)</h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 border-b border-gray-100 pb-3">
              {items.map((item) => {
                const product = item.product
                const price = product?.current_price ?? product?.price ?? 0
                return (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <img
                      src={product?.primary_image || product?.image_url || 'https://placehold.co/40x40/f5f5f5/999?text=SP'}
                      alt=""
                      className="w-10 h-10 object-contain bg-gray-50 rounded-lg p-1 border border-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{product?.name}</p>
                      <p className="text-gray-400">
                        {item.color ? `Màu: ${item.color}` : ''} {item.storage ? `• ${item.storage}` : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-800">{fmt(price * item.quantity)}</p>
                      <p className="text-gray-400">x{item.quantity}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="space-y-2 text-sm border-b border-gray-100 pb-3">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span className="font-semibold text-gray-800">{fmt(subtotal())}</span>
              </div>
              {discountAmount() > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Mã giảm giá ({appliedCoupon?.code}):</span>
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
              <span className="font-bold text-gray-900">Tổng cộng:</span>
              <span className="text-2xl font-extrabold text-red-600">{fmt(total)}</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3.5 font-bold text-sm shadow-md shadow-primary-200 gap-2 justify-center"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Xác nhận đặt hàng
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
