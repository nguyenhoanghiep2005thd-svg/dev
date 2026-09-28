import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

/** Bảo vệ route admin — redirect nếu chưa login hoặc không phải admin */
export default function AdminGuard({ children }) {
  const location        = useLocation()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated())
  const isAdmin         = useAuthStore(s => s.isAdmin())

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }
  return children
}
