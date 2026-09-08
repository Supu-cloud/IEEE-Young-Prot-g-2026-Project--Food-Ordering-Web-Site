import { useCallback, useState, type FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { orderApi } from '../core/api/services'
import type { ApiOrder } from '../core/types/api'
import { useAsyncResource } from '../core/api/useAsyncResource'
import { ErrorState, LoadingState } from '../components/ui/AsyncState'
import { formatLkr } from '../services/sriLankanData'

const steps: Array<{ label: string; field: keyof ApiOrder }> = [
  { label: 'Order Placed', field: 'placedAt' }, { label: 'Confirmed', field: 'confirmedAt' },
  { label: 'Preparing', field: 'preparingAt' }, { label: 'Ready for Pickup', field: 'readyForPickupAt' },
  { label: 'Rider Assigned', field: 'riderAssignedAt' }, { label: 'Picked Up', field: 'pickedUpAt' },
  { label: 'Out for Delivery', field: 'outForDeliveryAt' }, { label: 'Delivered', field: 'deliveredAt' },
]
function DeliveryReview({ order, onSaved }: { order: ApiOrder; onSaved: () => Promise<void> }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  if (order.deliveryReview) return <section className="checkout-panel"><h2>Your delivery review</h2><p>Rider: {order.deliveryReview.riderRating}/5 · Foodie service: {order.deliveryReview.serviceRating}/5</p><p>{order.deliveryReview.comment}</p></section>
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    setBusy(true); setError('')
    try { await orderApi.review(order._id, { riderRating: Number(form.get('rider')), serviceRating: Number(form.get('service')), restaurantRating: Number(form.get('restaurantRating')), restaurantComment: String(form.get('restaurantComment') ?? ''), comment: String(form.get('comment') ?? '') }); await onSaved() }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to save review') }
    finally { setBusy(false) }
  }
  return <form className="checkout-panel" onSubmit={event => void submit(event)}><h2>Rate your delivery and restaurant</h2>{error && <p role="alert" className="error-banner">{error}</p>}
    {[['rider', 'Rate Rider'], ['service', 'Rate Foodie Service']].map(([name, label]) => <label key={name}>{label}<select required name={name} defaultValue=""><option value="" disabled>Choose stars</option>{[1,2,3,4,5].map(stars => <option value={stars} key={stars}>{'★'.repeat(stars)} — {stars}/5</option>)}</select></label>)}
    <label>Restaurant rating<select required name="restaurantRating" defaultValue=""><option value="" disabled>Choose stars</option>{[1,2,3,4,5].map(stars => <option value={stars} key={stars}>{'★'.repeat(stars)} — {stars}/5</option>)}</select></label><label>Restaurant review<textarea required name="restaurantComment" maxLength={2000} /></label><label>Optional delivery comment<textarea name="comment" maxLength={2000} /></label><button className="button button--primary" disabled={busy}>{busy ? 'Saving…' : 'Submit review'}</button></form>
}

function ReceiptConfirmation({ order, onSaved }: { order: ApiOrder; onSaved: () => Promise<void> }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  const confirm = async (status: 'received' | 'not_received') => { setBusy(true); setError(''); try { await orderApi.receipt(order._id, status); await onSaved() } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to update receipt status') } finally { setBusy(false) } }
  return <section className="checkout-panel"><h2>Did you receive this order?</h2><p>Confirm the delivery so you can leave feedback.</p>{error && <p role="alert" className="error-banner">{error}</p>}{order.customerReceipt && <p className="success-banner">Marked as {order.customerReceipt.status === 'received' ? 'received' : 'not received'}.</p>}<div className="action-pair"><button className="button button--primary" disabled={busy} onClick={() => void confirm('received')}>I received the order</button><button className="button button--secondary" disabled={busy} onClick={() => void confirm('not_received')}>I did not receive it</button></div></section>
}

export function CustomerOrderDetailConnectedPage() {
  const { orderId = '' } = useParams(); const [params] = useSearchParams()
  const loader = useCallback(() => orderApi.get(orderId), [orderId])
  const resource = useAsyncResource(loader, 7000)
  const [actionError, setActionError] = useState(''); const [busy, setBusy] = useState(false)
  if (resource.loading) return <LoadingState label="Loading your order…" />
  if (resource.error || !resource.data) return <ErrorState message={resource.error || 'Order not found'} retry={resource.retry} />
  const order = resource.data
  const restaurant = typeof order.restaurant === 'string' ? null : order.restaurant
  const rider = typeof order.deliveryRider === 'string' ? null : order.deliveryRider
  const cancel = async () => { setBusy(true); setActionError(''); try { await orderApi.cancel(order._id); await resource.retry() } catch (caught) { setActionError(caught instanceof Error ? caught.message : 'Unable to cancel order') } finally { setBusy(false) } }
  return <div className="page container"><div className="page-title"><Link to="/orders">Back to orders</Link><h1>Order #{order._id.slice(-6).toUpperCase()}</h1><p>Full order reference: {order._id}</p><p>{restaurant?.name} · {order.status.replaceAll('_', ' ')}</p></div>
    {resource.refreshError && <p className="error-banner" role="status">Refresh failed: {resource.refreshError}. Showing last loaded status; retrying automatically.</p>}
    {params.has('cartWarning') && <p className="error-banner">Your paid order is saved, but the cart could not be cleared. Return to checkout to recover this order and retry cart cleanup; do not pay again.</p>}
    {actionError && <p className="error-banner" role="alert">{actionError}</p>}
    {['cancelled', 'declined', 'delivery_failed'].includes(order.status) && <p className="error-banner">This order is {order.status.replaceAll('_', ' ')}. {order.paymentStatus === 'paid' && 'Payment remains recorded; contact support for a Stripe test refund. No earnings are available.'}</p>}
    <section className="tracking-card"><h2>Order progress</h2><ol className="order-timeline">{steps.map(({ label, field }) => {
      const reached = order[field] ?? (field === 'placedAt' ? order.createdAt : undefined)
      return <li className={reached ? 'complete' : ''} key={field}><span>{reached ? '✓' : '○'}</span><div><strong>{label}</strong><small>{typeof reached === 'string' ? new Date(reached).toLocaleString() : 'Not reached'}</small></div></li>
    })}</ol><div className="detail-panels"><div><h3>Payment and items</h3><p>Payment: {order.paymentStatus}</p>{order.items.map(item => <p key={item.menuItem}>{item.quantity} × {item.name} — {formatLkr(item.price * item.quantity)}</p>)}<p>Delivery fee: {formatLkr(order.deliveryFee)}</p><strong>Total: {formatLkr(order.totalAmount)}</strong></div>
      <div><h3>Delivery details</h3><p>{order.deliveryAddress}</p><p>Rider: {rider?.name ?? (order.deliveryRider ? 'Assigned rider' : 'Awaiting assignment')}</p>{rider?.phone && <p>{rider.phone}</p>}</div></div>
      {order.status === 'placed' && <button className="button button--secondary" disabled={busy} onClick={() => void cancel()}>Cancel order</button>}
    </section>{order.status === 'delivered' && order.deliveryRider && <ReceiptConfirmation order={order} onSaved={resource.retry} />}{order.status === 'delivered' && order.deliveryRider && order.customerReceipt?.status === 'received' && <DeliveryReview order={order} onSaved={resource.retry} />}</div>
}
