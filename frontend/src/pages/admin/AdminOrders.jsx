import { useState, useEffect, useCallback } from 'react'
import {
  Search, Eye, ChevronDown, Loader2, RefreshCcw,
  ShoppingCart, X, MapPin, CreditCard, CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminFetchOrders, adminUpdateOrderStatus } from '../../services/adminService'

const fmt = n =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const STATUS_CFG = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-400'   },
  shipping:  { label: 'Đang giao',    color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-400' },
  delivered: { label: 'Đã giao',      color: 'bg-green-100 text-green-700',   dot: 'bg-green-500'  },
  cancelled: { label: 'Đã hủy',       color: 'bg-red-100 text-red-700',       dot: 'bg-red-400'    },
}

const STATUS_FLOW = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled']

const PAYMENT_LABEL = { cod: 'COD', bank: 'Chuyển khoản', online: 'Online' }

/* ── Inline status changer ── */
function StatusDropdown({ order, onChange }) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const cfg = STATUS_CFG[order.status] || STATUS_CFG.pending

  const handleChange = async (newStatus) => {
    if (newStatus === order.status) { setOpen(false); return }
    setLoading(true); setOpen(false)
    try {
      await onChange(order.id, newStatus)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading || order.status === 'cancelled' || order.status === 'delivered'}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold
                   px-2.5 py-1.5 rounded-full border transition-colors
                   ${cfg.color}
                   ${(loading || order.status === 'cancelled' || order.status === 'delivered')
                     ? 'cursor-not-allowed opacity-70'
                     : 'hover:opacity-80 cursor-pointer'}`}
      >
        {loading
          ? <Loader2 className="w-3 h-3 animate-spin" />
          : <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        }
        {cfg.label}
        {!loading && order.status !== 'cancelled' && order.status !== 'delivered' && (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-1 left-0 bg-white rounded-xl shadow-xl
                          border border-gray-100 py-1 min-w-[160px] animate-fade-in">
            {STATUS_FLOW.map(s => {
              const c = STATUS_CFG[s]
              return (
                <button
                  key={s}
                  onClick={() => handleChange(s)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors
                             flex items-center gap-2
                             ${s === order.status ? 'font-bold' : 'font-medium'}`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                  {c.label}
                  {s === order.status && <CheckCircle className="w-3 h-3 text-primary-500 ml-auto" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Order detail modal ── */
function OrderDetailModal({ order, onClose, onStatusChange }) {
  const shippingFee = Number(order.total_price) >= 1_000_000 ? 0 : 30_000
  const finalTotal  = order.final_total ?? (Number(order.total_price) + shippingFee)

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh]
                        overflow-y-auto animate-fade-in">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
            <div>
              <h2 className="font-bold text-gray-900">Đơn hàng #{order.id}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(order.created_at).toLocaleString('vi-VN')}
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Status control */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
              <span className="text-sm font-semibold text-gray-700">Trạng thái đơn hàng</span>
              <StatusDropdown order={order} onChange={async (id, s) => {
                await onStatusChange(id, s)
                order.status = s  // optimistic
              }} />
            </div>

            {/* Shipping info */}
            <div className="space-y-2 bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Thông tin giao hàng</p>
              {[
                [MapPin,     'Người nhận', order.shipping_full_name],
                [MapPin,     'Điện thoại', order.shipping_phone],
                ...(order.shipping_email ? [[MapPin, 'Email', order.shipping_email]] : []),
                [MapPin,     'Địa chỉ',   order.shipping_address],
                [CreditCard, 'Thanh toán', PAYMENT_LABEL[order.payment_method] || order.payment_method],
                ...(order.note ? [[MapPin, 'Ghi chú', order.note]] : []),
              ].map(([Ico, k, v]) => (
                <div key={k} className="flex gap-2 text-sm">
                  <span className="text-gray-500 w-24 flex-shrink-0">{k}:</span>
                  <span className="text-gray-800 font-medium">{v}</span>
                </div>
              ))}
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Sản phẩm</p>
              <div className="space-y-2">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <img
                      src={item.product_image || 'https://placehold.co/44x44/f5f5f5/999?text=SP'}
                      alt={item.product_name}
                      className="w-11 h-11 object-contain rounded-lg border border-gray-200 bg-white p-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.product_name}</p>
                      <p className="text-xs text-gray-400">x{item.quantity} · {fmt(item.price)}/cái</p>
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
                <span className={shippingFee === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                  {shippingFee === 0 ? 'Miễn phí' : fmt(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold border-t border-primary-200 pt-2">
                <span>Tổng thanh toán</span>
                <span className="text-primary-600 text-lg">{fmt(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Demo data ── */
const DEMO_ORDERS = [
  { id:10034, status:'pending',   payment_method:'cod',  total_price:34480000, shipping_full_name:'Lê Văn C',    shipping_phone:'0934567890', shipping_address:'789 Trần Hưng Đạo, Q5, TP.HCM', created_at:'2024-06-20T09:15:00Z', items:[{product_name:'Samsung Galaxy S24 Ultra',product_image:'https://images.unsplash.com/photo-1706789578150-4ebcc52e0e3d?w=60',quantity:1,price:30990000},{product_name:'Redmi 13C',product_image:'https://images.unsplash.com/photo-1603732551658-5fabbebb14ea?w=60',quantity:1,price:3490000}] },
  { id:10021, status:'shipping',  payment_method:'bank', total_price:10490000, shipping_full_name:'Trần Thị B',  shipping_phone:'0912345678', shipping_address:'456 Lê Lợi, Q1, TP.HCM',          created_at:'2024-06-18T14:30:00Z', items:[{product_name:'Samsung Galaxy A55 5G',product_image:'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=60',quantity:1,price:10490000}] },
  { id:10012, status:'delivered', payment_method:'cod',  total_price:22990000, shipping_full_name:'Nguyễn Văn A',shipping_phone:'0901234567', shipping_address:'123 Nguyễn Huệ, Q1, TP.HCM',      created_at:'2024-06-15T10:00:00Z', items:[{product_name:'iPhone 15',product_image:'https://images.unsplash.com/photo-1679761478891-50c4d3f0f69c?w=60',quantity:1,price:22990000}] },
]

/* ── Main ── */
export default function AdminOrders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [status,  setStatus]  = useState('all')
  const [selected,setSelected]= useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (status !== 'all') params.status = status
      if (search)           params.search = search
      const data = await adminFetchOrders(params)
      setOrders(Array.isArray(data) ? data : data.results ?? DEMO_ORDERS)
    } catch {
      setOrders(DEMO_ORDERS)
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (id, newStatus) => {
    try {
      try {
        await adminUpdateOrderStatus(id, newStatus)
      } catch (err) {
        if (err?.code !== 'ERR_NETWORK') throw err
      }
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: newStatus } : null)
      toast.success(`Cập nhật trạng thái: ${STATUS_CFG[newStatus]?.label}`)
    } catch (err) {
      toast.error(err?.response?.data?.status?.[0] || 'Không thể cập nhật trạng thái.')
    }
  }

  const counts = STATUS_FLOW.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length
    return acc
  }, {})

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-sm text-gray-500">{orders.length} đơn hàng</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-gray-500
                                         hover:text-primary-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <RefreshCcw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tên, SĐT..."
            className="input pl-9 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{ k: 'all', l: 'Tất cả' }, ...STATUS_FLOW.map(s => ({ k: s, l: STATUS_CFG[s].label }))].map(({ k, l }) => (
            <button key={k} onClick={() => setStatus(k)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold
                         border transition-all
                         ${status === k ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 bg-white hover:border-primary-300'}`}>
              {l}
              {k !== 'all' && counts[k] > 0 && (
                <span className={`text-[10px] font-bold px-1 rounded-full
                                 ${status === k ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {counts[k]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary-500" />Đang tải...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Tổng tiền', 'Thanh toán', 'Trạng thái', 'Ngày đặt', 'Thao tác'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => {
                  const shippingFee = Number(order.total_price) >= 1_000_000 ? 0 : 30_000
                  const finalTotal  = order.final_total ?? (Number(order.total_price) + shippingFee)
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">#{order.id}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900 whitespace-nowrap">{order.shipping_full_name}</p>
                        <p className="text-xs text-gray-400">{order.shipping_phone}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex -space-x-1">
                          {(order.items || []).slice(0, 3).map((item, i) => (
                            <img key={i} src={item.product_image || 'https://placehold.co/28x28/f5f5f5/999?text=SP'}
                              alt={item.product_name}
                              title={item.product_name}
                              className="w-7 h-7 rounded-full border-2 border-white object-contain bg-gray-50"
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{(order.items || []).length} SP</p>
                      </td>
                      <td className="py-3 px-4 font-bold text-primary-600 whitespace-nowrap">
                        {fmt(finalTotal)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          {PAYMENT_LABEL[order.payment_method] || order.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusDropdown order={order} onChange={handleStatusChange} />
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelected(order)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg
                                     bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                <p>Không có đơn hàng nào</p>
              </div>
            )}
          </div>
        )}
      </div>

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
