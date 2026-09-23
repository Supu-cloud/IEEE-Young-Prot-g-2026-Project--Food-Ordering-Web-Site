import { Clock3, Plus, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CatalogueDish } from '../hooks/useFoodCatalogue'
import { formatLkr } from '../services/sriLankanData'
import { useCart } from '../store/CartContext'
import { resolveImageUrl } from '../core/api/imageUrl';

export function FoodCard({ dish }: { dish: CatalogueDish }) {
  const cart = useCart()
  const available = dish.available && dish.restaurantOpen
  return <article className="food-card">
    <Link className="food-card__image" to={`/foods/${dish._id}`} aria-label={`View ${dish.name}`}>
      <img
  loading="lazy"
  src={
    resolveImageUrl(dish.imageUrl) ||
    '/images/food/sri_lankan_feast.jpg'
  }
  alt={dish.name}
  onError={(event) => {
    event.currentTarget.onerror = null
    event.currentTarget.src = '/images/food/sri_lankan_feast.jpg'
  }}
/>
      <span>{dish.category}</span>
    </Link>
    <div className="food-card__body">
      <Link to={`/foods/${dish._id}`}><h3>{dish.name}</h3></Link>
      <p className="food-card__restaurant">{dish.restaurantName}</p>
      <p className="food-card__description">{dish.description || 'Freshly prepared and delivered to you.'}</p>
      <div className="food-card__meta"><span><Star fill="currentColor" /> 4.8</span><span><Clock3 /> 20–30 min</span></div>
      <footer><strong>{formatLkr(dish.price)}</strong><button disabled={!available} aria-label={`Add ${dish.name} to cart`} onClick={() => cart.addItem({ id: dish._id, restaurantId: dish.restaurant, name: dish.name, description: dish.description ?? '', price: dish.price, category: dish.category, image: resolveImageUrl(dish.imageUrl) || '/images/food/sri_lankan_feast.jpg' })}><Plus /> <span>{available ? 'Add' : 'Unavailable'}</span></button></footer>
    </div>
  </article>
}
