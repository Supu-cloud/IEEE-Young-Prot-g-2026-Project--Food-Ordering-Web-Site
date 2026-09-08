import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck, Utensils } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AppApiError } from '../../core/api/apiError'
import { roleHome, useAuth } from '../../core/auth/AuthContext'

export function AdminLoginPage() {
  const { user, restoring, login, signOut } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  if (restoring) return <div className="route-loading"><span className="spinner" /><p>Checking your Foodie session…</p></div>
  if (user) return <Navigate to={roleHome[user.role]} replace />

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      const authenticatedUser = await login(String(form.get('email') ?? ''), String(form.get('password') ?? ''), form.get('remember') === 'on')
      if (authenticatedUser.role !== 'admin') {
        signOut()
        setError('This portal is restricted to authorized administrators.')
        return
      }
      navigate('/admin', { replace: true })
    } catch (caught) {
      const message = caught instanceof AppApiError || caught instanceof Error ? caught.message : ''
      setError(message.startsWith('Account is ') ? `${message}. Please contact an administrator.` : message || 'Unable to sign in right now. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="admin-login-page">
    <Link className="admin-login-brand" to="/"><span><Utensils size={21} /></span><strong>Foodie</strong></Link>
    <div className="admin-login-shell">
      <section className="admin-login-intro"><span className="admin-login-mark"><ShieldCheck /></span><span className="eyebrow">Foodie operations</span><h1>Admin Portal</h1><p>Secure access for authorized Foodie administrators.</p><div className="admin-login-trust"><LockKeyhole /><span><strong>Protected workspace</strong><small>System data and approval tools are restricted to approved administrators.</small></span></div></section>
      <form className="admin-login-form" onSubmit={submit} noValidate>
        <div><span className="eyebrow">Welcome back</span><h2>Admin sign in</h2><p>Use your administrator account to continue.</p></div>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <label htmlFor="admin-email">Email address</label><input id="admin-email" name="email" type="email" required autoComplete="username" placeholder="you@company.com" />
        <label htmlFor="admin-password">Password</label><div className="admin-password-field"><input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" placeholder="Enter your password" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff /> : <Eye />}</button></div>
        <label className="admin-remember"><input name="remember" type="checkbox" defaultChecked />Remember me on this device</label>
        <button className="button button--primary button--full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'}</button>
        <Link className="admin-login-back" to="/"><ArrowLeft />Back to Foodie</Link>
      </form>
    </div>
  </main>
}
