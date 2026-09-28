import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight,
  Search, LayoutGrid, List, Loader2, RefreshCcw, Home,
  ShoppingCart, Eye,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ProductCard from '../components/product/ProductCard'
import { useProducts } from '../hooks/useProducts'
import useCartStore from '../store/cartStore'

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 12

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Mới nhất' },
  { value: 'price',       label: 'Giá: Thấp → Cao' },
  { value: '-price',      label: 'Giá: Cao → Thấp' },
  { value: '-discount',   label: 'Giảm giá nhiều nhất' },
  { value: 'name',        label: 'Tên A → Z' },
]

const PRICE_RANGES = [
  { label: 'Tất cả',         min: '',          max: '' },
  { label: 'Dưới 5 triệu',   min: '0',         max: '5000000' },
  { label: '5 – 10 triệu',   min: '5000000',   max: '10000000' },
  { label: '10 – 20 triệu',  min: '10000000',  max: '20000000' },
  { label: '20 – 30 triệu',  min: '20000000',  max: '30000000' },
  { label: 'Trên 30 triệu',  min: '30000000',  max: '' },
]

const RAM_OPTIONS     = ['Tất cả', '4GB', '6GB', '8GB', '12GB', '16GB']
const STORAGE_OPTIONS = ['Tất cả', '64GB', '128GB', '256GB', '512GB', '1TB']

const DEFAULT_BRANDS = [
  { slug: 'apple',   name: 'Apple' },
  { slug: 'samsung', name: 'Samsung' },
  { slug: 'xiaomi',  name: 'Xiaomi' },
  { slug: 'oppo',    name: 'OPPO' },
  { slug: 'vivo',    name: 'Vivo' },
  { slug: 'google',  name: 'Google' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(p) {
  if (!p && p !== 0) return ''
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency', currency: 'VND', maximumFractionDigits: 0,
  }).format(Number(p))
}

function getStorageDisplay(specs) {
  const s = specs?.storage
  if (!s) return null
  return Array.isArray(s) ? s[0] : String(s)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Accordion section cho sidebar */
function FilterSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-3.5 text-sm font-semibold
                   text-gray-800 hover:text-primary-600 transition-colors"
      >
        {title}
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

/** Skeleton cho product card */
function ProductSkeleton() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 space-y-2.5">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="flex gap-1">
          <div className="h-5 bg-gray-200 rounded w-14" />
          <div className="h-5 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-5 bg-gray-200 rounded w-2/5" />
        <div className="h-9 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}

/** Phân trang */
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null

  const buildPages = () => {
    const delta = 2
    const pages = new Set([1, total])
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      pages.add(i)
    }
    const sorted = [...pages].sort((a, b) => a - b)
    const result = []
    sorted.forEach((p, i) => {
      if (i > 0 && p - sorted[i - 1] > 1) result.push('gap')
      result.push(p)
    })
    return result
  }

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current <= 1}
        aria-label="Trang trước"
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200
                   text-gray-500 hover:border-primary-400 hover:text-primary-600
                   disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {buildPages().map((item, i) =>
        item === 'gap' ? (
          <span key={`gap-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none">…</span>
        ) : (
          <button
            key={item}
            onClick={() => onChange(item)}
            aria-current={item === current ? 'page' : undefined}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold border transition-all
                       ${item === current
                         ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200'
                         : 'border-gray-200 text-gray-700 hover:border-primary-400 hover:text-primary-600'
                       }`}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current >= total}
        aria-label="Trang sau"
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200
                   text-gray-500 hover:border-primary-400 hover:text-primary-600
                   disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}

/** List view row */
function ListProductRow({ product }) {
  const addItem  = useCartStore(s => s.addItem)
  const openCart = useCartStore(s => s.openCart)
  const currentPrice = product.current_price ?? product.price
  const hasDiscount  = product.discount_percent > 0
  const storage      = getStorageDisplay(product.specs)

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1)
    openCart()
    toast.success(`Đã thêm "${product.name}" vào giỏ`)
  }

  return (
    <article className="card flex gap-3 sm:gap-4 p-3 sm:p-4 hover:shadow-md transition-shadow group">
      {/* Image */}
      <Link
        to={`/products/${product.id}`}
        className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-50 rounded-xl
                   overflow-hidden border border-gray-100 flex items-center justify-center"
      >
        <img
          src={product.primary_image || 'https://placehold.co/112x112/f5f5f5/999?text=No+Image'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wide">
          {product.brand_name}
        </span>

        <Link
          to={`/products/${product.id}`}
          className="font-semibold text-gray-900 hover:text-primary-600 transition-colors
                     line-clamp-2 text-sm leading-snug"
        >
          {product.name}
        </Link>

        {/* Spec chips */}
        <div className="flex flex-wrap gap-1.5">
          {product.specs?.ram && (
            <span className="text-[10px] bg-blue-50 text-blue-600 font-medium px-1.5 py-0.5 rounded border border-blue-100">
              RAM {product.specs.ram}
            </span>
          )}
          {storage && (
            <span className="text-[10px] bg-purple-50 text-purple-600 font-medium px-1.5 py-0.5 rounded border border-purple-100">
              {storage}
            </span>
          )}
          {product.specs?.display && (
            <span className="hidden sm:inline text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
              {product.specs.display.split(',')[0]}
            </span>
          )}
        </div>

        {/* Price row + actions */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-extrabold text-primary-600 text-base sm:text-lg leading-none">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs text-gray-400 line-through hidden sm:inline">
                  {formatPrice(product.price)}
                </span>
                <span className="badge-sale">-{product.discount_percent}%</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleAdd}
              disabled={!product.in_stock}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                         bg-primary-600 text-white hover:bg-primary-700 active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thêm giỏ</span>
            </button>
            <Link
              to={`/products/${product.id}`}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold
                         border border-gray-200 text-gray-600
                         hover:border-primary-400 hover:text-primary-600 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chi tiết</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [viewMode,     setViewMode]     = useState('grid')
  const [searchInput,  setSearchInput]  = useState('')

  // Đọc filters từ URL
  const filters = {
    search:     searchParams.get('search')      || '',
    brand_slug: searchParams.get('brand_slug')  || '',
    price_min:  searchParams.get('price_min')   || '',
    price_max:  searchParams.get('price_max')   || '',
    ram:        searchParams.get('ram')         || '',
    storage:    searchParams.get('storage')     || '',
    ordering:   searchParams.get('ordering')    || '-created_at',
    page:       searchParams.get('page')        || '1',
    page_size:  String(PAGE_SIZE),
  }

  // Sync search input với URL (back/forward navigation)
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '')
  }, [searchParams])

  // Gọi API qua hook
  const {
    products, brands: apiBrands, loading, error,
    totalCount, totalPages, currentPage, refetch,
  } = useProducts(filters)

  const brandList = apiBrands.length > 0 ? apiBrands : DEFAULT_BRANDS

  // ── URL helpers ──────────────────────────────────────────────────────────────
  const setParam = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value !== '' && value !== null && value !== undefined) {
        next.set(key, value)
      } else {
        next.delete(key)
      }
      if (key !== 'page') next.set('page', '1')
      return next
    })
  }, [setSearchParams])

  const setMultiParam = useCallback((entries) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      entries.forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) next.set(k, v)
        else next.delete(k)
      })
      next.set('page', '1')
      return next
    })
  }, [setSearchParams])

  const clearAll = useCallback(() => {
    setSearchParams({})
    setSearchInput('')
  }, [setSearchParams])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setParam('search', searchInput.trim())
  }

  const handlePageChange = (page) => {
    setParam('page', String(page))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Active filter chips ───────────────────────────────────────────────────────
  const activeFilters = [
    filters.search && {
      key: 'search',
      label: `"${filters.search}"`,
      clear: () => { setParam('search', ''); setSearchInput('') },
    },
    filters.brand_slug && {
      key: 'brand',
      label: brandList.find(b => b.slug === filters.brand_slug)?.name || filters.brand_slug,
      clear: () => setParam('brand_slug', ''),
    },
    (filters.price_min || filters.price_max) && {
      key: 'price',
      label: `${filters.price_min ? formatPrice(filters.price_min) : '0'} – ${filters.price_max ? formatPrice(filters.price_max) : '∞'}`,
      clear: () => setMultiParam([['price_min', ''], ['price_max', '']]),
    },
    filters.ram && {
      key: 'ram',
      label: `RAM ${filters.ram}`,
      clear: () => setParam('ram', ''),
    },
    filters.storage && {
      key: 'storage',
      label: filters.storage,
      clear: () => setParam('storage', ''),
    },
  ].filter(Boolean)

  // ── Sidebar ───────────────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div>
      {/* Hãng */}
      <FilterSection title="Thương hiệu" defaultOpen>
        <div className="space-y-1">
          {[{ slug: '', name: 'Tất cả hãng' }, ...brandList].map(b => {
            const active = filters.brand_slug === b.slug
            return (
              <label key={b.slug || '__all'} className="flex items-center gap-2.5 py-1 cursor-pointer group">
                <input
                  type="radio" name="brand" value={b.slug}
                  checked={active}
                  onChange={() => setParam('brand_slug', b.slug)}
                  className="accent-primary-600 w-3.5 h-3.5 flex-shrink-0"
                />
                <span className={`text-sm transition-colors
                  ${active ? 'text-primary-600 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                  {b.name}
                </span>
              </label>
            )
          })}
        </div>
      </FilterSection>

      {/* Khoảng giá */}
      <FilterSection title="Khoảng giá">
        <div className="space-y-1">
          {PRICE_RANGES.map(range => {
            const active = filters.price_min === range.min && filters.price_max === range.max
            return (
              <label key={range.label} className="flex items-center gap-2.5 py-1 cursor-pointer group">
                <input
                  type="radio" name="price"
                  checked={active}
                  onChange={() => setMultiParam([['price_min', range.min], ['price_max', range.max]])}
                  className="accent-primary-600 w-3.5 h-3.5 flex-shrink-0"
                />
                <span className={`text-sm transition-colors
                  ${active ? 'text-primary-600 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                  {range.label}
                </span>
              </label>
            )
          })}
        </div>
        {/* Custom range */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 mb-2 font-medium uppercase tracking-wide">Tự nhập khoảng giá:</p>
          <div className="flex gap-1.5 items-center">
            <input
              type="number" min={0} placeholder="Từ (VNĐ)"
              value={filters.price_min}
              onChange={e => setParam('price_min', e.target.value)}
              className="input py-1.5 px-2 text-xs w-full"
            />
            <span className="text-gray-300 text-xs flex-shrink-0">–</span>
            <input
              type="number" min={0} placeholder="Đến (VNĐ)"
              value={filters.price_max}
              onChange={e => setParam('price_max', e.target.value)}
              className="input py-1.5 px-2 text-xs w-full"
            />
          </div>
        </div>
      </FilterSection>

      {/* RAM */}
      <FilterSection title="RAM">
        <div className="flex flex-wrap gap-1.5">
          {RAM_OPTIONS.map(r => {
            const val    = r === 'Tất cả' ? '' : r
            const active = filters.ram === val
            return (
              <button key={r} onClick={() => setParam('ram', val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all
                  ${active
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'
                  }`}
              >{r}</button>
            )
          })}
        </div>
      </FilterSection>

      {/* Bộ nhớ */}
      <FilterSection title="Bộ nhớ trong">
        <div className="flex flex-wrap gap-1.5">
          {STORAGE_OPTIONS.map(s => {
            const val    = s === 'Tất cả' ? '' : s
            const active = filters.storage === val
            return (
              <button key={s} onClick={() => setParam('storage', val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all
                  ${active
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'
                  }`}
              >{s}</button>
            )
          })}
        </div>
      </FilterSection>

      {/* Clear all */}
      {activeFilters.length > 0 && (
        <div className="pt-4">
          <button onClick={clearAll}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                       border-2 border-red-200 text-red-600 text-sm font-semibold
                       hover:bg-red-50 transition-colors"
          >
            <X className="w-4 h-4" />
            Xoá {activeFilters.length} bộ lọc
          </button>
        </div>
      )}
    </div>
  )

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top bar: breadcrumb + search ── */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 min-w-0">
              <Link to="/" className="hover:text-primary-600 flex items-center gap-1 flex-shrink-0">
                <Home className="w-3.5 h-3.5" /> Trang chủ
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-medium flex-shrink-0">Điện thoại</span>
              {filters.brand_slug && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="text-primary-600 font-medium truncate">
                    {brandList.find(b => b.slug === filters.brand_slug)?.name || filters.brand_slug}
                  </span>
                </>
              )}
            </nav>

            {/* Search form */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 sm:ml-auto sm:w-80 lg:w-96">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Tìm điện thoại, hãng..."
                  className="input pl-9 py-2 text-sm pr-8"
                  aria-label="Tìm kiếm sản phẩm"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => { setSearchInput(''); setParam('search', '') }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Xoá tìm kiếm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button type="submit" className="btn-primary px-4 py-2 text-sm flex-shrink-0">
                Tìm
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* ── Desktop sidebar ── */}
          <aside aria-label="Bộ lọc sản phẩm" className="hidden lg:block w-60 flex-shrink-0">
            <div className="card p-4 sticky top-36">
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary-500" />
                Bộ lọc sản phẩm
              </h2>
              <SidebarContent />
            </div>
          </aside>

          {/* ── Main ── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Mobile filter button */}
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Mở bộ lọc"
                className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl border-2
                           border-gray-200 text-sm font-medium text-gray-700
                           hover:border-primary-400 hover:text-primary-600 transition-all"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Lọc
                {activeFilters.length > 0 && (
                  <span className="bg-primary-600 text-white text-[10px] font-bold
                                   w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilters.length}
                  </span>
                )}
              </button>

              {/* Count */}
              <p className="text-sm text-gray-500 flex-1">
                {loading ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-500" />
                    Đang tải...
                  </span>
                ) : (
                  <>
                    <strong className="text-gray-900">{totalCount.toLocaleString('vi-VN')}</strong>
                    {' '}sản phẩm
                    {filters.search && (
                      <> cho <em className="not-italic text-primary-600 font-medium">"{filters.search}"</em></>
                    )}
                  </>
                )}
              </p>

              {/* Sort */}
              <div className="relative">
                <select
                  value={filters.ordering}
                  onChange={e => setParam('ordering', e.target.value)}
                  aria-label="Sắp xếp theo"
                  className="input py-2 pl-3 pr-8 text-sm appearance-none cursor-pointer w-48"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View toggle */}
              <div className="hidden sm:flex items-center border border-gray-200 rounded-xl overflow-hidden">
                {[
                  { mode: 'grid', Icon: LayoutGrid },
                  { mode: 'list', Icon: List },
                ].map(({ mode, Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    aria-label={mode === 'grid' ? 'Xem dạng lưới' : 'Xem dạng danh sách'}
                    aria-pressed={viewMode === mode}
                    className={`p-2 transition-colors
                      ${viewMode === mode ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeFilters.map(f => (
                  <span key={f.key}
                    className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700
                               text-xs font-medium px-3 py-1.5 rounded-full border border-primary-200"
                  >
                    {f.label}
                    <button onClick={f.clear} aria-label={`Xoá lọc ${f.label}`}
                      className="text-primary-500 hover:text-primary-800 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button onClick={clearAll}
                  className="text-xs text-red-500 hover:text-red-600 font-semibold
                             px-2 py-1.5 rounded-full hover:bg-red-50 transition-colors"
                >
                  Xoá tất cả
                </button>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="card p-6 text-center mb-5 border border-red-100 bg-red-50">
                <p className="text-red-600 text-sm font-medium mb-3">
                  Không thể tải sản phẩm từ máy chủ.
                </p>
                <button onClick={refetch}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600
                             text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" /> Thử lại
                </button>
              </div>
            )}

            {/* Product grid / list */}
            {loading ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {Array.from({ length: PAGE_SIZE }).map((_, i) => <ProductSkeleton key={i} />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="card h-28 animate-pulse bg-gray-100" />
                  ))}
                </div>
              )
            ) : products.length === 0 ? (
              <div className="card py-20 flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-9 h-9 text-gray-300" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1">Không tìm thấy sản phẩm</h3>
                  <p className="text-gray-400 text-sm max-w-xs">
                    Thử thay đổi bộ lọc hoặc tìm kiếm với từ khoá khác
                  </p>
                </div>
                <button onClick={clearAll} className="btn-primary px-6 py-2.5 text-sm">
                  Xoá bộ lọc — xem tất cả
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="space-y-3">
                {products.map(p => <ListProductRow key={p.id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && (
              <>
                <Pagination current={currentPage} total={totalPages} onChange={handlePageChange} />
                <p className="text-center text-xs text-gray-400 mt-3">
                  Đang xem trang {currentPage}/{totalPages} — {totalCount.toLocaleString('vi-VN')} sản phẩm
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile sidebar drawer ── */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside
            aria-label="Bộ lọc sản phẩm (mobile)"
            className="fixed inset-y-0 left-0 z-50 w-80 max-w-[90vw] bg-white shadow-2xl flex flex-col animate-fade-in"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary-500" />
                Bộ lọc sản phẩm
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Đóng bộ lọc"
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-2">
              <SidebarContent />
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-white">
              <button
                onClick={() => setSidebarOpen(false)}
                className="btn-primary w-full py-3 text-sm"
              >
                Xem {totalCount.toLocaleString('vi-VN')} sản phẩm
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
