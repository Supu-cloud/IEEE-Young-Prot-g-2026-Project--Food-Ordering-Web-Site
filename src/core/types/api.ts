import type { Coordinates } from '../config/maps'
export type UserRole = 'customer' | 'restaurant_owner' | 'delivery_rider' | 'admin'
export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type OrderStatus = 'placed' | 'accepted' | 'declined' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'rider_assigned' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'delivery_failed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed'
export type DeliveryStatus = 'assigned' | 'accepted' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'failed' | 'rejected'

export type ApiEnvelope<T> = { success: boolean; message: string; data: T }
export type UserPreferences = { language: 'en' | 'si' | 'ta'; theme: 'system' | 'light' | 'dark' }
export type ApiUser = { _id: string; name: string; email: string; role: UserRole; accountStatus: AccountStatus; phone?: string; address?: string; preferences?: UserPreferences }
export type AuthPayload = { accessToken: string; refreshToken: string; user: ApiUser }
export type ApiRestaurant = { latitude?: number; longitude?: number; _id: string; name: string; description: string; address: string; phone: string; imageUrl?: string; category: string; owner: string | Pick<ApiUser, '_id' | 'name' | 'email'>; isOpen: boolean; operatingHours?: Record<string, { open: string; close: string; closed?: boolean }> }
export type ApiMenuItem = { _id: string; name: string; description?: string; price: number; imageUrl?: string; category: string; restaurant: string; available: boolean }
export type ApiCart = { _id?: string; customer?: string; restaurant?: string; groups?: Array<{restaurant: string; restaurantName: string; totalAmount: number}>; items: Array<{ menuItem: ApiMenuItem; quantity: number }>; totalAmount: number }
export type ApiOrderItem = { menuItem: string; name: string; quantity: number; price: number }
export type CheckoutInput = { deliveryLocation?: { latitude: number; longitude: number }; restaurant?: string; items: Array<{ menuItem: string; quantity: number }>; deliveryAddress: string; note?: string }
export type CheckoutAttempt = { checkoutId: string; paymentIntentId: string; clientSecret: string; status: string; quote: { groups?: Array<{restaurant: string; restaurantName?: string; subtotal: number; deliveryFee: number; totalAmount: number; items: ApiOrderItem[]}>; subtotal: number; deliveryFee: number; totalAmount: number; deliveryAddress: string; items: ApiOrderItem[] } }
export type CheckoutResult = ApiOrder | {checkoutId: string; paymentStatus: string; totalAmount: number; orders: ApiOrder[]; cartHandled: true}
export type ApiOrder = { deliveryLocation?: { latitude: number; longitude: number }; pickupLocation?: { address: string; latitude: number; longitude: number }; checkoutId?: string; subtotal?: number; deliveryFee: number; paymentMethod?: string; placedAt?: string; confirmedAt?: string; preparingAt?: string; readyForPickupAt?: string; riderAssignedAt?: string; pickedUpAt?: string; outForDeliveryAt?: string; deliveredAt?: string; cancelledAt?: string;
settlement?: { restaurantAmount: number; riderAmount: number; restaurantStatus: string; riderStatus: string; availableAt?: string };
deliveryReview?: { riderRating: number; serviceRating: number; comment?: string; createdAt: string }; customerReceipt?: { status: 'received' | 'not_received'; createdAt: string }; _id: string; customer: string | Pick<ApiUser, '_id' | 'name' | 'email' | 'phone'>; restaurant: string | Pick<ApiRestaurant, '_id' | 'name' | 'address' | 'phone' | 'imageUrl'>; items: ApiOrderItem[]; totalAmount: number; status: OrderStatus; deliveryAddress: string; paymentStatus: PaymentStatus; deliveryRider?: string | Pick<ApiUser,'_id'|'name'|'phone'>; note?: string; createdAt: string }
export type DeliveryAssignment = { _id: string; order: ApiOrder; rider: string; status: DeliveryStatus; payout: number; assignedAt: string; acceptedAt?: string; pickedUpAt?: string; deliveredAt?: string; failedAt?: string }
export type PublicReview = { _id: string; rating: number; comment: string; createdAt: string; customer: Pick<ApiUser, '_id' | 'name'>; restaurant: Pick<ApiRestaurant, '_id' | 'name'>; order?: { deliveryReview?: { riderRating: number; serviceRating: number; comment?: string } } }
export type PublicFeedback = { id: string; rating: number; merchantName: string; comment: string; deliveryDetails?: string; customerName: string; isVerified: boolean }
export type SalesAnalytics = { summary: { revenue: number; orderCount: number; averageOrderValue: number }; history: ApiOrder[] }
export type OwnerDashboardData = { owner: ApiUser; restaurant: ApiRestaurant | null; metrics: { todayOrders: number; activeOrders: number; completedOrders: number; todayRevenue: number; menuItems: number }; recentOrders: ApiOrder[] }
export type OwnerAnalytics = { summary: { todayRevenue: number; totalRevenue: number; orderCount: number; completedOrders: number; averageOrderValue: number }; popularItems: Array<{ _id: string; name: string; quantity: number; revenue: number }>; recentSales: ApiOrder[] }
export type Earnings = { totalEarnings: number; completedTrips: number; trips: DeliveryAssignment[] }
export type RiderProfile = { _id: string; user: Pick<ApiUser, '_id' | 'name' | 'email' | 'phone' | 'address' | 'role' | 'accountStatus'>; vehicleType: string; vehicleNumber: string; licenseNumber?: string; isAvailable: boolean; verificationDocuments: string[] }
export type PageResult<T> = { items: T[]; pagination: { page: number; limit: number; total: number; pages: number } }
export type AdminKpis = { totalUsers: number; totalCustomers: number; totalRestaurantOwners: number; totalDeliveryRiders: number; totalRestaurants: number; openRestaurants: number; totalOrders: number; ordersToday: number; totalSales: number; salesToday: number; averageOrderValue: number; completedOrders: number; cancelledOrders: number; pendingApprovals: number; availableRiders: number; newUsersToday: number; newUsersThisWeek: number; newUsersThisMonth: number; activeOrders: number }
export type AdminDashboard = { generatedAt: string; definitions: Record<string,string>; kpis: AdminKpis; userDistribution: Array<{role:UserRole;count:number}>; orderStatusDistribution: Array<{status:OrderStatus;count:number}>; topRestaurants: Array<{restaurantId:string;name:string;orders:number;revenue:number}>; recentActivity:{users:ApiUser[];orders:ApiOrder[]} }
export type AdminAnalytics = { range:{from:string;to:string;key:string}; salesTrend:Array<{date:string;revenue:number;orders:number}>; orderVolume:Array<{date:string;orders:number}>; userGrowth:Array<{date:string;role:UserRole;count:number}>; userDistribution:Array<{role:UserRole;count:number}>; orderStatusDistribution:Array<{status:OrderStatus;count:number;value:number}>; restaurantAnalytics:{topRestaurants:Array<{restaurantId:string;name:string;orders:number;revenue:number}>}; sales:{grossOrderSales:number;completedOrderRevenue:number;cancelledOrderValue:number;averageOrderValue:number;orderCount:number} }
export type AdminApplication = ApiUser & { createdAt:string; reviewedAt?:string; rejectionReason?:string; isEmailVerified:boolean; profile?:Record<string,unknown>|null }
export type AdminRestaurant = ApiRestaurant & { orderCount:number; revenue:number; createdAt:string }

export type RestaurantOptions = { categories: string[]; days: string[]; limits: { name: number; description: number; address: number }; phonePattern: string; image: { maxBytes: number; types: string[] } }
export type RestaurantInput = Pick<ApiRestaurant, 'latitude' | 'longitude' | 'name' | 'description' | 'address' | 'phone' | 'category' | 'imageUrl' | 'isOpen' | 'operatingHours'>

export type DeliveryRoute = {
  deliveryId: string; orderId: string; status: string
  restaurant: { name: string; address: string; coordinates: Coordinates | null }
  customer: { name: string; address: string; coordinates: Coordinates | null }
  route: { distanceMeters: number; durationSeconds: number; geometry: { type: 'LineString'; coordinates: [number, number][] }; coordinates: [number, number][] } | null
  errors: { code: string; message: string }[]
}
