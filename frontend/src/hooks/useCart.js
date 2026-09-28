/**
 * useCart — wrapper hook cho cartStore
 * Tự động truyền isAuth vào mọi action để chọn local vs API
 */
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'

export function useCart() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated())
  const store           = useCartStore()

  const addItem = useCallback(async (product, quantity = 1) => {
    // Kiểm tra hết hàng ngay ở client
    if (!product.in_stock || product.stock === 0) {
      toast.error(`"${product.name}" hiện đã hết hàng.`)
      return false
    }

    try {
      await store.addItem(product, quantity, isAuthenticated)
      store.openCart()
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`)
      return true
    } catch (err) {
      const msg = err?.response?.data?.quantity?.[0]
        || err?.response?.data?.product_id?.[0]
        || err?.message
        || 'Không thể thêm sản phẩm vào giỏ hàng.'
      toast.error(msg)
      return false
    }
  }, [isAuthenticated, store])

  const updateQuantity = useCallback(async (productId, newQty) => {
    try {
      await store.updateQuantity(productId, newQty, isAuthenticated)
    } catch (err) {
      const msg = err?.response?.data?.quantity?.[0] || err?.message || 'Lỗi khi cập nhật số lượng.'
      toast.error(msg)
    }
  }, [isAuthenticated, store])

  const removeItem = useCallback(async (productId) => {
    try {
      await store.removeItem(productId, isAuthenticated)
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng.')
    } catch {
      toast.error('Không thể xóa sản phẩm. Vui lòng thử lại.')
    }
  }, [isAuthenticated, store])

  const clearCart = useCallback(async () => {
    try {
      await store.clearCart(isAuthenticated)
      toast.success('Đã xóa toàn bộ giỏ hàng.')
    } catch {
      toast.error('Không thể xóa giỏ hàng. Vui lòng thử lại.')
    }
  }, [isAuthenticated, store])

  return {
    items:        store.items,
    isOpen:       store.isOpen,
    loading:      store.loading,
    totalItems:   store.totalItems(),
    totalPrice:   store.totalPrice(),
    shippingFee:  store.shippingFee(),
    finalTotal:   store.finalTotal(),
    openCart:     store.openCart,
    closeCart:    store.closeCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    isAuthenticated,
  }
}
