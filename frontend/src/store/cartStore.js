/**
 * Cart Store — Zustand
 *
 * Chiến lược 2 lớp:
 *   - Guest (chưa đăng nhập): lưu local localStorage
 *   - Auth  (đã đăng nhập):   sync với backend API, local là cache
 *
 * Khi user đăng nhập → gọi syncWithServer() để đẩy local cart lên server
 * Khi thao tác cart → gọi API, nếu lỗi → rollback local state
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  fetchCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCartApi,
  syncCart,
} from '../services/cartService'

const useCartStore = create(
  persist(
    (set, get) => ({
      /* ── State ─────────────────────────────────────────── */
      items:    [],    // [{ id?, product, quantity }]
      isOpen:   false,
      loading:  false,
      synced:   false, // true sau khi đã fetch từ server

      /* ── Drawer ────────────────────────────────────────── */
      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),

      /* ── Computed ──────────────────────────────────────── */
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (s, i) => s + (i.product?.current_price ?? i.product?.price ?? 0) * i.quantity,
          0
        ),

      shippingFee: () => {
        const total = get().totalPrice()
        return total >= 1_000_000 ? 0 : 30_000
      },

      finalTotal: () => get().totalPrice() + get().shippingFee(),

      /* ── Fetch cart từ server (sau khi login) ──────────── */
      fetchFromServer: async () => {
        set({ loading: true })
        try {
          const data = await fetchCart()
          // data.items từ server có dạng: { id, product: {...}, quantity, subtotal }
          const items = (data.items || []).map(item => ({
            id:       item.id,
            product:  normalizeProduct(item.product),
            quantity: item.quantity,
          }))
          set({ items, synced: true, loading: false })
        } catch {
          set({ loading: false })
        }
      },

      /* ── Sync local → server khi vừa đăng nhập ─────────── */
      syncWithServer: async () => {
        const localItems = get().items
        if (localItems.length === 0) {
          // Không có local, chỉ fetch từ server
          await get().fetchFromServer()
          return
        }
        set({ loading: true })
        try {
          await syncCart(localItems)
          await get().fetchFromServer()
        } catch {
          set({ loading: false })
        }
      },

      /* ── Thêm sản phẩm ─────────────────────────────────── */
      addItem: async (product, quantity = 1, isAuth = false) => {
        // Kiểm tra hết hàng
        if (!product.in_stock || product.stock === 0) {
          throw new Error('Sản phẩm đã hết hàng.')
        }

        // Kiểm tra không vượt stock
        const existing = get().items.find(i => i.product.id === product.id)
        const currentQty = existing?.quantity ?? 0
        if (currentQty + quantity > product.stock) {
          throw new Error(`Chỉ còn ${product.stock} sản phẩm. Giỏ hàng đã có ${currentQty}.`)
        }

        if (isAuth) {
          // Optimistic update
          _updateLocal(set, get, product, quantity, 'add')
          try {
            const item = await addToCart(product.id, quantity)
            // Cập nhật id thật từ server
            set(s => ({
              items: s.items.map(i =>
                i.product.id === product.id
                  ? { ...i, id: item.id }
                  : i
              ),
            }))
          } catch (err) {
            // Rollback
            _updateLocal(set, get, product, -quantity, 'add')
            throw err
          }
        } else {
          // Guest: chỉ local
          _updateLocal(set, get, product, quantity, 'add')
        }
      },

      /* ── Cập nhật số lượng ─────────────────────────────── */
      updateQuantity: async (productId, newQty, isAuth = false) => {
        if (newQty < 1) return

        const item = get().items.find(i => i.product.id === productId)
        if (!item) return

        // Kiểm tra stock
        if (newQty > item.product.stock) {
          throw new Error(`Chỉ còn ${item.product.stock} sản phẩm trong kho.`)
        }

        const prevQty = item.quantity

        // Optimistic update
        set(s => ({
          items: s.items.map(i =>
            i.product.id === productId ? { ...i, quantity: newQty } : i
          ),
        }))

        if (isAuth && item.id) {
          try {
            await updateCartItem(item.id, newQty)
          } catch (err) {
            // Rollback
            set(s => ({
              items: s.items.map(i =>
                i.product.id === productId ? { ...i, quantity: prevQty } : i
              ),
            }))
            throw err
          }
        }
      },

      /* ── Xóa 1 item ────────────────────────────────────── */
      removeItem: async (productId, isAuth = false) => {
        const item     = get().items.find(i => i.product.id === productId)
        const snapshot = get().items

        // Optimistic update
        set(s => ({ items: s.items.filter(i => i.product.id !== productId) }))

        if (isAuth && item?.id) {
          try {
            await deleteCartItem(item.id)
          } catch (err) {
            // Rollback
            set({ items: snapshot })
            throw err
          }
        }
      },

      /* ── Xóa toàn bộ ───────────────────────────────────── */
      clearCart: async (isAuth = false) => {
        const snapshot = get().items
        set({ items: [] })

        if (isAuth) {
          try {
            await clearCartApi()
          } catch {
            set({ items: snapshot })
          }
        }
      },

      /* ── Reset khi logout ──────────────────────────────── */
      resetCart: () => set({ items: [], synced: false }),
    }),
    {
      name:        'phonestore-cart',
      partialize:  s => ({ items: s.items }),
    }
  )
)

/* ── Helpers ───────────────────────────────────────────────────────────────── */

/** Chuẩn hoá product từ API response về dạng local */
function normalizeProduct(p) {
  return {
    id:            p.id,
    name:          p.name,
    slug:          p.slug,
    brand_name:    p.brand_name,
    price:         Number(p.price),
    sale_price:    p.sale_price ? Number(p.sale_price) : null,
    current_price: Number(p.current_price ?? p.sale_price ?? p.price),
    discount_percent: p.discount_percent ?? 0,
    stock:         p.stock ?? 0,
    in_stock:      p.in_stock ?? p.stock > 0,
    primary_image: p.primary_image ?? null,
  }
}

/** Optimistic local cart update */
function _updateLocal(set, get, product, deltaQty, mode) {
  if (mode === 'add') {
    const existing = get().items.find(i => i.product.id === product.id)
    if (existing) {
      set(s => ({
        items: s.items.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + deltaQty }
            : i
        ),
      }))
    } else {
      set(s => ({
        items: [...s.items, { product, quantity: deltaQty }],
      }))
    }
  }
}

export default useCartStore
