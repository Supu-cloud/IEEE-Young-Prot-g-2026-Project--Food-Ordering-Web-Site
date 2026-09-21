import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RiderMap } from '../src/pages/rider/RiderMap'
import { riderApi } from '../src/core/api/services'
import type { DeliveryRoute } from '../src/core/types/api'

vi.mock('../src/core/api/services', () => ({ riderApi: { route: vi.fn() } }))
// Fixtures are isolated from the application and never saved to a real backend.
const fixture = (): DeliveryRoute => ({
  deliveryId: 'delivery', orderId: 'order', status: 'picked_up',
  restaurant: { name: 'Pickup', address: 'Pickup address', coordinates: { latitude: 6.9, longitude: 79.8 } },
  customer: { name: 'Customer', address: 'Delivery address', coordinates: { latitude: 6.8, longitude: 79.9 } },
  route: { distanceMeters: 1200, durationSeconds: 300, geometry: { type: 'LineString', coordinates: [[79.8, 6.9], [79.9, 6.8]] }, coordinates: [[79.8, 6.9], [79.9, 6.8]] }, errors: [],
})
let root: Root
let container: HTMLDivElement
const locate = vi.fn()
beforeEach(() => {
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: locate } })
  locate.mockReset()
})
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.clearAllMocks() })
async function render(value = fixture()) {
  vi.mocked(riderApi.route).mockResolvedValue(value)
  await act(async () => root.render(<RiderMap deliveryId="delivery" />))
}
async function showLocation() {
  const button = [...container.querySelectorAll('button')].find(item => item.textContent === 'Show my location')!
  await act(async () => button.click())
}
describe('real Leaflet delivery map', () => {
  it('renders route and labeled endpoints without asking for location', async () => {
    await render()
    expect(container.querySelectorAll('.leaflet-interactive')).toHaveLength(3)
    expect(container.textContent).toContain('1.2 km')
    expect(container.textContent).toContain('5 min (no live traffic)')
    expect(container.querySelector('.leaflet-control-attribution')?.textContent).toContain('OpenStreetMap')
    expect(locate).not.toHaveBeenCalled()
    expect(riderApi.route).toHaveBeenCalledWith('delivery')
  })
  it('preserves route and endpoints when permission is denied', async () => {
    locate.mockImplementation((_success, failure) => failure({ code: 1 }))
    await render(); await showLocation()
    expect(container.textContent).toContain('Location permission was denied')
    expect(container.querySelectorAll('.leaflet-interactive')).toHaveLength(3)
  })
  it('adds rider marker when permission is granted', async () => {
    locate.mockImplementation(success => success({ coords: { latitude: 6.85, longitude: 79.85 } }))
    await render(); await showLocation()
    expect(container.querySelectorAll('.leaflet-interactive')).toHaveLength(4)
    expect(container.textContent).toContain('Refresh rider location')
  })
  it('keeps markers and destination navigation when routing fails', async () => {
    const value = fixture(); value.route = null; value.errors = [{ code: 'ROUTING_UNAVAILABLE', message: 'Routing service is temporarily unavailable.' }]
    await render(value)
    expect(container.querySelectorAll('.leaflet-interactive')).toHaveLength(2)
    expect(container.textContent).toContain('Route estimate is unavailable right now.')
    const retry = [...container.querySelectorAll('button')].find(item => item.textContent === 'Retry route')!
    await act(async () => retry.click())
    expect(riderApi.route).toHaveBeenCalledTimes(2)
    const navigation = [...container.querySelectorAll('a')].find(item => item.textContent === 'Start Navigation')!
    expect(navigation.href).toContain('6.8,79.9')
  })
  it('shows a missing destination error and keeps the pickup marker', async () => {
    const value = fixture(); value.customer.coordinates = null; value.route = null; value.errors = [{ code: 'CUSTOMER_LOCATION_MISSING', message: 'Customer delivery coordinates are missing.' }]
    await render(value)
    expect(container.querySelectorAll('.leaflet-interactive')).toHaveLength(1)
    expect(container.textContent).toContain('Customer delivery coordinates are missing.')
    expect(container.textContent).not.toContain('Start Navigation')
  })
  it('shows a missing restaurant error and keeps the customer marker', async () => {
    const value = fixture(); value.restaurant.coordinates = null; value.route = null; value.errors = [{ code: 'RESTAURANT_LOCATION_MISSING', message: 'Restaurant location is unavailable.' }]
    await render(value)
    expect(container.querySelectorAll('.leaflet-interactive')).toHaveLength(1)
    expect(container.textContent).toContain('Restaurant location is unavailable.')
  })
})
