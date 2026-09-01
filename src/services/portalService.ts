import type { DeliveryJob, OwnerOrder } from '../types'

export const ownerOrders: OwnerOrder[] = [
  { id: 'FF-2048', customer: 'Maya Perera', items: ['2× California Roll', '1× Miso Soup'], total: 24.47, placedAt: '2 min ago', status: 'New' },
  { id: 'FF-2047', customer: 'Daniel Silva', items: ['1× Spicy Tuna Roll', '2× Green Tea'], total: 17.97, placedAt: '8 min ago', status: 'Preparing' },
  { id: 'FF-2046', customer: 'Aisha Fernando', items: ['2× Salmon Nigiri', '1× Edamame'], total: 15.47, placedAt: '18 min ago', status: 'Ready for Pickup' },
  { id: 'FF-2045', customer: 'Noah Jayasinghe', items: ['3× California Roll'], total: 26.97, placedAt: 'Today, 11:42 AM', status: 'Completed' },
]

export const deliveryJobs: DeliveryJob[] = [
  { id: 'DL-8372', restaurant: 'Sushi Zen', pickup: '123 Maple Avenue, Springfield', dropoff: '48 Lake Drive, Springfield', distance: '3.2 km', payout: 7.50, customer: 'Alice Johnson', phone: '(555) 123-4567', instructions: 'Ring the side bell. Leave at the door.', items: ['California Roll × 2', 'Miso Soup × 1'], status: 'Available' },
  { id: 'DL-8371', restaurant: 'Pizza Palace', pickup: '82 Market Street, Springfield', dropoff: '16 Hill Road, Springfield', distance: '4.7 km', payout: 9.20, customer: 'Daniel Silva', phone: '(555) 987-6543', instructions: 'Call on arrival.', items: ['Margherita Pizza × 1', 'Garlic Bread × 1'], status: 'Available' },
  { id: 'DL-8369', restaurant: 'Burger Barn', pickup: '9 Main Street, Springfield', dropoff: '203 Oak Avenue, Springfield', distance: '2.1 km', payout: 6.30, customer: 'Maya Perera', phone: '(555) 234-8190', instructions: 'Apartment 4B.', items: ['Classic Burger × 2'], status: 'Delivered' },
]

const wait = () => new Promise((resolve) => window.setTimeout(resolve, 160))
export const portalService = {
  async getOwnerOrders() { await wait(); return ownerOrders },
  async getDeliveryJobs() { await wait(); return deliveryJobs },
  async updateOwnerOrder(id: string, status: OwnerOrder['status']) { await wait(); return { id, status } },
  async updateDelivery(id: string, status: DeliveryJob['status']) { await wait(); return { id, status } },
}
