import { Bike, CheckCircle2, Eye, EyeOff, MessageCircle, Phone, Store, UserRound, Utensils } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AppApiError } from '../core/api/apiError'
import { roleHome, useAuth } from '../core/auth/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import { authApi } from '../core/api/services'

const roleInfo = {
  customer: { label: 'Customer', icon: UserRound, description: 'Order local favourites and track deliveries.' },
  restaurant_owner: { label: 'Restaurant owner', icon: Store, description: 'Manage your restaurant, menu and orders.' },
  delivery_rider: { label: 'Delivery rider', icon: Bike, description: 'Deliver orders and track your earnings.' },
} as const
type RegistrationRole = keyof typeof roleInfo

export function AuthV2Page({ mode }: { mode: 'login' | 'register' }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const auth = useAuth()
  const queryRole = params.get('role') as RegistrationRole | null

  const [role, setRole] = useState<RegistrationRole>(queryRole && roleInfo[queryRole] ? queryRole : 'customer')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const selected = roleInfo[role]
  const SelectedIcon = selected.icon
  const adminWhatsApp = String(import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')
  const adminPhone = String(import.meta.env.VITE_ADMIN_PHONE_NUMBER ?? '').trim()

  const resendVerification = async () => {
    if (!email.trim()) { setError('Enter your email address first.'); return }
    setResending(true); setError(''); setResendMessage('')
    try { setResendMessage(await authApi.resendVerification(email)) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to resend the verification email.') }
    finally { setResending(false) }
  }

  // Google Login Handler
  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    setBusy(true)
    setError('')
    try {
      if (!credentialResponse.credential) throw new Error('Google authentication returned no credential.')
      const user = await auth.googleLogin(credentialResponse.credential)
      navigate(roleHome[user.role], { replace: true })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Google Authentication failed.')
    } finally {
      setBusy(false)
    }
  }

  // Normal Form Submission
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')

    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') ?? '')

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.')
      setBusy(false)
      return
    }

    try {
      if (mode === 'login') {
        const user = await auth.login(String(form.get('email')), password, form.get('remember') === 'on')
        navigate(roleHome[user.role], { replace: true })
      } else {
        const confirm = String(form.get('confirmPassword'))
        if (password !== confirm) throw new Error('Passwords do not match.')

        const message = await auth.register(role, {
          name: String(form.get('name')),
          email: String(form.get('email')),
          password,
          phone: String(form.get('phone')),
          address: String(form.get('address')),
        })

        setSuccess(message)
      }
    } catch (caught) {
      const message = caught instanceof AppApiError || caught instanceof Error ? caught.message : 'Something went wrong.'
      setError(
        message.startsWith('Account is ')
          ? `${message}. Restaurant-owner and rider accounts can sign in only after administrator approval.`
          : message
      )
    } finally {
      setBusy(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="application-success">
          <span><CheckCircle2 /></span>
          <h1>{role === 'customer' ? 'Ayubowan to Foodie!' : 'Thank you for joining us!'}</h1>
          <p>{role === 'customer'
            ? `${success} Please check your inbox and verify your email before signing in.`
            : `${success} Please verify your email first. Our administrator will review your application and Foodie will email you when it is approved.`}</p>
          {role !== 'customer' && <p className="pending-note">You cannot sign in while the application is pending. If you have any questions, contact the Foodie administrator.</p>}
          {(adminWhatsApp || adminPhone) && <div className="application-contact-actions">
            {adminWhatsApp && <a className="button button--primary" href={`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent('Hello Foodie Admin, I have a question about my registration application.')}`} target="_blank" rel="noreferrer"><MessageCircle/>Contact on WhatsApp</a>}
            {adminPhone && <a className="button button--secondary" href={`tel:${adminPhone}`}><Phone/>Call Admin</a>}
          </div>}
          <Link to="/">Return to Foodie</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <Link className="auth-brand" to="/">
        <span><Utensils size={21} /></span> Foodie
      </Link>
      <div className="auth-shell">
        <section className="auth-intro">
          <span className="eyebrow">One platform, every role</span>
          <h1>{mode === 'login' ? 'Ayubowan!' : 'Join Foodie.'}</h1>
          <p>{mode === 'login' ? 'Sign in once and we’ll take you to the right workspace.' : 'Choose how you’ll use Foodie and create your account.'}</p>
          {mode === 'register' && (
            <div className="role-options">
              {Object.entries(roleInfo).map(([key, info]) => {
                const Icon = info.icon
                return (
                  <button className={role === key ? 'active' : ''} type="button" onClick={() => setRole(key as RegistrationRole)} key={key}>
                    <Icon />
                    <span><strong>{info.label}</strong><small>{info.description}</small></span>
                    {role === key && <CheckCircle2 />}
                  </button>
                )
              })}
            </div>
          )}
          {mode === 'login' && (
            <div className="auth-local-copy">
              <strong>From Colombo to Kandy, your favourites are closer.</strong>
              <p>One secure account for customers, restaurant partners and delivery riders.</p>
            </div>
          )}
        </section>

        <form className="auth-form" onSubmit={submit} noValidate>
          <span className="auth-role-icon"><SelectedIcon /></span>
          <h2>{mode === 'login' ? 'Sign in to Foodie' : role === 'customer' ? 'Create customer account' : `${selected.label} application`}</h2>

          {error && (
            <div className="form-alert" role="alert">
              {error}
              <button type="button" onClick={() => setError('')}>×</button>
            </div>
          )}

          {resendMessage && <div className="success-banner" role="status"><CheckCircle2 />{resendMessage}</div>}

          {mode === 'register' && (
            <label>Full name
              <input required name="name" autoComplete="name" placeholder="Enter your full name" />
            </label>
          )}

          <label>Email address
            <input required name="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)} />
          </label>

          {mode === 'login' && error.toLowerCase().includes('verify') && (
            <button type="button" className="button button--secondary button--full" disabled={resending} onClick={() => void resendVerification()}>
              {resending ? 'Sending…' : 'Resend verification email'}
            </button>
          )}

          {mode === 'register' && (
            <>
              <label>Phone number
                <input required name="phone" type="tel" autoComplete="tel" placeholder="07X XXX XXXX" />
              </label>
              <label>Address
                <textarea required name="address" autoComplete="street-address" placeholder="Your delivery or business address" />
              </label>
            </>
          )}

          <label>Password
            <div className="password-field">
              <input required name="password" type={showPassword ? 'text' : 'password'} minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="At least 6 characters" />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>

          {mode === 'register' && (
            <label>Confirm password
              <input required name="confirmPassword" type="password" minLength={6} autoComplete="new-password" placeholder="Repeat your password" />
            </label>
          )}

          <label className="check">
            <input name={mode === 'login' ? 'remember' : 'terms'} type="checkbox" required={mode === 'register'} defaultChecked={mode === 'login'} />
            {mode === 'login' ? 'Remember me on this device' : 'I accept the Terms and Conditions'}
          </label>

          {mode === 'register' && role !== 'customer' && (
            <div className="pending-note">Applications are reviewed by an administrator. You cannot sign in until your account is approved.</div>
          )}

          <button className="button button--primary button--full" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : role === 'customer' ? 'Create account' : 'Submit application'}
          </button>

          {/* Google Login Component (Form එක ඇතුළට එකතු කරන ලදී) */}
          <div className="auth-divider" style={{ textAlign: 'center', margin: '15px 0', color: '#666' }}>
            <span>OR</span>
          </div>

          <div className="google-auth-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Sign In was unsuccessful. Try again.')}
            />
          </div>

          <p>
            {mode === 'login' ? 'New to Foodie?' : 'Already have an account?'}
            <Link to={mode === 'login' ? '/register' : '/login'}>
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
