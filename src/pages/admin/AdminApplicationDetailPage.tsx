import { Check, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminStatus, label } from '../../components/admin/AdminUi'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { adminApi } from '../../core/api/services'
import { useAsyncResource } from '../../core/api/useAsyncResource'

export function AdminApplicationDetailPage() {
  const { id = '' } = useParams()
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const resource = useAsyncResource(useCallback(() => adminApi.application(id), [id]))

  if (resource.loading) return <LoadingState />
  if (resource.error || !resource.data) return <ErrorState message={resource.error || 'Application not found'} retry={resource.retry} />

  const app = resource.data
  const act = async (action: 'approve' | 'reject') => {
    const reason = action === 'reject' ? prompt('Reason for rejection') : ''
    if (action === 'reject' && !reason?.trim()) return
    if (!confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this application?`)) return
    setBusy(true); setNotice(''); setActionError('')
    try {
      await (action === 'approve' ? adminApi.approve(id) : adminApi.reject(id, reason!))
      setNotice(`Application ${action === 'approve' ? 'approved' : 'rejected'} successfully.`)
      await resource.retry()
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Unable to update this application.')
    } finally { setBusy(false) }
  }

  return <>
    <div className="portal-title"><div><Link to="/admin/approvals">‹ Back to approvals</Link><h1>{app.name}</h1><p>{label(app.role)} application</p></div><AdminStatus value={app.accountStatus} /></div>
    {notice && <p className="success-banner" role="status">{notice}</p>}
    {actionError && <p className="error-banner" role="alert">{actionError}</p>}
    <div className="admin-detail-grid">
      <section className="portal-card"><h2>Applicant information</h2><dl className="admin-details"><div><dt>Email</dt><dd>{app.email}</dd></div><div><dt>Phone</dt><dd>{app.phone || 'Not provided'}</dd></div><div><dt>Address</dt><dd>{app.address || 'Not provided'}</dd></div><div><dt>Submitted</dt><dd>{new Date(app.createdAt).toLocaleString()}</dd></div><div><dt>Email verification</dt><dd>{app.isEmailVerified ? 'Verified' : 'Not verified'}</dd></div>{app.rejectionReason && <div><dt>Rejection reason</dt><dd>{app.rejectionReason}</dd></div>}</dl></section>
      <section className="portal-card"><h2>Role profile</h2>{app.profile ? <pre className="profile-json">{JSON.stringify(app.profile, null, 2)}</pre> : <p>No role profile has been submitted.</p>}{app.accountStatus === 'pending' && <div className="approval-actions"><button className="button button--primary" disabled={busy || !app.isEmailVerified} title={app.isEmailVerified ? 'Approve application' : 'Email verification is required first'} onClick={() => void act('approve')}><Check />Approve</button><button className="button button--danger" disabled={busy} onClick={() => void act('reject')}><X />Reject</button></div>}{app.accountStatus === 'pending' && !app.isEmailVerified && <p className="admin-verification-note">The applicant must verify their email before you can approve and assign this account.</p>}</section>
    </div>
  </>
}
