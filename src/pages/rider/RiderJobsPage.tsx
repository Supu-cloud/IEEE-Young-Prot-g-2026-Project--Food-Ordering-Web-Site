import { Clock3, MapPin, Navigation, Store } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { riderDeliveries } from '../../services/riderPortalMockData'

const tabs = ['Assigned', 'Active', 'Completed'] as const
export function RiderJobsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Assigned')
  const jobs = riderDeliveries.filter((job) => tab === 'Assigned' ? job.status === 'Assigned' : tab === 'Completed' ? job.status === 'Delivered' : !['Assigned', 'Delivered'].includes(job.status))
  return <><div className="portal-title"><div><span className="eyebrow">Delivery queue</span><h1>Deliveries</h1><p>Review assigned, active, and completed trips.</p></div></div><div className="portal-tabs">{tabs.map((item) => <button className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{item}</button>)}</div><div className="rider-job-list">{jobs.map((job) => <article key={job.id}><div className="job-main"><div className="job-payout"><span>Rider earning</span><strong>Rs. {job.payout.toLocaleString()}</strong></div><div className="route-detail"><div><Store /><span><small>Pickup</small><strong>{job.restaurant}</strong><em>{job.pickup}</em></span></div><i /><div><MapPin /><span><small>Deliver to {job.customer}</small><strong>{job.dropoff}</strong><em>{job.distance} away</em></span></div></div><div className="job-meta"><span><Clock3 /> {job.eta}</span><span><Navigation /> {job.distance}</span><span className={`delivery-status delivery-status--${job.status.toLowerCase().replaceAll(' ', '-')}`}>{job.status}</span></div></div><div className="job-actions"><Link className="button button--primary" to={`/rider/jobs/${job.id}`}>View delivery</Link></div></article>)}{jobs.length === 0 && <div className="empty-state">No {tab.toLowerCase()} deliveries.</div>}</div></>
}
