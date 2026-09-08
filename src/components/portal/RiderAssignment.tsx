import { useState } from 'react'
import { riderApi } from '../../core/api/services'
import { useAsyncResource } from '../../core/api/useAsyncResource'

export function RiderAssignment({ orderId, onAssigned }: { orderId: string; onAssigned: () => Promise<void> }) {
  const resource = useAsyncResource(riderApi.available, 7000)
  const [riderId, setRiderId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const assign = async () => {
    setBusy(true); setError('')
    try { await riderApi.assign(orderId, riderId); await onAssigned() }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to assign rider'); await resource.retry() }
    finally { setBusy(false) }
  }
  return <section className="portal-card"><h2>Assign a rider</h2>
    {(error || resource.error || resource.refreshError) && <p className="error-banner" role="alert">{error || resource.error || resource.refreshError}</p>}
    <label>Approved available rider<select value={riderId} onChange={event => setRiderId(event.target.value)} disabled={busy}>
      <option value="">Select rider</option>{resource.data?.map(profile => <option key={profile.user._id} value={profile.user._id}>{profile.user.name} — {profile.vehicleType}</option>)}
    </select></label>{resource.data?.length === 0 && <p>No available riders. An approved rider must go online first.</p>}
    <button className="button button--primary" disabled={busy || !riderId} onClick={() => void assign()}>{busy ? 'Assigning…' : 'Assign rider'}</button>
    <p>The order’s delivery fee becomes the rider’s internal test earning after delivery.</p>
  </section>
}
