import type { CheckoutAttempt, CheckoutInput } from '../types/api'
import { restaurantChanged } from './restaurantRefresh'
import type { RestaurantInput, RestaurantOptions } from '../types/api'
import { apiClient } from './client'
import type { AdminAnalytics, AdminApplication, AdminDashboard, AdminRestaurant, ApiCart, ApiEnvelope, ApiMenuItem, ApiOrder, ApiRestaurant, ApiUser, AuthPayload, DeliveryAssignment, DeliveryStatus, Earnings, OrderStatus, OwnerAnalytics, OwnerDashboardData, PageResult, PublicFeedback, PublicReview, RiderProfile, SalesAnalytics, UserRole } from '../types/api'

const data = <T>(response: { data: ApiEnvelope<T> }) => response.data.data
export const authApi = {
  login: async (email: string, password: string) => data(await apiClient.post<ApiEnvelope<AuthPayload>>('/auth/login', { email, password })),
  google: async (idToken: string) => data(await apiClient.post<ApiEnvelope<AuthPayload>>('/auth/google', { idToken })),
  register: async (role: UserRole, payload: { name: string; email: string; password: string; phone?: string; address?: string }) => { const path = role === 'customer' ? '/auth/signup' : role === 'restaurant_owner' ? '/auth/signup/restaurant-owner' : '/auth/signup/delivery-rider'; return (await apiClient.post<ApiEnvelope<ApiUser | AuthPayload>>(path, payload)).data },
  resendVerification: async (email: string) => (await apiClient.post<ApiEnvelope<null>>('/auth/resend-verification', { email })).data.message,
  me: async () => data(await apiClient.get<ApiEnvelope<ApiUser>>('/auth/me')),
}
export const restaurantApi = {
  options: async () => data(await apiClient.get<ApiEnvelope<RestaurantOptions>>('/restaurants/options')),
  list: async (params?: { search?: string; category?: string }) => data(await apiClient.get<ApiEnvelope<ApiRestaurant[]>>('/restaurants', { params })),
  get: async (id: string) => data(await apiClient.get<ApiEnvelope<ApiRestaurant>>(`/restaurants/${id}`)),
  create: async (payload: Omit<RestaurantInput, 'isOpen'> & { isOpen?: boolean }) => { const value = data(await apiClient.post<ApiEnvelope<ApiRestaurant>>('/restaurants', payload)); restaurantChanged(); return value },
  update: async (id: string, payload: Partial<RestaurantInput>) => { const value = data(await apiClient.put<ApiEnvelope<ApiRestaurant>>(`/restaurants/${id}`, payload)); restaurantChanged(); return value },
  toggle: async (id: string) => { const value = data(await apiClient.patch<ApiEnvelope<ApiRestaurant>>(`/restaurants/${id}/toggle`)); restaurantChanged(); return value },
}
export const menuApi = {
  list: async (restaurantId: string) => data(await apiClient.get<ApiEnvelope<ApiMenuItem[]>>(`/menu/restaurant/${restaurantId}`)),
  get: async (id: string) => data(await apiClient.get<ApiEnvelope<ApiMenuItem>>(`/menu/item/${id}`)),
  create: async (payload: Omit<ApiMenuItem, '_id' | 'available'>) => data(await apiClient.post<ApiEnvelope<ApiMenuItem>>('/menu', payload)),
  update: async (id: string, payload: Partial<ApiMenuItem>) => data(await apiClient.put<ApiEnvelope<ApiMenuItem>>(`/menu/${id}`, payload)),
  remove: async (id: string) => data(await apiClient.delete<ApiEnvelope<null>>(`/menu/${id}`)),
  toggle: async (id: string) => data(await apiClient.patch<ApiEnvelope<ApiMenuItem>>(`/menu/${id}/toggle`)),
}
export const cartApi = {
  get: async () => data(await apiClient.get<ApiEnvelope<ApiCart>>('/cart')),
  add: async (menuItem: string, quantity = 1) => data(await apiClient.post<ApiEnvelope<ApiCart>>('/cart/items', { menuItem, quantity })),
  update: async (menuItemId: string, quantity: number) => data(await apiClient.patch<ApiEnvelope<ApiCart>>(`/cart/items/${menuItemId}`, { quantity })),
  remove: async (menuItemId: string) => data(await apiClient.delete<ApiEnvelope<ApiCart>>(`/cart/items/${menuItemId}`)),
  clear: async () => data(await apiClient.delete<ApiEnvelope<ApiCart>>('/cart')),
}
export const orderApi = {
  review: async (id: string, payload: { riderRating: number; serviceRating: number; restaurantRating: number; restaurantComment: string; comment?: string }) => data(await apiClient.post<ApiEnvelope<ApiOrder>>(`/orders/${id}/delivery-review`, payload)),
  receipt: async (id: string, status: 'received' | 'not_received') => data(await apiClient.patch<ApiEnvelope<ApiOrder>>(`/orders/${id}/receipt`, { status })),
  place: async (payload: { restaurant: string; items: Array<{ menuItem: string; quantity: number }>; deliveryAddress: string; note?: string }) => data(await apiClient.post<ApiEnvelope<ApiOrder>>('/orders', payload)),
  mine: async () => data(await apiClient.get<ApiEnvelope<ApiOrder[]>>('/orders/my')),
  get: async (id: string) => data(await apiClient.get<ApiEnvelope<ApiOrder>>(`/orders/${id}`)),
  cancel: async (id: string) => data(await apiClient.patch<ApiEnvelope<ApiOrder>>(`/orders/${id}/cancel`)),
  all: async (status?: OrderStatus) => data(await apiClient.get<ApiEnvelope<ApiOrder[]>>('/orders/all', { params: { status } })),
  status: async (id: string, status: OrderStatus) => data(await apiClient.patch<ApiEnvelope<ApiOrder>>(`/orders/${id}/status`, { status })),
  analytics: async () => data(await apiClient.get<ApiEnvelope<SalesAnalytics>>('/orders/analytics/sales')),
}
export const riderApi = {
  available: async () => data(await apiClient.get<ApiEnvelope<RiderProfile[]>>('/deliveries/available-riders')),
  assign: async (orderId: string, riderId: string) => data(await apiClient.post<ApiEnvelope<DeliveryAssignment>>(`/deliveries/orders/${orderId}/assign`, { riderId })),
  mine: async () => data(await apiClient.get<ApiEnvelope<DeliveryAssignment[]>>('/deliveries/my')),
  earnings: async (from?: string) => data(await apiClient.get<ApiEnvelope<Earnings>>('/deliveries/my/earnings', { params: { from } })),
  status: async (id: string, status: DeliveryStatus) => data(await apiClient.patch<ApiEnvelope<DeliveryAssignment>>(`/deliveries/${id}/status`, { status })),
  getProfile: async () => data(await apiClient.get<ApiEnvelope<RiderProfile>>('/roles/rider/profile')),
  availability: async (isAvailable: boolean) => data(await apiClient.patch<ApiEnvelope<unknown>>('/roles/rider/availability', { isAvailable })),
  profile: async (payload: { vehicleType: string; vehicleNumber: string; licenseNumber?: string; verificationDocuments?: string[] }) => data(await apiClient.put<ApiEnvelope<unknown>>('/roles/rider/profile', payload)),
}
export const profileApi = { get: async () => data(await apiClient.get<ApiEnvelope<ApiUser>>('/users/profile')), update: async (payload: Pick<ApiUser, 'name' | 'phone' | 'address'>) => data(await apiClient.put<ApiEnvelope<ApiUser>>('/users/profile', payload)) }
export const reviewApi = { featured: async () => data(await apiClient.get<ApiEnvelope<PublicReview[]>>('/reviews/featured')) }
export const feedbackApi = { list: async () => data(await apiClient.get<ApiEnvelope<PublicFeedback[]>>('/feedbacks')) }
export const paymentApi = {
  checkout: async (checkoutKey: string, payload?: CheckoutInput) => data(await apiClient.post<ApiEnvelope<CheckoutAttempt>>('/payments/checkout', { checkoutKey, ...payload })),
  completeCheckout: async (id: string) => data(await apiClient.post<ApiEnvelope<ApiOrder>>(`/payments/checkout/${id}/complete`)),
  start: async (orderId: string) => data(await apiClient.post<ApiEnvelope<{ id: string; clientSecret?: string }>>(`/payments/orders/${orderId}/intent`)),
  confirm: async (orderId: string, paymentIntentId: string) => data(await apiClient.post<ApiEnvelope<ApiOrder>>(`/payments/orders/${orderId}/confirm`, { paymentIntentId })),
}
export const ownerApi = {
  saveRestaurant: async (payload: RestaurantInput) => { const value = data(await apiClient.put<ApiEnvelope<ApiRestaurant>>('/owner/restaurant', payload)); restaurantChanged(); return value },
  uploadLogo: async (file: File, onProgress: (percent: number) => void) => {
    const form = new FormData(); form.append('image', file)
    return data(await apiClient.post<ApiEnvelope<{ imageUrl: string }>>('/owner/restaurant/logo', form, { headers: { 'Content-Type': undefined }, timeout: 60_000, onUploadProgress: event => onProgress(event.total ? Math.round(event.loaded / event.total * 100) : 0) }))
  },
  dashboard: async () => data(await apiClient.get<ApiEnvelope<OwnerDashboardData>>('/owner/dashboard')),
  restaurant: async () => data(await apiClient.get<ApiEnvelope<ApiRestaurant | null>>('/owner/restaurant')),
  menu: async () => data(await apiClient.get<ApiEnvelope<ApiMenuItem[]>>('/owner/menu')),
  menuItem: async (id: string) => data(await apiClient.get<ApiEnvelope<ApiMenuItem>>(`/owner/menu/${id}`)),
  orders: async (status?: OrderStatus) => data(await apiClient.get<ApiEnvelope<ApiOrder[]>>('/owner/orders', { params: { status } })),
  order: async (id: string) => data(await apiClient.get<ApiEnvelope<ApiOrder>>(`/owner/orders/${id}`)),
  analytics: async () => data(await apiClient.get<ApiEnvelope<OwnerAnalytics>>('/owner/analytics')),
}
export const adminApi = {
  dashboard: async () => data(await apiClient.get<ApiEnvelope<AdminDashboard>>('/admin/dashboard')),
  analytics: async (params?:Record<string,string>) => data(await apiClient.get<ApiEnvelope<AdminAnalytics>>('/admin/analytics',{params})),
  applications: async (params?:Record<string,string|number>) => data(await apiClient.get<ApiEnvelope<PageResult<AdminApplication>>>('/admin/applications',{params})),
  application: async (id:string) => data(await apiClient.get<ApiEnvelope<AdminApplication>>(`/admin/applications/${id}`)),
  approve: async (id:string) => data(await apiClient.patch<ApiEnvelope<AdminApplication>>(`/admin/applications/${id}/approve`)),
  reject: async (id:string,reason:string) => data(await apiClient.patch<ApiEnvelope<AdminApplication>>(`/admin/applications/${id}/reject`,{reason})),
  users: async (params?:Record<string,string|number>) => data(await apiClient.get<ApiEnvelope<PageResult<ApiUser & {createdAt:string}>>>('/admin/users',{params})),
  userStatus: async (id:string,status:'approved'|'suspended') => data(await apiClient.patch<ApiEnvelope<ApiUser>>(`/admin/users/${id}/status`,{status})),
  deleteUser: async (id:string) => data(await apiClient.delete<ApiEnvelope<null>>(`/admin/users/${id}`)),
  restaurants: async (params?:Record<string,string|number>) => data(await apiClient.get<ApiEnvelope<PageResult<AdminRestaurant>>>('/admin/restaurants',{params})),
  assignableRestaurantOwners: async () => data(await apiClient.get<ApiEnvelope<Array<Pick<ApiUser,'_id'|'name'|'email'>>>>('/admin/restaurant-owners/assignable')),
  assignRestaurantOwner: async (restaurantId:string,ownerId:string) => data(await apiClient.patch<ApiEnvelope<ApiRestaurant>>(`/admin/restaurants/${restaurantId}/owner`,{ownerId})),
  unassignRestaurantOwner: async (restaurantId:string) => data(await apiClient.delete<ApiEnvelope<ApiRestaurant>>(`/admin/restaurants/${restaurantId}/owner`)),
  orders: async (params?:Record<string,string|number>) => data(await apiClient.get<ApiEnvelope<PageResult<ApiOrder>>>('/admin/orders',{params})),
  report: async (type:string,params?:Record<string,string>) => data(await apiClient.get<ApiEnvelope<{title:string;summary:{records:number;from:string;to:string;generatedAt:string};rows:Record<string,unknown>[] }>>(`/admin/reports/${type}`,{params})),
  reportCsv: async (type:string,params?:Record<string,string>) => (await apiClient.get<Blob>(`/admin/reports/${type}`,{params:{...params,format:'csv'},responseType:'blob'})).data,
}
