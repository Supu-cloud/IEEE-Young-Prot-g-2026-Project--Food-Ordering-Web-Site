import { MapPin, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/Button'
export function SearchBar({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate()
  return <form className={`search-bar ${compact ? 'search-bar--compact' : ''}`} onSubmit={(event) => { event.preventDefault(); navigate('/restaurants') }}><label><MapPin size={18} /><input aria-label="Delivery address" placeholder="Enter your delivery address" defaultValue={compact ? '' : 'Colombo 03'} /></label><label><Search size={18} /><input aria-label="Search food" placeholder="Search kottu, hoppers, sweets or restaurants…" /></label><Button type="submit">{compact ? 'Search' : 'Find food'}</Button></form>
}
