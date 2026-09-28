import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, ShoppingCart, Users, TrendingUp, TrendingDown,
  AlertTriangle, Clock, RefreshCcw, ArrowRight,
  CheckCircle, Truck, XCircle, DollarSign,
} from 'lucide-react'
import { fetchStats } from '../../services/adminService'

const fmt = n =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const fmtCompact = n => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' tỷ'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' tr'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'k'
  return String(n)
}

/* ── Mini bar chart ── */
function MiniBar({ data }) {
  if (!data?.length) return <div className="h-16 flex items-end gap-0.5 justify-center text-xs text-gray-400">Chưa có dữ liệu</div>
  const max = Math.max(...data.map(d => d.revenue), 1)
  return (
    <div className="flex items-end gap-0.5 h-16 mt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group">
          <div
            className="w-full bg-primary-400 rounded-sm hover:bg-primary-500 transition-colors
                       cursor-pointer relative"
            style={{ height: `${Math.max((d.revenue / max) * 52, 2)}px` }}
            title={`${d.date}: ${fmt(d.revenue)}`}
          />
        </div>
      ))}
    </div>
  )
}

/* ── Stat card ── */
function StatCard({ icon: Icon, label, value, sub, color, trend, link }) {
  const isUp = trend > 0
  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold
                           ${isUp ? 'text-green-600' : 'text-red-500'}`}>
            {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-gray-900 mt-3 leading-none">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      {link && (
        <Link to={link}
          className="text-xs text-primary-600 hover:underline flex items-center gap-0.5 mt-2 font-medium">
          Xem chi tiết <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  )
}

const STATUS_COLOR = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipping:  'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}
const STATUS_LABEL = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
  shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy',
}

/* ── Demo data fallback ── */
const DEMO = {
  products: { total: 20, active: 18, low_stock: 3, out_of_stock: 1 },
  users:    { total: 145, active: 140, new_month: 12 },
  orders: {
    total: 89, pending: 5, this_month: 23, prev_month: 18,
    by_status: [
      { status: 'pending', count: 5 }, { status: 'confirmed', count: 8 },
      { status: 'shipping', count: 12 }, { status: 'delivered', count: 58 },
      { status: 'cancelled', count: 6 },
    ],
  },
  revenue: {
    total: 1_850_000_000, this_month: 320_000_000, prev_month: 275_000_000,
    daily: Array.from({ length: 7 }, (_, i) => ({
      date: `2024-06-${15 + i}`,
      revenue: Math.random() * 80_000_000 + 20_000_000,
      orders: Math.floor(Math.random() * 8) + 2,
    })),
  },
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchStats()
      setStats(data)
    } catch {
      setStats(DEMO)  // fallback demo
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="card p-5 animate-pulse h-32">
          <div className="w-11 h-11 bg-gray-200 rounded-xl mb-3" />
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      ))}
    </div>
  )

  const s = stats
  const revTrend = s.revenue.prev_month > 0
    ? Math.round(((s.revenue.this_month - s.revenue.prev_month) / s.revenue.prev_month) * 100)
    : 0
  const ordTrend = s.orders.prev_month > 0
    ? Math.round(((s.orders.this_month - s.orders.prev_month) / s.orders.prev_month) * 100)
    : 0

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tổng quan hoạt động cửa hàng</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600
                     px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <RefreshCcw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {/* ── 4 stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package} label="Tổng sản phẩm"
          value={s.products.total}
          sub={`${s.products.active} đang bán`}
          color="bg-blue-100 text-blue-600"
          link="/admin/products"
        />
        <StatCard
          icon={Users} label="Người dùng"
          value={s.users.total}
          sub={`+${s.users.new_month} tháng này`}
          color="bg-purple-100 text-purple-600"
          link="/admin/users"
        />
        <StatCard
          icon={ShoppingCart} label="Tổng đơn hàng"
          value={s.orders.total}
          sub={`${s.orders.pending} đang chờ`}
          color="bg-orange-100 text-orange-600"
          trend={ordTrend}
          link="/admin/orders"
        />
        <StatCard
          icon={DollarSign} label="Doanh thu"
          value={fmtCompact(s.revenue.total)}
          sub={`Tháng này: ${fmtCompact(s.revenue.this_month)}`}
          color="bg-green-100 text-green-600"
          trend={revTrend}
        />
      </div>

      {/* ── Row 2: Chart + Order status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue 7 days */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-gray-900 text-sm">Doanh thu 7 ngày gần nhất</h2>
            <span className={`text-xs font-semibold flex items-center gap-0.5
                             ${revTrend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {revTrend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {Math.abs(revTrend)}% so với tháng trước
            </span>
          </div>
          <MiniBar data={s.revenue.daily} />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            {s.revenue.daily.map((d, i) => (
              <span key={i}>{d.date?.slice(5)}</span>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-6">
            {[
              { label: 'Tháng này', val: fmt(s.revenue.this_month), color: 'text-primary-600' },
              { label: 'Tháng trước', val: fmt(s.revenue.prev_month), color: 'text-gray-500' },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <p className="text-xs text-gray-400">{label}</p>
                <p className={`font-bold text-sm ${color}`}>{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order by status */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Trạng thái đơn hàng</h2>
          <div className="space-y-2.5">
            {s.orders.by_status.map(({ status, count }) => {
              const pct = s.orders.total > 0 ? Math.round((count / s.orders.total) * 100) : 0
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[status]}`}>
                      {STATUS_LABEL[status]}
                    </span>
                    <span className="font-bold text-gray-700">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Row 3: Alerts ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {s.products.out_of_stock > 0 && (
          <div className="card p-4 border-l-4 border-red-500 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-gray-800">{s.products.out_of_stock} sản phẩm hết hàng</p>
              <Link to="/admin/products?filter=out_of_stock"
                className="text-xs text-red-600 hover:underline">Xem ngay →</Link>
            </div>
          </div>
        )}
        {s.products.low_stock > 0 && (
          <div className="card p-4 border-l-4 border-yellow-400 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-gray-800">{s.products.low_stock} sản phẩm sắp hết</p>
              <Link to="/admin/products?filter=low_stock"
                className="text-xs text-yellow-600 hover:underline">Cập nhật tồn kho →</Link>
            </div>
          </div>
        )}
        {s.orders.pending > 0 && (
          <div className="card p-4 border-l-4 border-blue-500 flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-gray-800">{s.orders.pending} đơn chờ xác nhận</p>
              <Link to="/admin/orders?status=pending"
                className="text-xs text-blue-600 hover:underline">Xử lý ngay →</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
