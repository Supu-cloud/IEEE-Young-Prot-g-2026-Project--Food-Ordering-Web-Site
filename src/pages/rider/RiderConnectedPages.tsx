import { RiderDeliveryActions } from './RiderDeliveryActions'
import { OrderStatusBadge, orderStatusStyle, deliveryVisualStatus, mergeDelivery } from '../../components/OrderStatus'
import { orderRefreshEvent } from '../../core/api/orderRefresh'
import { RiderMap } from './RiderMapPanel'
import { DollarSign, MapPin, Package, Store } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { riderApi } from '../../core/api/services'
import { useAsyncResource } from '../../core/api/useAsyncResource'
import type { DeliveryAssignment, DeliveryStatus } from '../../core/types/api'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { formatLkr } from '../../services/sriLankanData'

const statusLabel: Record<DeliveryStatus, string> = { assigned: 'Assigned', accepted: 'Accepted', picked_up: 'Picked up', out_for_delivery: 'Out for delivery', delivered: 'Delivered', failed: 'Could not deliver', rejected: 'Rejected' }
const isFinished = (delivery: DeliveryAssignment) => ['delivered', 'failed', 'rejected'].includes(delivery.status)

export function RiderConnectedJobs() {
  const resource = useAsyncResource(riderApi.mine, 7000, orderRefreshEvent)
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
    return <article key={delivery._id} className="owner-order-card" data-status={delivery.status} style={orderStatusStyle(deliveryVisualStatus(delivery.status))}><div className="job-main"><div className="job-payout"><span>Delivery #{delivery.order._id.slice(-6).toUpperCase()}</span><strong>{formatLkr(delivery.payout)}</strong></div><div className="route-detail"><div><Store /><span><small>Pick up from</small><strong>{restaurant?.name ?? 'Restaurant'}</strong><em>{restaurant?.address ?? 'Address unavailable'}</em></span></div><i /><div><MapPin /><span><small>Deliver to</small><strong>{customer}</strong><em>{order.deliveryAddress}</em></span></div></div><div className="job-meta"><span><Package /> {order.items.length} items</span><OrderStatusBadge status={deliveryVisualStatus(delivery.status)} text={statusLabel[delivery.status]} /><span>{new Date(delivery.assignedAt).toLocaleString()}</span></div></div><div className="job-actions"><Link className="button button--primary" to={`/rider/deliveries/${delivery._id}`}>View Route</Link></div></article>
  })}</div>
}

export function RiderConnectedDetail() {
  const { id = '' } = useParams()
  const loader = useCallback(async () => { const deliveries = await riderApi.mine(); const found = deliveries.find((item) => item._id === id); if (!found) throw new Error('Delivery not found or is not assigned to your account.'); return found }, [id])
  const resource = useAsyncResource(loader, 7000, orderRefreshEvent)
  if (resource.loading) return <LoadingState label="Loading delivery details..." />
  if (resource.error || !resource.data) return <ErrorState message={resource.error || 'Delivery not found'} retry={resource.retry} />
  const delivery = resource.data
  const order = delivery.order
  const restaurant = typeof order.restaurant === 'string' ? null : order.restaurant
  const customer = typeof order.customer === 'string' ? null : order.customer
  return <>{resource.refreshError && <p className="error-banner" role="status">Refresh failed: {resource.refreshError}. Retrying automatically.</p>}
    <div className="portal-title"><div><Link to="/rider/deliveries">&larr; Back to deliveries</Link><h1>Delivery #{delivery.order._id.slice(-6).toUpperCase()}</h1><p>{statusLabel[delivery.status]} &middot; {formatLkr(delivery.payout)} internal test earning — {order.settlement?.riderStatus ?? 'pending'}</p></div><OrderStatusBadge status={deliveryVisualStatus(delivery.status)} text={statusLabel[delivery.status]} /></div>
    <div className="delivery-layout"><RiderMap key={delivery._id} deliveryId={delivery._id} /><aside className="delivery-steps owner-order-card" data-status={delivery.status} style={orderStatusStyle(deliveryVisualStatus(delivery.status))}><div className="delivery-step active"><span>1</span><div><small>Pickup</small><h2>{restaurant?.name ?? 'Restaurant'}</h2><p>{restaurant?.address ?? 'Address unavailable'}</p><ul>{order.items.map((item) => <li key={item.menuItem}>{item.quantity}x {item.name}</li>)}</ul></div></div><div className="delivery-step active"><span>2</span><div><small>Drop-off</small><h2>{customer?.name ?? 'Customer'}</h2><p>{order.deliveryAddress}</p>{customer?.phone && <p>{customer.phone}</p>}</div></div><RiderDeliveryActions delivery={delivery} onConfirmed={updated => { resource.commit(current => current ? mergeDelivery(current, updated) : current); void resource.retry() }} /></aside></div>
  </>
}

export function RiderConnectedEarnings() {
  const resource = useAsyncResource(riderApi.earnings, 7000, orderRefreshEvent)
  const trips = useMemo(() => resource.data?.trips ?? [], [resource.data])
  if (resource.loading) return <LoadingState label="Calculating rider earnings..." />
  if (resource.error || !resource.data) return <ErrorState message={resource.error || 'Earnings unavailable'} retry={resource.retry} />
  const value = resource.data
  return <>{resource.refreshError && <p className="error-banner" role="status">Refresh failed: {resource.refreshError}. Retrying automatically.</p>}<div className="portal-title"><div><span className="eyebrow">Delivered orders</span><h1>Earnings & trip history</h1><p>Figures come from delivered backend assignments.</p></div></div><div className="earnings-hero"><div><small>Total earnings</small><strong>{formatLkr(value.totalEarnings)}</strong><span><DollarSign /> Internal test earnings</span></div><div><small>Completed trips</small><strong>{value.completedTrips}</strong><span>Delivered assignments</span></div></div>{trips.length === 0 ? <EmptyState title="No earnings yet" message="Completed deliveries and payouts will appear here." /> : <section className="portal-card"><div className="portal-card__heading"><div><h2>Earnings history</h2><p>Available internal test earnings</p></div></div><div className="earnings-history">{trips.map((trip) => <div key={trip._id}><span><strong>Delivery #{trip._id.slice(-6).toUpperCase()}</strong><small>{new Date(trip.deliveredAt ?? trip.assignedAt).toLocaleString()}</small></span><b>{formatLkr(trip.payout)}</b></div>)}</div></section>}</>
}
