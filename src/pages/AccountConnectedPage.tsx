import { Bell, CreditCard, HelpCircle, LogOut, MapPin, Pencil, UserRound, WalletCards } from 'lucide-react'
import { useCallback, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { profileApi, orderApi } from '../core/api/services'
import { useAsyncResource } from '../core/api/useAsyncResource'
import { useAuth } from '../core/auth/AuthContext'
import { ErrorState, LoadingState } from '../components/ui/AsyncState'
import { formatLkr } from '../services/sriLankanData'
import { PreferenceControls } from '../components/preferences/PreferenceControls'

export function AccountConnectedPage() {
  const auth = useAuth()
  const profileLoader = useCallback(() => Promise.all([profileApi.get(), orderApi.mine()]), [])
  const resource = useAsyncResource(profileLoader)
  const [editing, setEditing] = useState(false)
  if (resource.loading) return <div className="page container"><LoadingState label="Loading your Foodie profile…" /></div>
  if (resource.error || !resource.data) return <div className="page container"><ErrorState message={resource.error || 'Profile not found'} retry={resource.retry} /></div>
  const [user, orders] = resource.data
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await profileApi.update({ name: String(form.get('name')), phone: String(form.get('phone')), address: String(form.get('address')) })
    await auth.refreshUser()
    setEditing(false)
    await resource.retry()
  }
  return <div className="page container"><div className="account-layout">
    <aside className="account-nav"><a className="active" href="#profile"><UserRound /> Profile overview</a><a href="#address"><MapPin /> Addresses</a><a href="#payments"><CreditCard /> Payment methods</a><a href="#preferences"><WalletCards /> Preferences</a><a href="#notifications"><Bell /> Notifications</a><a href="#orders"><UserRound /> Recent activity</a><a href="#help"><HelpCircle /> Help & support</a><button onClick={auth.signOut}><LogOut /> Log out</button></aside>
    <div className="account-content">
      <section className="profile-card" id="profile"><span className="profile-initial">{user.name.charAt(0).toUpperCase()}</span><div><h1>{user.name}</h1><p>{user.email}</p><p>{user.phone || 'Add your phone number'}</p></div><button className="button button--secondary" onClick={() => setEditing(true)}><Pencil /> Edit profile</button></section>
      <section className="account-section" id="address"><div className="section-heading"><h2>Saved addresses</h2></div><article className="saved-address"><MapPin /><div><strong>Default address</strong><p>{user.address || 'Add a delivery address to make checkout faster.'}</p>{user.address && <small>Default</small>}</div></article></section>
      <section className="account-section" id="payments"><div className="section-heading"><h2>Payment methods</h2></div><div className="payment-cards"><article><CreditCard /><span><strong>Payment methods</strong><small>Secure card payments are handled at checkout.</small></span></article><article><WalletCards /><span><strong>Foodie Wallet</strong><small>No saved payment methods yet.</small></span></article></div></section>
      <section className="account-section" id="preferences"><h2>Preferences</h2><p className="profile-muted">Your account preferences are managed securely through Foodie.</p><PreferenceControls /></section>
      <section className="account-section" id="notifications"><h2>Notification settings</h2><div className="settings-list"><label><span><strong>Order updates</strong><small>Preparation and delivery status</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>Offers and promotions</strong><small>Local Foodie deals and new restaurants</small></span><input type="checkbox" defaultChecked /></label></div></section>
      <section className="account-section" id="orders"><div className="section-heading"><h2>Recent orders</h2><Link to="/orders">View all orders</Link></div>{orders.length === 0 ? <p className="profile-muted">Your recent orders will appear here.</p> : <div className="recent-orders">{orders.slice(0, 4).map(order => <div key={order._id}><span>#{order._id.slice(-6).toUpperCase()}</span><strong>{typeof order.restaurant === 'string' ? 'Foodie restaurant' : order.restaurant.name}</strong><span>{new Date(order.createdAt).toLocaleDateString('en-LK')}</span><b>{formatLkr(order.totalAmount)}</b><span className={`api-status api-status--${order.status}`}>{order.status.replaceAll('_', ' ')}</span><Link to={`/orders/${order._id}`}>View details</Link></div>)}</div>}</section>
      <section className="account-section" id="help"><h2>Help & support</h2><p>Need help with an order, payment or account? Contact the Foodie support team.</p><button className="button button--secondary">Contact support</button></section>
    </div>
  </div>{editing && <div className="modal-backdrop" onClick={() => setEditing(false)}><form className="portal-modal" onClick={event => event.stopPropagation()} onSubmit={event => void save(event)}><h2>Edit personal information</h2><label>Name<input name="name" defaultValue={user.name} required /></label><label>Phone<input name="phone" defaultValue={user.phone} /></label><label>Delivery address<textarea name="address" defaultValue={user.address} /></label><button className="button button--primary button--full">Save changes</button></form></div>}</div>
}
