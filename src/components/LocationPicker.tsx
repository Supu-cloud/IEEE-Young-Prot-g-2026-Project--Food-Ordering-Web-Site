import { useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import { mapConfig, type Coordinates } from '../core/config/maps'
import 'leaflet/dist/leaflet.css'

function SelectPoint({ onSelect }: { onSelect: (point: Coordinates) => void }) {
  useMapEvents({ click: event => onSelect({ latitude: event.latlng.lat, longitude: ((event.latlng.lng + 180) % 360 + 360) % 360 - 180 }) })
  return null
}
export function LocationPicker({ value, onConfirm, onCancel }: { value?: Partial<Coordinates>; onConfirm: (point: Coordinates) => void; onCancel: () => void }) {
  const valid = value?.latitude !== undefined && value.longitude !== undefined && Number.isFinite(value.latitude) && Number.isFinite(value.longitude) && Math.abs(value.latitude) <= 90 && Math.abs(value.longitude) <= 180
  const [point, setPoint] = useState<Coordinates | undefined>(valid ? value as Coordinates : undefined)
  return <section aria-label="Select exact location"><p>Pan and zoom, then tap the exact location. The initial map view is not a selected location.</p>
    <MapContainer center={point ? [point.latitude, point.longitude] : [7.8, 80.7]} zoom={point ? 16 : 7} style={{ height: 320, width: '100%' }}>
      <TileLayer url={mapConfig.tileUrl} attribution={mapConfig.attribution} maxZoom={mapConfig.maxZoom} />
      <SelectPoint onSelect={setPoint} />
      {point && <CircleMarker center={[point.latitude, point.longitude]} radius={10} pathOptions={{ color: '#2563eb', fillOpacity: 1 }} />}
    </MapContainer>
    <p role="status">{point ? 'Location selected. Confirm the marker matches your address.' : 'No location selected.'}</p>
    <button type="button" disabled={!point} onClick={() => point && onConfirm(point)}>Confirm location</button>
    <button type="button" onClick={onCancel}>Cancel map selection</button>
  </section>
}
