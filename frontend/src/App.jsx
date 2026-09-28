import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AdminGuard from './components/admin/AdminGuard'
import AdminLayout from './components/admin/AdminLayout'

/* Public pages */
import HomePage         from './pages/HomePage'
import ProductListPage  from './pages/ProductListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage         from './pages/CartPage'
import CheckoutPage     from './pages/CheckoutPage'
import LoginPage        from './pages/LoginPage'
import RegisterPage     from './pages/RegisterPage'
import OrdersPage       from './pages/OrdersPage'
import ProfilePage      from './pages/ProfilePage'
import NotFoundPage     from './pages/NotFoundPage'

/* Admin pages */
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts  from './pages/admin/AdminProducts'
import AdminOrders    from './pages/admin/AdminOrders'
import AdminUsers     from './pages/admin/AdminUsers'

export default function App() {
  return (
    <Routes>
      {/* ── Public / Customer routes ── */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products"    element={<ProductListPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="cart"        element={<CartPage />} />
        <Route path="checkout"    element={<CheckoutPage />} />
        <Route path="login"       element={<LoginPage />} />
        <Route path="register"    element={<RegisterPage />} />
        <Route path="orders"      element={<OrdersPage />} />
        <Route path="profile"     element={<ProfilePage />} />
        <Route path="*"           element={<NotFoundPage />} />
      </Route>

      {/* ── Admin routes — requires admin role ── */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index          element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders"   element={<AdminOrders />} />
        <Route path="users"    element={<AdminUsers />} />
      </Route>
    </Routes>
  )
}
