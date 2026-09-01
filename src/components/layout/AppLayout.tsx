import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
export function AppLayout() { return <><Header /><main><Outlet /></main><Footer /></> }
