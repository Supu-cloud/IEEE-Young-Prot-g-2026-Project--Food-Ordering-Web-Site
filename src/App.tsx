import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { AccountConnectedPage as AccountPage } from './pages/AccountConnectedPage'
import { CartPage } from './pages/CartPage'
import { CheckoutConnectedPage as CheckoutPage } from './pages/CheckoutConnectedPage'
import { DiscoveryPage as HomePage } from './pages/DiscoveryPage'
import { SweetShopPage } from './pages/SweetShopPage'
import { FoodDetailsPage } from './pages/FoodDetailsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { CustomerOrderDetailConnectedPage as OrderDetailPage } from './pages/CustomerOrderDetailConnectedPage'
import { CustomerOrdersConnectedPage as OrdersPage } from './pages/CustomerOrdersConnectedPage'
import { CartProvider } from './store/CartContext'
import { PortalLayout } from './components/portal/PortalLayout'
import { AuthV2Page } from './pages/AuthV2Page'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { GuestRoute, ProtectedRoute } from './core/auth/RouteGuards'
import { OwnerDashboard } from './pages/owner/OwnerDashboard'
import { OwnerOrdersV2Page } from './pages/owner/OwnerOrdersV2Page'
import { OwnerOrderDetailPage } from './pages/owner/OwnerOrderDetailPage'
import { OwnerMenuPage } from './pages/owner/OwnerMenuPage'
import { OwnerMenuFormPage } from './pages/owner/OwnerMenuFormPage'
import { OwnerAnalyticsPage } from './pages/owner/OwnerAnalyticsPage'
import { OwnerProfilePage } from './pages/owner/OwnerProfilePage'
import { OwnerProfileConnectedPage } from './pages/owner/OwnerProfileConnectedPage'
import { roleHome, useAuth } from './core/auth/AuthContext'
import { RiderConnectedJobs, RiderConnectedDetail } from './pages/rider/RiderConnectedPages'
import { RiderAvailabilityPage, RiderPortalEarningsPage, RiderPortalProfilePage } from './pages/rider/RiderPortalProfilePage'
import { RiderPremiumDashboard } from './pages/rider/RiderPremiumDashboard'
import { WalletPage } from './pages/WalletPage'
import { RestaurantsConnectedPage } from './pages/RestaurantsConnectedPage'
import { RestaurantMenuPage as RestaurantConnectedPage } from './pages/RestaurantMenuPage'
import './App.css'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminApprovalsPage } from './pages/admin/AdminApprovalsPage'
import { AdminApplicationDetailPage } from './pages/admin/AdminApplicationDetailPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminRestaurantsPage } from './pages/admin/AdminRestaurantsPage'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage'
import { AdminReportsPage } from './pages/admin/AdminReportsPage'
import { AdminProfilePage } from './pages/admin/AdminProfilePage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'

function RoleAwareHome() {
  const { user, restoring } = useAuth()
  if (restoring) return <div className="route-loading"><span className="spinner" /></div>
  if (user && user.role !== 'customer') return <Navigate replace to={roleHome[user.role]} />
  return <HomePage />
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<RoleAwareHome />} />
            <Route path="sweets" element={<SweetShopPage />} />
            <Route path="foods/:id" element={<FoodDetailsPage />} />
            <Route path="restaurants" element={<RestaurantsConnectedPage />} />
            <Route path="restaurants/:restaurantId" element={<RestaurantConnectedPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route element={<ProtectedRoute roles={['customer']} />}>
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:orderId" element={<OrderDetailPage />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="profile" element={<AccountPage />} />
              <Route path="account" element={<AccountPage />} />
            </Route>
            <Route path="help" element={<NotFoundPage />} />
          </Route>

          {/* Guest Routes (Unauthenticated Users) */}
          <Route element={<GuestRoute />}>
            <Route path="login" element={<AuthV2Page mode="login" />} />
            <Route path="register" element={<AuthV2Page mode="register" />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
          </Route>

          <Route path="admin/login" element={<AdminLoginPage />} />

          {/* Restaurant Owner Routes */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="admin" element={<PortalLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="approvals" element={<AdminApprovalsPage />} />
              <Route path="approvals/:id" element={<AdminApplicationDetailPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="restaurants" element={<AdminRestaurantsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
            </Route>
          </Route>

          {/* Restaurant Owner Routes */}
          <Route element={<ProtectedRoute roles={['restaurant_owner']} />}>
            <Route path="owner" element={<PortalLayout />}>
              <Route index element={<OwnerDashboard />} />
              <Route path="restaurant" element={<OwnerProfileConnectedPage />} />
              <Route path="orders" element={<OwnerOrdersV2Page />} />
              <Route path="orders/:orderId" element={<OwnerOrderDetailPage />} />
              <Route path="menu" element={<OwnerMenuPage />} />
              <Route path="menu/new" element={<OwnerMenuFormPage />} />
              <Route path="menu/:itemId/edit" element={<OwnerMenuFormPage />} />
              <Route path="analytics" element={<OwnerAnalyticsPage />} />
              <Route path="profile" element={<OwnerProfilePage />} />
            </Route>
          </Route>

          {/* Delivery Rider Routes */}
          <Route element={<ProtectedRoute roles={['delivery_rider']} />}>
            <Route path="rider" element={<PortalLayout />}>
              <Route index element={<RiderPremiumDashboard />} />
              <Route path="deliveries" element={<RiderConnectedJobs />} />
              <Route path="deliveries/:id" element={<RiderConnectedDetail />} />
              <Route path="jobs" element={<RiderConnectedJobs />} />
              <Route path="jobs/:id" element={<RiderConnectedDetail />} />
              <Route path="earnings" element={<RiderPortalEarningsPage />} />
              <Route path="availability" element={<RiderAvailabilityPage />} />
              <Route path="profile" element={<RiderPortalProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
