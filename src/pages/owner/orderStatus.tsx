import { BellRing, Check, ChefHat, PackageCheck, Bike, CircleCheck, CircleX, TriangleAlert } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { ApiOrder, OrderStatus } from '../../core/types/api'
import './orderStatus.css'

// Keys are backend OrderStatus values. Confirmed is the current Accept action;
// accepted is a legacy state that must still pass through confirmed.
export const orderAppearance = {
  placed: { label: 'New order', color: '#F59E0B', ink: '#92400E', icon: BellRing },
  accepted: { label: 'Accepted', color: '#3B82F6', ink: '#1D4ED8', icon: Check },
  confirmed: { label: 'Accepted', color: '#3B82F6', ink: '#1D4ED8', icon: Check },
  preparing: { label: 'Preparing', color: '#F97316', ink: '#9A3412', icon: ChefHat },
  ready_for_pickup: { label: 'Ready for pickup', color: '#22C55E', ink: '#166534', icon: PackageCheck },
  rider_assigned: { label: 'Rider assigned', color: '#22C55E', ink: '#166534', icon: Bike },
  picked_up: { label: 'Picked up', color: '#8B5CF6', ink: '#6D28D9', icon: Bike },
  out_for_delivery: { label: 'Out for delivery', color: '#8B5CF6', ink: '#6D28D9', icon: Bike },
  delivered: { label: 'Delivered', color: '#16A34A', ink: '#166534', icon: CircleCheck },
  declined: { label: 'Declined', color: '#EF4444', ink: '#B91C1C', icon: CircleX },
  cancelled: { label: 'Cancelled', color: '#EF4444', ink: '#B91C1C', icon: CircleX },
  delivery_failed: { label: 'Delivery failed', color: '#B91C1C', ink: '#991B1B', icon: TriangleAlert },
} satisfies Record<OrderStatus, {label: string; color: string; ink: string; icon: typeof Check}>
export const ownerActions: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  placed: { status: 'confirmed', label: 'Accept order' },
  accepted: { status: 'confirmed', label: 'Confirm order' },
  confirmed: { status: 'preparing', label: 'Start preparing' },
  preparing: { status: 'ready_for_pickup', label: 'Ready for pickup' },
}
export function statusStyle(status: OrderStatus): CSSProperties {
  const value = orderAppearance[status]
  return { '--order-color': value.color, '--order-ink': value.ink } as CSSProperties
}
export function OwnerStatusBadge({ status }: { status: OrderStatus }) {
  const value = orderAppearance[status]; const Icon = value.icon
  return <span className="owner-order-status" style={statusStyle(status)}><Icon size={16} aria-hidden="true" />{value.label}</span>
}
export function mergeConfirmedOrder(current: ApiOrder, updated: ApiOrder): ApiOrder {
  // PATCH returns unpopulated references. Keep the display names already loaded.
  return { ...current, ...updated, customer: typeof updated.customer === 'string' ? current.customer : updated.customer, restaurant: typeof updated.restaurant === 'string' ? current.restaurant : updated.restaurant }
}
