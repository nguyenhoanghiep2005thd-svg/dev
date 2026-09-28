import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight, Home, MapPin, CreditCard, CheckCircle,
  ShoppingBag, User, Phone, Mail, FileText, Loader2,
  ShieldCheck, Truck, Copy, Smartphone, Building2,
  Wallet, AlertCircle, ArrowLeft, Package,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import { createOrder } from '../services/orderService'

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const fmt = n =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const SHIPPING_THRESHOLD = 1_000_000
const SHIPPING_FEE       = 30_000

/* ─── Step indicator ──────────────────────────────────────────────────────── */
const STEPS = [
  { n: 1, label: 'Thông tin' },
  { n: 2, label: 'Thanh toán' },
  { n: 3, label: 'Xác nhận' },
]

function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map(({ n, label }, i) => (
        <div key={n} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                            border-2 transition-all duration-300
                            ${current > n  ? 'bg-green-500 border-green-500 text-white'
                            : current === n ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200'
                            :                 'bg-white border-gray-200 text-gray-400'}`}>
              {current > n ? <CheckCircle className="w-5 h-5" /> : n}
            </div>
            <span className={`text-xs mt-1 font-medium hidden sm:block
                              ${current >= n ? 'text-primary-600' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mx-1 transition-all duration-300
                            ${current > n ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── Order summary sidebar ───────────────────────────────────────────────── */
function OrderSummary({ items, totalPrice, shippingFee }) {
  const finalTotal = totalPrice + shippingFee
  return (
    <div className="card p-5 sticky top-24 space-y-4">
      <h3 className="font-bold text-gray-900 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-primary-500" />
        Đơn hàng ({items.length} sản phẩm)
      </h3>

      {/* Items */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {items.map(({ product, quantity }) => {
          const price = product?.current_price ?? product?.price ?? 0
          return (
            <div key={product?.id} className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <img
                  src={product?.primary_image || 'https://placehold.co/40x40/f5f5f5/999?text=SP'}
                  alt={product?.name}
                  className="w-11 h-11 object-contain bg-gray-50 rounded-xl border border-gray-100 p-0.5"
                />
                <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-primary-600 text-white
                                 text-[9px] font-bold rounded-full flex items-center justify-center
                                 min-w-[18px] px-0.5">
                  {quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate leading-snug">
                  {product?.name}
                </p>
                <p className="text-[10px] text-gray-400">{product?.brand_name}</p>
              </div>
              <span className="text-xs font-bold text-gray-800 flex-shrink-0">
                {fmt(price * quantity)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Breakdown */}
      <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Tạm tính</span>
          <span className="font-medium text-gray-800">{fmt(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Phí vận chuyển</span>
          {shippingFee === 0
            ? <span className="font-medium text-green-600">Miễn phí</span>
            : <span className="font-medium text-gray-800">{fmt(shippingFee)}</span>
          }
        </div>
        {shippingFee > 0 && (
          <p className="text-[11px] text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg">
            💡 Thêm {fmt(SHIPPING_THRESHOLD - totalPrice)} để miễn phí ship
          </p>
        )}
      </div>

      <div className="flex justify-between items-center border-t border-gray-100 pt-3">
        <span className="font-bold text-gray-900">Tổng thanh toán</span>
        <span className="text-xl font-extrabold text-primary-600">{fmt(finalTotal)}</span>
      </div>
    </div>
  )
}

/* ─── Payment method options ──────────────────────────────────────────────── */
const PAYMENT_METHODS = [
  {
    value: 'cod',
    label: 'Thanh toán khi nhận hàng',
    sublabel: 'COD',
    desc:  'Kiểm tra hàng trước khi thanh toán. Nhân viên giao hàng thu tiền.',
    icon:  Truck,
    color: 'text-green-600',
    bg:    'bg-green-50',
    badge: null,
  },
  {
    value: 'bank',
    label: 'Chuyển khoản ngân hàng',
    sublabel: 'ATM / Internet Banking',
    desc:  'Chuyển khoản sau khi đặt hàng. Đơn xử lý sau khi nhận được tiền.',
    icon:  Building2,
    color: 'text-blue-600',
    bg:    'bg-blue-50',
    badge: null,
  },
  {
    value: 'online',
    label: 'Thanh toán online',
    sublabel: 'VNPay · MoMo · ZaloPay',
    desc:  'Cổng thanh toán trực tuyến an toàn. Sẽ được tích hợp trong thời gian tới.',
    icon:  Wallet,
    color: 'text-purple-600',
    bg:    'bg-purple-50',
    badge: 'Sắp ra mắt',
  },
]

/* ─── Field component ─────────────────────────────────────────────────────── */
function Field({ icon: Icon, label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none z-10" />
        )}
        {children}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  )
}

/* ─── Success screen ──────────────────────────────────────────────────────── */
function SuccessScreen({ order }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(`#${order.id}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const paymentLabel = PAYMENT_METHODS.find(m => m.value === order.payment_method)?.label || order.payment_method

  return (
    <div className="max-w-lg mx-auto text-center py-8 px-4">
      {/* Icon */}
      <div className="relative inline-flex mb-6">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 rounded-full
                        flex items-center justify-center">
          <Package className="w-4 h-4 text-white" />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
        Đặt hàng thành công! 🎉
      </h1>
      <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
        Cảm ơn bạn đã mua sắm tại PhoneStore. Chúng tôi sẽ liên hệ xác nhận trong 30 phút.
      </p>

      {/* Order info card */}
      <div className="card p-5 mb-6 text-left space-y-3">
        {/* Order ID */}
        <div className="flex items-center justify-between bg-primary-50 rounded-xl px-4 py-3">
          <div>
            <p className="text-xs text-primary-400 font-medium">Mã đơn hàng</p>
            <p className="text-xl font-extrabold text-primary-700">#{order.id}</p>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800
                       bg-white border border-primary-200 px-3 py-1.5 rounded-lg
                       hover:bg-primary-50 transition-all font-medium"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Đã copy!' : 'Sao chép'}
          </button>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Người nhận',     val: order.shipping_full_name },
            { label: 'SĐT',            val: order.shipping_phone },
            { label: 'Thanh toán',     val: paymentLabel },
            { label: 'Trạng thái',     val: order.status_display || 'Chờ xác nhận' },
          ].map(({ label, val }) => (
            <div key={label} className="bg-gray-50 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-gray-400 uppercase font-medium">{label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5 leading-snug">{val}</p>
            </div>
          ))}
        </div>

        {/* Address */}
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm">
          <p className="text-[10px] text-gray-400 uppercase font-medium mb-0.5">Giao đến</p>
          <p className="text-sm font-semibold text-gray-800">{order.shipping_address}</p>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center bg-primary-50 rounded-xl px-4 py-3">
          <span className="text-sm font-semibold text-gray-700">Tổng thanh toán</span>
          <span className="text-xl font-extrabold text-primary-600">
            {fmt(order.final_total ?? order.total_price)}
          </span>
        </div>

        {/* Bank info nếu chọn bank */}
        {order.payment_method === 'bank' && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
            <p className="text-sm font-bold text-blue-800 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Thông tin chuyển khoản
            </p>
            {[
              { k: 'Ngân hàng',    v: 'MB Bank' },
              { k: 'Số tài khoản', v: '1234567890' },
              { k: 'Chủ tài khoản',v: 'PHONESTORE VN' },
              { k: 'Nội dung CK',  v: `DONHANG ${order.id}` },
              { k: 'Số tiền',      v: fmt(order.final_total ?? order.total_price) },
            ].map(({ k, v }) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-blue-500 font-medium">{k}:</span>
                <span className="font-bold text-blue-800">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/orders" className="btn-outline flex-1 py-3 gap-2">
          <Package className="w-4 h-4" /> Xem đơn hàng
        </Link>
        <Link to="/" className="btn-primary flex-1 py-3 gap-2">
          <Home className="w-4 h-4" /> Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  )
}

/* ─── Main component ──────────────────────────────────────────────────────── */
export default function CheckoutPage() {
  const navigate = useNavigate()

  const items       = useCartStore(s => s.items)
  const clearCart   = useCartStore(s => s.clearCart)
  const user        = useAuthStore(s => s.user)
  const isAuth      = useAuthStore(s => s.isAuthenticated())

  const totalPrice = items.reduce(
    (s, { product, quantity }) => s + (product?.current_price ?? product?.price ?? 0) * quantity, 0
  )
  const shippingFee = totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const finalTotal  = totalPrice + shippingFee

  /* ── Form state ── */
  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [order,   setOrder]   = useState(null)   // kết quả sau khi đặt thành công
  const [errors,  setErrors]  = useState({})

  const [form, setForm] = useState({
    full_name:      user?.full_name  || '',
    phone:          user?.phone      || '',
    email:          user?.email      || '',
    address:        user?.address    || '',
    payment_method: 'cod',
    note:           '',
  })

  /* Redirect nếu chưa đăng nhập */
  useEffect(() => {
    if (!isAuth) {
      toast.error('Vui lòng đăng nhập để tiến hành thanh toán.')
      navigate('/login', { state: { from: '/checkout' } })
    }
  }, [isAuth, navigate])

  /* Redirect nếu giỏ trống (và chưa có order thành công) */
  useEffect(() => {
    if (!order && items.length === 0) {
      navigate('/cart')
    }
  }, [items, order, navigate])

  if (!isAuth) return null

  /* ── Validate step 1 ── */
  const validateStep1 = () => {
    const errs = {}
    if (!form.full_name.trim())   errs.full_name = 'Vui lòng nhập họ tên.'
    if (!form.phone.trim())       errs.phone     = 'Vui lòng nhập số điện thoại.'
    else if (!/^[0-9]{9,11}$/.test(form.phone.replace(/\D/g, '')))
                                  errs.phone     = 'Số điện thoại không hợp lệ.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                  errs.email     = 'Email không đúng định dạng.'
    if (!form.address.trim())     errs.address   = 'Vui lòng nhập địa chỉ giao hàng.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) return
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }))
  }

  /* ── Place order ── */
  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      const payload = {
        shipping_full_name: form.full_name.trim(),
        shipping_phone:     form.phone.trim(),
        shipping_email:     form.email.trim(),
        shipping_address:   form.address.trim(),
        payment_method:     form.payment_method,
        note:               form.note.trim(),
      }

      let result
      try {
        // ── Gọi API thật ──────────────────────────────────
        result = await createOrder(payload)
      } catch (apiErr) {
        // ── Fallback demo khi backend chưa chạy ──────────
        if (apiErr?.code === 'ERR_NETWORK') {
          await new Promise(r => setTimeout(r, 1000))
          result = {
            id:                 Math.floor(Math.random() * 90000) + 10000,
            status:             'pending',
            status_display:     'Chờ xác nhận',
            shipping_full_name: payload.shipping_full_name,
            shipping_phone:     payload.shipping_phone,
            shipping_address:   payload.shipping_address,
            payment_method:     payload.payment_method,
            total_price:        totalPrice,
            final_total:        finalTotal,
            message:            'Demo: đặt hàng thành công.',
          }
        } else {
          // Lỗi thật từ backend (validation, stock, ...)
          const data    = apiErr?.response?.data
          const errMsg  = data?.stock?.[0]
            || data?.non_field_errors?.[0]
            || data?.detail
            || 'Đặt hàng thất bại. Vui lòng thử lại.'
          throw new Error(errMsg)
        }
      }

      // Xóa giỏ hàng local
      await clearCart(true)

      setOrder({ ...result, final_total: finalTotal })
      setStep(4) // success screen
      toast.success(`Đặt hàng thành công! Mã đơn #${result.id}`)

    } catch (err) {
      toast.error(err.message || 'Đặt hàng thất bại.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Render success ── */
  if (step === 4 && order) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <SuccessScreen order={order} />
      </div>
    )
  }

  /* ── Main render ── */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <Link to="/cart" className="hover:text-primary-600">Giỏ hàng</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900 font-medium">Thanh toán</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StepBar current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: form ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* ════ STEP 1: Thông tin giao hàng ════ */}
            {step === 1 && (
              <div className="card p-6 space-y-5">
                <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  Thông tin người nhận
                </h2>

                {/* Họ tên */}
                <Field icon={User} label="Họ và tên" required error={errors.full_name}>
                  <input
                    type="text" name="full_name"
                    value={form.full_name} onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className={`input pl-10 ${errors.full_name ? 'border-red-400' : ''}`}
                    autoComplete="name"
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Số điện thoại */}
                  <Field icon={Phone} label="Số điện thoại" required error={errors.phone}>
                    <input
                      type="tel" name="phone"
                      value={form.phone} onChange={handleChange}
                      placeholder="0901234567"
                      className={`input pl-10 ${errors.phone ? 'border-red-400' : ''}`}
                      autoComplete="tel"
                    />
                  </Field>

                  {/* Email */}
                  <Field icon={Mail} label="Email" error={errors.email}>
                    <input
                      type="email" name="email"
                      value={form.email} onChange={handleChange}
                      placeholder="ban@email.com (nhận xác nhận đơn)"
                      className={`input pl-10 ${errors.email ? 'border-red-400' : ''}`}
                      autoComplete="email"
                    />
                  </Field>
                </div>

                {/* Địa chỉ */}
                <Field icon={MapPin} label="Địa chỉ giao hàng" required error={errors.address}>
                  <textarea
                    name="address" rows={3}
                    value={form.address} onChange={handleChange}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    className={`input pl-10 resize-none ${errors.address ? 'border-red-400' : ''}`}
                    autoComplete="street-address"
                  />
                </Field>

                {/* Ghi chú */}
                <Field icon={FileText} label="Ghi chú đơn hàng">
                  <textarea
                    name="note" rows={2}
                    value={form.note} onChange={handleChange}
                    placeholder="Ghi chú cho người giao hàng (ví dụ: gọi trước khi giao, giao giờ hành chính...)"
                    className="input pl-10 resize-none"
                  />
                </Field>

                <button onClick={handleNextStep} className="btn-primary w-full py-4 text-base gap-2">
                  Tiếp tục chọn phương thức thanh toán
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* ════ STEP 2: Phương thức thanh toán ════ */}
            {step === 2 && (
              <div className="card p-6 space-y-5">
                <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-500" />
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map(({ value, label, sublabel, desc, icon: Icon, color, bg, badge }) => {
                    const isSelected = form.payment_method === value
                    const isDisabled = value === 'online'
                    return (
                      <label
                        key={value}
                        className={`relative flex items-start gap-4 p-4 rounded-2xl border-2
                                    transition-all duration-200 cursor-pointer
                                    ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
                                    ${isSelected
                                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                                      : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                      >
                        <input
                          type="radio" name="payment_method" value={value}
                          checked={isSelected}
                          onChange={handleChange}
                          disabled={isDisabled}
                          className="accent-primary-600 mt-1 flex-shrink-0"
                        />

                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                         flex-shrink-0 ${bg}`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 text-sm">{label}</span>
                            <span className="text-xs text-gray-500">({sublabel})</span>
                            {badge && (
                              <span className="text-[10px] bg-purple-100 text-purple-600
                                               font-bold px-2 py-0.5 rounded-full">
                                {badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>

                          {/* Bank details khi chọn bank */}
                          {isSelected && value === 'bank' && (
                            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-1.5">
                              <p className="text-xs font-bold text-blue-800">Thông tin chuyển khoản:</p>
                              {[
                                ['Ngân hàng',     'MB Bank'],
                                ['Số TK',         '1234567890'],
                                ['Chủ TK',        'PHONESTORE VN'],
                                ['Nội dung',      `DONHANG [MÃ ĐƠN]`],
                              ].map(([k, v]) => (
                                <div key={k} className="flex justify-between text-xs">
                                  <span className="text-blue-500 font-medium">{k}:</span>
                                  <span className="font-bold text-blue-800">{v}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Online placeholder */}
                          {isSelected && value === 'online' && (
                            <div className="mt-3 bg-purple-50 border border-purple-100 rounded-xl p-3">
                              <p className="text-xs text-purple-700">
                                🚧 Cổng thanh toán online đang được tích hợp.
                                Hiện tại chưa hỗ trợ phương thức này.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Selected checkmark */}
                        {isSelected && !isDisabled && (
                          <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                        )}
                      </label>
                    )
                  })}
                </div>

                {/* Security badges */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-xs text-gray-500">
                    Thông tin thanh toán được mã hóa SSL 256-bit. Chúng tôi không lưu trữ
                    thông tin thẻ của bạn.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-ghost flex-shrink-0 px-5 py-3.5 gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={form.payment_method === 'online'}
                    className="btn-primary flex-1 py-3.5 text-base gap-2 disabled:opacity-50"
                  >
                    Xem lại đơn hàng <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* ════ STEP 3: Xác nhận đơn hàng ════ */}
            {step === 3 && (
              <div className="card p-6 space-y-5">
                <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary-500" />
                  Xác nhận đơn hàng
                </h2>

                {/* Shipping info */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                    Thông tin giao hàng
                  </p>
                  {[
                    { icon: User,    k: 'Người nhận', v: form.full_name },
                    { icon: Phone,   k: 'Số điện thoại', v: form.phone },
                    ...(form.email ? [{ icon: Mail, k: 'Email', v: form.email }] : []),
                    { icon: MapPin,  k: 'Địa chỉ', v: form.address },
                    { icon: CreditCard, k: 'Thanh toán',
                      v: PAYMENT_METHODS.find(m => m.value === form.payment_method)?.label },
                    ...(form.note ? [{ icon: FileText, k: 'Ghi chú', v: form.note }] : []),
                  ].map(({ icon: Icon, k, v }) => (
                    <div key={k} className="flex gap-3 text-sm">
                      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-500 w-28 flex-shrink-0">{k}:</span>
                      <span className="text-gray-900 font-semibold">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Products list */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                    Sản phẩm đặt hàng
                  </p>
                  <div className="space-y-3 border border-gray-100 rounded-2xl divide-y divide-gray-50 overflow-hidden">
                    {items.map(({ product, quantity }) => {
                      const price = product?.current_price ?? product?.price ?? 0
                      return (
                        <div key={product?.id} className="flex items-center gap-3 p-3">
                          <img
                            src={product?.primary_image || 'https://placehold.co/48x48/f5f5f5/999?text=SP'}
                            alt={product?.name}
                            className="w-12 h-12 object-contain bg-gray-50 rounded-xl border border-gray-100 p-1"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {product?.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {product?.brand_name} · x{quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{fmt(price * quantity)}</p>
                            <p className="text-[10px] text-gray-400">{fmt(price)} / cái</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-primary-50 rounded-2xl p-4 space-y-2 border border-primary-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-semibold">{fmt(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    {shippingFee === 0
                      ? <span className="font-semibold text-green-600">Miễn phí 🎉</span>
                      : <span className="font-semibold">{fmt(shippingFee)}</span>
                    }
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-primary-200 pt-2">
                    <span className="text-gray-900">Tổng thanh toán</span>
                    <span className="text-primary-600 text-xl">{fmt(finalTotal)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="btn-ghost flex-shrink-0 px-5 py-4 gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn-primary flex-1 py-4 text-base gap-2
                               disabled:opacity-60 disabled:cursor-not-allowed
                               shadow-lg shadow-primary-200"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang xử lý đơn hàng...
                      </span>
                    ) : (
                      <>
                        <Smartphone className="w-5 h-5" />
                        Xác nhận đặt hàng
                      </>
                    )}
                  </button>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-gray-400 text-center">
                  Bằng cách đặt hàng, bạn đồng ý với{' '}
                  <Link to="/" className="text-primary-500 hover:underline">
                    Điều khoản dịch vụ
                  </Link>{' '}
                  của PhoneStore.
                </p>
              </div>
            )}
          </div>

          {/* ── Right: order summary ── */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={items}
              totalPrice={totalPrice}
              shippingFee={shippingFee}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
