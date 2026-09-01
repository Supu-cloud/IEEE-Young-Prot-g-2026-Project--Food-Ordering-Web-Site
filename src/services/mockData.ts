import type { MenuItem, Order, Restaurant } from '../types'

export const cuisines = [
  { name: 'Pizza', emoji: '🍕' }, { name: 'Sushi', emoji: '🍣' },
  { name: 'Burgers', emoji: '🍔' }, { name: 'Tacos', emoji: '🌮' },
  { name: 'Thai', emoji: '🍜' }, { name: 'Indian', emoji: '🍛' },
  { name: 'Desserts', emoji: '🍰' }, { name: 'Healthy', emoji: '🥗' },
]

export const restaurants: Restaurant[] = [
  { id: 'golden-spoon', name: 'The Golden Spoon', cuisine: 'Fine Dining · French', price: '$$$', rating: 4.8, reviews: 120, deliveryTime: '25–35 min', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80', status: 'Open', featured: true },
  { id: 'pizza-palace', name: 'Pizza Palace', cuisine: 'Italian · Pizza', price: '$$', rating: 4.5, reviews: 250, deliveryTime: '40–50 min', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80', status: 'Busy', featured: true },
  { id: 'sushi-zen', name: 'Sushi Zen', cuisine: 'Japanese · Sushi', price: '$$$', rating: 4.9, reviews: 85, deliveryTime: '20–30 min', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80', status: 'Open', featured: true, address: '123 Maple Avenue, Springfield, IL 62701' },
  { id: 'burger-barn', name: 'Burger Barn', cuisine: 'American · Fast Food', price: '$', rating: 4.2, reviews: 500, deliveryTime: '15–25 min', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80', status: 'Open', featured: true },
  { id: 'thai-spice', name: 'Thai Spice', cuisine: 'Thai · Asian', price: '$$', rating: 4.6, reviews: 120, deliveryTime: '30–40 min', image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=900&q=80', status: 'Open' },
  { id: 'curry-house', name: 'Curry House', cuisine: 'Indian · North Indian', price: '$$', rating: 4.4, reviews: 200, deliveryTime: '35–45 min', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80', status: 'Open' },
  { id: 'dessert-delight', name: 'Dessert Delight', cuisine: 'Desserts · Bakery', price: '$', rating: 4.7, reviews: 150, deliveryTime: '20–30 min', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80', status: 'Open' },
  { id: 'healthy-bites', name: 'Healthy Bites', cuisine: 'Healthy · Salads', price: '$$', rating: 4.3, reviews: 180, deliveryTime: '25–35 min', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80', status: 'Open' },
]

export const menuItems: MenuItem[] = [
  { id: 'california-roll', restaurantId: 'sushi-zen', name: 'California Roll', description: 'Crab, avocado, cucumber, and sesame seeds.', price: 8.99, category: 'Sushi Rolls', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=500&q=80', popular: true },
  { id: 'spicy-tuna-roll', restaurantId: 'sushi-zen', name: 'Spicy Tuna Roll', description: 'Spicy tuna, cucumber, and scallions.', price: 9.49, category: 'Sushi Rolls', image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=500&q=80', popular: true },
  { id: 'salmon-nigiri', restaurantId: 'sushi-zen', name: 'Salmon Nigiri', description: 'Fresh salmon over seasoned sushi rice.', price: 5.49, category: 'Nigiri', image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=500&q=80' },
  { id: 'miso-soup', restaurantId: 'sushi-zen', name: 'Miso Soup', description: 'Traditional miso soup with tofu, seaweed, and green onions.', price: 3.49, category: 'Popular', image: 'https://images.unsplash.com/photo-1607301405390-d831c242f59b?auto=format&fit=crop&w=500&q=80', popular: true },
  { id: 'green-tea', restaurantId: 'sushi-zen', name: 'Green Tea', description: 'Hot, fragrant Japanese green tea.', price: 1.99, category: 'Beverages', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=500&q=80' },
  { id: 'edamame', restaurantId: 'sushi-zen', name: 'Edamame', description: 'Steamed soybeans with sea salt.', price: 4.49, category: 'Popular', image: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=500&q=80' },
]

export const orders: Order[] = [
  { id: '1234567', restaurant: 'Pizza Palace', restaurantImage: restaurants[1].image, placedAt: 'May 12, 2025 · 1:30 PM', items: 3, total: 28.47, status: 'Preparing' },
  { id: '1234566', restaurant: 'Sushi Zen', restaurantImage: restaurants[2].image, placedAt: 'May 11, 2025 · 7:15 PM', items: 2, total: 24.90, status: 'Out for Delivery' },
  { id: '1234565', restaurant: 'The Golden Spoon', restaurantImage: restaurants[0].image, placedAt: 'May 10, 2025 · 12:45 PM', items: 4, total: 42.60, status: 'Delivered' },
  { id: '1234564', restaurant: 'Burger Barn', restaurantImage: restaurants[3].image, placedAt: 'May 9, 2025 · 6:20 PM', items: 2, total: 18.75, status: 'Cancelled' },
]
