import { Package, RotateCcw, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { orderApi } from '../core/api/services'
import { orderRefreshEvent, ordersChanged } from '../core/api/orderRefresh'
import { useAsyncResource } from '../core/api/useAsyncResource'
import type { ApiOrder, OrderStatus } from '../core/types/api'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/AsyncState'
import { OrderStatusBadge, orderStatusStyle } from '../components/OrderStatus'
import { mergeConfirmedOrder } from './owner/orderStatus'
import { formatLkr } from '../services/sriLankanData'
const groups: Array<{label: string; statuses: OrderStatus[]}> = [{label:'Active',statuses:['placed','accepted','confirmed','preparing','ready_for_pickup','rider_assigned','picked_up','out_for_delivery']},{label:'Completed',statuses:['delivered']},{label:'Cancelled / Failed',statuses:['cancelled','declined','delivery_failed']}]
function CancelOrder({ order, onConfirmed }: { order: ApiOrder; onConfirmed: (updated: ApiOrder) => void }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const lock = useRef(false)
  return <>{error && <p role="alert">{error}</p>}<button className="text-button" disabled={busy} onClick={async () => {
    if (lock.current) return
    lock.current = true; setBusy(true); setError('')
    try { onConfirmed(await orderApi.cancel(order._id)); ordersChanged() }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to cancel order.') }
    finally { lock.current = false; setBusy(false) }
  }}><X />{busy ? 'Cancelling…' : 'Cancel order'}</button></>
}
export function CustomerOrdersConnectedPage() {
  const [params] = useSearchParams(); const checkout = params.get('checkout')
  const resource = useAsyncResource(orderApi.mine, 7000, orderRefreshEvent)
  const [tab, setTab] = useState(0)
  if (resource.loading) return <div className="page container"><LoadingState label="Loading your Foodie orders…" /></div>
  if (resource.error) return <div className="page container"><ErrorState message={resource.error} retry={resource.retry} /></div>
  const all = (resource.data ?? []).filter(order => !checkout || order.checkoutId === checkout)
  const orders = all.filter(order => groups[tab].statuses.includes(order.status))
  return <div className="page container"><div className="page-title"><span className="eyebrow">Order history</span><h1>My orders</h1>{checkout && <p>Payment confirmed. Track each restaurant delivery below. <Link to="/orders">Show all orders</Link></p>}{params.has('cartWarning') && <p role="alert">Orders are paid and saved. Refresh your cart before ordering again.</p>}<p>Track active meals and review past orders.</p></div>
    {resource.refreshError && <p role="alert">Refresh failed: {resource.refreshError}. Showing your last loaded orders.</p>}
    <div className="tabs">{groups.map((group, index) => <button className={tab === index ? 'active' : ''} onClick={() => setTab(index)} key={group.label}>{group.label} ({all.filter(order => group.statuses.includes(order.status)).length})</button>)}</div>
    {!orders.length ? <EmptyState title={`No ${groups[tab].label.toLowerCase()} orders`} message="When an order reaches this stage, it will appear here." /> : <section className="order-list">{orders.map(order => {
      const restaurant = typeof order.restaurant === 'string' ? null : order.restaurant
      return <article className="order-card owner-order-card" key={order._id} data-order-id={order._id} data-status={order.status} style={orderStatusStyle(order.status)}>
        {restaurant?.imageUrl ? <img src={restaurant.imageUrl} alt={restaurant.name} /> : <span className="order-image-fallback"><Package /></span>}
        <div className="order-name"><strong>Order #{order._id.slice(-6).toUpperCase()}</strong><span>{restaurant?.name ?? 'Foodie restaurant'}</span><small>{order.checkoutId && `Checkout ${order.checkoutId.slice(-6)} - `}{new Date(order.createdAt).toLocaleString('en-LK')}</small></div>
        <span><Package /> {order.items.length} items</span><b>{formatLkr(order.totalAmount)}</b><OrderStatusBadge status={order.status} />
        <div className="order-actions"><Link className="button button--secondary" to={`/orders/${order._id}`}>{order.status === 'delivered' ? 'View order' : 'Track order'}</Link>
          {order.status === 'delivered' && <button className="button button--secondary"><RotateCcw /> Reorder</button>}
          {order.status === 'placed' && <CancelOrder order={order} onConfirmed={updated => { resource.commit(current => current?.map(item => item._id === updated._id ? mergeConfirmedOrder(item, updated) : item) ?? null); void resource.retry() }} />}
        </div>
      </article>
    })}</section>}
  </div>
}
