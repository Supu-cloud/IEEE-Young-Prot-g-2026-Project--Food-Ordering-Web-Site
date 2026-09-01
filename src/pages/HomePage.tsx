import { ArrowRight, Clock3, Heart, Star, Store, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RestaurantCard } from '../components/RestaurantCard'
import { SearchBar } from '../components/SearchBar'
import { cuisines, restaurants } from '../services/sriLankanData'

export function HomePage() { return <>
  <section className="hero-section foodie-hero"><div className="container hero-content"><span className="eyebrow">Good food, delivered islandwide</span><h1>Ayubowan! What are you craving today?</h1><p>Discover kottu, hoppers, rice and curry, short eats and traditional sweets near you.</p><SearchBar /></div></section>
  <section className="section container"><div className="section-heading"><div><span className="eyebrow">Taste the world</span><h2>Explore cuisines</h2></div><Link to="/restaurants">View all <ArrowRight size={17} /></Link></div><div className="cuisine-grid">{cuisines.map((item) => <Link to={`/restaurants?cuisine=${item.name}`} className="cuisine-card" key={item.name}><span>{item.emoji}</span><strong>{item.name}</strong></Link>)}</div></section>
  <section className="section section--tint"><div className="container"><div className="section-heading"><div><span className="eyebrow">Loved near you</span><h2>Featured restaurants</h2></div><Link to="/restaurants">See all <ArrowRight size={17} /></Link></div><div className="restaurant-grid">{restaurants.slice(0, 4).map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div></div></section>
  <section className="section container"><div className="offer-banner"><div><span>NEW CUSTOMER OFFER</span><h2>Get 20% off your first order!</h2><p>Use code <strong>FOODIE20</strong> at checkout on orders above Rs. 2,000.</p><Link className="button button--primary" to="/restaurants">Claim offer now</Link></div><div className="offer-art" aria-hidden="true">20<small>% OFF</small></div></div>
  <div className="stats"><div><Store /><strong>500+</strong><span>Restaurants</span></div><div><Users /><strong>15k+</strong><span>Happy customers</span></div><div><Clock3 /><strong>25 min</strong><span>Avg. delivery time</span></div><div><Star /><strong>4.8/5</strong><span>App rating</span></div></div></section>
  <section className="section value-strip"><div className="container value-grid"><div><Clock3 /><h3>Fast delivery</h3><p>Hot meals at your door, right on time.</p></div><div><Heart /><h3>Local favorites</h3><p>Discover the best restaurants around you.</p></div><div><Star /><h3>Top-rated quality</h3><p>Reliable reviews from verified customers.</p></div></div></section>
  </> }
