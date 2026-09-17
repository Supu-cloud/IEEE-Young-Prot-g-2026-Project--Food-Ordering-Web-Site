import { orderRefreshEvent } from '../../core/api/orderRefresh'
import { RiderMap } from './RiderMapPanel'
import { ArrowRight, Bike, CheckCircle2, Clock3, DollarSign, Headphones, MapPin, Navigation, Package, Phone, Power, Route, ShieldCheck, Sparkles, Store, TrendingUp } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { riderApi } from '../../core/api/services'
import { useAsyncResource } from '../../core/api/useAsyncResource'
import { formatLkr } from '../../services/sriLankanData'

const deliverySteps = ['Assigned', 'Picked up', 'Out for delivery', 'Delivered']

export function RiderPremiumDashboard() {
  const loader = useCallback(() => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    return Promise.all([riderApi.mine(), riderApi.earnings(), riderApi.earnings(startOfToday.toISOString()), riderApi.getProfile()])
  }, [])
  const resource = useAsyncResource(loader, 7000, orderRefreshEvent)
  const [showMap, setShowMap] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  if (resource.loading) return <LoadingState label="Loading your rider workspace..." />
  if (resource.error.includes('Create rider profile first')) return <section className="rider-dashboard-locked"><span><Bike /></span><small>Complete your rider setup</small><h1>Your dashboard is almost ready</h1><p>Your account is approved, but we still need your vehicle details before delivery tools can be activated.</p><Link className="button button--primary" to="/rider/profile">Set up rider profile <ArrowRight /></Link></section>
  if (resource.error || !resource.data) return <ErrorState message={resource.error || 'Rider dashboard unavailable'} retry={resource.retry} />

  const [deliveries, earnings, today, profile] = resource.data
  const active = deliveries.filter((delivery) => !['delivered', 'failed', 'rejected'].includes(delivery.status))
  const completed = deliveries.filter((delivery) => delivery.status === 'delivered').slice(0, 3)
  const current = active.find((delivery) => delivery.status === 'picked_up') ?? active.find((delivery) => delivery.status === 'accepted') ?? active[0]
  const restaurant = current && typeof current.order.restaurant !== 'string' ? current.order.restaurant : null
  const customer = current && typeof current.order.customer !== 'string' ? current.order.customer : null
  const stageIndex = current ? { assigned: 0, accepted: 0, picked_up: 1, out_for_delivery: 2, delivered: 3, failed: 0, rejected: 0 }[current.status] : 0

  const toggleAvailability = async () => {
    setSaving(true)
    setMessage('')
    try {
      await riderApi.availability(!profile.isAvailable)
      setMessage(`You are now ${profile.isAvailable ? 'offline' : 'online'}.`)
      await resource.retry()
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Unable to update availability.')
    } finally {
      setSaving(false)
    }
  }

  return <div className="rider-premium-dashboard">{resource.refreshError && <p className="error-banner" role="status">Refresh failed: {resource.refreshError}. Retrying automatically.</p>}
    <section className="rider-welcome-card">
      <div className="rider-welcome-copy"><span className="rider-kicker"><Sparkles /> Rider command centre</span><h1>Ayubowan, {profile.user.name.split(' ')[0]}!</h1><p>Your routes, earnings and next delivery—all in one calm workspace.</p><div className="rider-welcome-actions"><Link className="button rider-primary-action" to={current ? `/rider/deliveries/${current._id}` : '/rider/deliveries'}>{current ? 'Continue delivery' : 'Find deliveries'} <ArrowRight /></Link><Link className="button rider-glass-action" to="/rider/earnings">View earnings</Link></div></div>
      <button disabled={saving} className={`rider-online-control ${profile.isAvailable ? 'online' : ''}`} onClick={() => void toggleAvailability()}><span className="rider-online-icon"><Power /></span><span><small>Availability</small><strong>{profile.isAvailable ? 'Online & ready' : 'Currently offline'}</strong><em>{saving ? 'Updating status...' : profile.isAvailable ? 'Receiving delivery requests' : 'Tap to start receiving jobs'}</em></span><i /></button>
    </section>
    {message && <p className={message.startsWith('Unable') ? 'error-banner' : 'success-banner'} role="status">{message}</p>}

    <section className="rider-stat-grid" aria-label="Rider performance summary">
      <article><span><DollarSign /></span><div><small>Today's earnings</small><strong>{formatLkr(today.totalEarnings)}</strong><em><TrendingUp /> {today.completedTrips} completed today</em></div></article>
      <article><span><Bike /></span><div><small>Total deliveries</small><strong>{earnings.completedTrips}</strong><em><CheckCircle2 /> Successfully delivered</em></div></article>
      <article><span><Package /></span><div><small>Active deliveries</small><strong>{active.length}</strong><em><Route /> In your current queue</em></div></article>
      <article><span><ShieldCheck /></span><div><small>Account standing</small><strong>{profile.user.accountStatus}</strong><em><Sparkles /> Verified Foodie rider</em></div></article>
    </section>

    <section className="rider-dashboard-grid">
      <article className="rider-active-card">
        <header><div><span className="rider-section-icon"><Navigation /></span><div><small>Current Delivery</small><h2>{current ? `Delivery #${current.order._id.slice(-6).toUpperCase()}` : 'Ready for your next route'}</h2></div></div>{current && <b className={`delivery-status delivery-status--${current.status.replace('_', '-')}`}>{current.status.replace('_', ' ')}</b>}</header>
        {current ? <><ol className="rider-route-progress" aria-label="Delivery progress">{deliverySteps.map((step, index) => <li className={index < stageIndex ? 'complete' : index === stageIndex ? 'active' : ''} key={step}><span>{index < stageIndex ? <CheckCircle2 /> : index + 1}</span><small>{step}</small></li>)}</ol><button type="button" className="button button--secondary" aria-expanded={showMap} onClick={() => setShowMap(value => !value)}>{showMap ? 'Hide Route' : 'View Route'}</button>{showMap && <RiderMap key={current._id} deliveryId={current._id} />}<div className="rider-route-details"><div><span><Store /></span><p><small>Pick up from</small><strong>{restaurant?.name ?? 'Restaurant'}</strong><em>{restaurant?.address ?? 'Address available in delivery details'}</em></p></div><i /><div><span><MapPin /></span><p><small>Deliver to</small><strong>{customer?.name ?? 'Customer'}</strong><em>{current.order.deliveryAddress}</em></p></div></div><footer><div><span><Package /> {current.order.items.length} items</span><span><DollarSign /> {formatLkr(current.payout)} internal test earning</span><span><Clock3 /> Assigned {new Date(current.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div><Link className="button button--primary" to={`/rider/deliveries/${current._id}`}>View Route <ArrowRight /></Link></footer></> : <div className="rider-no-route"><span><Bike /></span><h2>No active delivery</h2><p>Stay online and your next assigned route will appear here automatically.</p><Link className="button button--primary" to="/rider/deliveries">View delivery queue</Link></div>}
      </article>

      <aside className="rider-side-stack">
        <section className="portal-card rider-queue-card"><div className="portal-card__heading"><div><h2>Delivery queue</h2><p>{active.length} active assignment{active.length === 1 ? '' : 's'}</p></div><Link to="/rider/deliveries">View all</Link></div>{active.length === 0 ? <p className="admin-empty">Your queue is clear.</p> : <div className="rider-premium-queue">{active.slice(0, 3).map((delivery) => { const itemRestaurant = typeof delivery.order.restaurant === 'string' ? null : delivery.order.restaurant; return <Link to={`/rider/deliveries/${delivery._id}`} key={delivery._id}><span><Store /></span><div><strong>{itemRestaurant?.name ?? 'Restaurant'}</strong><small>#{delivery.order._id.slice(-6).toUpperCase()} · {delivery.order.items.length} items</small></div><b>{formatLkr(delivery.payout)}</b><ArrowRight /></Link> })}</div>}</section>
        <section className="rider-help-card"><span><Headphones /></span><div><small>Rider support</small><h2>Need help on the road?</h2><p>Get help with an order, customer or delivery issue.</p></div><a className="button rider-help-button" href="tel:+94110000000"><Phone /> Contact support</a></section>
      </aside>
    </section>

    <section className="rider-lower-grid">
      <article className="portal-card"><div className="portal-card__heading"><div><h2>Recent activity</h2><p>Your latest completed deliveries</p></div><Link to="/rider/earnings">Full history</Link></div>{completed.length ? <div className="rider-recent-list">{completed.map((delivery) => <div key={delivery._id}><span><CheckCircle2 /></span><div><strong>Delivery #{delivery.order._id.slice(-6).toUpperCase()}</strong><small>{new Date(delivery.deliveredAt ?? delivery.assignedAt).toLocaleString()}</small></div><b>{formatLkr(delivery.payout)}</b></div>)}</div> : <p className="admin-empty">Completed deliveries will appear here.</p>}</article>
      <article className="rider-safety-card"><span><ShieldCheck /></span><div><small>Safety first</small><h2>Ride smart. Deliver safely.</h2><p>Wear your helmet, follow the safest route and contact support whenever you need assistance.</p><Link to="/rider/profile">Review rider profile <ArrowRight /></Link></div></article>
    </section>
  </div>
}
