import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Package, ChevronRight, Clock, CheckCircle, Truck,
  XCircle, ShoppingBag, Home, RefreshCcw, Loader2,
  AlertCircle, MapPin, CreditCard, Eye, Ban,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { fetchOrders, cancelOrder } from '../services/orderService'

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const fmt = n =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const STATUS_CFG = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', Icon: Clock,         dot: 'bg-yellow-400' },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700 border-blue-200',       Icon: CheckCircle,   dot: 'bg-blue-400' },
  shipping:  { label: 'Đang giao',    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',  Icon: Truck,         dot: 'bg-indigo-400' },
  delivered: { label: 'Đã giao',      color: 'bg-green-100 text-green-700 border-green-200',     Icon: CheckCircle,   dot: 'bg-green-500' },
  cancelled: { label: 'Đã hủy',       color: 'bg-red-100 text-red-700 border-red-200',           Icon: XCircle,       dot: 'bg-red-400' },
}

const PAYMENT_LABEL = {
  cod:    'Thanh toán khi nhận (COD)',
  bank:   'Chuyển khoản ngân hàng',
  online: 'Thanh toán online',
}

/* ─── Skeleton ─────────────────────────────────────────────────────────────── */
function OrderSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="card p-5 animate-pulse space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-6 bg-gray-200 rounded-full w-24" />
          </div>
          <div className="flex gap-3 pt-2">
            <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-100">
            <div className="h-5 bg-gray-200 rounded w-28" />
            <div className="h-8 bg-gray-200 rounded-xl w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Order detail modal ───────────────────────────────────────────────────── */
function OrderDetailModal({ order, onClose, onCancel }) {
  if (!order) return null
  const cfg = STATUS_CFG[order.status] || STATUS_CFG.pending
  const { Icon } = cfg
  const shippingFee = order.shipping_fee ?? (Number(order.total_price) >= 1_000_000 ? 0 : 30_000)
  const finalTotal  = order.final_total  ?? (Number(order.total_price) + shippingFee)

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Chi tiết đơn hàng</h2>
              <p className="text-sm text-gray-500">#{order.id}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold
                             px-2.5 py-1.5 rounded-full border ${cfg.color}`}>
              <Icon className="w-3.5 h-3.5" />
              {cfg.label}
            </span>
          </div>

          <div className="p-5 space-y-5">
            {/* Shipping info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Thông tin giao hàng</p>
              {[
                [MapPin,      'Người nhận', order.shipping_full_name],
                [MapPin,      'Điện thoại', order.shipping_phone],
                ...(order.shipping_email ? [[MapPin, 'Email', order.shipping_email]] : []),
                [MapPin,      'Địa chỉ',   order.shipping_address],
                [CreditCard,  'Thanh toán', PAYMENT_LABEL[order.payment_method] || order.payment_method],
                ...(order.note ? [[MapPin, 'Ghi chú', order.note]] : []),
              ].map(([Ico, k, v]) => (
                <div key={k} className="flex gap-2 text-sm">
                  <span className="text-gray-500 w-24 flex-shrink-0">{k}:</span>
                  <span className="text-gray-900 font-medium">{v}</span>
                </div>
              ))}
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Sản phẩm</p>
              <div className="space-y-2.5">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <img
                      src={item.product_image || 'https://placehold.co/44x44/f5f5f5/999?text=SP'}
                      alt={item.product_name}
                      className="w-11 h-11 object-contain rounded-lg border border-gray-100 bg-white p-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.product_name}</p>
                      <p className="text-xs text-gray-400">x{item.quantity} · {fmt(item.price)} / cái</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-primary-50 rounded-xl p-4 space-y-2 border border-primary-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-medium">{fmt(order.total_price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Vận chuyển</span>
                {shippingFee === 0
                  ? <span className="text-green-600 font-medium">Miễn phí</span>
                  : <span className="font-medium">{fmt(shippingFee)}</span>
                }
              </div>
              <div className="flex justify-between font-bold border-t border-primary-200 pt-2">
                <span>Tổng thanh toán</span>
                <span className="text-primary-600 text-lg">{fmt(finalTotal)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              {order.status === 'pending' && (
                <button
                  onClick={() => onCancel(order.id)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2
                             border-red-200 text-red-600 text-sm font-semibold
                             hover:bg-red-50 transition-colors"
                >
                  <Ban className="w-4 h-4" /> Hủy đơn
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 btn-outline py-2.5 text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── Order card ───────────────────────────────────────────────────────────── */
function OrderCard({ order, onViewDetail, onCancel }) {
  const cfg     = STATUS_CFG[order.status] || STATUS_CFG.pending
  const { Icon } = cfg
  const date    = new Date(order.created_at).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
  const shippingFee = order.shipping_fee ?? (Number(order.total_price) >= 1_000_000 ? 0 : 30_000)
  const finalTotal  = order.final_total  ?? (Number(order.total_price) + shippingFee)
  const totalQty    = (order.items || []).reduce((s, i) => s + i.quantity, 0)

  return (
    <article className="card p-4 sm:p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-bold text-gray-900 flex items-center gap-2">
            Đơn #{order.id}
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold
                             px-2 py-0.5 rounded-full border ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              <Icon className="w-3 h-3" />
              {cfg.label}
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {date} · {totalQty} sản phẩm · {PAYMENT_LABEL[order.payment_method] || order.payment_method}
          </p>
        </div>
      </div>

      {/* Items preview (max 3) */}
      <div className="flex gap-2 flex-wrap mb-4">
        {(order.items || []).slice(0, 3).map((item, i) => (
          <div key={i} className="relative">
            <img
              src={item.product_image || 'https://placehold.co/48x48/f5f5f5/999?text=SP'}
              alt={item.product_name}
              className="w-12 h-12 object-contain bg-gray-50 rounded-xl border border-gray-100 p-1"
              title={item.product_name}
            />
            {item.quantity > 1 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-primary-600
                               text-white text-[9px] font-bold rounded-full flex items-center
                               justify-center px-0.5">
                {item.quantity}
              </span>
            )}
          </div>
        ))}
        {(order.items || []).length > 3 && (
          <div className="w-12 h-12 bg-gray-100 rounded-xl border border-gray-200 flex items-center
                          justify-center text-xs font-bold text-gray-500">
            +{order.items.length - 3}
          </div>
        )}
      </div>

      {/* First item name */}
      {order.items?.[0] && (
        <p className="text-sm text-gray-600 mb-4 truncate">
          {order.items[0].product_name}
          {order.items.length > 1 && ` và ${order.items.length - 1} sản phẩm khác`}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div>
          <p className="text-xs text-gray-400">Tổng thanh toán</p>
          <p className="text-lg font-extrabold text-primary-600">{fmt(finalTotal)}</p>
        </div>
        <div className="flex gap-2">
          {order.status === 'pending' && (
            <button
              onClick={() => onCancel(order.id)}
              className="text-xs text-red-500 border border-red-200 hover:bg-red-50
                         px-3 py-2 rounded-xl transition-colors font-medium flex items-center gap-1"
            >
              <Ban className="w-3.5 h-3.5" /> Hủy
            </button>
          )}
          <button
            onClick={() => onViewDetail(order)}
            className="flex items-center gap-1.5 btn-outline text-xs py-2 px-3"
          >
            <Eye className="w-3.5 h-3.5" /> Chi tiết
          </button>
        </div>
      </div>
    </article>
  )
}

/* ─── Main page ────────────────────────────────────────────────────────────── */
export default function OrdersPage() {
  const isAuth   = useAuthStore(s => s.isAuthenticated())
  const navigate = useNavigate()

  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [filter,      setFilter]      = useState('all')
  const [selectedOrder, setSelected]  = useState(null)

  /* Load orders */
  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOrders()
      setOrders(Array.isArray(data) ? data : data.results ?? [])
    } catch (err) {
      if (err?.code === 'ERR_NETWORK') {
        // Demo fallback
        setOrders([
          {
            id: 10012, status: 'delivered', payment_method: 'cod',
            total_price: 22990000, shipping_fee: 0, final_total: 22990000,
            created_at: '2024-06-15T10:00:00Z',
            shipping_full_name: 'Nguyễn Văn A', shipping_phone: '0901234567',
            shipping_address: '123 Nguyễn Huệ, Q1, TP.HCM',
            items: [{ product_name: 'iPhone 15', product_image: 'https://images.unsplash.com/photo-1679761478891-50c4d3f0f69c?w=80', quantity: 1, price: 22990000 }],
          },
          {
            id: 10021, status: 'shipping', payment_method: 'bank',
            total_price: 10490000, shipping_fee: 0, final_total: 10490000,
            created_at: '2024-06-18T14:30:00Z',
            shipping_full_name: 'Trần Thị B', shipping_phone: '0912345678',
            shipping_address: '456 Lê Lợi, Q1, TP.HCM',
            items: [{ product_name: 'Samsung Galaxy A55 5G', product_image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=80', quantity: 1, price: 10490000 }],
          },
          {
            id: 10034, status: 'pending', payment_method: 'cod',
            total_price: 34480000, shipping_fee: 0, final_total: 34480000,
            created_at: '2024-06-20T09:15:00Z',
            shipping_full_name: 'Lê Văn C', shipping_phone: '0934567890',
            shipping_address: '789 Trần Hưng Đạo, Q5, TP.HCM',
            items: [
              { product_name: 'Samsung Galaxy S24 Ultra', product_image: 'https://images.unsplash.com/photo-1706789578150-4ebcc52e0e3d?w=80', quantity: 1, price: 30990000 },
              { product_name: 'Redmi 13C', product_image: 'https://images.unsplash.com/photo-1603732551658-5fabbebb14ea?w=80', quantity: 1, price: 3490000 },
            ],
          },
        ])
      } else {
        setError('Không thể tải danh sách đơn hàng.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuth) { navigate('/login', { state: { from: '/orders' } }); return }
    loadOrders()
  }, [isAuth, loadOrders, navigate])

  /* Cancel order */
  const handleCancel = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return
    try {
      try {
        await cancelOrder(orderId)
      } catch (err) {
        if (err?.code !== 'ERR_NETWORK') throw err
        // Demo: update local
      }
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o)
      )
      if (selectedOrder?.id === orderId) {
        setSelected(prev => prev ? { ...prev, status: 'cancelled' } : null)
      }
      toast.success('Đã hủy đơn hàng thành công.')
    } catch (err) {
      const msg = err?.response?.data?.error || 'Không thể hủy đơn hàng này.'
      toast.error(msg)
    }
  }

  /* Filter tabs */
  const TABS = [
    { key: 'all',       label: 'Tất cả' },
    { key: 'pending',   label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'shipping',  label: 'Đang giao' },
    { key: 'delivered', label: 'Đã giao' },
    { key: 'cancelled', label: 'Đã hủy' },
  ]

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const countByStatus = (s) => orders.filter(o => o.status === s).length

  if (!isAuth) return null

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900 font-medium">Đơn hàng của tôi</span>
          </nav>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Package className="w-6 h-6 text-primary-600" />
            Đơn hàng của tôi
            {orders.length > 0 && (
              <span className="text-base font-normal text-gray-400">({orders.length})</span>
            )}
          </h1>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600
                       px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {TABS.map(({ key, label }) => {
            const count = key === 'all' ? orders.length : countByStatus(key)
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full
                            text-xs font-semibold transition-all
                            ${filter === key
                              ? 'bg-primary-600 text-white shadow-sm'
                              : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}
              >
                {label}
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                                   ${filter === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Content */}
        {loading ? (
          <OrderSkeleton />
        ) : error ? (
          <div className="card p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-300 mx-auto" />
            <p className="text-gray-600 font-medium">{error}</p>
            <button onClick={loadOrders} className="btn-primary px-6 py-2.5 text-sm gap-2">
              <RefreshCcw className="w-4 h-4" /> Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-gray-200" />
            </div>
            <div>
              <p className="font-bold text-gray-700 text-lg mb-1">
                {filter === 'all' ? 'Chưa có đơn hàng nào' : `Không có đơn "${TABS.find(t => t.key === filter)?.label}"`}
              </p>
              <p className="text-gray-400 text-sm">
                {filter === 'all' ? 'Hãy mua sắm và đặt hàng ngay!' : 'Thử chọn tab khác hoặc đặt hàng mới.'}
              </p>
            </div>
            <Link to="/products" className="btn-primary px-6 py-2.5 text-sm">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetail={setSelected}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelected(null)}
          onCancel={async (id) => {
            await handleCancel(id)
            setSelected(null)
          }}
        />
      )}
    </div>
  )
}
