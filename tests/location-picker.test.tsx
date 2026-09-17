import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { CoordinateFields } from '../src/components/CoordinateFields'

let root: Root
let container: HTMLDivElement
beforeEach(() => {
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(async () => { await act(async () => root.unmount()); container.remove() })
const button = (text: string) => [...container.querySelectorAll('button')].find(item => item.textContent === text)!

it('does not save the initial viewport; only confirms an explicitly selected map point', async () => {
  const onChange = vi.fn()
  await act(async () => root.render(<CoordinateFields label="Delivery location" onChange={onChange} />))
  await act(async () => button('Choose location on map').click())
  expect(button('Confirm location').disabled).toBe(true)
  expect(onChange).not.toHaveBeenCalled()
  await act(async () => container.querySelector('.leaflet-container')!.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 120, clientY: 100 })))
  expect(button('Confirm location').disabled).toBe(false)
  expect(onChange).not.toHaveBeenCalled()
  expect(container.querySelectorAll('.leaflet-interactive')).toHaveLength(1)
  await act(async () => button('Confirm location').click())
  expect(onChange).toHaveBeenCalledOnce()
  const point = onChange.mock.calls[0][0]
  expect(Math.abs(point.latitude)).toBeLessThanOrEqual(90)
  expect(Math.abs(point.longitude)).toBeLessThanOrEqual(180)
  expect(container.querySelector('.leaflet-container')).toBeNull()
})

it('shows saved restaurant coordinates and cancel preserves the saved point', async () => {
  const onChange = vi.fn()
  await act(async () => root.render(<CoordinateFields label="Restaurant location" value={{ latitude: 6.9, longitude: 79.8 }} onChange={onChange} />))
  await act(async () => button('Choose location on map').click())
  expect(container.textContent).toContain('Location selected.')
  expect(container.textContent).not.toContain('6.900000')
  expect(container.textContent).not.toContain('79.800000')
  expect(container.querySelector('input')).toBeNull()
  expect(container.querySelectorAll('.leaflet-interactive')).toHaveLength(1)
  await act(async () => button('Cancel map selection').click())
  expect(onChange).not.toHaveBeenCalled()
})
