import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from '../cart/CartDrawer'
import ServerWakeUp from '../common/ServerWakeUp'
import useAuthStore from '../../store/authStore'
import useCartStore from '../../store/cartStore'

export default function Layout() {
  useEffect(() => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      useCartStore.getState().fetchCart()
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <ServerWakeUp />
    </div>
  )
}
