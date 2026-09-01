import { ArrowLeft, Clock3, MapPin, Phone, Store } from 'lucide-react'
import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { menuApi, restaurantApi } from '../core/api/services'
import { useAsyncResource } from '../core/api/useAsyncResource'
import { environment } from '../core/config/environment'
import type { ApiMenuItem, ApiRestaurant } from '../core/types/api'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/AsyncState'
import { Button } from '../components/ui/Button'
import { formatLkr, menuItems, restaurants } from '../services/sriLankanData'
import { useCart } from '../store/CartContext'

export function RestaurantV3Page() {
  const { restaurantId = '' } = useParams(); const cart = useCart()
  const restaurantLoader = useCallback(async () => {
    if (!environment.useMocks) return restaurantApi.get(restaurantId)
    const value = restaurants.find((item) => item.id === restaurantId) ?? restaurants[0]
    return { _id: value.id, name: value.name, description: value.cuisine, address: value.address ?? '', phone: '011 234 5678', imageUrl: value.image, category: value.cuisine, owner: 'demo', isOpen: value.status === 'Open' } satisfies ApiRestaurant
  }, [restaurantId])
  const menuLoader = useCallback(async () => {
    if (!environment.useMocks) return menuApi.list(restaurantId)
    return menuItems.filter((item) => item.restaurantId === restaurantId).map((item) => ({ _id: item.id, name: item.name, description: item.description, price: item.price, imageUrl: item.image, category: item.category, restaurant: item.restaurantId, available: true } satisfies ApiMenuItem))
  }, [restaurantId])
  const restaurantResource = useAsyncResource(restaurantLoader); const menuResource = useAsyncResource(menuLoader)
  if (restaurantResource.loading) return <div className="page container"><LoadingState label="Opening restaurant…" /></div>
  if (restaurantResource.error || !restaurantResource.data) return <div className="page container"><ErrorState message={restaurantResource.error || 'Restaurant not found'} retry={restaurantResource.retry} /></div>
  const restaurant = restaurantResource.data
  const add = (item: ApiMenuItem) => cart.addItem({ id: item._id, restaurantId: item.restaurant, name: item.name, description: item.description ?? '', price: item.price, category: item.category, image: item.imageUrl ?? '/images/food/sri_lankan_feast.jpg' })
  return <div className="page container"><Link className="back-link" to="/restaurants"><ArrowLeft /> Back to restaurants</Link><section className="restaurant-hero connected-restaurant"><div className="connected-cover">{restaurant.imageUrl ? <img src={restaurant.imageUrl} alt={`${restaurant.name} signature food`} /> : <Store />}</div><div><span className="eyebrow">{restaurant.isOpen ? 'Accepting orders' : 'Currently closed'}</span><h1>{restaurant.name}</h1><p>{restaurant.description}</p><div className="restaurant-details"><span><MapPin /> {restaurant.address}</span><span><Phone /> {restaurant.phone}</span><span><Clock3 /> Check menu availability below</span></div></div>{cart.count > 0 && <aside className="cart-preview"><strong>Your cart</strong><span>{cart.count} items</span><b>{formatLkr(cart.subtotal)}</b><Link className="button button--secondary" to="/cart">View cart</Link></aside>}</section><div className="section-heading menu-heading"><div><span className="eyebrow">Fresh from the kitchen</span><h2>Menu</h2></div></div>{menuResource.loading ? <LoadingState label="Loading today’s menu…" /> : menuResource.error ? <ErrorState message={menuResource.error} retry={menuResource.retry} /> : menuResource.data?.length === 0 ? <EmptyState title="Menu unavailable" message="This restaurant has no available menu items right now." /> : <div className="connected-menu-grid">{menuResource.data?.map((item) => <article key={item._id}><div>{item.imageUrl ? <img loading="lazy" src={item.imageUrl} alt={item.name} /> : <Store />}</div><span>{item.category}</span><h3>{item.name}</h3><p>{item.description}</p><footer><strong>{formatLkr(item.price)}</strong><Button disabled={!restaurant.isOpen} onClick={() => add(item)}>Add to cart</Button></footer></article>)}</div>}</div>
}
