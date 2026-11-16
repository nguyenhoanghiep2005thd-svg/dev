import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import useAuthStore from './authStore'
import * as cartApi from '../services/cartService'

const SHIPPING_THRESHOLD = 1_000_000
const SHIPPING_FEE       = 30_000

function getItemKey(productId, color = '', storage = '') {
  return `${productId}__${color}__${storage}`
}

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      loading: false,
      appliedCoupon: null,

      openCart:  () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      applyCoupon: (coupon) => {
        set({ appliedCoupon: coupon })
        toast.success(`Đã áp dụng mã ${coupon.code}! Giảm ${new Intl.NumberFormat('vi-VN').format(coupon.discount)}đ`)
      },

      removeCoupon: () => {
        set({ appliedCoupon: null })
        toast.success('Đã hủy áp dụng mã giảm giá')
      },

      addItem: async (product, quantity = 1, variant = {}) => {
        const { color = '', storage = '' } = variant
        const token = useAuthStore.getState().accessToken
        const key = getItemKey(product.id, color, storage)

        if (token) {
          try {
            set({ loading: true })
            await cartApi.addToCart(product.id, quantity)
            await get().fetchCart()
            set({ isOpen: true })
            toast.success(`Đã thêm "${product.name}" vào giỏ!`)
            return true
          } catch (err) {
            const msg = err.response?.data?.quantity?.[0]
              || err.response?.data?.error
              || 'Không thể thêm vào giỏ hàng.'
            toast.error(msg)
            return false
          } finally {
            set({ loading: false })
          }
        }

        const items = [...get().items]
        const existingIdx = items.findIndex(
          i => getItemKey(i.product.id, i.color, i.storage) === key
        )

        if (existingIdx > -1) {
          const currentQty = items[existingIdx].quantity
          const newQty = currentQty + quantity
          if (product.stock && newQty > product.stock) {
            toast.error(`Chỉ còn ${product.stock} sản phẩm trong kho.`)
            return false
          }
          items[existingIdx] = { ...items[existingIdx], quantity: newQty }
        } else {
          items.push({
            id: key,
            product,
            quantity,
            color,
            storage,
          })
        }

        set({ items, isOpen: true })
        toast.success(`Đã thêm "${product.name}" vào giỏ!`)
        return true
      },

      updateQuantity: async (itemId, quantity) => {
        if (quantity < 1) return get().removeItem(itemId)
        const token = useAuthStore.getState().accessToken

        if (token && typeof itemId === 'number') {
          try {
            set({ loading: true })
            await cartApi.updateCartItem(itemId, quantity)
            await get().fetchCart()
          } catch (err) {
            toast.error(err.response?.data?.quantity?.[0] || 'Lỗi cập nhật số lượng.')
          } finally {
            set({ loading: false })
          }
          return
        }

        const items = get().items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
        set({ items })
      },

      removeItem: async (itemId) => {
        const token = useAuthStore.getState().accessToken

        if (token && typeof itemId === 'number') {
          try {
            set({ loading: true })
            await cartApi.removeCartItem(itemId)
            await get().fetchCart()
            toast.success('Đã xóa sản phẩm khỏi giỏ.')
          } catch {
            toast.error('Không thể xóa sản phẩm.')
          } finally {
            set({ loading: false })
          }
          return
        }

        set({ items: get().items.filter(i => i.id !== itemId) })
        toast.success('Đã xóa sản phẩm khỏi giỏ.')
      },

      clearCart: async () => {
        const token = useAuthStore.getState().accessToken
        if (token) {
          try {
            await cartApi.clearCart()
          } catch {
            // ignore
          }
        }
        set({ items: [], appliedCoupon: null })
      },

      fetchCart: async () => {
        const token = useAuthStore.getState().accessToken
        if (!token) return
        try {
          set({ loading: true })
          const res = await cartApi.fetchCart()
          set({ items: res.data.items || [] })
        } catch {
          // ignore
        } finally {
          set({ loading: false })
        }
      },

      syncCart: async () => {
        const token = useAuthStore.getState().accessToken
        const localItems = get().items
        if (!token || !localItems.length) return

        try {
          const payload = localItems.map(i => ({
            product_id: i.product.id,
            quantity: i.quantity,
            color: i.color || '',
            storage: i.storage || '',
          }))
          await cartApi.syncCart(payload)
          await get().fetchCart()
        } catch {
          // ignore
        }
      },

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => {
          const price = i.product?.current_price ?? i.product?.price ?? 0
          return sum + price * i.quantity
        }, 0),

      shippingFee: () => {
        const sub = get().subtotal()
        if (sub === 0) return 0
        const coupon = get().appliedCoupon
        if (coupon?.code === 'FREESHIP') return 0
        return sub >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
      },

      discountAmount: () => {
        const coupon = get().appliedCoupon
        return coupon?.discount || 0
      },

      finalTotal: () => {
        const sub = get().subtotal()
        if (sub === 0) return 0
        const ship = get().shippingFee()
        const disc = get().discountAmount()
        return Math.max(0, sub - disc) + ship
      },
    }),
    {
      name: 'phonestore_cart',
      partialize: (state) => ({ items: state.items, appliedCoupon: state.appliedCoupon }),
    }
  )
)

export default useCartStore
