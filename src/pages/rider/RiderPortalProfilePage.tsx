import { ArrowRight, Bike, CheckCircle2, DollarSign, Mail, MapPin, Package, Phone, Power, ShieldCheck, Store } from 'lucide-react'
import { useCallback, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { riderApi } from '../../core/api/services'
import { useAsyncResource } from '../../core/api/useAsyncResource'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { formatLkr } from '../../services/sriLankanData'

export function RiderPortalOverviewPage() {
  const loader = useCallback(() => { const today = new Date(); today.setHours(0, 0, 0, 0); return Promise.all([riderApi.mine(), riderApi.earnings(), riderApi.earnings(today.toISOString()), riderApi.getProfile()]) }, [])
  const resource = useAsyncResource(loader, 7000)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  if (resource.loading) return <LoadingState label="Loading your rider workspace..." />
  if (resource.error || !resource.data) return <ErrorState message={resource.error || 'Rider dashboard unavailable'} retry={resource.retry} />
  const [deliveries, earnings, today, profile] = resource.data
  const active = deliveries.filter(item => !['delivered', 'rejected'].includes(item.status))
  const recentCompleted = deliveries.filter(item => item.status === 'delivered').slice(0, 3)
  const toggle = async () => { setSaving(true); setMessage(''); try { await riderApi.availability(!profile.isAvailable); setMessage(`You are now ${profile.isAvailable ? 'offline' : 'online'}.`); await resource.retry() } catch (caught) { setMessage(caught instanceof Error ? caught.message : 'Unable to update availability.') } finally { setSaving(false) } }
  return <>{resource.refreshError && <p className="error-banner" role="status">Refresh failed: {resource.refreshError}. Showing the last loaded data; retrying automatically.</p>}<div className="portal-title rider-title"><div><span className="eyebrow">Ayubowan, delivery partner</span><h1>Welcome, {profile.user.name}</h1><p>Manage availability and assigned Foodie deliveries.</p></div><button disabled={saving} className={`availability-switch ${profile.isAvailable ? 'online' : ''}`} onClick={() => void toggle()}><Power /><span><strong>{profile.isAvailable ? 'You are online' : 'You are offline'}</strong><small>{saving ? 'Saving...' : profile.isAvailable ? 'Receiving assignments' : 'Go online when ready'}</small></span></button></div>{message && <p className={message.startsWith('Unable') ? 'error-banner' : 'success-banner'} role="status">{message}</p>}<div className="metric-grid rider-metrics"><article><span><DollarSign /></span><div><small>Today's earnings</small><strong>{formatLkr(today.totalEarnings)}</strong><em>{today.completedTrips} completed today</em></div></article><article><span><Bike /></span><div><small>Completed deliveries</small><strong>{earnings.completedTrips}</strong><em>All-time backend total</em></div></article><article><span><Package /></span><div><small>Active deliveries</small><strong>{active.length}</strong><em>Assigned to you</em></div></article><article><span><Power /></span><div><small>Account status</small><strong>{profile.user.accountStatus}</strong><em>{profile.isAvailable ? 'Available for work' : 'Currently offline'}</em></div></article></div><section className="portal-card"><div className="portal-card__heading"><div><h2>Current deliveries</h2><p>Only assignments belonging to your rider account</p></div><Link to="/rider/deliveries">View all</Link></div>{active.length === 0 ? <p className="admin-empty">No active deliveries right now.</p> : <div className="rider-overview-deliveries">{active.map(delivery => { const restaurant = typeof delivery.order.restaurant === 'string' ? null : delivery.order.restaurant; return <article key={delivery._id}><span><Store /></span><div><strong>#{delivery.order._id.slice(-6).toUpperCase()}</strong><p>{restaurant?.name ?? 'Restaurant'} · {delivery.order.deliveryAddress}</p></div><b>{delivery.status.replace('_', ' ')}</b></article> })}</div>}</section>{recentCompleted.length > 0 && <section className="portal-card"><div className="portal-card__heading"><div><h2>Recent completed deliveries</h2><p>Latest assignments marked delivered</p></div></div><div className="earnings-history">{recentCompleted.map(delivery => <div key={delivery._id}><span><strong>Delivery #{delivery.order._id.slice(-6).toUpperCase()}</strong><small>{new Date(delivery.deliveredAt ?? delivery.assignedAt).toLocaleString()}</small></span><b>{formatLkr(delivery.payout)}</b></div>)}</div></section>}</>
}

export function RiderPortalEarningsPage() {
  const loader = useCallback(() => { const today = new Date(); today.setHours(0, 0, 0, 0); const week = new Date(today); week.setDate(week.getDate() - 6); return Promise.all([riderApi.earnings(), riderApi.earnings(today.toISOString()), riderApi.earnings(week.toISOString())]) }, [])
  const resource = useAsyncResource(loader, 7000)
  if (resource.loading) return <LoadingState label="Calculating rider earnings..." />
  if (resource.error || !resource.data) return <ErrorState message={resource.error || 'Earnings unavailable'} retry={resource.retry} />
  const [total, today, week] = resource.data
  return <>{resource.refreshError && <p className="error-banner" role="status">Refresh failed: {resource.refreshError}. Retrying automatically.</p>}<div className="portal-title"><div><span className="eyebrow">Delivered orders</span><h1>Earnings</h1><p>Internal test ledger from delivered orders. No Stripe or bank payouts.</p></div></div><div className="metric-grid rider-metrics"><article><span><DollarSign /></span><div><small>Today</small><strong>{formatLkr(today.totalEarnings)}</strong><em>{today.completedTrips} completed deliveries</em></div></article><article><span><DollarSign /></span><div><small>This week</small><strong>{formatLkr(week.totalEarnings)}</strong><em>{week.completedTrips} completed deliveries</em></div></article><article><span><DollarSign /></span><div><small>Total earnings</small><strong>{formatLkr(total.totalEarnings)}</strong><em>{total.completedTrips} completed deliveries</em></div></article></div>{total.trips.length === 0 ? <p className="admin-empty">No completed deliveries or earnings yet.</p> : <section className="portal-card"><div className="portal-card__heading"><div><h2>Earnings history</h2><p>Available internal test earnings</p></div></div><div className="earnings-history">{total.trips.map(trip => <div key={trip._id}><span><strong>Delivery #{trip._id.slice(-6).toUpperCase()}</strong><small>{new Date(trip.deliveredAt ?? trip.assignedAt).toLocaleString()}</small></span><b>{formatLkr(trip.payout)}</b></div>)}</div></section>}</>
}

export function RiderAvailabilityPage() {
  const resource = useAsyncResource(useCallback(() => riderApi.getProfile(), []))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const profile = resource.data
  const setAvailability = async () => { if (!profile) return; setSaving(true); setMessage(''); try { await riderApi.availability(!profile.isAvailable); setMessage(`You are now ${profile.isAvailable ? 'offline' : 'online'}.`); await resource.retry() } catch (caught) { setMessage(caught instanceof Error ? caught.message : 'Unable to update availability.') } finally { setSaving(false) } }
  if (resource.loading) return <LoadingState label="Loading availability..." />
  if (resource.error || !profile) return <ErrorState message={resource.error || 'Rider profile unavailable'} retry={resource.retry} />
  return <><div className="portal-title"><div><span className="eyebrow">Delivery status</span><h1>Availability</h1><p>Control whether restaurants can assign new deliveries to you.</p></div></div>{message && <p className={message.startsWith('Unable') ? 'error-banner' : 'success-banner'} role="status">{message}</p>}<section className="portal-card rider-availability-card"><span className={`availability-icon ${profile.isAvailable ? 'online' : ''}`}><Power /></span><div><h2>{profile.isAvailable ? 'You are online' : 'You are offline'}</h2><p>{profile.isAvailable ? 'You can receive new delivery assignments.' : 'You will not receive new assignments until you go online.'}</p></div><button className="button button--primary" disabled={saving} onClick={() => void setAvailability()}>{saving ? 'Saving...' : profile.isAvailable ? 'Go offline' : 'Go online'}</button></section></>
}

export function RiderPortalProfilePage() {
  const resource = useAsyncResource(useCallback(() => riderApi.getProfile(), []))
  if (resource.loading) return <LoadingState label="Loading rider profile..." />
  if (resource.error.includes('Create rider profile first')) return <RiderProfileSetup onSaved={resource.retry} />
  if (resource.error || !resource.data) return <ErrorState message={resource.error || 'Rider profile unavailable'} retry={resource.retry} />
  const profile = resource.data
  const user = profile.user
  return <><div className="portal-title"><div><span className="eyebrow">Account & vehicle</span><h1>Rider profile</h1><p>Your verified rider details from Foodie.</p></div></div><section className="portal-card rider-backend-profile"><div className="rider-profile-avatar"><Bike /></div><div><h2>{user.name}</h2><span><CheckCircle2 /> Approved delivery rider</span></div></section><div className="profile-settings rider-profile-settings"><section className="portal-card"><h2>Personal details</h2><dl className="admin-details"><div><dt><Mail /> Email</dt><dd>{user.email}</dd></div><div><dt><Phone /> Phone</dt><dd>{user.phone || 'Not provided'}</dd></div><div><dt><MapPin /> Address</dt><dd>{user.address || 'Not provided'}</dd></div></dl></section><section className="portal-card"><h2>Vehicle details</h2><dl className="admin-details"><div><dt><Bike /> Vehicle</dt><dd>{profile.vehicleType}</dd></div><div><dt>Vehicle number</dt><dd>{profile.vehicleNumber}</dd></div><div><dt><ShieldCheck /> Documents</dt><dd>{profile.verificationDocuments.length ? `${profile.verificationDocuments.length} submitted` : 'Not provided'}</dd></div></dl></section></div></>
}

function RiderProfileSetup({ onSaved }: { onSaved: () => Promise<unknown> }) {
  const [vehicleType, setVehicleType] = useState('Motorcycle')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await riderApi.profile({ vehicleType, vehicleNumber: vehicleNumber.trim(), licenseNumber: licenseNumber.trim() || undefined })
      await onSaved()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to create rider profile.')
    } finally {
      setSaving(false)
    }
  }

  return <div className="rider-profile-onboarding"><section className="rider-onboarding-intro"><span><Bike /></span><small>One final step</small><h1>Set up your rider profile</h1><p>Your account is approved. Add your vehicle details once to unlock the dashboard, availability controls and delivery assignments.</p><ul><li><CheckCircle2 /> Access your premium rider dashboard</li><li><CheckCircle2 /> Receive delivery assignments</li><li><CheckCircle2 /> Track earnings and completed trips</li></ul></section><form className="portal-card rider-setup-form" onSubmit={(event) => void submit(event)}><div><span className="eyebrow">Vehicle information</span><h2>Tell us how you deliver</h2><p>Use the same details shown on your vehicle documents.</p></div>{error && <p className="error-banner" role="alert">{error}</p>}<label>Vehicle type<select value={vehicleType} onChange={(event) => setVehicleType(event.target.value)}><option>Motorcycle</option><option>Bicycle</option><option>Car</option><option>Three-wheeler</option><option>Van</option></select></label><label>Vehicle number<input required value={vehicleNumber} onChange={(event) => setVehicleNumber(event.target.value)} placeholder="Example: WP BCT-4821" /></label><label>Driving licence number <small>Optional for bicycles</small><input value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} placeholder="Enter licence number" /></label><button className="button button--primary button--full" disabled={saving} type="submit">{saving ? 'Creating profile...' : 'Complete rider setup'} <ArrowRight /></button><small className="rider-setup-note"><ShieldCheck /> These details are stored securely with your approved rider account.</small></form></div>
}
