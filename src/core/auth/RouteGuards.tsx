import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, roleHome } from './AuthContext'
import type { UserRole } from '../types/api'

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, restoring } = useAuth()
  const location = useLocation()
  if (restoring) return <div className="route-loading"><span className="spinner" /><p>Restoring your Foodie session…</p></div>
  if (!user) return <Navigate to={location.pathname.startsWith('/admin') ? '/admin/login' : '/login'} replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) return <Navigate to={roleHome[user.role]} replace />
  return <Outlet />
}

export function GuestRoute() {
  const { user, restoring } = useAuth()
  if (restoring) return <div className="route-loading"><span className="spinner" /></div>
  return user ? <Navigate to={roleHome[user.role]} replace /> : <Outlet />
}
