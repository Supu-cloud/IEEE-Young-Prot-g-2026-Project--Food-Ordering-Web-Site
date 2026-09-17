import { useEffect, useRef, useState } from 'react'
import { Check, LoaderCircle, TriangleAlert, Truck } from 'lucide-react'
import { riderApi } from '../../core/api/services'
import { ordersChanged } from '../../core/api/orderRefresh'
import type { DeliveryAssignment, DeliveryStatus } from '../../core/types/api'
import '../../components/orderStatusUI.css'

function FailureConfirmation({ rejected, onConfirm, onCancel }: { rejected: boolean; onConfirm: () => void; onCancel: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { ref.current?.showModal() }, [])
  return <dialog ref={ref} className="delivery-confirmation" aria-labelledby="delivery-confirm-title" onCancel={event => { event.preventDefault(); onCancel() }}>
    <h2 id="delivery-confirm-title">{rejected ? 'Reject this assignment?' : 'Could not deliver this order?'}</h2>
    <p>{rejected ? 'The assignment will be returned to the restaurant.' : 'Confirm that this delivery could not be completed. This will mark the order as delivery failed.'}</p>
    <div><button type="button" onClick={onCancel} autoFocus>Go back</button><button type="button" className="rider-failure" onClick={onConfirm}><TriangleAlert size={18} />Confirm {rejected ? 'rejection' : 'failure'}</button></div>
  </dialog>
}
const nextStatus: Partial<Record<DeliveryStatus, DeliveryStatus>> = { assigned: 'picked_up', accepted: 'picked_up', picked_up: 'out_for_delivery', out_for_delivery: 'delivered' }
export function RiderDeliveryActions({ delivery, onConfirmed }: { delivery: DeliveryAssignment; onConfirmed: (updated: DeliveryAssignment) => void }) {
  const [pending, setPending] = useState<DeliveryStatus | null>(null)
  const [confirmation, setConfirmation] = useState<'failed' | 'rejected' | null>(null)
  const [error, setError] = useState('')
  const locked = useRef(false)
  const next = nextStatus[delivery.status]
  const update = async (status: DeliveryStatus) => {
    if (locked.current) return
    locked.current = true; setPending(status); setError('')
    try { const updated = await riderApi.status(delivery._id, status); onConfirmed(updated); ordersChanged() }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to update delivery status.') }
    finally { locked.current = false; setPending(null) }
  }
  const blocked = pending !== null || confirmation !== null
  return <>{error && <p role="alert" className="error-banner">{error}</p>}<div className="rider-action-row">
    {next && <button type="button" className={next === 'delivered' ? 'rider-success' : 'rider-progress'} disabled={blocked} aria-busy={pending === next} onClick={() => void update(next)}>{pending === next ? <LoaderCircle className="owner-order-spinner" /> : next === 'delivered' ? <Check /> : <Truck />}{pending === next ? 'Saving…' : next === 'picked_up' ? 'Mark picked up' : next === 'out_for_delivery' ? 'Start delivery' : 'Mark as Delivered'}</button>}
    {['assigned', 'accepted', 'picked_up', 'out_for_delivery'].includes(delivery.status) && <button type="button" className="rider-failure" disabled={blocked} aria-busy={pending === 'failed'} onClick={() => setConfirmation('failed')}>{pending === 'failed' ? <LoaderCircle className="owner-order-spinner" /> : <TriangleAlert />}{pending === 'failed' ? 'Saving…' : 'Could Not Deliver'}</button>}
    {delivery.status === 'assigned' && <button type="button" className="rider-failure" disabled={blocked} onClick={() => setConfirmation('rejected')}>Reject assignment</button>}
  </div>{confirmation && <FailureConfirmation rejected={confirmation === 'rejected'} onCancel={() => setConfirmation(null)} onConfirm={() => { const status = confirmation; setConfirmation(null); void update(status) }} />}</>
}
