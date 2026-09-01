import { apiClient } from './client'
import type { ApiCart, ApiEnvelope, ApiMenuItem, ApiOrder, ApiRestaurant, ApiUser, AuthPayload, DeliveryAssignment, DeliveryStatus, Earnings, OrderStatus, SalesAnalytics, UserRole } from '../types/api'

const data = <T>(response: { data: ApiEnvelope<T> }) => response.data.data
export const authApi = {
  login: async (email: string, password: string) => data(await apiClient.post<ApiEnvelope<AuthPayload>>('/auth/login', { email, password })),
  register: async (role: UserRole, payload: { name: string; email: string; password: string; phone?: string; address?: string }) => { const path = role === 'customer' ? '/auth/signup' : role === 'restaurant_owner' ? '/auth/signup/restaurant-owner' : '/auth/signup/delivery-rider'; return (await apiClient.post<ApiEnvelope<ApiUser | AuthPayload>>(path, payload)).data },
  me: async () => data(await apiClient.get<ApiEnvelope<ApiUser>>('/auth/me')),
}
export const restaurantApi = {
  list: async (params?: { search?: string; category?: string }) => data(await apiClient.get<ApiEnvelope<ApiRestaurant[]>>('/restaurants', { params })),
  get: async (id: string) => data(await apiClient.get<ApiEnvelope<ApiRestaurant>>(`/restaurants/${id}`)),
  create: async (payload: Omit<ApiRestaurant, '_id' | 'owner' | 'isOpen'>) => data(await apiClient.post<ApiEnvelope<ApiRestaurant>>('/restaurants', payload)),
  update: async (id: string, payload: Partial<ApiRestaurant>) => data(await apiClient.put<ApiEnvelope<ApiRestaurant>>(`/restaurants/${id}`, payload)),
  toggle: async (id: string) => data(await apiClient.patch<ApiEnvelope<ApiRestaurant>>(`/restaurants/${id}/toggle`)),
}
export const menuApi = {
  list: async (restaurantId: string) => data(await apiClient.get<ApiEnvelope<ApiMenuItem[]>>(`/menu/restaurant/${restaurantId}`)),
  get: async (id: string) => data(await apiClient.get<ApiEnvelope<ApiMenuItem>>(`/menu/item/${id}`)),
  create: async (payload: Omit<ApiMenuItem, '_id' | 'available'>) => data(await apiClient.post<ApiEnvelope<ApiMenuItem>>('/menu', payload)),
  update: async (id: string, payload: Partial<ApiMenuItem>) => data(await apiClient.put<ApiEnvelope<ApiMenuItem>>(`/menu/${id}`, payload)),
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
  place: async (payload: { restaurant: string; items: Array<{ menuItem: string; quantity: number }>; deliveryAddress: string; note?: string }) => data(await apiClient.post<ApiEnvelope<ApiOrder>>('/orders', payload)),
  mine: async () => data(await apiClient.get<ApiEnvelope<ApiOrder[]>>('/orders/my')),
  get: async (id: string) => data(await apiClient.get<ApiEnvelope<ApiOrder>>(`/orders/${id}`)),
  cancel: async (id: string) => data(await apiClient.patch<ApiEnvelope<ApiOrder>>(`/orders/${id}/cancel`)),
  all: async (status?: OrderStatus) => data(await apiClient.get<ApiEnvelope<ApiOrder[]>>('/orders/all', { params: { status } })),
  status: async (id: string, status: OrderStatus) => data(await apiClient.patch<ApiEnvelope<ApiOrder>>(`/orders/${id}/status`, { status })),
  analytics: async () => data(await apiClient.get<ApiEnvelope<SalesAnalytics>>('/orders/analytics/sales')),
}
export const riderApi = {
  mine: async () => data(await apiClient.get<ApiEnvelope<DeliveryAssignment[]>>('/deliveries/my')),
  earnings: async (from?: string) => data(await apiClient.get<ApiEnvelope<Earnings>>('/deliveries/my/earnings', { params: { from } })),
  status: async (id: string, status: DeliveryStatus) => data(await apiClient.patch<ApiEnvelope<DeliveryAssignment>>(`/deliveries/${id}/status`, { status })),
  availability: async (isAvailable: boolean) => data(await apiClient.patch<ApiEnvelope<unknown>>('/roles/rider/availability', { isAvailable })),
  profile: async (payload: { vehicleType: string; vehicleNumber: string; licenseNumber?: string; verificationDocuments?: string[] }) => data(await apiClient.put<ApiEnvelope<unknown>>('/roles/rider/profile', payload)),
}
export const profileApi = { get: async () => data(await apiClient.get<ApiEnvelope<ApiUser>>('/users/profile')), update: async (payload: Pick<ApiUser, 'name' | 'phone' | 'address'>) => data(await apiClient.put<ApiEnvelope<ApiUser>>('/users/profile', payload)) }
export const paymentApi = { start: async (orderId: string) => data(await apiClient.post<ApiEnvelope<{ id: string; clientSecret?: string }>>(`/payments/orders/${orderId}/intent`)) }
