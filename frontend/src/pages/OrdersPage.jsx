import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Package, ChevronRight, Clock, CheckCircle, Truck,
  XCircle, ShoppingBag, Home, RefreshCcw, Loader2,
  MapPin, CreditCard, Eye, RotateCcw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'
import { fetchOrders, cancelOrder } from '../services/orderService'

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const STATUS_CFG = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', step: 1 },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700 border-blue-200',       step: 2 },
  shipping:  { label: 'Đang giao',    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',  step: 3 },
  delivered: { label: 'Đã giao',      color: 'bg-green-100 text-green-700 border-green-200',     step: 4 },
  cancelled: { label: 'Đã hủy',       color: 'bg-red-100 text-red-700 border-red-200',           step: 0 },
}

const STEPS = [
  { step: 1, label: 'Chờ xác nhận' },
  { step: 2, label: 'Đã xác nhận' },
  { step: 3, label: 'Đang giao' },
  { step: 4, label: 'Đã giao' },
]

export default function OrdersPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const addItem = useCartStore((s) => s.addItem)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await fetchOrders()
      setOrders(data.results || data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    loadOrders()
  }, [isAuthenticated])

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId}?`)) return
    try {
      await cancelOrder(orderId)
      toast.success('Hủy đơn hàng thành công')
      loadOrders()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Không thể hủy đơn hàng')
    }
  }

  const handleReorder = async (order) => {
    let count = 0
    for (const item of order.items || []) {
      if (item.product) {
        await addItem(item.product, item.quantity, { color: item.color, storage: item.storage })
        count++
      }
    }
    if (count > 0) {
      toast.success('Đã thêm sản phẩm từ đơn hàng vào giỏ!')
      navigate('/cart')
    } else {
      toast.error('Không tìm thấy sản phẩm khả dụng để mua lại.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
          <p className="text-sm text-gray-500">Quản lý và theo dõi tiến trình đơn hàng của bạn</p>
        </div>
        <button
          onClick={loadOrders}
          className="btn-outline text-xs px-3 py-2 gap-1.5"
          title="Tải lại"
        >
          <RefreshCcw className="w-3.5 h-3.5" /> Làm mới
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-3" />
          <p className="text-sm text-gray-500">Đang tải danh sách đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center space-y-4 my-8">
          <div className="w-16 h-16 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Bạn chưa có đơn hàng nào</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Khám phá những mẫu smartphone mới nhất và đặt hàng ngay hôm nay!
          </p>
          <Link to="/products" className="btn-primary inline-flex text-xs px-5 py-2.5">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const cfg = STATUS_CFG[order.status] || STATUS_CFG.pending
            const isCancelled = order.status === 'cancelled'

            return (
              <div key={order.id} className="card p-5 border border-gray-100 hover:shadow-md transition-shadow space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-sm font-bold text-gray-900">Đơn hàng #{order.id}</span>
                    <span className="text-xs text-gray-400 ml-3">
                      Ngày đặt: {order.created_at?.slice(0, 10)}
                    </span>
                  </div>
                  <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full border ${cfg.color} self-start sm:self-auto`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Tracking Stepper */}
                {!isCancelled && (
                  <div className="py-2 px-2 sm:px-6">
                    <div className="flex items-center justify-between relative">
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-100 z-0" />
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-600 z-0 transition-all duration-500"
                        style={{ width: `${((cfg.step - 1) / (STEPS.length - 1)) * 100}%` }}
                      />

                      {STEPS.map((s) => {
                        const passed = cfg.step >= s.step
                        return (
                          <div key={s.step} className="flex flex-col items-center relative z-10">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              passed ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-200 text-gray-500'
                            }`}>
                              {passed ? <CheckCircle className="w-4 h-4" /> : s.step}
                            </div>
                            <span className={`text-[10px] mt-1 font-semibold hidden sm:block ${
                              passed ? 'text-primary-600' : 'text-gray-400'
                            }`}>
                              {s.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-3 pt-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.product_image || 'https://placehold.co/40x40/f5f5f5/999?text=SP'}
                          alt=""
                          className="w-12 h-12 object-contain bg-gray-50 rounded-lg p-1 border border-gray-100 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 truncate">{item.product_name}</p>
                          <p className="text-gray-400">
                            {item.color ? `Màu: ${item.color}` : ''} {item.storage ? `• ${item.storage}` : ''} • SL: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-800">{fmt(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer info & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    <span>Giao tới: <strong>{order.shipping_address}</strong></span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div>
                      <span className="text-xs text-gray-500 mr-2">Tổng tiền:</span>
                      <span className="text-base font-extrabold text-red-600">{fmt(order.final_total || order.total_price)}</span>
                    </div>

                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="btn-outline text-xs text-red-600 hover:bg-red-50 border-red-200 py-2 px-3"
                        >
                          Hủy đơn
                        </button>
                      )}

                      <button
                        onClick={() => handleReorder(order)}
                        className="btn-primary text-xs py-2 px-3 gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Mua lại
                      </button>
                    </div>
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
