import { useRef, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { orderApi } from '../../core/api/services'
import { restaurantChanged } from '../../core/api/restaurantRefresh'
import type { ApiOrder, OrderStatus } from '../../core/types/api'
import { orderAppearance, ownerActions, statusStyle } from './orderStatus'

export function OwnerOrderActions({ order, onConfirmed }: { order: ApiOrder; onConfirmed: (updated: ApiOrder) => void }) {
  const [pending, setPending] = useState<OrderStatus | null>(null)
  const [error, setError] = useState('')
  const locked = useRef(false)
  const next = ownerActions[order.status]
  const actions = [...(next ? [next] : []), ...(order.status === 'placed' ? [{ status: 'declined' as const, label: 'Decline order' }] : [])]
  const update = async (status: OrderStatus) => {
    if (locked.current) return
    locked.current = true; setPending(status); setError('')
    try {
      const updated = await orderApi.status(order._id, status)
      onConfirmed(updated)
      restaurantChanged() // Refresh existing dashboard metrics, including other tabs.
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to update this order.') }
    finally { locked.current = false; setPending(null) }
  }
  return <>{error && <p role="alert">{error}</p>}<div className="owner-order-actions">{actions.map(action => {
    const Icon = pending === action.status ? LoaderCircle : orderAppearance[action.status].icon
    return <button key={action.status} type="button" className="owner-order-action" style={statusStyle(action.status)} data-target={action.status} disabled={pending !== null} aria-busy={pending === action.status} onClick={() => void update(action.status)}><Icon size={18} className={pending === action.status ? 'owner-order-spinner' : ''} aria-hidden="true" />{pending === action.status ? 'Saving…' : action.label}</button>
  })}</div></>
}
