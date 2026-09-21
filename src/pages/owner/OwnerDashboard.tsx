import { BarChart3, Clock3, ListPlus, PackageCheck, ReceiptText, Store, TrendingUp, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { ownerApi, restaurantApi } from '../../core/api/services'
import { useRestaurantResource } from '../../core/api/restaurantRefresh'
import { restaurantImageUrl } from '../../core/api/imageUrl'
import { formatLkr } from '../../services/sriLankanData'
import { OwnerOrderBadgeV2 } from './OwnerOrdersV2Page'
import { statusStyle } from './orderStatus'

export function OwnerDashboard() {
  const resource = useRestaurantResource(ownerApi.dashboard, 7000)
  if (resource.loading) return <LoadingState label="Loading your restaurant dashboardâ€¦" />
  if (resource.error) return <ErrorState message={resource.error} retry={resource.retry} />
  const data = resource.data!
  const toggle = async () => { if (!data.restaurant) return; await restaurantApi.toggle(data.restaurant._id); await resource.retry() }
  return <>
    <div className="portal-title owner-welcome"><div><span className="eyebrow">Restaurant workspace</span><h1>Ayubowan, {data.owner.name}</h1><p>{data.restaurant ? `${data.restaurant.name} service at a glance.` : 'Set up your restaurant to begin managing orders.'}</p></div>{data.restaurant&&<button className={`availability-switch ${data.restaurant.isOpen?'online':''}`} onClick={()=>void toggle()}><Store/><span><strong>{data.restaurant.isOpen?'Restaurant open':'Restaurant closed'}</strong><small>{data.restaurant.isOpen?'Accepting new orders':'Not accepting orders'}</small></span></button>}</div>
    {!data.restaurant?<><EmptyState title="Create your restaurant" message="Your approved owner account is ready. Add your restaurant details to begin."/><p className="owner-setup-action"><Link className="button button--primary" to="/owner/restaurant">Set up restaurant</Link></p></>:<>
      <div className="owner-restaurant-summary">{data.restaurant.imageUrl && <img src={restaurantImageUrl(data.restaurant.imageUrl)} alt={`${data.restaurant.name} logo`} />}<div><h2>{data.restaurant.name}</h2><span>{data.restaurant.category}</span><p>{data.restaurant.address}</p></div></div>
      <div className="metric-grid owner-metrics">
        <article><span><ReceiptText/></span><div><small>Today&apos;s orders</small><strong>{data.metrics.todayOrders}</strong><em>Created today</em></div></article>
        <article><span><Clock3/></span><div><small>Active orders</small><strong>{data.metrics.activeOrders}</strong><em>Needs attention</em></div></article>
        <article><span><PackageCheck/></span><div><small>Completed orders</small><strong>{data.metrics.completedOrders}</strong><em>Delivered</em></div></article>
        <article><span><TrendingUp/></span><div><small>Revenue today</small><strong>{formatLkr(data.metrics.todayRevenue)}</strong><em>Available internal test earnings</em></div></article>
        <article><span><Utensils/></span><div><small>Menu items</small><strong>{data.metrics.menuItems}</strong><em>In your catalogue</em></div></article>
      </div>
      <section className="portal-card quick-actions"><div className="portal-card__heading"><div><h2>Quick actions</h2><p>Common restaurant tasks</p></div></div><div><Link to="/owner/orders"><ReceiptText/>View orders</Link><Link to="/owner/menu/new"><ListPlus/>Add menu item</Link><Link to="/owner/restaurant"><Store/>Edit restaurant</Link><Link to="/owner/analytics"><BarChart3/>View analytics</Link></div></section>
      <section className="portal-card"><div className="portal-card__heading"><div><h2>Recent orders</h2><p>Latest customer activity</p></div><Link to="/owner/orders">View all</Link></div>{data.recentOrders.length?<div className="compact-orders">{data.recentOrders.map(order=><Link key={order._id} className="owner-order-card" data-status={order.status} style={statusStyle(order.status)} to={`/owner/orders/${order._id}`}><span><strong>#{order._id.slice(-6).toUpperCase()}</strong><small>{typeof order.customer==='string'?'Customer':order.customer.name} Â· {new Date(order.createdAt).toLocaleString('en-LK')}</small></span><b>{formatLkr(order.totalAmount)}</b><OwnerOrderBadgeV2 status={order.status}/>{order.status === 'ready_for_pickup' && !order.deliveryRider && <span>Assign rider</span>}</Link>)}</div>:<EmptyState title="No orders yet" message="New orders will appear here."/>}</section>
    </>}
  </>
}
