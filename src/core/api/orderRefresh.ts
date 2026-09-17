export const orderRefreshEvent = 'foodie:orders-changed'
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(orderRefreshEvent) : null
channel?.addEventListener('message', () => window.dispatchEvent(new Event(orderRefreshEvent)))
export function ordersChanged() {
  window.dispatchEvent(new Event(orderRefreshEvent))
  channel?.postMessage('refresh')
}
