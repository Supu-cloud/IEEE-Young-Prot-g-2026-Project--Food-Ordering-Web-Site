import { Bike, CheckCircle2, Store, UserRound, Utensils } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

const roleInfo = {
  customer: { label: 'Customer', icon: UserRound, home: '/', description: 'Order food and track deliveries.' },
  owner: { label: 'Restaurant owner', icon: Store, home: '/owner', description: 'Manage your restaurant and orders.' },
  rider: { label: 'Delivery rider', icon: Bike, home: '/rider', description: 'Accept deliveries and track earnings.' },
} as const

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const [params] = useSearchParams(); const navigate = useNavigate(); const initial = params.get('role') as keyof typeof roleInfo | null
  const [role, setRole] = useState<keyof typeof roleInfo>(initial && roleInfo[initial] ? initial : 'customer'); const [busy, setBusy] = useState(false); const selected = roleInfo[role]
  const SelectedIcon = selected.icon
  const submit = (event: FormEvent) => { event.preventDefault(); setBusy(true); window.setTimeout(() => navigate(selected.home), 350) }
  return <div className="auth-page"><Link className="auth-brand" to="/"><span><Utensils /></span> FeastFlow</Link><div className="auth-shell"><section className="auth-intro"><span className="eyebrow">One platform, every role</span><h1>{mode === 'login' ? 'Welcome back.' : 'Join FeastFlow.'}</h1><p>{mode === 'login' ? 'Sign in to continue to your personalized workspace.' : 'Create the account that fits how you use FeastFlow.'}</p><div className="role-options">{Object.entries(roleInfo).map(([key, info]) => { const Icon = info.icon; return <button className={role === key ? 'active' : ''} type="button" onClick={() => setRole(key as keyof typeof roleInfo)} key={key}><Icon /><span><strong>{info.label}</strong><small>{info.description}</small></span>{role === key && <CheckCircle2 />}</button> })}</div></section><form className="auth-form" onSubmit={submit}><span className="auth-role-icon"><SelectedIcon /></span><h2>{mode === 'login' ? `${selected.label} login` : `Create ${selected.label.toLowerCase()} account`}</h2>{mode === 'register' && <><label>Full name<input required placeholder="Enter your full name" /></label>{role === 'owner' && <label>Restaurant name<input required placeholder="Your restaurant name" /></label>}</>}<label>Email address<input required type="email" placeholder="you@example.com" /></label>{mode === 'register' && <label>Phone number<input required type="tel" placeholder="Your phone number" /></label>}<label>Password<input required type="password" minLength={6} placeholder="At least 6 characters" /></label>{mode === 'register' && <label>Confirm password<input required type="password" minLength={6} placeholder="Repeat your password" /></label>}<label className="check"><input type="checkbox" required={mode === 'register'} /> {mode === 'login' ? 'Remember me' : 'I agree to the Terms and Privacy Policy'}</label><button className="button button--primary button--full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button><p>{mode === 'login' ? 'New to FeastFlow?' : 'Already have an account?'} <Link to={`${mode === 'login' ? '/register' : '/login'}?role=${role}`}>{mode === 'login' ? 'Create an account' : 'Sign in'}</Link></p></form></div></div>
}
