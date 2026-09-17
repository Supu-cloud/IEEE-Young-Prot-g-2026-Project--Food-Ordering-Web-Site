import { useCallback, useEffect, useRef, useState } from 'react'

export function useAsyncResource<T>(loader: () => Promise<T>, pollMs = 0, refreshEvent?: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshError, setRefreshError] = useState('')
  const [source, setSource] = useState(() => loader)
  const sequence = useRef(0)
  const loadRef = useRef<() => Promise<void>>(async () => {})
  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined
    let inFlight = false
    let loaded = false
    const load = async () => {
      if (inFlight || !active) return
      inFlight = true
      clearTimeout(timer)
      const request = ++sequence.current
      try {
        const result = await loader()
        if (active && request === sequence.current) {
          setData(result); setError(''); setRefreshError(''); loaded = true
        }
      } catch (caught) {
        if (active && request === sequence.current) {
          const message = caught instanceof Error ? caught.message : 'Unable to refresh orders'
          if (loaded) setRefreshError(message); else setError(message)
        }
      } finally {
        inFlight = false
        if (active) {
          setSource(() => loader)
          setLoading(false)
          if (pollMs > 0) timer = setTimeout(() => void load(), pollMs)
        }
      }
    }
    const refresh = () => { void load() }
    if (refreshEvent) window.addEventListener(refreshEvent, refresh)
    loadRef.current = load
    // Start synchronization with the external API; cleanup prevents stale writes.
    void load()
    return () => { active = false; clearTimeout(timer); if (refreshEvent) window.removeEventListener(refreshEvent, refresh) }
  }, [loader, pollMs, refreshEvent])
  const retry = useCallback(() => loadRef.current(), [])
  // Invalidate older polls before applying a backend-confirmed mutation.
  const commit = useCallback((update: (current: T | null) => T | null) => {
    ++sequence.current; setData(update); setRefreshError('');
  }, [])
  return { data: source === loader ? data : null, loading: loading || source !== loader,
    error: source === loader ? error : '', refreshError: source === loader ? refreshError : '', retry, setData, commit }
}
