import { useCallback } from 'react'
import { menuApi, restaurantApi } from '../core/api/services'
import { useRestaurantResource } from '../core/api/restaurantRefresh'
import type { ApiMenuItem } from '../core/types/api'

export type CatalogueDish = ApiMenuItem & { restaurantName: string; restaurantOpen: boolean }

export function useFoodCatalogue() {
  const loader = useCallback(async () => {
    const restaurantList = await restaurantApi.list()
    const menus = await Promise.all(restaurantList.map(async (restaurant) => {
      const items = await menuApi.list(restaurant._id)
      return items.map((dish): CatalogueDish => ({ ...dish, restaurantName: restaurant.name, restaurantOpen: restaurant.isOpen }))
    }))
    return { restaurants: restaurantList, dishes: menus.flat() }
  }, [])
  return useRestaurantResource(loader)
}
