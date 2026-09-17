import { BellRing, Check, Clock3, PackageCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { ownerApi } from '../../core/api/services'
import { useAsyncResource } from '../../core/api/useAsyncResource'
import type { OrderStatus } from '../../core/types/api'
import { formatLkr } from '../../services/sriLankanData'
import { OwnerOrderActions } from './OwnerOrderActions'
import { OwnerStatusBadge, mergeConfirmedOrder, statusStyle } from './orderStatus'

const columns: Array<{ label: string; statuses: OrderStatus[]; icon: typeof BellRing }> = [
  { label: 'Incoming', statuses: ['placed'], icon: BellRing },
  { label: 'In progress', statuses: ['accepted', 'confirmed', 'preparing'], icon: Clock3 },
  { label: 'Ready for pickup', statuses: ['ready_for_pickup', 'rider_assigned'], icon: PackageCheck },
  { label: 'History', statuses: ['declined', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled', 'delivery_failed'], icon: Check },
]
export const OwnerOrderBadgeV2 = OwnerStatusBadge
export function OwnerOrdersV2Page() {
  const resource = useAsyncResource(ownerApi.orders, 7000)
  const orders = resource.data ?? []
  if (resource.loading) return <LoadingState label="Loading restaurant orders…" />
  if (resource.error) return <ErrorState message={resource.error} retry={resource.retry} />
  return <>
    {resource.refreshError && <p className="error-banner" role="status">Refresh failed: {resource.refreshError}. Showing the last loaded data; retrying automatically.</p>}
    <div className="portal-title"><div><span className="eyebrow">Kitchen command centre</span><h1>Orders</h1><p>Only orders placed with your restaurant are shown.</p></div></div>
    {orders.length === 0 ? <EmptyState title="No orders yet" message="New customer orders will appear here." /> : <div className="order-board">{columns.map(column => {
      const Icon = column.icon; const items = orders.filter(order => column.statuses.includes(order.status))
      return <section key={column.label} aria-label={column.label}><header><div><Icon /><h2>{column.label}</h2></div><span aria-label={`${column.label} count`}>{items.length}</span></header><div>{items.map(order => <article className="kitchen-order owner-order-card" key={order._id} data-order-id={order._id} data-status={order.status} style={statusStyle(order.status)}>
        <div><Link to={`/owner/orders/${order._id}`}><strong>#{order._id.slice(-6).toUpperCase()}</strong></Link><OwnerStatusBadge status={order.status} /></div>
        <h3>{typeof order.customer === 'string' ? 'Customer' : order.customer.name}</h3>
        <p>Payment: {order.paymentStatus} · {new Date(order.createdAt).toLocaleString()}</p>
        <ul>{order.items.map(item => <li key={`${order._id}-${item.menuItem}`}>{item.quantity} × {item.name}</li>)}</ul>
        <div className="kitchen-order__total"><span>Total</span><b>{formatLkr(order.totalAmount)}</b></div>
        <OwnerOrderActions order={order} onConfirmed={updated => {
          resource.commit(current => current?.map(item => item._id === updated._id ? mergeConfirmedOrder(item, updated) : item) ?? null)
          void resource.retry()
        }} />
      </article>)}{!items.length && <p className="column-empty">Nothing here right now.</p>}</div></section>
    })}</div>}
  </>
}
