import { Clock3, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Restaurant } from '../types'
export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) { return <Link className="restaurant-card" to={`/restaurants/${restaurant.id}`}><div className="restaurant-image"><img src={restaurant.image} alt="" /><span className={`availability ${restaurant.status === 'Busy' ? 'availability--busy' : ''}`}>{restaurant.status}</span></div><div className="restaurant-card__body"><h3>{restaurant.name}</h3><p>{restaurant.cuisine} · {restaurant.price}</p><div className="restaurant-meta"><span><Star size={15} fill="currentColor" /> {restaurant.rating} ({restaurant.reviews}+)</span><span><Clock3 size={15} /> {restaurant.deliveryTime}</span></div></div></Link> }
