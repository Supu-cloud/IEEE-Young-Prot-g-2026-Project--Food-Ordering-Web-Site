import { lazy, Suspense } from 'react'
const Map = lazy(() => import('./RiderMap').then(module => ({ default: module.RiderMap })))
export function RiderMap({ deliveryId }: { deliveryId: string }) {
  return <Suspense fallback={<p role="status">Loading map…</p>}><Map deliveryId={deliveryId} /></Suspense>
}
