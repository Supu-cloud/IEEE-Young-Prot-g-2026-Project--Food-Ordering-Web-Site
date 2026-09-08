import { Eye } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ownerOrders, type OwnerOrderStatus } from '../../services/ownerPortalMockData'

const tabs = ['All','Pending','Confirmed','Preparing','Out for Delivery','Delivered','Cancelled'] as const
export function OwnerOrderBadge({status}:{status:OwnerOrderStatus}) { return <span className={`owner-status owner-status--${status.toLowerCase().replaceAll(' ','-')}`}>{status}</span> }
export function OwnerOrdersPage(){
 const[tab,setTab]=useState<(typeof tabs)[number]>('All'); const orders=useMemo(()=>tab==='All'?ownerOrders:ownerOrders.filter((order)=>order.status===tab),[tab])
 return <><div className="portal-title"><div><span className="eyebrow">Order management</span><h1>Orders</h1><p>Review every order and keep service moving.</p></div><div className="live-indicator"><span/>Mock preview</div></div><div className="portal-tabs" role="tablist">{tabs.map((value)=><button role="tab" aria-selected={tab===value} className={tab===value?'active':''} key={value} onClick={()=>setTab(value)}>{value}<small>{value==='All'?ownerOrders.length:ownerOrders.filter((order)=>order.status===value).length}</small></button>)}</div><section className="portal-card order-list"><div className="order-list__head"><span>Order</span><span>Customer</span><span>Items</span><span>Total</span><span>Status</span><span/></div>{orders.map((order)=><article key={order.id}><span><strong>#{order.id}</strong><small>{order.time}</small></span><span><strong>{order.customer}</strong><small>{order.address}</small></span><span>{order.items.reduce((sum,item)=>sum+item.quantity,0)} items</span><b>Rs. {order.total.toLocaleString()}</b><OwnerOrderBadge status={order.status}/><Link className="icon-link" aria-label={`View ${order.id}`} to={`/owner/orders/${order.id}`}><Eye/> <span>View details</span></Link></article>)}{orders.length===0&&<p className="column-empty">No orders in this status.</p>}</section></>
}
