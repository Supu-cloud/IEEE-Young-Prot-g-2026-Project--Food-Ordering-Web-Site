import type { CSSProperties } from 'react'
import type { DeliveryAssignment, DeliveryStatus, OrderStatus } from '../core/types/api'
import { orderAppearance, statusStyle } from '../pages/owner/orderStatus'
import './orderStatusUI.css'

export function orderStatusStyle(status: OrderStatus): CSSProperties {
  return status === 'delivery_failed' ? { '--order-color': '#EF4444', '--order-ink': '#B91C1C' } as CSSProperties : statusStyle(status)
}
export function OrderStatusBadge({ status, text }: { status: OrderStatus; text?: string }) {
  const value = orderAppearance[status]; const Icon = value.icon
  return <span className="owner-order-status" style={orderStatusStyle(status)}><Icon size={18} aria-hidden="true" />{text ?? value.label}</span>
}
// Assignment and order have distinct backend enums; this mirrors their transaction.
export const deliveryOrderStatus: Record<DeliveryStatus, OrderStatus> = { assigned: 'rider_assigned', accepted: 'rider_assigned', picked_up: 'picked_up', out_for_delivery: 'out_for_delivery', delivered: 'delivered', failed: 'delivery_failed', rejected: 'ready_for_pickup' }
export const deliveryLabels: Record<DeliveryStatus, string> = { assigned: 'Assigned', accepted: 'Accepted', picked_up: 'Picked up', out_for_delivery: 'Out for delivery', delivered: 'Delivered', failed: 'Could not deliver', rejected: 'Rejected' }
export const deliveryVisualStatus = (status: DeliveryStatus): OrderStatus => status === 'rejected' ? 'declined' : deliveryOrderStatus[status]
export function mergeDelivery(current: DeliveryAssignment, updated: DeliveryAssignment): DeliveryAssignment {
  return { ...current, ...updated, order: { ...current.order, status: deliveryOrderStatus[updated.status] } }
}
