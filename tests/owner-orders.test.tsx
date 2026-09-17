import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { OwnerOrdersV2Page } from '../src/pages/owner/OwnerOrdersV2Page'
import { orderApi, ownerApi } from '../src/core/api/services'
import { restaurantChanged } from '../src/core/api/restaurantRefresh'
import type { ApiOrder, OrderStatus } from '../src/core/types/api'

vi.mock('../src/core/api/services', () => ({ ownerApi: { orders: vi.fn() }, orderApi: { status: vi.fn() } }))
vi.mock('../src/core/api/restaurantRefresh', () => ({ restaurantChanged: vi.fn() }))
const fixture = (status: OrderStatus, id = 'order1'): ApiOrder => ({ _id: id, status, customer: { _id: 'c', name: 'Customer', email: 'c@example.test' }, restaurant: 'r', items: [{ menuItem: 'food', name: 'Rice', quantity: 1, price: 500 }], totalAmount: 850, deliveryAddress: 'Address', paymentStatus: 'paid', createdAt: '2026-09-16T12:00:00Z' })
let root: Root, container: HTMLDivElement, saved: ApiOrder[]
beforeEach(() => {
  saved = [fixture('placed'), fixture('delivered', 'order2'), fixture('delivery_failed', 'order3')]
  vi.mocked(ownerApi.orders).mockImplementation(async () => structuredClone(saved))
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.clearAllMocks(); vi.useRealTimers(); delete document.documentElement.dataset.theme })
const render = () => act(async () => root.render(<MemoryRouter><OwnerOrdersV2Page /></MemoryRouter>))
const card = () => container.querySelector<HTMLElement>('[data-order-id="order1"]')!
const button = (text: string) => [...card().querySelectorAll('button')].find(item => item.textContent === text)!
const expectStatus = (status: string, color: string) => { expect(card().dataset.status).toBe(status); expect(card().style.getPropertyValue('--order-color')).toBe(color) }

for (const theme of ['light', 'dark']) it(`confirms every transition before changing color and actions in ${theme}`, async () => {
  document.documentElement.dataset.theme = theme
  await render()
  for (const [old, oldColor, action, next, nextColor] of [
    ['placed', '#F59E0B', 'Accept order', 'confirmed', '#3B82F6'],
    ['confirmed', '#3B82F6', 'Start preparing', 'preparing', '#F97316'],
    ['preparing', '#F97316', 'Ready for pickup', 'ready_for_pickup', '#22C55E'],
  ]) {
    let resolve!: (order: ApiOrder) => void
    vi.mocked(orderApi.status).mockImplementationOnce(() => new Promise(done => { resolve = done }))
    await act(async () => button(action).click())
    expectStatus(old, oldColor)
    expect([...card().querySelectorAll('button')].every(item => item.disabled)).toBe(true)
    expect(card().textContent).toContain('Saving')
    saved[0] = fixture(next as OrderStatus)
    await act(async () => resolve({ ...saved[0], customer: 'c' }))
    expectStatus(next, nextColor)
    expect(card().textContent).toContain('Customer')
  }
  expect(restaurantChanged).toHaveBeenCalledTimes(3)
  expect(container.querySelector('[aria-label="Incoming count"]')?.textContent).toBe('0')
  expect(container.querySelector('[aria-label="Ready for pickup count"]')?.textContent).toBe('1')
  expect(container.querySelector('[data-order-id="order2"]')?.getAttribute('data-status')).toBe('delivered')
  expect(container.querySelector('[data-order-id="order3"]')?.getAttribute('data-status')).toBe('delivery_failed')
  await act(async () => root.unmount()); root = createRoot(container); await render()
  expectStatus('ready_for_pickup', '#22C55E')
})

for (const [status, color, action] of [['placed', '#F59E0B', 'Accept order'], ['confirmed', '#3B82F6', 'Start preparing'], ['preparing', '#F97316', 'Ready for pickup']]) {
  it(`keeps ${status} and its color on API failure and enables retry`, async () => {
    saved = [fixture(status as OrderStatus)]; await render()
    vi.mocked(orderApi.status).mockRejectedValueOnce(new Error('Backend rejected the update'))
    await act(async () => button(action).click())
    expectStatus(status, color)
    expect(card().textContent).toContain('Backend rejected the update')
    expect(button(action).disabled).toBe(false)
    expect(restaurantChanged).not.toHaveBeenCalled()
  })
}

it('keeps the confirmed response if the following refresh fails', async () => {
  await render()
  vi.mocked(orderApi.status).mockResolvedValueOnce(fixture('confirmed'))
  vi.mocked(ownerApi.orders).mockRejectedValueOnce(new Error('Refresh offline'))
  await act(async () => button('Accept order').click())
  expectStatus('confirmed', '#3B82F6')
  expect(container.textContent).toContain('Refresh offline')
  expect(button('Start preparing')).toBeDefined()
})

it('ignores an older poll that completes after the backend-confirmed mutation', async () => {
  vi.useFakeTimers(); await render()
  let finishPoll!: (orders: ApiOrder[]) => void
  vi.mocked(ownerApi.orders).mockImplementationOnce(() => new Promise(done => { finishPoll = done }))
  await act(async () => { await vi.advanceTimersByTimeAsync(7000) })
  vi.mocked(orderApi.status).mockResolvedValueOnce(fixture('confirmed'))
  await act(async () => button('Accept order').click())
  await act(async () => finishPoll([fixture('placed')]))
  expectStatus('confirmed', '#3B82F6')
})
