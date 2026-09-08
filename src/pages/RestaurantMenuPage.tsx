import { ArrowLeft, Clock3, MapPin, Phone, Store } from 'lucide-react'
import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FoodCard } from '../components/FoodCard'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/AsyncState'
import { menuApi, restaurantApi } from '../core/api/services'
import { useAsyncResource } from '../core/api/useAsyncResource'
import { useRestaurantResource } from '../core/api/restaurantRefresh'
import { restaurantImageUrl } from '../core/api/imageUrl'
import { formatLkr } from '../services/sriLankanData'
import { useCart } from '../store/CartContext'

export function RestaurantMenuPage() {
  const { restaurantId = '' } = useParams()
  const cart = useCart()
  const restaurantLoader = useCallback(() => restaurantApi.get(restaurantId), [restaurantId])
  const menuLoader = useCallback(() => menuApi.list(restaurantId), [restaurantId])
  const restaurantResource = useRestaurantResource(restaurantLoader)
  const menuResource = useAsyncResource(menuLoader)
  if (restaurantResource.loading) return <div className="page container"><LoadingState label="Opening restaurantâ€¦" /></div>
  if (restaurantResource.error || !restaurantResource.data) return <div className="page container"><ErrorState message={restaurantResource.error || 'Restaurant not found'} retry={restaurantResource.retry} /></div>
  const restaurant = restaurantResource.data
  return <div className="page container">
    <Link className="back-link" to="/restaurants"><ArrowLeft /> Back to restaurants</Link>
    <section className="restaurant-hero connected-restaurant">
      <div className="connected-cover">{restaurant.imageUrl ? <img src={restaurantImageUrl(restaurant.imageUrl)} alt={`${restaurant.name} logo`} /> : <Store />}</div>
      <div><span className="eyebrow">{restaurant.isOpen ? 'Accepting orders' : 'Currently closed'}</span><h1>{restaurant.name}</h1><span className="eyebrow">{restaurant.category}</span><p>{restaurant.description}</p><div className="restaurant-details"><span><MapPin /> {restaurant.address}</span><span><Phone /> {restaurant.phone}</span><span><Clock3 /> Check menu availability below</span></div></div>
      {cart.count > 0 && <aside className="cart-preview"><strong>Your cart</strong><span>{cart.count} items</span><b>{formatLkr(cart.subtotal)}</b><Link className="button button--secondary" to="/cart">View cart</Link></aside>}
    </section>
    {restaurant.operatingHours && Object.keys(restaurant.operatingHours).length > 0 && <details className="restaurant-public-hours"><summary><Clock3 />Operating hours</summary>{Object.entries(restaurant.operatingHours).map(([day, hours]) => <p key={day}><strong>{day}</strong><span>{hours.closed ? 'Closed' : `${hours.open} ? ${hours.close}${hours.close < hours.open ? ' (next day)' : ''}`}</span></p>)}</details>}
    <div className="section-heading menu-heading"><div><span className="eyebrow">Fresh from the kitchen</span><h2>Menu</h2></div></div>
    {menuResource.loading ? <LoadingState label="Loading todayâ€™s menuâ€¦" /> : menuResource.error ? <ErrorState message={menuResource.error} retry={menuResource.retry} /> : menuResource.data?.length === 0 ? <EmptyState title="Menu unavailable" message="This restaurant has no available menu items right now." /> : <div className="food-grid">{menuResource.data?.map((item) => <FoodCard key={item._id} dish={{ ...item, restaurantName: restaurant.name, restaurantOpen: restaurant.isOpen }} />)}</div>}
  </div>
}
