import { useCallback } from 'react'
import { menuApi, restaurantApi } from '../core/api/services'
import { useAsyncResource } from '../core/api/useAsyncResource'
import { environment } from '../core/config/environment'
import type { ApiMenuItem, ApiRestaurant } from '../core/types/api'
import { menuItems, restaurants } from '../services/sriLankanData'

export type CatalogueDish = ApiMenuItem & { restaurantName: string; restaurantOpen: boolean }

const mockRestaurants: ApiRestaurant[] = restaurants.map((restaurant) => ({
  _id: restaurant.id, name: restaurant.name, description: restaurant.cuisine,
  address: restaurant.address ?? 'Sri Lanka', phone: '011 234 5678', imageUrl: restaurant.image,
  category: restaurant.cuisine.split(' · ')[0], owner: 'mock-owner', isOpen: restaurant.status === 'Open',
}))

const mockDishes: CatalogueDish[] = menuItems.map((dish) => ({
  _id: dish.id, restaurant: dish.restaurantId, name: dish.name, description: dish.description,
  price: dish.price, imageUrl: dish.image, category: dish.category, available: true,
  restaurantName: restaurants.find((restaurant) => restaurant.id === dish.restaurantId)?.name ?? 'Foodie partner',
  restaurantOpen: true,
}))

export function useFoodCatalogue() {
  const loader = useCallback(async () => {
    if (environment.useMocks) return { restaurants: mockRestaurants, dishes: mockDishes }
    const restaurantList = await restaurantApi.list()
    const menus = await Promise.all(restaurantList.map(async (restaurant) => {
      const items = await menuApi.list(restaurant._id)
      return items.map((dish): CatalogueDish => ({ ...dish, restaurantName: restaurant.name, restaurantOpen: restaurant.isOpen }))
    }))
    return { restaurants: restaurantList, dishes: menus.flat() }
  }, [])
  return useAsyncResource(loader)
}
