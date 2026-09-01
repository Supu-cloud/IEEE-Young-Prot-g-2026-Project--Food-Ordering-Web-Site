import { Clock3, MapPin, Search, Store } from 'lucide-react'
import { useCallback, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { restaurantApi } from '../core/api/services'
import { useAsyncResource } from '../core/api/useAsyncResource'
import { environment } from '../core/config/environment'
import type { ApiRestaurant } from '../core/types/api'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/AsyncState'
import { cuisines, menuItems, restaurants as localRestaurants } from '../services/sriLankanData'

const localToApi = (): ApiRestaurant[] => localRestaurants.map((r) => ({ _id:r.id,name:r.name,description:r.cuisine,address:r.address ?? 'Sri Lanka',phone:'011 234 5678',imageUrl:r.image,category:r.cuisine.split(' · ')[0],owner:'demo',isOpen:r.status==='Open' }))
export function RestaurantsConnectedPage() {
  const [params,setParams]=useSearchParams(); const [query,setQuery]=useState(params.get('search')??''); const category=params.get('category')??'All'
  const loader=useCallback(() => {
    const search=params.get('search')?.trim().toLowerCase() ?? ''
    if (!environment.useMocks) return restaurantApi.list({ search:search||undefined, category:category==='All'?undefined:category })
    const matchingRestaurantIds = new Set(menuItems.filter((item)=>category==='All'||item.category===category).map((item)=>item.restaurantId))
    return Promise.resolve(localToApi().filter((restaurant)=>(category==='All'||matchingRestaurantIds.has(restaurant._id))&&(!search||`${restaurant.name} ${restaurant.description} ${restaurant.category}`.toLowerCase().includes(search))))
  },[params,category]); const resource=useAsyncResource(loader)
  const submit=(event:FormEvent)=>{event.preventDefault();const next=new URLSearchParams(params);if(query)next.set('search',query);else next.delete('search');setParams(next)}
  return <div className="page container"><div className="discovery-title"><div><span className="eyebrow">Foodie partners across Sri Lanka</span><h1>Find your next favourite meal</h1></div><form onSubmit={submit}><Search/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search restaurants by name…"/><button>Search</button></form></div><div className="chip-row">{cuisines.map((item)=><button className={category===item.name?'selected':''} key={item.name} onClick={()=>{const next=new URLSearchParams(params);if(item.name==='All')next.delete('category');else next.set('category',item.name);setParams(next)}}>{item.emoji} {item.name}</button>)}</div>{resource.loading?<LoadingState label="Finding restaurants near you…"/>:resource.error?<ErrorState message={resource.error} retry={resource.retry}/>:resource.data?.length===0?<EmptyState title="No restaurants found" message="Try another name or category. We’re adding new Foodie partners every week."/>:<div className="api-restaurant-grid">{resource.data?.map((restaurant)=><Link to={`/restaurants/${restaurant._id}`} key={restaurant._id}><div className="api-restaurant-image">{restaurant.imageUrl?<img loading="lazy" src={restaurant.imageUrl} alt={`${restaurant.name} food and dining`}/>:<Store/>}<span className={restaurant.isOpen?'open':'closed'}>{restaurant.isOpen?'Open':'Closed'}</span></div><div><span>{restaurant.category}</span><h2>{restaurant.name}</h2><p>{restaurant.description}</p><small><MapPin/> {restaurant.address}</small><small><Clock3/> View menu and availability</small></div></Link>)}</div>}</div>
}
