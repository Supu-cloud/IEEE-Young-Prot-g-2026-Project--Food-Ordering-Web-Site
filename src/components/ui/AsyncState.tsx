import { Inbox, RefreshCw } from 'lucide-react'
export function LoadingState({ label = 'Loading…' }: { label?: string }) { return <div className="async-state"><span className="spinner" /><p>{label}</p><div className="skeleton-row"><i /><i /><i /></div></div> }
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) { return <div className="async-state async-state--error" role="alert"><h2>We couldn’t load this</h2><p>{message}</p>{retry && <button className="button button--secondary" onClick={retry}><RefreshCw /> Try again</button>}</div> }
export function EmptyState({ title, message }: { title: string; message: string }) { return <div className="async-state"><Inbox /><h2>{title}</h2><p>{message}</p></div> }
