import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { RestaurantCard } from '../components/RestaurantCard'
import { SearchBar } from '../components/SearchBar'
import { cuisines, restaurants } from '../services/sriLankanData'

export function RestaurantsPage() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  return <div className="page container"><SearchBar compact /><div className="chip-row">{cuisines.slice(0, 7).map((item) => <button key={item.name}>{item.name}</button>)}<button>More⌄</button></div><div className="results-layout">
    <button className="filter-toggle button button--secondary" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={17} /> Filters</button>
    <aside className={`filters ${filtersOpen ? 'filters--open' : ''}`}><h3>Filter restaurants</h3><label>Sort by<select><option>Recommended</option><option>Rating</option><option>Delivery time</option></select></label><fieldset><legend>Delivery time</legend>{['20 min or less', '20–30 min', '30–45 min', '45 min or more'].map((x) => <label key={x}><input type="checkbox" /> {x}</label>)}</fieldset><fieldset><legend>Rating</legend>{['4.5 & above', '4.0 & above', '3.5 & above'].map((x) => <label key={x}><input type="checkbox" /> {x}</label>)}</fieldset><fieldset><legend>Price range</legend>{['Under Rs. 500', 'Rs. 500–1,000', 'Rs. 1,000–2,000', 'Above Rs. 2,000'].map((x) => <label key={x}><input type="checkbox" /> {x}</label>)}</fieldset><button className="button button--primary">Apply filters</button><button className="button button--ghost">Clear all</button></aside>
    <section className="results"><div className="results-header"><div><span className="eyebrow">Delivering around Colombo</span><h1>{restaurants.length} Foodie partners</h1></div><select aria-label="Sort results"><option>Sort by: Recommended</option><option>Top rated</option><option>Fastest delivery</option></select></div><div className="restaurant-grid restaurant-grid--results">{restaurants.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div></section>
  </div></div>
}
