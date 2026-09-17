import { vi } from 'vitest'
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
Object.defineProperty(SVGSVGElement.prototype, 'createSVGRect', { value: () => ({}) })
Object.defineProperty(HTMLElement.prototype, 'clientWidth', { get: () => 800 })
Object.defineProperty(HTMLElement.prototype, 'clientHeight', { get: () => 400 })
vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} unobserve() {} })
