import { Banknote, CreditCard, LockKeyhole, MapPin, ShoppingBag, WalletCards } from 'lucide-react';
import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderApi, paymentApi } from '../core/api/services';
import { AppApiError } from '../core/api/apiError';
import { useAuth } from '../core/auth/AuthContext';
import { formatLkr } from '../services/sriLankanData';
import { useCart } from '../store/CartContext';
import { environment } from '../core/config/environment';

// Stripe Packages Import
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe instance safely with a string fallback to prevent uncaught runtime errors
const stripeKey = environment?.stripePublishableKey || '';
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// =========================================================================
// 1. Stripe Card Input Component
// =========================================================================
interface StripeFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
  busy: boolean;
  setBusy: (state: boolean) => void;
}

const StripePaymentForm = ({ clientSecret, onSuccess, onError, busy, setBusy }: StripeFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleCardPayment = async () => {
    if (!stripe || !elements) return;

    setBusy(true);
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setBusy(false);
      return;
    }

    const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      onError(error.message || 'Payment processing failed.');
      setBusy(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    }
  };

  return (
    <div className="stripe-card-form" style={{ marginTop: '1rem' }}>
      <div 
        className="stripe-input-container" 
        style={{ 
          padding: '14px', 
          border: '1px solid #d1d5db', 
          borderRadius: '8px', 
          background: '#ffffff',
          minHeight: '45px'
        }}
      >
        <CardElement 
          options={{ 
            disableLink: true, // Stripe Link Popup එක Disable කරයි
            style: { 
              base: { 
                fontSize: '16px', 
                color: '#1f2937',
                '::placeholder': { color: '#9ca3af' },
              },
              invalid: { color: '#ef4444' } 
            } 
          }} 
        />
      </div>
      
      <button 
        type="button" 
        onClick={() => void handleCardPayment()}
        className="button button--primary button--full" 
        disabled={!stripe || busy} 
        style={{ marginTop: '1rem' }}
      >
        {busy ? 'Processing Card…' : 'Pay and Place Order'}
      </button>
    </div>
  );
};

// =========================================================================
// 2. Main Checkout Page Component
// =========================================================================
export function CheckoutConnectedPage() {
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState<'cash' | 'wallet' | 'card'>('cash');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const delivery = 350;
  const total = cart.subtotal + delivery;

  useEffect(() => {
    let isMounted = true;

    if (method === 'card' && cart.lines.length > 0) {
      setBusy(true);
      setError('');

      fetch('http://localhost:5000/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Server error: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (!isMounted) return;
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            setError('Failed to initialize payment gateway.');
          }
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error('Stripe Init Error:', err);
          setError(err.message || 'Unable to connect to payment server. Make sure your backend is running on port 5000.');
        })
        .finally(() => {
          if (isMounted) setBusy(false);
        });
    } else {
      setBusy(false);
    }

    return () => {
      isMounted = false;
    };
  }, [method, total, cart.lines.length]);

  const handleOrderSuccess = (orderId: string) => {
    cart.clearCart();
    navigate(`/orders/${orderId}?placed=true`, { replace: true });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cart.lines.length) return;

    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);

    try {
      const order = await orderApi.place({
        restaurant: cart.lines[0].restaurantId,
        items: cart.lines.map((line) => ({ menuItem: line.id, quantity: line.quantity })),
        deliveryAddress: String(form.get('address')),
        note: String(form.get('note')) || undefined,
      });

      if (method === 'wallet') {
        throw new AppApiError('Foodie Wallet payments need a backend wallet endpoint and cannot be completed yet. Please choose cash on delivery or card.');
      }

      if (method === 'cash') {
        handleOrderSuccess(order._id);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to place your order.');
    } finally {
      if (method !== 'card') setBusy(false);
    }
  };

  if (!cart.lines.length) {
    return (
      <div className="page container">
        <div className="empty-state empty-state--large">
          <ShoppingBag />
          <h1>Your cart is empty</h1>
          <p>Add a local favourite before checking out.</p>
          <Link className="button button--primary" to="/restaurants">Browse restaurants</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page container">
      <div className="page-title">
        <span className="eyebrow">Almost there</span>
        <h1>Checkout</h1>
        <p>Review your delivery details and payment choice.</p>
      </div>

      {error && <div className="form-alert" role="alert">{error}</div>}

      <form id="checkout-form" className="checkout-grid" onSubmit={(e) => void submit(e)}>
        <section className="checkout-panel">
          <h2><MapPin /> Delivery address</h2>
          <div className="form-grid">
            <label>Full name<input required defaultValue={user?.name} /></label>
            <label>Phone<input required defaultValue={user?.phone} /></label>
            <label className="full">
              Delivery address
              <textarea name="address" required defaultValue={user?.address} placeholder="House number, street, city" />
            </label>
            <label className="full">
              Order notes
              <textarea name="note" placeholder="Spice preference, landmark or delivery instructions" />
            </label>
          </div>
        </section>

        <section className="checkout-panel">
          <h2><CreditCard /> Payment method</h2>
          <div className="checkout-methods">
            <label className={method === 'cash' ? 'selected' : ''}>
              <input type="radio" name="payment" checked={method === 'cash'} onChange={() => setMethod('cash')} />
              <Banknote />
              <span>
                <strong>Cash on delivery</strong>
                <small>Pay your rider when the order arrives</small>
              </span>
            </label>

            <label className={method === 'card' ? 'selected' : ''}>
              <input type="radio" name="payment" checked={method === 'card'} onChange={() => setMethod('card')} />
              <CreditCard />
              <span>
                <strong>Card payment</strong>
                <small>Pay securely with Visa / Mastercard (LKR)</small>
              </span>
            </label>

            <label className={method === 'wallet' ? 'selected' : ''}>
              <input type="radio" name="payment" checked={method === 'wallet'} onChange={() => setMethod('wallet')} />
              <WalletCards />
              <span>
                <strong>Foodie Wallet</strong>
                <small>Not yet supported by the backend</small>
              </span>
            </label>
          </div>

          {method === 'card' && !stripeKey && (
            <div className="form-alert" role="alert" style={{ marginTop: '1rem' }}>
              Stripe publishable key is missing. Add VITE_STRIPE_PUBLISHABLE_KEY to the frontend .env file, then restart Vite.
            </div>
          )}

          {method === 'card' && stripePromise && !clientSecret && !busy && !error && (
            <p className="secure-note" style={{ marginTop: '1rem' }}>Preparing secure card payment…</p>
          )}

          {method === 'card' && clientSecret && stripePromise && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Enter Card Details</h3>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm 
                  clientSecret={clientSecret}
                  busy={busy}
                  setBusy={setBusy}
                  onError={(msg) => setError(msg)}
                  onSuccess={async () => {
                    const form = new FormData(document.getElementById('checkout-form') as HTMLFormElement);
                    try {
                      const order = await orderApi.place({
                        restaurant: cart.lines[0].restaurantId,
                        items: cart.lines.map((line) => ({ menuItem: line.id, quantity: line.quantity })),
                        deliveryAddress: String(form.get('address')),
                        note: String(form.get('note')) || undefined,
                      });
                      await paymentApi.start(order._id);
                      handleOrderSuccess(order._id);
                    } catch (err) {
                      setError('Payment succeeded but failed to save order.');
                    }
                  }}
                />
              </Elements>
            </div>
          )}

          <div className="secure-note" style={{ marginTop: '1rem' }}>
            <LockKeyhole /> Card payments are processed securely via Stripe Test Mode.
          </div>
        </section>

        <aside className="summary-card checkout-summary">
          <h2>Order summary</h2>
          {cart.lines.map((line) => (
            <div className="mini-line" key={line.id}>
              <img src={line.image} alt={line.name} />
              <span>{line.name}<small>Qty: {line.quantity}</small></span>
              <b>{formatLkr(line.price * line.quantity)}</b>
            </div>
          ))}
          <div className="summary-row"><span>Subtotal</span><b>{formatLkr(cart.subtotal)}</b></div>
          <div className="summary-row"><span>Delivery</span><b>{formatLkr(delivery)}</b></div>
          <div className="summary-total"><span>Total</span><strong>{formatLkr(total)}</strong></div>

          {method !== 'card' && (
            <button className="button button--primary button--full" disabled={busy || method === 'wallet'}>
              {busy ? 'Placing order…' : 'Place order'}
            </button>
          )}
        </aside>
      </form>
    </div>
  );
}
