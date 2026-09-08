import { Check, Eye, RefreshCw, Search, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminFilterBar, AdminStatus, label } from '../../components/admin/AdminUi'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { adminApi } from '../../core/api/services'
import { useAsyncResource } from '../../core/api/useAsyncResource'

export function AdminApprovalsPage() {
  const [status, setStatus] = useState('pending')
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const loader = useCallback(() => adminApi.applications({ status, role, search }), [status, role, search])
  const resource = useAsyncResource(loader)
  const approve = async (id: string) => {
    if (!confirm('Approve this application?')) return
    setBusy(id); setNotice(''); setActionError('')
    try { await adminApi.approve(id); setNotice('Application approved successfully.'); await resource.retry() }
    catch (caught) { setActionError(caught instanceof Error ? caught.message : 'Unable to approve this application.') }
    finally { setBusy('') }
  }
  const reject = async (id: string) => {
    const reason = prompt('Reason for rejection'); if (!reason?.trim() || !confirm('Reject this application?')) return
    setBusy(id); setNotice(''); setActionError('')
    try { await adminApi.reject(id, reason); setNotice('Application rejected successfully.'); await resource.retry() }
    catch (caught) { setActionError(caught instanceof Error ? caught.message : 'Unable to reject this application.') }
    finally { setBusy('') }
  }
  return <>
    <div className="portal-title"><div><span className="eyebrow">Partner onboarding</span><h1>Approvals</h1><p>Review restaurant-owner and rider applications.</p></div><button className="button button--secondary compact" onClick={() => void resource.retry()} disabled={resource.loading}><RefreshCw /> Refresh</button></div>
    {notice && <p className="success-banner" role="status">{notice}</p>}{actionError && <p className="error-banner" role="alert">{actionError}</p>}
    <AdminFilterBar><label><Search /><input placeholder="Search applicants" value={search} onChange={e => setSearch(e.target.value)} /></label><select value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option><option value="pending">All pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select><select value={role} onChange={e => setRole(e.target.value)}><option value="">Owners & riders</option><option value="restaurant_owner">Restaurant owners</option><option value="delivery_rider">Delivery riders</option></select></AdminFilterBar>
    {resource.loading ? <LoadingState /> : resource.error ? <ErrorState message={resource.error} retry={resource.retry} /> : <section className="portal-card admin-table-wrap"><table className="admin-table"><thead><tr><th>Applicant</th><th>Role</th><th>Applied</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead><tbody>{resource.data?.items.map(app => <tr key={app._id}><td><span className="admin-person"><i>{app.name.slice(0, 1)}</i><span><strong>{app.name}</strong><small>{app.email}</small></span></span></td><td>{label(app.role)}</td><td>{new Date(app.createdAt).toLocaleDateString()}</td><td>{app.isEmailVerified ? 'Verified' : <span>Not verified<small className="admin-verification-note">Verification required before approval</small></span>}</td><td><AdminStatus value={app.accountStatus} /></td><td><div className="table-actions"><Link to={`/admin/approvals/${app._id}`}><Eye /></Link>{app.accountStatus === 'pending' && <><button disabled={busy === app._id || !app.isEmailVerified} onClick={() => void approve(app._id)} title={app.isEmailVerified ? 'Approve application' : 'Email verification is required first'} aria-label="Approve application"><Check /></button><button disabled={busy === app._id} onClick={() => void reject(app._id)} title="Reject" aria-label="Reject application"><X /></button></>}</div></td></tr>)}</tbody></table>{!resource.data?.items.length && <p className="admin-empty">No applications match these filters.</p>}</section>}
  </>
}
