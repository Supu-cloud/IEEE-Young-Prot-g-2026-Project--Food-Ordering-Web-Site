import { Check, MapPin, MessageCircle, Navigation, Phone, Store, Truck } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { riderDeliveries, type RiderDeliveryStatus } from '../../services/riderPortalMockData'

const flow: RiderDeliveryStatus[] = ['Assigned', 'Accepted', 'Picked Up', 'Out for Delivery', 'Delivered']
export function RiderJobDetailPage() {
  const { id = 'FD-1048' } = useParams()
  const job = riderDeliveries.find((delivery) => delivery.id === id) ?? riderDeliveries[0]
  const [status, setStatus] = useState<RiderDeliveryStatus>(job.status)
  const index = flow.indexOf(status)
  const next = flow[index + 1]
  return <><div className="portal-title"><div><Link to="/rider/jobs">‹ Back to deliveries</Link><h1>Delivery {job.id}</h1><p>{job.distance} · Estimated time {job.eta}</p></div><span className={`delivery-status delivery-status--${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</span></div><div className="delivery-layout"><section className="delivery-map" aria-label="Map placeholder"><div className="map-roads" /><span className="pickup-pin"><Store /></span><span className="dropoff-pin"><MapPin /></span><div className="route-line" /><div className="map-placeholder-label"><Navigation /> Route preview</div></section><aside className="delivery-steps"><div className="delivery-contact"><span><Store /></span><div><small>Pickup</small><h2>{job.restaurant}</h2><p>{job.pickup}</p></div><button aria-label="Call restaurant"><Phone /></button></div><div className="delivery-contact"><span><MapPin /></span><div><small>Drop-off</small><h2>{job.customer}</h2><p>{job.dropoff}</p></div><div><a href={`tel:${job.phone}`} aria-label="Call customer"><Phone /></a><button aria-label="Message customer"><MessageCircle /></button></div></div><div className="order-summary-mini"><h3>Order summary</h3>{job.items.map((item) => <p key={item}>{item}</p>)}</div><ol className="delivery-timeline">{flow.map((step, stepIndex) => <li className={stepIndex < index ? 'complete' : stepIndex === index ? 'active' : ''} key={step}><span>{stepIndex < index ? <Check /> : stepIndex + 1}</span><strong>{step}</strong></li>)}</ol><div className="delivery-primary-action">{next ? <button onClick={() => setStatus(next)}>{status === 'Assigned' ? 'Accept delivery' : status === 'Accepted' ? 'Confirm pickup' : status === 'Picked Up' ? 'Start delivery' : 'Mark delivered'} <Truck /></button> : <Link className="button button--primary button--full" to="/rider">Return to dashboard</Link>}</div></aside></div></>
}
