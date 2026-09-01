import { restaurantApi, menuApi, orderApi } from '../core/api/services'

const delay = (ms = 120) => new Promise((resolve) => window.setTimeout(resolve, ms))

export const foodService = {
  async getCuisines() { await delay(); return cuisines },
  async getRestaurants() {return restaurantApi.list()},
  async getRestaurant(id: string) {return restaurantApi.get(id)},
  async getMenu(restaurantId: string) { await delay(); return menuItems.filter((item) => item.restaurantId === restaurantId) },
  async getOrders() { await delay(); return orders },
  async getOrder(id: string) { await delay(); return orders.find((order) => order.id === id) ?? orders[0] },
}