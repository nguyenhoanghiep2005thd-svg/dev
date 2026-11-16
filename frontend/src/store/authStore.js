import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import useCartStore from './cartStore'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,

      /**
       * Gọi sau khi login thành công.
       * Tự động sync cart local → server.
       */
      login: (user, tokens) => {
        set({
          user,
          accessToken:  tokens.access,
          refreshToken: tokens.refresh,
        })
        // Sync giỏ hàng local lên server
        const cart = useCartStore.getState()
        if (typeof cart.syncWithServer === 'function') {
          cart.syncWithServer()
        } else if (typeof cart.syncCart === 'function') {
          cart.syncCart()
        }
      },

      logout: () => {
        // Reset cart khi đăng xuất
        const cart = useCartStore.getState()
        if (typeof cart.resetCart === 'function') {
          cart.resetCart()
        } else if (typeof cart.clearCart === 'function') {
          cart.clearCart()
        }
        set({ user: null, accessToken: null, refreshToken: null })
      },

      updateUser: (userData) =>
        set({ user: { ...get().user, ...userData } }),

      isAuthenticated: () => !!get().accessToken,
      isAdmin:         () => get().user?.role === 'admin',
    }),
    {
      name:       'auth-storage',
      partialize: s => ({
        user:         s.user,
        accessToken:  s.accessToken,
        refreshToken: s.refreshToken,
      }),
    }
  )
)

export default useAuthStore
