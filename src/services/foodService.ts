import { restaurantApi, menuApi, orderApi } from '../core/api/services'

export const foodService = {
  getCuisines: async () => (await restaurantApi.options()).categories,
  getRestaurants: restaurantApi.list,
  getRestaurant: restaurantApi.get,
  getMenu: menuApi.list,
  getOrders: orderApi.mine,
  getOrder: orderApi.get,
}
