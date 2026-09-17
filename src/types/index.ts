export type Restaurant = {
  id: string
  name: string
  cuisine: string
  price: string
  rating: number
  reviews: number
  deliveryTime: string
  image: string
  status: 'Open' | 'Busy'
  featured?: boolean
  address?: string
}

export type MenuItem = {
  id: string
  restaurantId: string
  name: string
  description: string
  price: number
  category: string
  image: string
  popular?: boolean
}

export type CartLine = MenuItem & { quantity: number; restaurantName?: string }

export type OrderStatus = 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled'

export type Order = {
  id: string
  restaurant: string
  restaurantImage: string
  placedAt: string
  items: number
  total: number
  status: OrderStatus
}

export type OwnerOrderStatus = 'New' | 'Preparing' | 'Ready for Pickup' | 'Completed' | 'Declined'
export type OwnerOrder = {
  id: string; customer: string; items: string[]; total: number; placedAt: string; status: OwnerOrderStatus
}

export type DeliveryJob = {
  id: string; restaurant: string; pickup: string; dropoff: string; distance: string; payout: number;
  customer: string; phone: string; instructions: string; items: string[]; status: 'Available' | 'Accepted' | 'Picked Up' | 'Delivered'
}
