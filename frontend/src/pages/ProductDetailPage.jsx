import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight, Star, Minus, Plus, ShoppingCart, Zap,
  Heart, Share2, ShieldCheck, Truck, RefreshCcw, Award,
  Smartphone, Cpu, Battery, Camera, Monitor, Weight,
  Droplets, CheckCircle, XCircle, ThumbsUp, MessageSquare,
  ChevronDown, ChevronUp, Home,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../hooks/useCart'
import useAuthStore from '../store/authStore'
import { products } from '../data/mockData'
import ProductCard from '../components/product/ProductCard'

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

/* Ánh xạ key spec → icon + label tiếng Việt */
const SPEC_META = {
  ram:              { Icon: Cpu,        label: 'RAM' },
  storage:          { Icon: Smartphone, label: 'Bộ nhớ' },
  chip:             { Icon: Cpu,        label: 'Vi xử lý' },
  display:          { Icon: Monitor,    label: 'Màn hình' },
  camera:           { Icon: Camera,     label: 'Camera' },
  battery:          { Icon: Battery,    label: 'Pin' },
  os:               { Icon: Smartphone, label: 'Hệ điều hành' },
  weight:           { Icon: Weight,     label: 'Trọng lượng' },
  water_resistance: { Icon: Droplets,   label: 'Chống nước' },
  extras:           { Icon: Award,      label: 'Tính năng nổi bật' },
}

/* Màu sắc swatch */
const COLOR_MAP = {
  'Đen': '#1a1a1a', 'Đen Than': '#2d2d2d', 'Đen Huyền Thoại': '#1a1a2e',
  'Trắng': '#f5f5f5', 'Trắng Sữa': '#f8f3e8', 'Trắng Ngọc Trai': '#f0ebe1', 'Trắng Ceramic': '#f9f9f9',
  'Vàng': '#d4a843', 'Titan Tự Nhiên': '#c8b9a5', 'Titan Vàng': '#c8a96e',
  'Xanh Dương': '#1a73e8', 'Xanh Lá': '#2e7d32', 'Xanh Băng': '#b3e5fc', 'Xanh Ngọc': '#00897b',
  'Hồng': '#e91e8c', 'Tím': '#7b1fa2', 'Tím Bình Minh': '#9c27b0',
  'Titan Đen': '#3d3d3d', 'Titan Trắng': '#e8e8e8', 'Titan Xanh': '#4a6fa5', 'Titan Xám': '#9e9e9e',
  'Titan Tím': '#7b68ee', 'Cobalt Violet': '#5c3d99', 'Onyx Black': '#0d0d0d',
  'Marble Gray': '#888', 'Sandstone Orange': '#e8703a',
  'Awesome Iceblue': '#a8d8ea', 'Awesome Lilac': '#c8a2c8',
  'Awesome Navy': '#2c3e6d', 'Awesome Lemon': '#fff176',
  'Obsidian': '#1c1c1c', 'Porcelain': '#f5ede3', 'Bay': '#457b9d', 'Aloe': '#a8c5a0',
  'Đỏ': '#c62828', 'Peacock Green': '#00796b', 'Noble Black': '#212121',
}

/* Reviews mẫu */
const MOCK_REVIEWS = [
  { id:1, name:'Nguyễn Văn Anh',   avatar:'A', rating:5, date:'20/06/2024', color:'Titan Đen', storage:'256GB', verified:true,  likes:24, text:'Máy rất đẹp, chất lượng tuyệt vời! Camera chụp ảnh sắc nét, pin dùng cả ngày không hết. Đóng gói cẩn thận, giao hàng nhanh. Rất hài lòng với sản phẩm này.' },
  { id:2, name:'Trần Thị Bình',    avatar:'B', rating:5, date:'15/06/2024', color:'Titan Trắng', storage:'512GB', verified:true,  likes:17, text:'Sản phẩm chính hãng, seal mới 100%. Màn hình đẹp, chip A17 Pro mạnh mẽ, chơi game mượt mà. Tuy nhiên giá hơi cao so với tầm tiền nhưng xứng đáng với chất lượng.' },
  { id:3, name:'Lê Minh Cường',    avatar:'C', rating:4, date:'10/06/2024', color:'Titan Xanh', storage:'256GB', verified:false, likes:9,  text:'Đây là lần thứ 3 tôi mua hàng tại PhoneStore. Chất lượng dịch vụ vẫn rất tốt, nhân viên tư vấn nhiệt tình, có hỗ trợ trả góp 0%. Sẽ tiếp tục ủng hộ.' },
  { id:4, name:'Phạm Thu Hà',      avatar:'P', rating:5, date:'05/06/2024', color:'Titan Tự Nhiên', storage:'1TB', verified:true,  likes:31, text:'Mua tặng chồng nhân dịp sinh nhật. Anh ấy rất thích, dùng thấy mượt hơn máy cũ nhiều. Cảm ơn PhoneStore đã tư vấn tận tình và giao hàng đúng hẹn!' },
  { id:5, name:'Hoàng Đức Nam',    avatar:'H', rating:3, date:'01/06/2024', color:'Titan Đen', storage:'256GB', verified:true,  likes:5,  text:'Sản phẩm ổn nhưng hộp có vết xước nhỏ ở góc. Shop đã hỗ trợ giảm giá 200k, cũng chấp nhận được. Máy bên trong vẫn đẹp hoàn toàn.' },
]

/* ── Rating summary ────────────────────────────────────────────────────────── */
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-6 text-right text-gray-600 font-medium">{star}</span>
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-gray-500 text-xs">{count}</span>
    </div>
  )
}

/* ── Star row ───────────────────────────────────────────────────────────────── */
function Stars({ value, size = 'sm' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  return (
    <div className="flex">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${sz} ${i <= value ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
      ))}
    </div>
  )
}

/* ── Review card ────────────────────────────────────────────────────────────── */
function ReviewCard({ review }) {
  const [liked, setLiked] = useState(false)
  return (
    <article className="card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center
                          text-primary-600 font-bold text-sm flex-shrink-0">
            {review.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">{review.name}</span>
              {review.verified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] bg-green-50 text-green-600
                                 border border-green-200 px-1.5 py-0.5 rounded-full font-medium">
                  <CheckCircle className="w-2.5 h-2.5" /> Đã mua
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Stars value={review.rating} />
              <span className="text-xs text-gray-400">{review.date}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Variant info */}
      {(review.color || review.storage) && (
        <div className="flex gap-2">
          {review.color && (
            <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              Màu: {review.color}
            </span>
          )}
          {review.storage && (
            <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              Bộ nhớ: {review.storage}
            </span>
          )}
        </div>
      )}

      <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>

      <button
        onClick={() => setLiked(l => !l)}
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full
                    border transition-all ${liked
                      ? 'bg-primary-50 text-primary-600 border-primary-200'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
        Hữu ích ({liked ? review.likes + 1 : review.likes})
      </button>
    </article>
  )
}

/* ── Main ───────────────────────────────────────────────────────────────────── */
export default function ProductDetailPage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { addItem, isAuthenticated: isAuth } = useCart()
  const { isAuthenticated } = useAuthStore()

  const product = products.find(p => String(p.id) === String(id))

  /* ── State ── */
  const [activeImg,      setActiveImg]      = useState(0)
  const [selectedColor,  setSelectedColor]  = useState(null)
  const [selectedStorage,setSelectedStorage]= useState(null)
  const [qty,            setQty]            = useState(1)
  const [tab,            setTab]            = useState('specs')
  const [wishlisted,     setWishlisted]     = useState(false)
  const [reviewFilter,   setReviewFilter]   = useState('all')
  const [showAllSpecs,   setShowAllSpecs]   = useState(false)
  const [newReview,      setNewReview]      = useState({ rating: 0, text: '', hover: 0 })
  const [showReviewForm, setShowReviewForm] = useState(false)

  /* Khởi tạo lựa chọn mặc định */
  useEffect(() => {
    if (product) {
      const colors   = product.specs?.colors
      const storages = product.specs?.storage
      if (Array.isArray(colors)   && colors.length)   setSelectedColor(colors[0])
      if (Array.isArray(storages) && storages.length) setSelectedStorage(storages[0])
    }
  }, [product?.id]) // eslint-disable-line

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5">
      <Smartphone className="w-16 h-16 text-gray-200" />
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-700 mb-1">Không tìm thấy sản phẩm</h2>
        <p className="text-gray-400 text-sm">Sản phẩm không tồn tại hoặc đã bị xóa</p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => navigate(-1)} className="btn-outline px-5 py-2.5 text-sm">Quay lại</button>
        <Link to="/products" className="btn-primary px-5 py-2.5 text-sm">Xem tất cả sản phẩm</Link>
      </div>
    </div>
  )

  /* ── Derived data ── */
  const images      = product.images?.length
    ? product.images
    : [{ id: 0, image: product.primary_image, alt_text: product.name, is_primary: true }]

  const colors      = product.specs?.colors  || []
  const storages    = Array.isArray(product.specs?.storage)
    ? product.specs.storage
    : product.specs?.storage ? [product.specs.storage] : []

  const currentPrice  = product.current_price ?? product.price
  const hasDiscount   = product.discount_percent > 0
  const isOutOfStock  = !product.in_stock || product.stock === 0

  const specEntries   = Object.entries(product.specs || {})
    .filter(([k]) => k !== 'storage' && k !== 'colors')
  const visibleSpecs  = showAllSpecs ? specEntries : specEntries.slice(0, 6)

  const related = products
    .filter(p => p.brand_id === product.brand_id && p.id !== product.id)
    .slice(0, 4)

  /* Rating summary */
  const avgRating   = (MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length).toFixed(1)
  const ratingDist  = [5,4,3,2,1].map(s => ({
    star: s, count: MOCK_REVIEWS.filter(r => r.rating === s).length,
  }))
  const filteredReviews = reviewFilter === 'all'
    ? MOCK_REVIEWS
    : MOCK_REVIEWS.filter(r => r.rating === Number(reviewFilter))

  /* ── Actions ── */
  const handleAddToCart = async () => {
    const ok = await addItem({ ...product, current_price: currentPrice }, qty)
    if (!ok) return
  }

  const handleBuyNow = async () => {
    const ok = await addItem({ ...product, current_price: currentPrice }, qty)
    if (!ok) return
    navigate('/checkout')
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Đã sao chép link sản phẩm!')
    } catch {
      toast('Link: ' + window.location.href)
    }
  }

  const handleSubmitReview = (e) => {
    e.preventDefault()
    if (!isAuthenticated()) { toast.error('Vui lòng đăng nhập để đánh giá'); return }
    if (!newReview.rating)  { toast.error('Vui lòng chọn số sao'); return }
    if (!newReview.text.trim()) { toast.error('Vui lòng nhập nhận xét'); return }
    toast.success('Cảm ơn bạn đã đánh giá sản phẩm!')
    setShowReviewForm(false)
    setNewReview({ rating: 0, text: '', hover: 0 })
  }

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500 flex-wrap">
            <Link to="/" className="hover:text-primary-600 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            <Link to="/products" className="hover:text-primary-600">Sản phẩm</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            <Link
              to={`/products?brand_slug=${product.brand_name.toLowerCase()}`}
              className="hover:text-primary-600"
            >
              {product.brand_name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ════════════════════════════════════════════════
            PHẦN 1: Gallery + Thông tin chính
        ════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 mb-10">

          {/* ── Gallery ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative card overflow-hidden bg-white rounded-2xl aspect-square
                            flex items-center justify-center">
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                {hasDiscount && (
                  <span className="badge-sale text-sm px-2.5 py-1">-{product.discount_percent}%</span>
                )}
                {product.is_new && (
                  <span className="badge-new px-2.5 py-1">MỚI</span>
                )}
              </div>

              {/* Action icons top-right */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={() => setWishlisted(w => !w)}
                  aria-label={wishlisted ? 'Bỏ yêu thích' : 'Yêu thích'}
                  className={`w-9 h-9 rounded-full shadow-sm flex items-center justify-center
                              border transition-all ${wishlisted
                                ? 'bg-red-50 border-red-200 text-red-500'
                                : 'bg-white border-gray-100 text-gray-400 hover:text-red-400'}`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  aria-label="Chia sẻ"
                  className="w-9 h-9 rounded-full shadow-sm bg-white border border-gray-100
                             flex items-center justify-center text-gray-400 hover:text-primary-500
                             transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Image */}
              <img
                key={activeImg}
                src={images[activeImg]?.image || product.primary_image}
                alt={images[activeImg]?.alt_text || product.name}
                className="w-full h-full object-contain p-8 animate-fade-in"
              />

              {/* Out of stock */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <span className="bg-gray-800 text-white font-bold px-5 py-2 rounded-full text-sm">
                    Tạm hết hàng
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <button
                    key={img.id ?? i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl border-2 bg-white overflow-hidden p-1.5
                                transition-all duration-200 flex-shrink-0
                                ${activeImg === i
                                  ? 'border-primary-500 shadow-md shadow-primary-100'
                                  : 'border-gray-200 hover:border-primary-300'}`}
                  >
                    <img
                      src={img.image}
                      alt={img.alt_text}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quick spec grid — desktop only */}
            <div className="hidden lg:grid grid-cols-2 gap-2 pt-1">
              {[
                { icon: Cpu,     label: 'Chip',    val: product.specs?.chip },
                { icon: Monitor, label: 'Màn hình', val: product.specs?.display?.split(',')[0] },
                { icon: Camera,  label: 'Camera',  val: product.specs?.camera?.split('(')[0].trim() },
                { icon: Battery, label: 'Pin',      val: product.specs?.battery?.split(',')[0] },
              ].filter(s => s.val).map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-start gap-2 bg-white rounded-xl p-3 border border-gray-100">
                  <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Product info panel ── */}
          <div className="flex flex-col gap-5">

            {/* Brand + name + rating */}
            <div>
              <Link
                to={`/products?brand_slug=${product.brand_name.toLowerCase()}`}
                className="text-xs font-bold text-primary-600 uppercase tracking-widest
                           hover:underline"
              >
                {product.brand_name}
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1.5 leading-tight">
                {product.name}
              </h1>

              {/* Rating + stock */}
              <div className="flex items-center flex-wrap gap-3 mt-3">
                <button onClick={() => setTab('reviews')} className="flex items-center gap-1.5 group">
                  <Stars value={Math.round(Number(avgRating))} />
                  <span className="text-sm text-primary-600 font-semibold group-hover:underline">
                    {avgRating}
                  </span>
                  <span className="text-sm text-gray-400">({MOCK_REVIEWS.length} đánh giá)</span>
                </button>

                <span className="text-gray-200">|</span>

                {isOutOfStock ? (
                  <span className="flex items-center gap-1 text-sm text-red-600 font-medium">
                    <XCircle className="w-4 h-4" /> Tạm hết hàng
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Còn <strong>{product.stock}</strong> sản phẩm
                  </span>
                )}
              </div>
            </div>

            {/* ── Price box ── */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-4 border border-primary-100">
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-extrabold text-primary-600 leading-none">
                  {fmt(currentPrice)}
                </span>
                {hasDiscount && (
                  <div className="flex flex-col">
                    <span className="text-base text-gray-400 line-through leading-tight">
                      {fmt(product.price)}
                    </span>
                    <span className="badge-sale text-xs">
                      Tiết kiệm {fmt(product.price - currentPrice)}
                    </span>
                  </div>
                )}
              </div>
              {hasDiscount && (
                <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                  🎉 Giảm {product.discount_percent}% so với giá gốc!
                </p>
              )}
            </div>

            {/* ── Chọn màu ── */}
            {colors.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2.5">
                  Màu sắc:
                  {selectedColor && (
                    <span className="text-primary-600 font-normal ml-1.5">{selectedColor}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map(color => {
                    const swatch = COLOR_MAP[color] || '#ccc'
                    const isActive = selectedColor === color
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border-2
                                    text-sm font-medium transition-all
                                    ${isActive
                                      ? 'border-primary-500 shadow-md shadow-primary-100 bg-primary-50 text-primary-700'
                                      : 'border-gray-200 text-gray-600 hover:border-primary-300 bg-white'}`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0"
                          style={{ backgroundColor: swatch }}
                        />
                        {color}
                        {isActive && (
                          <CheckCircle className="w-3.5 h-3.5 text-primary-500 absolute -top-1.5 -right-1.5 bg-white rounded-full" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Chọn bộ nhớ ── */}
            {storages.length > 1 && (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2.5">
                  Phiên bản bộ nhớ:
                  {selectedStorage && (
                    <span className="text-primary-600 font-normal ml-1.5">{selectedStorage}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {storages.map(s => {
                    const isActive = selectedStorage === s
                    return (
                      <button
                        key={s}
                        onClick={() => setSelectedStorage(s)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2
                                    transition-all relative
                                    ${isActive
                                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md shadow-primary-100'
                                      : 'border-gray-200 text-gray-700 hover:border-primary-300 bg-white'}`}
                      >
                        {s}
                        {isActive && (
                          <CheckCircle className="w-3.5 h-3.5 text-primary-500 absolute -top-1.5 -right-1.5 bg-white rounded-full" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Chọn số lượng ── */}
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-sm font-semibold text-gray-800">Số lượng:</p>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Giảm"
                  className="w-10 h-10 flex items-center justify-center
                             hover:bg-gray-50 disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-base font-bold text-gray-900 select-none">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock || isOutOfStock}
                  aria-label="Tăng"
                  className="w-10 h-10 flex items-center justify-center
                             hover:bg-gray-50 disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-400">
                {isOutOfStock ? 'Hết hàng' : `(còn ${product.stock} sản phẩm)`}
              </span>
            </div>

            {/* ── CTA buttons ── */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl
                           bg-primary-600 hover:bg-primary-700 text-white font-bold text-base
                           active:scale-[0.98] transition-all disabled:opacity-50
                           disabled:cursor-not-allowed shadow-lg shadow-primary-200"
              >
                <Zap className="w-5 h-5" />
                {isOutOfStock ? 'Hết hàng' : 'Mua ngay'}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl
                           border-2 border-primary-600 text-primary-600 font-bold text-base
                           hover:bg-primary-50 active:scale-[0.98] transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                Thêm vào giỏ
              </button>
            </div>

            {/* ── Chính sách ── */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: ShieldCheck, label: 'Bảo hành chính hãng 12 tháng', color: 'text-blue-500 bg-blue-50' },
                { icon: Truck,       label: 'Giao hàng toàn quốc 2–4 ngày', color: 'text-green-500 bg-green-50' },
                { icon: RefreshCcw,  label: 'Đổi trả miễn phí trong 7 ngày', color: 'text-orange-500 bg-orange-50' },
                { icon: Award,       label: 'Sản phẩm chính hãng 100%',      color: 'text-purple-500 bg-purple-50' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label}
                  className="flex items-center gap-2.5 bg-white rounded-xl p-3 border border-gray-100">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-gray-600 leading-snug">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            PHẦN 2: Tabs — Thông số / Mô tả / Đánh giá
        ════════════════════════════════════════════════ */}
        <div className="card mb-10 overflow-hidden">
          {/* Tab header */}
          <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
            {[
              { key: 'specs',   label: 'Thông số kỹ thuật' },
              { key: 'desc',    label: 'Mô tả sản phẩm' },
              { key: 'reviews', label: `Đánh giá (${MOCK_REVIEWS.length})` },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-shrink-0 px-5 sm:px-8 py-4 text-sm font-semibold
                            border-b-2 -mb-px transition-colors whitespace-nowrap
                            ${tab === t.key
                              ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                              : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5 sm:p-8">

            {/* ── Thông số ── */}
            {tab === 'specs' && (
              <div className="max-w-2xl">
                {/* RAM + Storage highlight */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {product.specs?.ram && (
                    <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100
                                    rounded-xl px-4 py-3">
                      <Cpu className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-[10px] text-blue-400 uppercase font-bold">RAM</p>
                        <p className="text-lg font-extrabold text-blue-700">{product.specs.ram}</p>
                      </div>
                    </div>
                  )}
                  {storages.length > 0 && (
                    <div className="flex items-center gap-2.5 bg-purple-50 border border-purple-100
                                    rounded-xl px-4 py-3">
                      <Smartphone className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-[10px] text-purple-400 uppercase font-bold">Bộ nhớ</p>
                        <p className="text-lg font-extrabold text-purple-700">
                          {storages.join(' / ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Spec table */}
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  {visibleSpecs.map(([key, val], idx) => {
                    const meta  = SPEC_META[key]
                    const Icon  = meta?.Icon
                    const label = meta?.label || key
                    const displayVal = Array.isArray(val) ? val.join(' / ') : String(val)
                    return (
                      <div
                        key={key}
                        className={`flex gap-4 px-4 py-3.5 items-start
                          ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <div className="flex items-center gap-2 w-36 flex-shrink-0">
                          {Icon && <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                          <span className="text-sm text-gray-500 font-medium capitalize">{label}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 flex-1 leading-snug">
                          {displayVal}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Show more / less */}
                {specEntries.length > 6 && (
                  <button
                    onClick={() => setShowAllSpecs(v => !v)}
                    className="mt-4 flex items-center gap-1.5 text-sm text-primary-600
                               font-semibold hover:text-primary-700 transition-colors"
                  >
                    {showAllSpecs ? (
                      <><ChevronUp className="w-4 h-4" /> Thu gọn</>
                    ) : (
                      <><ChevronDown className="w-4 h-4" /> Xem thêm ({specEntries.length - 6} thông số)</>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* ── Mô tả ── */}
            {tab === 'desc' && (
              <div className="max-w-2xl space-y-5">
                <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || `${product.name} là sản phẩm cao cấp với những tính năng vượt trội. Được trang bị phần cứng mạnh mẽ nhất, thiết kế tinh tế và camera chuyên nghiệp, đây là lựa chọn hoàn hảo cho người dùng đòi hỏi cao nhất.`}
                </p>

                {/* Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    product.specs?.chip    && { label: 'Vi xử lý', val: product.specs.chip, Icon: Cpu },
                    product.specs?.display && { label: 'Màn hình', val: product.specs.display.split(',')[0], Icon: Monitor },
                    product.specs?.camera  && { label: 'Camera', val: product.specs.camera.split('(')[0].trim(), Icon: Camera },
                    product.specs?.battery && { label: 'Pin', val: product.specs.battery.split(',')[0], Icon: Battery },
                  ].filter(Boolean).map(({ label, val, Icon }) => (
                    <div key={label} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="text-sm font-semibold text-gray-800 leading-snug">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                  <p className="text-sm text-primary-700 font-medium">
                    📦 Sản phẩm đi kèm đầy đủ phụ kiện chính hãng, được bảo hành 12 tháng tại
                    tất cả các trung tâm bảo hành trên toàn quốc.
                  </p>
                </div>
              </div>
            )}

            {/* ── Đánh giá ── */}
            {tab === 'reviews' && (
              <div className="max-w-3xl space-y-8">

                {/* Rating summary */}
                <div className="flex flex-col sm:flex-row gap-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  {/* Overall */}
                  <div className="flex flex-col items-center justify-center sm:border-r sm:border-gray-200 sm:pr-8 flex-shrink-0">
                    <span className="text-6xl font-extrabold text-gray-900">{avgRating}</span>
                    <Stars value={Math.round(Number(avgRating))} size="md" />
                    <span className="text-sm text-gray-500 mt-1">
                      {MOCK_REVIEWS.length} đánh giá
                    </span>
                  </div>

                  {/* Distribution */}
                  <div className="flex-1 space-y-1.5">
                    {ratingDist.map(({ star, count }) => (
                      <RatingBar key={star} star={star} count={count} total={MOCK_REVIEWS.length} />
                    ))}
                  </div>
                </div>

                {/* Filter tabs + write review */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex gap-2 flex-wrap">
                    {['all','5','4','3','2','1'].map(f => (
                      <button
                        key={f}
                        onClick={() => setReviewFilter(f)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all
                          ${reviewFilter === f
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}
                      >
                        {f === 'all' ? 'Tất cả' : `${f} ★`}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowReviewForm(v => !v)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600
                               text-white text-sm font-semibold hover:bg-primary-700
                               transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Viết đánh giá
                  </button>
                </div>

                {/* Review form */}
                {showReviewForm && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="card p-5 space-y-4 border-2 border-primary-100"
                  >
                    <h3 className="font-bold text-gray-900">Đánh giá của bạn</h3>

                    {/* Star picker */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Chọn số sao:</p>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewReview(r => ({ ...r, rating: s }))}
                            onMouseEnter={() => setNewReview(r => ({ ...r, hover: s }))}
                            onMouseLeave={() => setNewReview(r => ({ ...r, hover: 0 }))}
                            className="p-0.5"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                s <= (newReview.hover || newReview.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      rows={4}
                      value={newReview.text}
                      onChange={e => setNewReview(r => ({ ...r, text: e.target.value }))}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                      className="input resize-none text-sm"
                      required
                    />

                    <div className="flex gap-2.5">
                      <button type="submit" className="btn-primary px-6 py-2.5 text-sm">
                        Gửi đánh giá
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="btn-ghost px-4 py-2.5 text-sm"
                      >
                        Huỷ
                      </button>
                    </div>
                  </form>
                )}

                {/* Review list */}
                {filteredReviews.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    Chưa có đánh giá nào với mức sao này
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReviews.map(r => <ReviewCard key={r.id} review={r} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            PHẦN 3: Sản phẩm liên quan
        ════════════════════════════════════════════════ */}
        {related.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title">Sản phẩm cùng hãng</h2>
              <Link
                to={`/products?brand_slug=${product.brand_name.toLowerCase()}`}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700
                           flex items-center gap-1"
              >
                Xem tất cả <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
