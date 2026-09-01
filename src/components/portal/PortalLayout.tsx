import { BarChart3, Bike, ClipboardList, LayoutDashboard, LogOut, MenuSquare, Settings, Store, UserRound } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../core/auth/AuthContext'

const ownerLinks = [[LayoutDashboard, 'Overview', '/owner'], [ClipboardList, 'Orders', '/owner/orders'], [MenuSquare, 'Menu & stock', '/owner/menu'], [BarChart3, 'Analytics', '/owner/analytics'], [Settings, 'Restaurant profile', '/owner/profile']] as const
const riderLinks = [[LayoutDashboard, 'Overview', '/rider'], [Bike, 'Delivery requests', '/rider/jobs'], [ClipboardList, 'Trip history', '/rider/earnings'], [UserRound, 'Rider profile', '/rider/profile']] as const

export function PortalLayout() {
  const role = useLocation().pathname.startsWith('/owner') ? 'owner' : 'rider'; const links = role === 'owner' ? ownerLinks : riderLinks; const { user, signOut } = useAuth()
  return <div className={`portal portal--${role}`}><aside className="portal-sidebar"><Link className="portal-brand" to="/"><span>{role === 'owner' ? <Store /> : <Bike />}</span><div><strong>Foodie</strong><small>{role === 'owner' ? 'Restaurant portal' : 'Rider portal'}</small></div></Link><nav>{links.map(([Icon, label, to]) => <NavLink end={to === `/${role}`} key={to} to={to}><Icon size={19} /> {label}</NavLink>)}</nav><button className="portal-logout" onClick={signOut}><LogOut size={18} /> Sign out</button></aside><div className="portal-main"><header className="portal-topbar"><div><span className="eyebrow">{role === 'owner' ? 'Restaurant partner' : 'Delivery partner'}</span><strong>{role === 'owner' ? 'Restaurant workspace' : `Ayubowan, ${user?.name ?? 'rider'}`}</strong></div><Link to={`/${role}/profile`}><span className="avatar"><UserRound size={19} /></span><span>{user?.name}</span></Link></header><main className="portal-content"><Outlet /></main></div></div>
}
