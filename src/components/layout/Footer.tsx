import { Link } from 'react-router-dom'
const groups = [
  ['Company', 'About Us', 'Careers', 'Blog', 'Press'],
  ['For Restaurants', 'Partner with Us', 'Restaurant Login', 'Support'],
  ['Legal', 'Terms of Service', 'Privacy Policy', 'Cookie Policy'],
  ['Connect', 'Contact Us', 'FAQ'],
]
export function Footer() { const routeFor = (item: string) => item === 'Restaurant Login' ? '/login' : item === 'Partner with Us' ? '/register?role=restaurant_owner' : '/help'; return <footer className="site-footer"><div className="container footer-grid">{groups.map(([title, ...items]) => <div key={title}><h3>{title}</h3>{items.map((item) => <Link key={item} to={routeFor(item)}>{item}</Link>)}</div>)}</div><div className="container copyright">© 2026 Foodie. Made with care in Sri Lanka.</div></footer> }
