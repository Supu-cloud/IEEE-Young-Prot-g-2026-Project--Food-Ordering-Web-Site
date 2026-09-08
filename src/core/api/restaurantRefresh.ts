import { useCallback, useEffect, useRef, useState } from 'react'

const eventName = 'foodie:restaurants-changed'
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(eventName) : null
channel?.addEventListener('message', () => window.dispatchEvent(new Event(eventName)))
export function restaurantChanged() {
  window.dispatchEvent(new Event(eventName))
  channel?.postMessage('refresh')
}

// Restaurant views refetch on mutation, tab focus and while visible. No second data store.
export function useRestaurantResource<T>(loader: () => Promise<T>, pollMs = 30_000) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const generation = useRef(0)
  const load = useCallback(async (background = false) => {
    const id = ++generation.current
    if (!background) setLoading(true)
    try {
      const value = await loader()
      if (id === generation.current) { setData(value); setError('') }
    } catch (caught) {
      if (id === generation.current) setError(caught instanceof Error ? caught.message : 'Unable to refresh restaurants.')
    } finally { if (id === generation.current) setLoading(false) }
  }, [loader])
  useEffect(() => {
    // The first load synchronizes this resource with the backend after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
    const refresh = () => { if (document.visibilityState === 'visible') void load(true) }
    window.addEventListener(eventName, refresh)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    const timer = window.setInterval(refresh, pollMs)
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ++generation.current
      clearInterval(timer)
      window.removeEventListener(eventName, refresh)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [load, pollMs])
  return { data, loading, error, retry: () => load() }
}
