export const mapConfig = {
  tileUrl: import.meta.env.VITE_OSM_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
}
export type Coordinates = { latitude: number; longitude: number }
export const navigationUrl = (point: Coordinates) => `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${point.latitude},${point.longitude}`
export function currentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Location is unavailable in this browser.')); return }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      error => reject(new Error(error.code === 1 ? 'Location permission was denied. The delivery route still works.' : error.code === 3 ? 'Location request timed out. Please retry.' : 'Your current location is unavailable.')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    )
  })
}
