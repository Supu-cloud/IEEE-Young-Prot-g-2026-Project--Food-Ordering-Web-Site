import { useCallback, useEffect, useState } from 'react'

export function useAsyncResource<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const load = useCallback(async () => { setLoading(true); setError(''); try { setData(await loader()) } catch (caught) { setError(caught instanceof Error ? caught.message : 'Something went wrong.') } finally { setLoading(false) } }, [loader])
  // The effect intentionally starts the external API synchronization.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load() }, [load])
  return { data, loading, error, retry: load, setData }
}
