import { Check, Clock3, DollarSign, MapPin, Navigation, Package, Store } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { riderApi } from '../../core/api/services'
import { useAsyncResource } from '../../core/api/useAsyncResource'
import type { DeliveryAssignment, DeliveryStatus } from '../../core/types/api'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { formatLkr } from '../../services/sriLankanData'

const nextStatus: Partial<Record<DeliveryStatus, DeliveryStatus>> = { assigned: 'picked_up', accepted: 'picked_up', picked_up: 'out_for_delivery', out_for_delivery: 'delivered' }
const statusLabel: Record<DeliveryStatus, string> = { assigned: 'Assigned', accepted: 'Accepted', picked_up: 'Picked up', out_for_delivery: 'Out for delivery', delivered: 'Delivered', failed: 'Could not deliver', rejected: 'Rejected' }
const isFinished = (delivery: DeliveryAssignment) => ['delivered', 'failed', 'rejected'].includes(delivery.status)

export function RiderConnectedJobs() {
  const resource = useAsyncResource(riderApi.mine, 7000)
  const [tab, setTab] = useState<'active' | 'completed'>('active')
  if (resource.loading) return <LoadingState label="Loading assigned deliveries..." />
  if (resource.error) return <ErrorState message={resource.error} retry={resource.retry} />
  const deliveries = resource.data ?? []
  const visible = deliveries.filter((delivery) => (tab === 'completed' ? isFinished(delivery) : !isFinished(delivery)))
  return <>{resource.refreshError && <p className="error-banner" role="status">Refresh failed: {resource.refreshError}. Showing the last loaded data; retrying automatically.</p>}
    <div className="portal-title"><div><span className="eyebrow">Your assignments</span><h1>Deliveries</h1><p>Only deliveries assigned to your approved rider account appear here.</p></div></div>
    <div className="portal-tabs" role="tablist">{(['active', 'completed'] as const).map((value) => <button key={value} role="tab" aria-selected={tab === value} className={tab === value ? 'active' : ''} onClick={() => setTab(value)}>{value === 'active' ? 'Active' : 'Completed'}<small>{deliveries.filter((delivery) => value === 'completed' ? isFinished(delivery) : !isFinished(delivery)).length}</small></button>)}</div>
    {visible.length === 0 ? <EmptyState title={tab === 'active' ? 'No active deliveries' : 'No completed deliveries'} message={tab === 'active' ? 'Go online when you are ready to receive assignments.' : 'Available internal test earnings will appear here.'} /> : <DeliveryList deliveries={visible} />}
  </>
}

function DeliveryList({ deliveries }: { deliveries: DeliveryAssignment[] }) {
  return <div className="rider-job-list">{deliveries.map((delivery) => {
    const order = delivery.order
    const restaurant = typeof order.restaurant === 'string' ? null : order.restaurant
    const customer = typeof order.customer === 'string' ? 'Customer' : order.customer.name
    return <article key={delivery._id}><div className="job-main"><div className="job-payout"><span>Delivery #{delivery.order._id.slice(-6).toUpperCase()}</span><strong>{formatLkr(delivery.payout)}</strong></div><div className="route-detail"><div><Store /><span><small>Pick up from</small><strong>{restaurant?.name ?? 'Restaurant'}</strong><em>{restaurant?.address ?? 'Address unavailable'}</em></span></div><i /><div><MapPin /><span><small>Deliver to</small><strong>{customer}</strong><em>{order.deliveryAddress}</em></span></div></div><div className="job-meta"><span><Package /> {order.items.length} items</span><span><Clock3 /> {statusLabel[delivery.status]}</span><span>{new Date(delivery.assignedAt).toLocaleString()}</span></div></div><div className="job-actions"><Link className="button button--primary" to={`/rider/deliveries/${delivery._id}`}>View details</Link></div></article>
  })}</div>
}

export function RiderConnectedDetail() {
  const { id = '' } = useParams()
  const loader = useCallback(async () => { const deliveries = await riderApi.mine(); const found = deliveries.find((item) => item._id === id); if (!found) throw new Error('Delivery not found or is not assigned to your account.'); return found }, [id])
  const resource = useAsyncResource(loader, 7000)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  if (resource.loading) return <LoadingState label="Loading delivery details..." />
  if (resource.error || !resource.data) return <ErrorState message={resource.error || 'Delivery not found'} retry={resource.retry} />
  const delivery = resource.data
  const order = delivery.order
  const restaurant = typeof order.restaurant === 'string' ? null : order.restaurant
  const customer = typeof order.customer === 'string' ? null : order.customer
  const next = nextStatus[delivery.status]
  const update = async (status: DeliveryStatus) => { setUpdating(true); setError(''); try { await riderApi.status(delivery._id, status); await resource.retry() } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to update delivery status.') } finally { setUpdating(false) } }
  return <>{resource.refreshError && <p className="error-banner" role="status">Refresh failed: {resource.refreshError}. Retrying automatically.</p>}
    <div className="portal-title"><div><Link to="/rider/deliveries">&larr; Back to deliveries</Link><h1>Delivery #{delivery.order._id.slice(-6).toUpperCase()}</h1><p>{statusLabel[delivery.status]} &middot; {formatLkr(delivery.payout)} internal test earning — {order.settlement?.riderStatus ?? 'pending'}</p></div><span className={`delivery-status delivery-status--${delivery.status.replace('_', '-')}`}>{statusLabel[delivery.status]}</span></div>
    {error && <p className="error-banner" role="alert">{error}</p>}
    <div className="delivery-layout"><section className="delivery-map" aria-label="Delivery map placeholder"><div className="map-roads" /><span className="pickup-pin"><Store /></span><span className="dropoff-pin"><MapPin /></span><div className="route-line" /><p>Map navigation will be available here.</p></section><aside className="delivery-steps"><div className="delivery-step active"><span>1</span><div><small>Pickup</small><h2>{restaurant?.name ?? 'Restaurant'}</h2><p>{restaurant?.address ?? 'Address unavailable'}</p><ul>{order.items.map((item) => <li key={item.menuItem}>{item.quantity}x {item.name}</li>)}</ul><button type="button" className="button button--secondary button--full"><Navigation /> Open navigation</button></div></div><div className="delivery-step active"><span>2</span><div><small>Drop-off</small><h2>{customer?.name ?? 'Customer'}</h2><p>{order.deliveryAddress}</p>{customer?.phone && <p>{customer.phone}</p>}</div></div><div className="delivery-primary-action">{delivery.status === 'assigned' && <button type="button" disabled={updating} onClick={() => void update('rejected')}>Reject assignment</button>}{next && <button type="button" disabled={updating} onClick={() => void update(next)}>{updating ? 'Updating...' : next === 'accepted' ? 'Accept delivery' : next === 'picked_up' ? 'Mark as picked up' : next === 'out_for_delivery' ? 'Start delivery' : 'Mark as delivered'} <Check /></button>}{['accepted', 'picked_up', 'out_for_delivery'].includes(delivery.status) && <button type="button" className="button button--secondary" disabled={updating} onClick={() => void update('failed')}>{updating ? 'Updating...' : 'Could not deliver'}</button>}</div></aside></div>
  </>
}

export function RiderConnectedEarnings() {
  const resource = useAsyncResource(riderApi.earnings, 7000)
  const trips = useMemo(() => resource.data?.trips ?? [], [resource.data])
  if (resource.loading) return <LoadingState label="Calculating rider earnings..." />
  if (resource.error || !resource.data) return <ErrorState message={resource.error || 'Earnings unavailable'} retry={resource.retry} />
  const value = resource.data
  return <>{resource.refreshError && <p className="error-banner" role="status">Refresh failed: {resource.refreshError}. Retrying automatically.</p>}<div className="portal-title"><div><span className="eyebrow">Delivered orders</span><h1>Earnings & trip history</h1><p>Figures come from delivered backend assignments.</p></div></div><div className="earnings-hero"><div><small>Total earnings</small><strong>{formatLkr(value.totalEarnings)}</strong><span><DollarSign /> Internal test earnings</span></div><div><small>Completed trips</small><strong>{value.completedTrips}</strong><span>Delivered assignments</span></div></div>{trips.length === 0 ? <EmptyState title="No earnings yet" message="Completed deliveries and payouts will appear here." /> : <section className="portal-card"><div className="portal-card__heading"><div><h2>Earnings history</h2><p>Available internal test earnings</p></div></div><div className="earnings-history">{trips.map((trip) => <div key={trip._id}><span><strong>Delivery #{trip._id.slice(-6).toUpperCase()}</strong><small>{new Date(trip.deliveredAt ?? trip.assignedAt).toLocaleString()}</small></span><b>{formatLkr(trip.payout)}</b></div>)}</div></section>}</>
}
