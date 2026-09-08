import type { OrderStatus } from '../../types'
export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status status--${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</span>
}
