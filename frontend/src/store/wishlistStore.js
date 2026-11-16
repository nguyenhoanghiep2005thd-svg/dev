import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      addToWishlist: (product) => {
        const { items } = get()
        if (!items.some(i => i.id === product.id)) {
          set({ items: [product, ...items] })
        }
      },

      removeFromWishlist: (productId) => {
        set({ items: get().items.filter(i => i.id !== productId) })
      },

      toggleWishlist: (product) => {
        const { items, addToWishlist, removeFromWishlist } = get()
        const exists = items.some(i => i.id === product.id)
        if (exists) {
          removeFromWishlist(product.id)
          return false
        } else {
          addToWishlist(product)
          return true
        }
      },

      isWishlisted: (productId) => {
        return get().items.some(i => i.id === productId)
      },

      clearWishlist: () => set({ items: [] }),

      totalItems: () => get().items.length,
    }),
    {
      name: 'phonestore_wishlist',
    }
  )
)

export default useWishlistStore
