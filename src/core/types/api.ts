export type UserRole = 'customer' | 'restaurant_owner' | 'delivery_rider'
export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type OrderStatus = 'placed' | 'accepted' | 'declined' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'rider_assigned' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed'
export type DeliveryStatus = 'assigned' | 'accepted' | 'picked_up' | 'delivered' | 'rejected'

export type ApiEnvelope<T> = { success: boolean; message: string; data: T }
export type ApiUser = { _id: string; name: string; email: string; role: UserRole; accountStatus: AccountStatus; phone?: string; address?: string }
export type AuthPayload = { accessToken: string; refreshToken: string; user: ApiUser }
export type ApiRestaurant = { _id: string; name: string; description: string; address: string; phone: string; imageUrl?: string; category: string; owner: string | Pick<ApiUser, '_id' | 'name' | 'email'>; isOpen: boolean; operatingHours?: Record<string, { open: string; close: string; closed?: boolean }> }
export type ApiMenuItem = { _id: string; name: string; description?: string; price: number; imageUrl?: string; category: string; restaurant: string; available: boolean }
export type ApiCart = { _id?: string; customer?: string; restaurant?: string; items: Array<{ menuItem: ApiMenuItem; quantity: number }>; totalAmount: number }
export type ApiOrderItem = { menuItem: string; name: string; quantity: number; price: number }
export type ApiOrder = { _id: string; customer: string | Pick<ApiUser, '_id' | 'name' | 'email' | 'phone'>; restaurant: string | Pick<ApiRestaurant, '_id' | 'name' | 'address' | 'phone' | 'imageUrl'>; items: ApiOrderItem[]; totalAmount: number; status: OrderStatus; deliveryAddress: string; paymentStatus: PaymentStatus; deliveryRider?: string; note?: string; createdAt: string }
export type DeliveryAssignment = { _id: string; order: ApiOrder; rider: string; status: DeliveryStatus; payout: number; assignedAt: string; acceptedAt?: string; pickedUpAt?: string; deliveredAt?: string }
export type SalesAnalytics = { summary: { revenue: number; orderCount: number; averageOrderValue: number }; history: ApiOrder[] }
export type Earnings = { totalEarnings: number; completedTrips: number; trips: DeliveryAssignment[] }
