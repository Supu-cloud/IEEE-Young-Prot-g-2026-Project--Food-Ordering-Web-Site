export type OwnerOrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled'

export type OwnerOrder = {
  id: string
  customer: string
  phone: string
  address: string
  time: string
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
  status: OwnerOrderStatus
  payment: string
}

export type OwnerMenuItem = {
  id: string
  name: string
  description: string
  category: string
  price: number
  available: boolean
  prepTime: number
  image: string
}

export const ownerOrders: OwnerOrder[] = [
  { id: 'FD-1048', customer: 'Maya Perera', phone: '077 234 6789', address: '18 Flower Road, Colombo 07', time: '5 min ago', status: 'Pending', payment: 'Card - Paid', total: 3280, items: [{ name: 'Cheese Chicken Kottu', quantity: 2, price: 1450 }, { name: 'Ceylon Milk Tea', quantity: 1, price: 380 }] },
  { id: 'FD-1047', customer: 'Nimal Silva', phone: '071 845 1290', address: '42 Lake Drive, Nugegoda', time: '12 min ago', status: 'Confirmed', payment: 'Cash on delivery', total: 2460, items: [{ name: 'Egg Hopper Breakfast', quantity: 2, price: 980 }, { name: 'Watalappan', quantity: 1, price: 500 }] },
  { id: 'FD-1046', customer: 'Aisha Fernando', phone: '076 512 9034', address: '6 Park Lane, Rajagiriya', time: '21 min ago', status: 'Preparing', payment: 'Card - Paid', total: 1850, items: [{ name: 'Seafood Fried Rice', quantity: 1, price: 1850 }] },
  { id: 'FD-1045', customer: 'Dinuka Jayasinghe', phone: '075 903 2241', address: '91 Temple Road, Kotte', time: '38 min ago', status: 'Out for Delivery', payment: 'Card - Paid', total: 2960, items: [{ name: 'Chicken Lamprais', quantity: 2, price: 1480 }] },
  { id: 'FD-1044', customer: 'Emma Wilson', phone: '070 611 4432', address: '11 Galle Road, Colombo 03', time: 'Today, 11:20 AM', status: 'Delivered', payment: 'Card - Paid', total: 1380, items: [{ name: 'String Hopper Set', quantity: 1, price: 980 }, { name: 'Ceylon Milk Tea', quantity: 1, price: 400 }] },
  { id: 'FD-1043', customer: 'Ravindu Senanayake', phone: '077 621 8340', address: '3 Station Road, Dehiwala', time: 'Today, 10:48 AM', status: 'Cancelled', payment: 'Refunded', total: 1450, items: [{ name: 'Cheese Chicken Kottu', quantity: 1, price: 1450 }] },
]

export const ownerMenuItems: OwnerMenuItem[] = [
  { id: 'MI-01', name: 'Cheese Chicken Kottu', description: 'Sizzling kottu with roast chicken, vegetables and melted cheese.', category: 'Kottu', price: 1450, available: true, prepTime: 20, image: '/images/food/cheese_kottu.jpg' },
  { id: 'MI-02', name: 'Egg Hopper Breakfast', description: 'Three hoppers, egg hopper, dhal curry and sambol.', category: 'Breakfast', price: 980, available: true, prepTime: 15, image: '/images/food/egg_hoppers.jpg' },
  { id: 'MI-03', name: 'Chicken Lamprais', description: 'Fragrant rice, chicken curry and traditional accompaniments.', category: 'Rice', price: 1480, available: true, prepTime: 25, image: '/images/food/sri_lankan_feast.jpg' },
  { id: 'MI-04', name: 'Watalappan', description: 'Steamed coconut custard with jaggery and cashews.', category: 'Desserts', price: 500, available: false, prepTime: 5, image: '/images/food/pani_walalu.jpg' },
]

export const ownerRestaurant = {
  name: 'Ceylon Kitchen', category: 'Sri Lankan', address: '128 Galle Road, Colombo 03', phone: '011 245 8890',
  description: 'Authentic Sri Lankan comfort food prepared with fresh local ingredients and family recipes.',
  image: '/images/food/sri_lankan_feast.jpg', isOpen: true,
  hours: ['Mon - Fri  8:00 AM - 10:00 PM', 'Saturday  9:00 AM - 11:00 PM', 'Sunday  9:00 AM - 9:00 PM'],
}
