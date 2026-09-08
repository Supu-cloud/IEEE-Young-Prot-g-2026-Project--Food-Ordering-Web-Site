import { restaurantImageUrl } from '../core/api/imageUrl'
import { feedbackApi } from '../core/api/services'
import { useAsyncResource } from '../core/api/useAsyncResource'
import { ArrowLeft, ArrowRight, Leaf, MapPin, Search, ShoppingBag, Store } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FoodCard } from '../components/FoodCard'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/AsyncState'
import { useFoodCatalogue } from '../hooks/useFoodCatalogue'
import { useCart } from '../store/CartContext'

const categories = ['All', 'Breakfast', 'Kottu', 'Rice & Curry', 'Short Eats', 'Sweets']

export function DiscoveryPage() {
  const catalogue = useFoodCatalogue()
  const feedbacks = useAsyncResource(feedbackApi.list, 30000)
  const feedbackTrack = useRef<HTMLDivElement>(null)
  const cart = useCart()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const dishes = useMemo(() => (catalogue.data?.dishes ?? []).filter((dish) => (category === 'All' || dish.category.toLowerCase() === category.toLowerCase()) && (!query || `${dish.name} ${dish.restaurantName}`.toLowerCase().includes(query.toLowerCase()))), [catalogue.data, category, query])
  const restaurants = catalogue.data?.restaurants ?? []

  return <>
    <section className="discovery-hero">
      <div className="hero-cover-slides" aria-hidden="true"><span className="hero-cover-slide hero-cover-slide--feast" /><span className="hero-cover-slide hero-cover-slide--woman" /><span className="hero-cover-slide hero-cover-slide--man" /><span className="hero-cover-slide hero-cover-slide--pattern" /></div>
      <div className="container discovery-hero__grid">
        <div className="discovery-hero__copy">
          <span className="location-pill"><MapPin /> Delivering to <strong>Colombo</strong></span>
          <span className="eyebrow">Fresh favourites, delivered</span>
          <h1>Ayubowan! Taste the best of Sri Lanka.</h1>
          <p>From sizzling cheese kottu to traditional Avurudu sweets, your next local favourite is only a few taps away.</p>
          <form className="food-search" onSubmit={(event) => event.preventDefault()}><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dishes or restaurants" aria-label="Search dishes or restaurants" /><button>Find food</button></form>
        </div>
        <div className="hero-video-showcase">
          <div className="hero-video-frame">
            <video autoPlay muted loop playsInline preload="metadata" poster="/images/hero/sri-lankan-feast-hd.png" aria-label="Animated Sri Lankan feast">
              <source src="/videos/sri-lankan-feast-vivid-hd.mp4" type="video/mp4" />
            </video>
          </div>
          <span className="hero-video-badge"><Leaf /> Local flavours · Freshly made <img className="sri-lanka-flag" src="/images/emoji/sri-lanka-flag.svg" alt="🇱🇰 Sri Lanka" /></span>
        </div>
      </div>
    </section>
    <main className="container food-discovery">
      <section className="category-section"><div className="section-heading"><div><span className="eyebrow">Browse your way</span><h2>What are you craving?</h2></div>{cart.count > 0 && <Link className="floating-cart" to="/cart"><ShoppingBag /> View cart <b>{cart.count}</b></Link>}</div><div className="food-category-row">{categories.map((item) => <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div></section>
      <section className="catalogue-section"><div className="section-heading"><div><span className="eyebrow">Popular near you</span><h2>{category === 'All' ? 'Explore Sri Lankan food' : category}</h2><p>{dishes.length} delicious choices</p></div><Link to="/restaurants">All restaurants <ArrowRight /></Link></div>{catalogue.loading ? <LoadingState label="Preparing today’s menu…" /> : catalogue.error ? <ErrorState message={catalogue.error} retry={catalogue.retry} /> : dishes.length ? <div className="food-grid">{dishes.slice(0, 10).map((dish) => <FoodCard dish={dish} key={dish._id} />)}</div> : <EmptyState title="No dishes found" message="Try a different search or category." />}</section>
      <Link className="sweet-shop-banner" to="/sweets"><div><span>Traditional favourites</span><h2>Sri Lankan Sweet Shop</h2><p>Kawum, kokis, pani walalu and more—handmade treats for every celebration.</p><strong>Explore the sweet shop <ArrowRight /></strong></div><div className="sweet-shop-images"><img src="/images/food/kavum.jpg" alt="Konda kawum" /><img src="/images/food/pani_walalu.jpg" alt="Pani walalu" /><img src="/images/food/kokis.jpg" alt="Kokis" /></div></Link>
      <section className="wireframe-stats" aria-label="Foodie at a glance"><article><strong>{restaurants.length}</strong><span>Local restaurants</span></article><article><strong>{catalogue.data?.dishes.length ?? 0}</strong><span>Dishes to discover</span></article><article><strong>{categories.length - 1}</strong><span>Sri Lankan cuisines</span></article><article><strong>Fresh</strong><span>Made for your table</span></article></section>
      <section className="home-restaurants"><div className="section-heading"><div><span className="eyebrow">Foodie partners</span><h2>Restaurants near you</h2></div><Link to="/restaurants">View all <ArrowRight /></Link></div><div className="compact-restaurant-grid">{restaurants.slice(0, 4).map((restaurant) => <Link to={`/restaurants/${restaurant._id}`} key={restaurant._id}><div>{restaurant.imageUrl ? <img src={restaurantImageUrl(restaurant.imageUrl)} alt={restaurant.name} /> : <Store />}</div><span>{restaurant.category}</span><h3>{restaurant.name}</h3><p><MapPin /> {restaurant.address}</p></Link>)}</div></section>
      <section className="home-reviews"><div className="section-heading"><div><span className="eyebrow">From our community</span><h2>What customers are saying</h2></div>{feedbacks.data?.length ? <div className="home-review-controls"><button type="button" aria-label="Previous customer feedback" onClick={() => feedbackTrack.current?.scrollBy({ left: -390, behavior: 'smooth' })}><ArrowLeft /></button><button type="button" aria-label="Next customer feedback" onClick={() => feedbackTrack.current?.scrollBy({ left: 390, behavior: 'smooth' })}><ArrowRight /></button></div> : null}</div>{feedbacks.loading ? <p className="home-review-state">Loading customer feedback...</p> : feedbacks.error ? <p className="home-review-state">Customer feedback is temporarily unavailable.</p> : feedbacks.data?.length ? <div className="home-review-viewport" ref={feedbackTrack}><div className="home-review-track">{feedbacks.data.map((feedback) => <article className="home-review-card" key={feedback.id}><div className="home-review-card__top"><div className="home-review-stars" aria-label={`${feedback.rating} out of 5 stars`}>{'★'.repeat(feedback.rating)}<span>{'★'.repeat(5 - feedback.rating)}</span></div><small>{feedback.merchantName}</small></div><p>“{feedback.comment}”</p>{feedback.deliveryDetails && <small className="home-review-delivery">{feedback.deliveryDetails}</small>}<footer><strong>{feedback.customerName}</strong>{feedback.isVerified && <span>Verified customer</span>}</footer></article>)}</div></div> : <p className="home-review-state">No customer feedback yet.</p>}</section>
    </main>
  </>
}
