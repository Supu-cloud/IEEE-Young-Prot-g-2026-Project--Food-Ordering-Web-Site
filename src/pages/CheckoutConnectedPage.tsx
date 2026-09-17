import { CoordinateFields } from '../components/CoordinateFields'
import type { Coordinates } from '../core/config/maps'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { paymentApi } from '../core/api/services'
import type { CheckoutAttempt } from '../core/types/api'
import { useAuth } from '../core/auth/AuthContext'
import { environment } from '../core/config/environment'
import { useCart } from '../store/CartContext'
import { formatLkr } from '../services/sriLankanData'

const testKey = environment.stripePublishableKey?.startsWith('pk_test_')
const stripePromise = testKey ? loadStripe(environment.stripePublishableKey) : null

function CardPayment({ attempt, finish, busy, setBusy, onError }: { attempt: CheckoutAttempt; finish: () => Promise<void>; busy: boolean; setBusy: (busy: boolean) => void; onError: (message: string) => void }) {
  const stripe = useStripe(); const elements = useElements()
  const pay = async () => {
    if (!stripe || !elements || busy) return
    setBusy(true); onError('')
    try {
      // Re-read the same intent first: a lost confirmation response must never
      // cause a second payment attempt after a successful charge.
      const existing = await stripe.retrievePaymentIntent(attempt.clientSecret)
      if (existing.error) throw new Error(existing.error.message)
      if (existing.paymentIntent?.status === 'succeeded') { await finish(); return }
      const card = elements.getElement(CardElement)
      if (!card) throw new Error('Card form is not ready')
      const result = await stripe.confirmCardPayment(attempt.clientSecret, { payment_method: { card } })
      if (result.error) throw new Error(result.error.message)
      if (result.paymentIntent?.status !== 'succeeded') throw new Error('Payment is still processing. Retry this checkout to check its status.')
      await finish()
    } catch (caught) { onError(caught instanceof Error ? caught.message : 'Unable to complete payment. Your checkout reference is saved; retry here.') }
    finally { setBusy(false) }
  }
  return <><div className="checkout-panel"><CardElement /></div><button type="button" className="button button--primary button--full" disabled={busy || !stripe} onClick={() => void pay()}>{busy ? 'Verifying payment and saving order…' : 'Pay with Stripe TEST MODE'}</button></>
}

export function CheckoutConnectedPage() {
  const cart = useCart(); const { user } = useAuth(); const navigate = useNavigate()
  const storageKey = `foodie-checkout:${user?._id}`
  const [attempt, setAttempt] = useState<CheckoutAttempt | null>(null)
  const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  const [recovering, setRecovering] = useState(() => Boolean(localStorage.getItem(storageKey)))
  const [address, setAddress] = useState(user?.address ?? '')
  const [note, setNote] = useState('')
  const [location, setLocation] = useState<Partial<Coordinates>>({})
  useEffect(() => {
    const key = localStorage.getItem(storageKey)
    if (!key) return
    let active = true
    paymentApi.checkout(key).then(value => { if (active) setAttempt(value) }).catch(caught => {
      if (active) setError(caught instanceof Error ? caught.message : 'Unable to recover checkout. Retry without paying again.')
    }).finally(() => { if (active) setRecovering(false) })
    return () => { active = false }
  }, [storageKey])
  const start = async (event: FormEvent) => {
    event.preventDefault(); if (busy) return
    setBusy(true); setError('')
    try {
      if (location.latitude === undefined || location.longitude === undefined || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude) || Math.abs(location.latitude) > 90 || Math.abs(location.longitude) > 180) throw new Error('Select and confirm a valid delivery location on the map.')
      const key = localStorage.getItem(storageKey) ?? crypto.randomUUID()
      // Save before the request so a lost response or reload reuses the same attempt.
      localStorage.setItem(storageKey, key)
      const value = await paymentApi.checkout(key, { items: cart.lines.map(line => ({ menuItem: line.id, quantity: line.quantity })), deliveryAddress: address, deliveryLocation: location.latitude !== undefined && location.longitude !== undefined ? { latitude: location.latitude, longitude: location.longitude } : undefined, note })
      setAttempt(value)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to start checkout') }
    finally { setBusy(false) }
  }
  const finish = async () => {
    if (!attempt) return
    setBusy(true); setError('')
    try {
      const order = await paymentApi.completeCheckout(attempt.checkoutId)
      if (order.paymentStatus !== 'paid' || ('orders' in order && (!order.orders.length || order.orders.some(child => child.paymentStatus !== 'paid')))) throw new Error('Order payment has not been confirmed')
      let cartWarning = false
      try { if ('cartHandled' in order) await cart.refreshCart(); else await cart.clearCart(); localStorage.removeItem(storageKey) } catch { cartWarning = true }
      navigate('orders' in order ? (order.orders.length === 1 ? `/orders/${order.orders[0]._id}${cartWarning ? '?cartWarning=true' : ''}` : `/orders?checkout=${order.checkoutId}${cartWarning ? '&cartWarning=true' : ''}`) : `/orders/${order._id}?placed=true${cartWarning ? '&cartWarning=true' : ''}`, { replace: true })
    } catch (caught) {
      setError(`Payment may have succeeded, but the order is not yet confirmed. Retry saving this same checkout; do not pay again. ${caught instanceof Error ? caught.message : ''}`)
    } finally { setBusy(false) }
  }
  if (recovering) return <div className="page container"><p>Recovering your saved checkout…</p></div>
  if (!attempt && !cart.lines.length && !localStorage.getItem(storageKey)) return <div className="page container"><h1>Your cart is empty</h1><Link to="/restaurants">Browse restaurants</Link></div>
  return <div className="page container"><div className="page-title"><h1>Checkout</h1><p>Stripe TEST MODE — no real money or bank payouts.</p></div>
    {error && <p className="error-banner" role="alert">{error}</p>}
    {cart.syncError && <p className="error-banner" role="alert">Cart: {cart.syncError}</p>}
    {!testKey && <p className="error-banner">Stripe test payments are unavailable. A test publishable key must be configured by the project administrator.</p>}
    <div className="checkout-grid"><section className="checkout-panel">
      {!attempt ? <form onSubmit={event => void start(event)}><h2>Delivery details</h2><label>Delivery address<textarea required maxLength={1000} value={address} onChange={event => setAddress(event.target.value)} /></label><CoordinateFields label="Delivery location" value={location} onChange={setLocation} /><label>Order notes<textarea maxLength={1000} value={note} onChange={event => setNote(event.target.value)} /></label><button className="button button--primary" disabled={busy || !testKey}>{busy ? 'Preparing checkout…' : 'Continue / recover secure checkout'}</button></form>
      : <><h2>Secure test payment</h2><p>Checkout reference: {attempt.checkoutId}</p><p>Deliver to: {attempt.quote.deliveryAddress}</p><p>One payment covers all restaurants. Each restaurant gets its own order and delivery tracking after payment is verified.</p>
        {attempt.status === 'succeeded' ? <button className="button button--primary" disabled={busy} onClick={() => void finish()}>Payment received — save / recover order</button>
        : stripePromise && <Elements stripe={stripePromise}><CardPayment attempt={attempt} finish={finish} busy={busy} setBusy={setBusy} onError={setError} /></Elements>}
        <button type="button" className="button button--secondary" disabled={busy} onClick={() => void finish()}>Check payment and retry saving order</button>
      </>}
    </section><aside className="summary-card"><h2>Order summary</h2>{attempt?.quote.groups?.map(group => <section key={group.restaurant}><h3>{group.restaurantName ?? 'Restaurant'}</h3>{group.items.map(item => <p key={item.menuItem}>{item.quantity} x {item.name}</p>)}<p>Food: {formatLkr(group.subtotal)} + Delivery: {formatLkr(group.deliveryFee)}</p><strong>{formatLkr(group.totalAmount)}</strong></section>)}{(!attempt?.quote.groups ? (attempt?.quote.items ?? cart.lines) : []).map(item => <p key={'menuItem' in item ? item.menuItem : item.id}>{item.quantity} × {item.name} <strong>{formatLkr(item.price * item.quantity)}</strong></p>)}
      <div className="summary-row"><span>Subtotal</span><b>{formatLkr(attempt?.quote.subtotal ?? cart.subtotal)}</b></div><div className="summary-row"><span>Delivery fee</span><b>{formatLkr(attempt?.quote.deliveryFee ?? new Set(cart.lines.map(line => line.restaurantId)).size * 350)}</b></div><div className="summary-total"><span>Total</span><b>{formatLkr(attempt?.quote.totalAmount ?? cart.subtotal + new Set(cart.lines.map(line => line.restaurantId)).size * 350)}</b></div><small>The backend validates menu items and calculates the payable total.</small></aside></div></div>
}
