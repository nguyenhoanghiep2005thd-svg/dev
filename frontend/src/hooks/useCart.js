/**
 * useCart – wrapper hook cho cartStore
 * Tự động proxy state + actions từ Zustand store
 */
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'

export function useCart() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated())
  const store           = useCartStore()

  /**
   * addItem(product, quantity, variant)
   * variant = { color?: string, storage?: string }
   */
  const addItem = useCallback(async (product, quantity = 1, variant = {}) => {
    if (!product.in_stock || product.stock === 0) {
      toast.error(`"${product.name}" hiện đã hết hàng.`)
      return false
    }
    try {
      // cartStore.addItem handles toast + openCart internally
      return await store.addItem(product, quantity, variant)
    } catch (err) {
      const msg = err?.response?.data?.quantity?.[0]
        || err?.response?.data?.product_id?.[0]
        || err?.message
        || 'Không thể thêm sản phẩm vào giỏ hàng.'
      toast.error(msg)
      return false
    }
  }, [store])

  const updateQuantity = useCallback(async (productId, newQty) => {
    try {
      await store.updateQuantity(productId, newQty)
    } catch (err) {
      const msg = err?.response?.data?.quantity?.[0] || err?.message || 'Lỗi khi cập nhật số lượng.'
      toast.error(msg)
    }
  }, [store])

  const removeItem = useCallback(async (productId) => {
    try {
      // cartStore.removeItem handles its own toast
      await store.removeItem(productId)
    } catch {
      toast.error('Không thể xóa sản phẩm. Vui lòng thử lại.')
    }
  }, [store])

  const clearCart = useCallback(async () => {
    try {
      await store.clearCart()
      toast.success('Đã xóa toàn bộ giỏ hàng.')
    } catch {
      toast.error('Không thể xóa giỏ hàng. Vui lòng thử lại.')
    }
  }, [store])

  return {
    items:            store.items,
    isOpen:           store.isOpen,
    loading:          store.loading,
    totalItems:       store.totalItems(),
    totalPrice:       store.subtotal(),       // subtotal before discounts
    discountAmount:   store.discountAmount(),
    shippingFee:      store.shippingFee(),
    finalTotal:       store.finalTotal(),
    appliedCoupon:    store.appliedCoupon,
    applyCoupon:      store.applyCoupon,
    removeCoupon:     store.removeCoupon,
    openCart:         store.openCart,
    closeCart:        store.closeCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart:        store.fetchCart,
    syncCart:         store.syncCart,
    isAuthenticated,
  }
}
