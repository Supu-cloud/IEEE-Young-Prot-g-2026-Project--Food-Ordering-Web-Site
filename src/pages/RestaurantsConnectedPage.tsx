import { Clock3, MapPin, Search, SlidersHorizontal, Star, Store, X } from 'lucide-react'
import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { restaurantApi, menuApi } from '../core/api/services'
import { useAsyncResource } from '../core/api/useAsyncResource'
import { useRestaurantResource } from '../core/api/restaurantRefresh'
import { restaurantImageUrl } from '../core/api/imageUrl'
import type { ApiRestaurant } from '../core/types/api'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/AsyncState'

type PriceBand = 'under500' | '500to1000' | '1000to2000' | 'over2000'
type RestaurantListing = ApiRestaurant & { menuPrices: number[] }
type Filters = { sort: string; delivery: string[]; rating: string[]; price: PriceBand[] }
const pageSize = 8
const priceBands: Array<{ value: PriceBand; label: string; matches: (price: number) => boolean }> = [
  { value: 'under500', label: 'Rs. 0 - 500', matches: (price) => price <= 500 },
  { value: '500to1000', label: 'Rs. 500 - 1000', matches: (price) => price > 500 && price <= 1000 },
  { value: '1000to2000', label: 'Rs. 1000 - 2000', matches: (price) => price > 1000 && price <= 2000 },
  { value: 'over2000', label: 'Rs. 2000+', matches: (price) => price >= 2000 },
]
const initialFilters: Filters = { sort: 'recommended', delivery: [], rating: [], price: [] }

const priceText = (prices: number[]) => prices.length ? `Rs. ${Math.min(...prices).toLocaleString()} - ${Math.max(...prices).toLocaleString()}` : 'Price unavailable'

export function RestaurantsConnectedPage() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('search') ?? '')
  const [address, setAddress] = useState('Colombo')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draft, setDraft] = useState<Filters>(initialFilters)
  const [applied, setApplied] = useState<Filters>(initialFilters)
  const [page, setPage] = useState(1)
  const category = params.get('category') ?? 'All'
  const loader = useCallback(async () => {
    const search = params.get('search')?.trim().toLowerCase() ?? ''
    const base = await restaurantApi.list({ search: search || undefined, category: category === 'All' ? undefined : category })
    return Promise.all(base.map(async (restaurant) => {
      const prices = (await menuApi.list(restaurant._id).catch(() => [])).filter(item => item.available).map(item => item.price)
      return { ...restaurant, menuPrices: prices } satisfies RestaurantListing
    }))
  }, [params, category])
  const resource = useRestaurantResource(loader)
  const options = useAsyncResource(restaurantApi.options)
  const filtered = useMemo(() => (resource.data ?? []).filter((restaurant) => {
    const hasPrice = !applied.price.length || applied.price.some((band) => restaurant.menuPrices.some((price) => priceBands.find((item) => item.value === band)?.matches(price) ?? false))
    return hasPrice
  }).sort((a, b) => applied.sort === 'name' ? a.name.localeCompare(b.name) : applied.sort === 'open' ? Number(b.isOpen) - Number(a.isOpen) : applied.sort === 'price-low' ? (Math.min(...a.menuPrices, Infinity) - Math.min(...b.menuPrices, Infinity)) : applied.sort === 'price-high' ? (Math.max(...b.menuPrices, 0) - Math.max(...a.menuPrices, 0)) : 0), [resource.data, applied])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const submit = (event: FormEvent) => { event.preventDefault(); const next = new URLSearchParams(params); if (query.trim()) next.set('search', query.trim()); else next.delete('search'); setParams(next); setPage(1) }
  const selectCategory = (name: string) => { const next = new URLSearchParams(params); if (name === 'All') next.delete('category'); else next.set('category', name); setParams(next); setPage(1); setFiltersOpen(false) }
  const toggle = <K extends keyof Filters>(key: K, value: Filters[K] extends string[] ? string : never) => setDraft((current) => ({ ...current, [key]: (current[key] as string[]).includes(value) ? (current[key] as string[]).filter((item) => item !== value) : [...(current[key] as string[]), value] }))
  const applyFilters = () => { setApplied(draft); setPage(1); setFiltersOpen(false) }
  const clearAll = () => { setDraft(initialFilters); setApplied(initialFilters); selectCategory('All') }

  return <div className="page container">
    <div className="wireframe-page-heading"><span className="eyebrow">Foodie partners across Sri Lanka</span><h1>Restaurants</h1><p>Find trusted local restaurants and order your favourites.</p></div>
    <div className="restaurant-search-row"><label><MapPin /><input value={address} onChange={(event) => setAddress(event.target.value)} aria-label="Delivery address" placeholder="Delivery address" /></label><form onSubmit={submit}><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search restaurants, cuisines or dishes" aria-label="Search restaurants, cuisines or dishes" /><button>Search</button></form><button className="filter-trigger" onClick={() => setFiltersOpen(true)}><SlidersHorizontal /> Filters</button></div>
    <div className="chip-row wireframe-category-row">{['All', ...(options.data?.categories ?? [])].map(name => <button className={category === name ? 'selected' : ''} key={name} onClick={() => selectCategory(name)}>{name}</button>)}</div>
    <div className="restaurant-results-toolbar"><p><strong>{filtered.length}</strong> Restaurants</p><label>Sort by <select value={applied.sort} onChange={(event) => { const next = { ...applied, sort: event.target.value }; setApplied(next); setDraft(next); setPage(1) }}><option value="recommended">Recommended</option><option value="rating" disabled>Rating (unavailable)</option><option value="delivery" disabled>Delivery Time (unavailable)</option><option value="price-low">Price Low to High</option><option value="price-high">Price High to Low</option></select></label></div>
    <div className={`restaurant-results-layout ${filtersOpen ? 'filters-open' : ''}`}>
      <aside className="restaurant-filter-sidebar wireframe-filter-sidebar"><div><h2>Filters</h2><button aria-label="Close filters" onClick={() => setFiltersOpen(false)}><X /></button></div><fieldset><legend>Sort by</legend><select value={draft.sort} onChange={(event) => setDraft({ ...draft, sort: event.target.value })}><option value="recommended">Recommended</option><option value="rating" disabled>Rating (unavailable)</option><option value="delivery" disabled>Delivery Time (unavailable)</option><option value="price-low">Price Low to High</option><option value="price-high">Price High to Low</option></select></fieldset><fieldset><legend>Delivery time</legend>{['20 min or less', '20 - 30 min', '30 - 45 min', '45 min or more'].map((label) => <label className="filter-option disabled" key={label}><input type="checkbox" disabled /> {label}<small>Unavailable</small></label>)}</fieldset><fieldset><legend>Rating</legend>{['4.5 & above', '4.0 & above', '3.5 & above', '3.0 & above'].map((label) => <label className="filter-option disabled" key={label}><input type="checkbox" disabled /> {label}<small>Unavailable</small></label>)}</fieldset><fieldset><legend>Price range</legend>{priceBands.map((band) => <label className="filter-option" key={band.value}><input type="checkbox" checked={draft.price.includes(band.value)} onChange={() => toggle('price', band.value)} /> {band.label}</label>)}</fieldset><button className="button button--primary button--full" onClick={applyFilters}>Apply Filters</button><button className="clear-filter-button" onClick={clearAll}>Clear All</button><p className="filter-note">Price levels are derived from available menu item prices.</p></aside>
      <div className="restaurant-results-grid">{resource.loading ? <LoadingState label="Finding restaurants near youâ€¦" /> : resource.error ? <ErrorState message={resource.error} retry={resource.retry} /> : !visible.length ? <EmptyState title="No restaurants found" message="Try another search or filter combination." /> : <div className="api-restaurant-grid">{visible.map((restaurant) => <Link to={`/restaurants/${restaurant._id}`} key={restaurant._id}><div className="api-restaurant-image">{restaurant.imageUrl ? <img loading="lazy" src={restaurantImageUrl(restaurant.imageUrl)} alt={`${restaurant.name} logo`} /> : <Store />}<span className={restaurant.isOpen ? 'open' : 'closed'}>{restaurant.isOpen ? 'Open' : 'Closed'}</span></div><div><span>{restaurant.category}</span><h2>{restaurant.name}</h2><p>{restaurant.description}</p><small><Star /> Rating unavailable</small><small><Clock3 /> Delivery time unavailable</small><small><MapPin /> {restaurant.address}</small><small className="restaurant-price-level">{priceText(restaurant.menuPrices)}</small></div></Link>)}</div>}{!resource.loading && pageCount > 1 && <nav className="wireframe-pagination" aria-label="Restaurant pages"><button disabled={page === 1} onClick={() => setPage(page - 1)}>â€¹</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button className={page === number ? 'active' : ''} onClick={() => setPage(number)} key={number}>{number}</button>)}<button disabled={page === pageCount} onClick={() => setPage(page + 1)}>â€º</button></nav>}</div>
    </div>
  </div>
}
