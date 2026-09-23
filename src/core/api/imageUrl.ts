import { environment } from '../config/environment'

export function resolveImageUrl(value?: string): string | undefined {
  if (!value?.trim()) return undefined
  try {
    const api = new URL(environment.apiBaseUrl, window.location.origin)
    const trimmed = value.trim()
    const result = new URL(trimmed, `${api.origin}/`)
    if (!['http:', 'https:'].includes(result.protocol)) return undefined
    // Older records may contain a development-host URL; use the configured API origin.
    if (['localhost', '127.0.0.1', '[::1]'].includes(result.hostname)) return `${api.origin}${result.pathname}${result.search}${result.hash}`
    return /^https?:\/\//i.test(trimmed) ? trimmed : result.href
  } catch { return undefined }
}
