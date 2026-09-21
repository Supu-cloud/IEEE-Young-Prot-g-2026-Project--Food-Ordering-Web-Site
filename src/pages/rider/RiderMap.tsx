import { useCallback, useEffect, useState } from 'react'
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { LatLngTuple } from 'leaflet'
import { riderApi } from '../../core/api/services'
import { useAsyncResource } from '../../core/api/useAsyncResource'
import { currentLocation, mapConfig, navigationUrl, type Coordinates } from '../../core/config/maps'
import 'leaflet/dist/leaflet.css'
import './riderMap.css'


const position = (point: Coordinates): LatLngTuple => [point.latitude, point.longitude]
function FitBounds({ points }: { points: LatLngTuple[] }) {
  const map = useMap()
  const key = JSON.stringify(points)
  useEffect(() => {
    const values: LatLngTuple[] = JSON.parse(key)
    if (values.length) map.fitBounds(values, { padding: [48, 48], maxZoom: 16 })
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map, key])
  return null
}
export function RiderMap({ deliveryId }: { deliveryId: string }) {
  const loader = useCallback(() => riderApi.route(deliveryId), [deliveryId])
  const resource = useAsyncResource(loader)
  const [rider, setRider] = useState<Coordinates>()
  const [locationError, setLocationError] = useState('')
  const [locating, setLocating] = useState(false)
  const data = resource.data
  const markers = [
    { label: 'Restaurant', color: '#b45309', point: data?.restaurant.coordinates },
    { label: 'Customer', color: '#2563eb', point: data?.customer.coordinates },
    { label: 'Rider', color: '#15803d', point: rider },
  ].filter(item => item.point)
  const route: LatLngTuple[] = data?.route?.coordinates.map(([lng, lat]) => [lat, lng]) ?? []
  const points = [...markers.map(item => position(item.point!)), ...route]
  return <section className="foodie-rider-map" aria-label="Rider map">
    <h2>Rider Map</h2>
    {resource.loading && <p role="status">Loading delivery route…</p>}
    {resource.refreshError && <p role="alert">{resource.refreshError}</p>}
    {resource.error && <p role="alert">{resource.error}</p>}
    {data?.errors.map(error => ['ROUTING_UNAVAILABLE', 'ROUTING_TIMEOUT', 'ROUTING_NOT_CONFIGURED', 'INVALID_ROUTE', 'NO_ROUTE'].includes(error.code)
      ? <p className="foodie-route-notice" role="status" key={error.code}>Route estimate is unavailable right now. The map and navigation links still work; you can retry the route shortly.</p>
      : <p className="error-banner" role="alert" key={error.code}>{error.message}</p>)}
    {data?.errors.some(error => error.code === 'RESTAURANT_LOCATION_MISSING' || error.code === 'CUSTOMER_LOCATION_MISSING') && <p role="note">This delivery may have been created before map locations were saved. Update the restaurant location, select the customer delivery point, and create a fresh order; existing orders are never assigned guessed coordinates.</p>}
    {points.length > 0 ? <MapContainer bounds={points} boundsOptions={{ padding: [48, 48], maxZoom: 16 }} className="foodie-map-canvas" scrollWheelZoom={false}>
      <TileLayer url={mapConfig.tileUrl} attribution={mapConfig.attribution} maxZoom={mapConfig.maxZoom} />
      <FitBounds points={points} />
      {route.length > 0 && <Polyline positions={route} pathOptions={{ color: '#2563eb', weight: 5 }} />}
      {markers.map(marker => <CircleMarker key={marker.label} center={position(marker.point!)} radius={10} pathOptions={{ color: '#fff', weight: 3, fillColor: marker.color, fillOpacity: 1 }}><Tooltip permanent direction="top">{marker.label}</Tooltip></CircleMarker>)}
    </MapContainer> : !resource.loading && <p>Map locations are not available for this delivery.</p>}
    {data && <div className="foodie-route-details"><p><strong>Restaurant: {data.restaurant.name}</strong><br />{data.restaurant.address || 'Pickup address unavailable.'}</p><p><strong>Customer: {data.customer.name}</strong><br />{data.customer.address}</p><p><strong>Distance:</strong> {data.route ? `${(data.route.distanceMeters / 1000).toFixed(1)} km` : 'Unavailable'}<br /><strong>Estimated travel time:</strong> {data.route ? `${Math.max(1, Math.ceil(data.route.durationSeconds / 60))} min (no live traffic)` : 'Unavailable'}</p></div>}
    <div className="foodie-map-actions"><button type="button" className="button button--secondary" disabled={locating} onClick={async () => { setLocating(true); setLocationError(''); try { setRider(await currentLocation()) } catch (error) { setLocationError(error instanceof Error ? error.message : 'Location unavailable.') } finally { setLocating(false) } }}>{locating ? 'Finding location…' : rider ? 'Refresh rider location' : 'Show my location'}</button>
      <button type="button" className="button button--secondary" onClick={() => void resource.retry()}>Retry route</button>
      {data?.customer.coordinates && <a className="button button--primary" href={navigationUrl(data.customer.coordinates)} target="_blank" rel="noreferrer">Start Navigation</a>}
      {data?.restaurant.coordinates && <a className="button button--secondary" href={navigationUrl(data.restaurant.coordinates)} target="_blank" rel="noreferrer">Navigate to Restaurant</a>}
    </div>{rider && <small>Rider position is the last requested location; use Refresh to update it.</small>}{locationError && <p role="status">{locationError}</p>}
  </section>
}
