import { Link } from 'react-router-dom'
export function NotFoundPage() { return <div className="page container"><div className="empty-state empty-state--large"><span className="eyebrow">404</span><h1>That page isn’t on the menu</h1><p>Let’s get you back to something delicious.</p><Link className="button button--primary" to="/">Go home</Link></div></div> }
