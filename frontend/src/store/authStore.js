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
        useCartStore.getState().syncWithServer()
      },

      logout: () => {
        // Reset cart khi đăng xuất
        useCartStore.getState().resetCart()
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
