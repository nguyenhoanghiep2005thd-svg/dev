import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, Edit2, Trash2, X, Upload, Image,
  ChevronDown, Save, Loader2, CheckCircle, AlertTriangle,
  Package, Eye,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  adminFetchProducts, adminCreateProduct, adminUpdateProduct,
  adminDeleteProduct, adminUploadImage, adminDeleteImage,
  adminFetchBrands, adminFetchCategories,
} from '../../services/adminService'
import { products as mockProducts, brands as mockBrands } from '../../data/mockData'

const fmt = n =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const EMPTY_FORM = {
  name: '', brand_id: '', category_id: '', description: '',
  price: '', sale_price: '', stock: '0', is_active: true,
  specs: '{}',
}

/* ── Image uploader ── */
function ImageManager({ productId, images = [], onRefresh }) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('image', file)
    fd.append('is_primary', images.length === 0 ? 'true' : 'false')
    setUploading(true)
    try {
      await adminUploadImage(productId, fd)
      toast.success('Tải ảnh thành công!')
      onRefresh?.()
    } catch {
      toast.error('Lỗi tải ảnh. Thử lại.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imgId) => {
    if (!window.confirm('Xóa ảnh này?')) return
    try {
      await adminDeleteImage(imgId)
      onRefresh?.()
      toast.success('Đã xóa ảnh.')
    } catch {
      toast.error('Không thể xóa ảnh.')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map(img => (
          <div key={img.id} className="relative group">
            <img
              src={img.image}
              alt={img.alt_text}
              className="w-16 h-16 object-contain bg-gray-50 rounded-lg border border-gray-200 p-1"
            />
            {img.is_primary && (
              <span className="absolute -top-1.5 -left-1.5 text-[8px] bg-primary-600 text-white
                               font-bold px-1 py-0.5 rounded-full">★</span>
            )}
            <button
              onClick={() => handleDelete(img.id)}
              className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-red-500 text-white
                         rounded-full hidden group-hover:flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Upload button */}
        <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg
                          flex flex-col items-center justify-center cursor-pointer
                          hover:border-primary-400 hover:bg-primary-50 transition-colors">
          {uploading
            ? <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
            : <><Upload className="w-4 h-4 text-gray-400" /><span className="text-[9px] text-gray-400 mt-0.5">Thêm</span></>
          }
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
    </div>
  )
}

/* ── Product form modal ── */
function ProductModal({ product, brands, categories, onClose, onSaved }) {
  const isEdit = !!product
  const [form,    setForm]    = useState(isEdit ? {
    name:        product.name,
    brand_id:    product.brand?.id ?? product.brand_id ?? '',
    category_id: product.category?.id ?? product.category_id ?? '',
    description: product.description || '',
    price:       product.price,
    sale_price:  product.sale_price || '',
    stock:       product.stock,
    is_active:   product.is_active ?? true,
    specs:       JSON.stringify(product.specs || {}, null, 2),
  } : EMPTY_FORM)
  const [saving,  setSaving]  = useState(false)
  const [images,  setImages]  = useState(product?.images || [])
  const [specsErr,setSpecsErr]= useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim())  { toast.error('Nhập tên sản phẩm.'); return }
    if (!form.price)        { toast.error('Nhập giá sản phẩm.'); return }
    if (form.specs) {
      try { JSON.parse(form.specs); setSpecsErr('') }
      catch { setSpecsErr('JSON không hợp lệ.'); return }
    }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'specs') {
          try { fd.append('specs', form.specs) } catch {}
        } else if (v !== '' && v !== null && v !== undefined) {
          fd.append(k, v)
        }
      })

      if (isEdit) {
        await adminUpdateProduct(product.id, fd)
        toast.success('Đã cập nhật sản phẩm!')
      } else {
        await adminCreateProduct(fd)
        toast.success('Đã tạo sản phẩm mới!')
      }
      onSaved()
    } catch (err) {
      const data = err?.response?.data
      const msg  = data ? Object.values(data).flat()[0] : 'Lỗi lưu sản phẩm.'
      toast.error(String(msg))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]
                        overflow-y-auto animate-fade-in">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
            <h2 className="font-bold text-gray-900 text-lg">
              {isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Name */}
            <div>
              <label className="label-sm">Tên sản phẩm *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                className="input" placeholder="VD: iPhone 15 Pro Max 256GB" />
            </div>

            {/* Brand + Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-sm">Hãng</label>
                <select value={form.brand_id} onChange={e => set('brand_id', e.target.value)} className="input">
                  <option value="">— Chọn hãng —</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label-sm">Danh mục</label>
                <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className="input">
                  <option value="">— Chọn danh mục —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Price + Sale price + Stock */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label-sm">Giá gốc (₫) *</label>
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                  className="input" placeholder="22990000" min={0} />
              </div>
              <div>
                <label className="label-sm">Giá KM (₫)</label>
                <input type="number" value={form.sale_price} onChange={e => set('sale_price', e.target.value)}
                  className="input" placeholder="Để trống nếu không KM" min={0} />
              </div>
              <div>
                <label className="label-sm">Tồn kho *</label>
                <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)}
                  className="input" placeholder="0" min={0} />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="label-sm">Mô tả</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={3} className="input resize-none" placeholder="Mô tả sản phẩm..." />
            </div>

            {/* Specs JSON */}
            <div>
              <label className="label-sm">Thông số kỹ thuật (JSON)</label>
              <textarea value={form.specs} onChange={e => { set('specs', e.target.value); setSpecsErr('') }}
                rows={5} className={`input resize-none font-mono text-xs ${specsErr ? 'border-red-400' : ''}`}
                placeholder='{"ram":"8GB","storage":"256GB","chip":"A17 Pro"}' />
              {specsErr && <p className="text-red-500 text-xs mt-1">{specsErr}</p>}
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set('is_active', !form.is_active)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer
                           ${form.is_active ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow
                                 transition-all ${form.is_active ? 'left-[22px]' : 'left-0.5'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {form.is_active ? 'Đang bán' : 'Ẩn sản phẩm'}
              </span>
            </label>

            {/* Images (chỉ khi edit) */}
            {isEdit && (
              <div>
                <label className="label-sm">Hình ảnh</label>
                <ImageManager
                  productId={product.id}
                  images={images}
                  onRefresh={() => {/* re-fetch images */}}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 flex gap-3">
            <button onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">Hủy</button>
            <button onClick={handleSave} disabled={saving}
              className="btn-primary flex-1 py-2.5 text-sm gap-2 disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Main ── */
export default function AdminProducts() {
  const [products,   setProducts]   = useState([])
  const [brands,     setBrands]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [modal,      setModal]      = useState(null) // null | 'create' | product object
  const [stockFilter,setStockFilter]= useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, bRes, cRes] = await Promise.all([
        adminFetchProducts({ search, page_size: 50 }),
        adminFetchBrands(),
        adminFetchCategories(),
      ])
      setProducts(Array.isArray(pRes) ? pRes : pRes.results ?? mockProducts)
      setBrands(Array.isArray(bRes) ? bRes : bRes.results ?? mockBrands)
      setCategories(Array.isArray(cRes) ? cRes : cRes.results ?? [])
    } catch {
      setProducts(mockProducts)
      setBrands(mockBrands)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  const handleDelete = async (p) => {
    if (!window.confirm(`Xóa "${p.name}"? Không thể hoàn tác.`)) return
    try {
      await adminDeleteProduct(p.id)
      toast.success('Đã xóa sản phẩm.')
      load()
    } catch {
      toast.error('Không thể xóa sản phẩm đang có trong đơn hàng.')
    }
  }

  const filtered = products.filter(p => {
    if (stockFilter === 'out_of_stock') return p.stock === 0
    if (stockFilter === 'low_stock')    return p.stock > 0 && p.stock <= 5
    return true
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500">{products.length} sản phẩm</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary gap-2 py-2.5 px-4 text-sm">
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tên, hãng..."
            className="input pl-9 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {[
            { k: 'all',          l: 'Tất cả' },
            { k: 'low_stock',    l: 'Sắp hết' },
            { k: 'out_of_stock', l: 'Hết hàng' },
          ].map(({ k, l }) => (
            <button key={k} onClick={() => setStockFilter(k)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all
                         ${stockFilter === k ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 bg-white hover:border-primary-300'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary-500" />
            Đang tải...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Sản phẩm', 'Hãng', 'Giá', 'Tồn kho', 'Trạng thái', 'Thao tác'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Sản phẩm */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.primary_image || `https://placehold.co/40x40/f5f5f5/999?text=${encodeURIComponent(p.name?.charAt(0) || 'P')}`}
                          alt={p.name}
                          className="w-10 h-10 object-contain bg-gray-50 rounded-lg border border-gray-100 p-0.5 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate max-w-[180px]">{p.name}</p>
                          <p className="text-[10px] text-gray-400">ID: {p.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Hãng */}
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {p.brand_name || p.brand?.name || '—'}
                    </td>

                    {/* Giá */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-semibold text-primary-600">
                        {fmt(p.current_price ?? p.price)}
                      </p>
                      {p.sale_price && (
                        <p className="text-[10px] text-gray-400 line-through">{fmt(p.price)}</p>
                      )}
                    </td>

                    {/* Tồn kho */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
                                       ${p.stock === 0 ? 'bg-red-100 text-red-600'
                                       : p.stock <= 5 ? 'bg-yellow-100 text-yellow-700'
                                       : 'bg-green-100 text-green-700'}`}>
                        {p.stock === 0 ? <X className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {p.stock}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full
                                       ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.is_active ? 'Đang bán' : 'Ẩn'}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setModal(p)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg
                                     bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg
                                     bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                <p>Không có sản phẩm nào</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <ProductModal
          product={modal === 'create' ? null : modal}
          brands={brands}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
