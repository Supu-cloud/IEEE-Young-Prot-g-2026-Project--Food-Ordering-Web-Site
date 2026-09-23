import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })

describe('backend image URLs', () => {
  it.each(['https://backend.example/api', 'http://localhost:5000/api'])('uses the origin of %s', async base => {
    vi.stubEnv('VITE_API_BASE_URL', base)
    const { resolveImageUrl } = await import('../src/core/api/imageUrl')
    const origin = new URL(base).origin
    const path = '/images/food/creamy-cheese-delight-pizza.jpg'
    for (const value of [path, ` ${path} `, path.slice(1), `http://localhost:5000${path}`, `http://127.0.0.1:5000${path}`]) {
      expect(resolveImageUrl(value)).toBe(`${origin}${path}`)
    }
    expect(resolveImageUrl(`http://localhost:5000${path}?v=2#preview`)).toBe(`${origin}${path}?v=2#preview`)
    const external = 'https://cdn.example/images/photo.jpg?v=1'
    expect(resolveImageUrl(external)).toBe(external)
    for (const value of [undefined, '', '   ', 'javascript:alert(1)', 'data:image/png;base64,abc', 'http://[invalid']) {
      expect(resolveImageUrl(value)).toBeUndefined()
    }
  })
})
