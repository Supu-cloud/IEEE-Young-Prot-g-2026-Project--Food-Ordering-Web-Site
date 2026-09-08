import { Menu, ShoppingBag, UserRound, X, Utensils } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../../store/CartContext'
import { useAuth } from '../../core/auth/AuthContext'

export function Header() {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { count } = useCart()
  const { user, signOut } = useAuth()
  const links = [['/', 'Home'], ['/restaurants', 'Restaurants'], ['/sweets', 'Sweet Shop'], ['/orders', 'Orders']] as const
  return <header className="site-header"><div className="container header-inner">
    <Link className="brand" to="/" onClick={() => setOpen(false)}><span className="brand-mark"><Utensils size={21} /></span><span>Foodie</span></Link>
    <button className="mobile-menu" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <nav className={`main-nav ${open ? 'main-nav--open' : ''}`} aria-label="Primary navigation">
      {links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>)}
      <NavLink className="cart-link" to="/cart" onClick={() => setOpen(false)}><ShoppingBag size={18} /> Cart {count > 0 && <span className="cart-count">{count}</span>}</NavLink>
    </nav>
    {user?.role === 'customer' ? <div className="profile-menu"><button className="user-link user-button" aria-expanded={profileOpen} onClick={() => setProfileOpen(value => !value)}><span className="avatar"><UserRound size={19} /></span><span>{user.name}</span></button>{profileOpen && <div className="profile-menu__panel"><Link to="/profile" onClick={() => setProfileOpen(false)}>Profile</Link><Link to="/orders" onClick={() => setProfileOpen(false)}>Orders</Link><button onClick={signOut}>Logout</button></div>}</div> : user ? <button className="user-link user-button" onClick={signOut}><span className="avatar"><UserRound size={19} /></span><span>Sign out</span></button> : <Link className="user-link" to="/login"><span className="avatar"><UserRound size={19} /></span><span>Sign in</span></Link>}
  </div></header>
}
