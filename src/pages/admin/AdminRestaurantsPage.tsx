import { Search, Store, UserRoundCheck, UserRoundX } from 'lucide-react'
import { useCallback, useState } from 'react'
import { AdminFilterBar, money } from '../../components/admin/AdminUi'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { adminApi } from '../../core/api/services'
import { useAsyncResource } from '../../core/api/useAsyncResource'

function RestaurantLogo({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  return <span className={`restaurant-admin-logo${showImage ? '' : ' restaurant-admin-logo--fallback'}`} aria-label={`${name} logo`}>
    {showImage ? <img loading="lazy" src={src} alt={`${name} logo`} onError={() => setFailed(true)} /> : <Store aria-hidden="true" />}
  </span>
}

function AssignedOwner({ owner }: { owner: { name: string; email: string } }) {
  return <div className="current-restaurant-owner">
    <UserRoundCheck />
    <span><small>Currently assigned owner</small><strong>{owner.name}</strong><em>{owner.email}</em></span>
  </div>
}

export function AdminRestaurantsPage() {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState('')
  const resource = useAsyncResource(useCallback(() => adminApi.restaurants({ search, open }), [search, open]))
  const owners = useAsyncResource(useCallback(() => adminApi.assignableRestaurantOwners(), []))
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')

  const assign = async (restaurantId: string) => {
    const ownerId = selected[restaurantId]
    if (!ownerId) { setMessage('Please choose an approved owner first.'); return }
    setBusy(restaurantId); setMessage('')
    try {
      await adminApi.assignRestaurantOwner(restaurantId, ownerId)
      setSelected(previous => ({ ...previous, [restaurantId]: '' }))
      setMessage('Restaurant owner assigned successfully.')
      await Promise.all([resource.retry(), owners.retry()])
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to assign this owner.') }
    finally { setBusy('') }
  }

  const unassign = async (restaurantId: string, name: string) => {
    if (!window.confirm(`Remove the owner from ${name}? The restaurant will be closed to new orders.`)) return
    setBusy(restaurantId); setMessage('')
    try {
      await adminApi.unassignRestaurantOwner(restaurantId)
      setMessage('Owner removed. The restaurant is now closed.')
      await Promise.all([resource.retry(), owners.retry()])
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to remove this owner.') }
    finally { setBusy('') }
  }

  return <>
    <div className="portal-title"><div><span className="eyebrow">Marketplace oversight</span><h1>Restaurants</h1><p>Assign approved owners and monitor restaurant performance.</p></div></div>
    {message && <p className="form-alert" role="status">{message}</p>}
    <AdminFilterBar><label><Search /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search restaurants" /></label><select value={open} onChange={e => setOpen(e.target.value)}><option value="">All restaurants</option><option value="true">Open</option><option value="false">Closed</option></select></AdminFilterBar>
    {resource.loading ? <LoadingState /> : resource.error ? <ErrorState message={resource.error} retry={resource.retry} /> : <div className="admin-card-grid">{resource.data?.items.map(item => <article className="portal-card restaurant-admin-card" key={item._id}>
      <RestaurantLogo src={item.imageUrl} name={item.name} />
      <div className="restaurant-admin-info"><small>{item.category}</small><h2>{item.name}</h2><p>{typeof item.owner === 'object' && item.owner ? `${item.owner.name} · ${item.owner.email}` : 'No owner assigned'}</p></div>
      <b className={item.isOpen && item.owner ? 'open' : 'closed'}>{!item.owner ? 'Unassigned' : item.isOpen ? 'Open' : 'Closed'}</b>
      <div className="restaurant-owner-assignment">
        {typeof item.owner === 'object' && item.owner && <AssignedOwner owner={item.owner} />}
        <label><span>{item.owner ? 'Change to another owner' : 'Assign owner'}</span><select value={selected[item._id] ?? ''} onChange={event => setSelected(previous => ({ ...previous, [item._id]: event.target.value }))} disabled={busy === item._id || owners.loading}><option value="">{owners.loading ? 'Loading owners…' : item.owner ? 'Choose a different approved owner' : 'Choose approved owner'}</option>{owners.data?.map(owner => <option key={owner._id} value={owner._id}>{owner.name} — {owner.email}</option>)}</select></label>
        <button className="button button--primary compact" disabled={busy === item._id || !selected[item._id]} onClick={() => void assign(item._id)}><UserRoundCheck />{busy === item._id ? 'Saving…' : 'Assign'}</button>
        {item.owner && <button className="button button--secondary compact danger-button" disabled={busy === item._id} onClick={() => void unassign(item._id, item.name)}><UserRoundX />Remove</button>}
      </div>
      <footer><span><strong>{item.orderCount}</strong><small>Orders</small></span><span><strong>{money(item.revenue)}</strong><small>Revenue</small></span></footer>
    </article>)}</div>}
  </>
}
