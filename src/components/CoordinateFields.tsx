import { useState } from 'react'
import { LocationPicker } from './LocationPicker'
import { currentLocation, type Coordinates } from '../core/config/maps'

export function CoordinateFields({ value, onChange, label }: { value?: Partial<Coordinates>; onChange: (value: Partial<Coordinates>) => void; label: string }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  return <fieldset><legend>{label}</legend><p>Choose the exact location on the map, or use your current location when you are at this address.</p>
    <button type="button" className="button button--secondary" disabled={busy} onClick={async () => { setBusy(true); setMessage(''); try { onChange(await currentLocation()); setMessage('Location selected. Confirm that this matches the address before saving.') } catch (error) { setMessage(error instanceof Error ? error.message : 'Location unavailable.') } finally { setBusy(false) } }}>{busy ? 'Finding location…' : 'Use my current location'}</button>
    <button type="button" onClick={() => setOpen(true)}>Choose location on map</button>
    {open && <LocationPicker value={value} onConfirm={point => { onChange(point); setOpen(false); setMessage('Location confirmed.') }} onCancel={() => setOpen(false)} />}
    {message && <p role="status">{message}</p>}
  </fieldset>
}
