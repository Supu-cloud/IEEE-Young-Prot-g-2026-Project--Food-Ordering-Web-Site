import { RiderAssignment } from '../../components/portal/RiderAssignment'
import { Check, ChefHat, MapPin, PackageCheck, Phone, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { orderApi, ownerApi } from '../../core/api/services'
import { useAsyncResource } from '../../core/api/useAsyncResource'
import type { OrderStatus } from '../../core/types/api'
import { formatLkr } from '../../services/sriLankanData'
import { OwnerOrderBadgeV2 } from './OwnerOrdersV2Page'

const ownerFlow: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'ready_for_pickup']
const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = { placed: 'confirmed', accepted: 'confirmed', confirmed: 'preparing', preparing: 'ready_for_pickup' }
const actionLabel: Partial<Record<OrderStatus, string>> = { placed: 'Accept order', accepted: 'Confirm order', confirmed: 'Start preparing', preparing: 'Mark ready for pickup' }

export function OwnerOrderDetailPage() {
  const { orderId = '' } = useParams()
  const loader = useCallback(() => ownerApi.order(orderId), [orderId])
  const resource = useAsyncResource(loader, 7000)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (resource.loading) return <LoadingState label="Loading order details..." />
  if (resource.error) return <ErrorState message={resource.error} retry={resource.retry} />
  const order = resource.data!
  const customer = typeof order.customer === 'string' ? null : order.customer
  const update = async (status: OrderStatus) => {
    setBusy(true); setError('')
    try { await orderApi.status(order._id, status); await resource.retry() }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to update this order.') }
    finally { setBusy(false) }
  }
  const next = nextStatus[order.status]
  const currentIndex = ownerFlow.indexOf(order.status)
  return <>{resource.refreshError && <p className="error-banner" role="status">Refresh failed: {resource.refreshError}. Showing the last loaded data; retrying automatically.</p>}<div className="portal-title"><div><Link to="/owner/orders">&larr; Back to orders</Link><h1>Order #{order._id.slice(-6).toUpperCase()}</h1><p>{new Date(order.createdAt).toLocaleString('en-LK')} &middot; {order.items.reduce((sum,item)=>sum+item.quantity,0)} items</p></div><OwnerOrderBadgeV2 status={order.status}/></div>
    {error&&<p className="error-banner" role="alert">{error}</p>}
    <div className="order-detail-layout"><div className="order-detail-stack"><section className="portal-card"><div className="portal-card__heading"><div><h2>Ordered items</h2><p>Kitchen summary</p></div></div><div className="order-detail-items">{order.items.map(item=><div key={`${item.menuItem}-${item.name}`}><span><strong>{item.name}</strong><small>{item.quantity} x {formatLkr(item.price)}</small></span><b>{item.quantity}</b><strong>{formatLkr(item.quantity*item.price)}</strong></div>)}</div></section>
      <section className="portal-card"><h2>Order progress</h2><ol className="order-timeline">{ownerFlow.map((step,index)=><li className={index<currentIndex?'complete':index===currentIndex?'active':''} key={step}><span>{index<currentIndex?<Check/>:index+1}</span><div><strong>{step.replaceAll('_',' ')}</strong><small>{index<currentIndex?'Completed':index===currentIndex?'Current status':'Waiting'}</small></div></li>)}</ol></section></div>
      <aside className="order-detail-stack">{order.status === 'ready_for_pickup' && <RiderAssignment orderId={order._id} onAssigned={resource.retry} />}{order.deliveryRider && <section className="portal-card"><h2>Assigned rider</h2><p>{typeof order.deliveryRider === 'string' ? order.deliveryRider : order.deliveryRider.name}</p><p>{order.status.replaceAll('_', ' ')}</p></section>}<section className="portal-card"><h2>Customer</h2><strong>{customer?.name??'Customer'}</strong>{customer?.phone&&<p><Phone/> {customer.phone}</p>}<p><MapPin/> {order.deliveryAddress}</p></section><section className="portal-card payment-lines"><h2>Payment summary</h2>{order.settlement && <p>Restaurant internal test earning: {formatLkr(order.settlement.restaurantAmount)} — {order.settlement.restaurantStatus}. No bank payout.</p>}<div><span>Order total</span><b>{formatLkr(order.totalAmount)}</b></div><div><span>Payment</span><b>{order.paymentStatus}</b></div></section><section className="portal-card detail-actions"><h2>Owner actions</h2>{next&&<button className="button button--primary button--full" disabled={busy} onClick={()=>void update(next)}>{order.status==='placed'?<Check/>:order.status==='accepted'?<PackageCheck/>:<ChefHat/>}{actionLabel[order.status]}</button>}{order.status==='placed'&&<button className="button button--danger button--full" disabled={busy} onClick={()=>void update('declined')}><X/>Decline order</button>}<small>Only backend-approved restaurant-owner transitions are available.</small></section></aside></div></>
}
