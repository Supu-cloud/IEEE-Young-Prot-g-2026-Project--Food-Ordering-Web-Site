import { Bike, CircleDollarSign, Clock3, MapPin, Power, Route, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { riderDeliveries, riderProfile } from '../../services/riderPortalMockData'

export function RiderDashboard() {
  const [online, setOnline] = useState(true)
  const current = riderDeliveries.find((delivery) => delivery.status === 'Out for Delivery')
  const assigned = riderDeliveries.filter((delivery) => delivery.status === 'Assigned')

  return <>
    <div className="portal-title rider-title"><div><span className="eyebrow">Rider workspace</span><h1>Good morning, {riderProfile.name.split(' ')[0]}</h1><p>Stay safe and keep every delivery moving.</p></div><button className={`availability-switch ${online ? 'online' : ''}`} onClick={() => setOnline(!online)}><Power /><span><strong>{online ? 'You’re online' : 'You’re offline'}</strong><small>{online ? 'Receiving delivery requests' : 'Go online when you are ready'}</small></span></button></div>
    <div className="metric-grid rider-metrics"><article><span><Bike /></span><div><small>Completed today</small><strong>7</strong><em>2 more than yesterday</em></div></article><article><span><CircleDollarSign /></span><div><small>Today’s earnings</small><strong>Rs. 3,850</strong><em>Across 7 trips</em></div></article><article><span><Route /></span><div><small>Weekly earnings</small><strong>Rs. 21,430</strong><em>38 completed trips</em></div></article><article><span><Clock3 /></span><div><small>Online time</small><strong>5h 24m</strong><em>Today</em></div></article></div>
    <section className="portal-card"><div className="portal-card__heading"><div><h2>Current delivery</h2><p>Your active route and next action</p></div><Link to={current ? `/rider/jobs/${current.id}` : '/rider/jobs'}>View delivery</Link></div>{current ? <div className="current-delivery"><div className="current-delivery__route"><span><i /><div><small>Pickup</small><strong>{current.restaurant}</strong><p>{current.pickup}</p></div></span><span><MapPin /><div><small>Drop-off</small><strong>{current.customer}</strong><p>{current.dropoff}</p></div></span></div><div className="current-delivery__meta"><span>{current.distance}</span><span>{current.eta}</span><b>{current.status}</b></div></div> : <p>No delivery is active right now.</p>}</section>
    <div className="portal-two-column"><section className="portal-card"><div className="portal-card__heading"><div><h2>Assigned jobs</h2><p>{assigned.length} delivery waiting for you</p></div><Link to="/rider/jobs">View all</Link></div>{assigned.map((delivery) => <article className="compact-delivery" key={delivery.id}><div><small>{delivery.id}</small><strong>{delivery.restaurant}</strong><span>{delivery.distance} · {delivery.eta}</span></div><Link className="button button--secondary" to={`/rider/jobs/${delivery.id}`}>Review</Link></article>)}</section><section className="portal-card"><div className="portal-card__heading"><div><h2>Quick actions</h2><p>Frequently used rider tools</p></div></div><div className="quick-action-grid"><Link to="/rider/jobs"><Bike />Deliveries</Link><Link to="/rider/earnings"><CircleDollarSign />Earnings</Link><Link to={current ? `/rider/jobs/${current.id}` : '/rider/jobs'}><Route />Current route</Link><Link to="/rider/profile"><UserRound />Profile</Link></div></section></div>
  </>
}
