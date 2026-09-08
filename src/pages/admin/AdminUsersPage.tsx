import { Search, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { AdminFilterBar, AdminStatus, label } from '../../components/admin/AdminUi'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { adminApi } from '../../core/api/services'
import { useAsyncResource } from '../../core/api/useAsyncResource'

export function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const resource = useAsyncResource(useCallback(() => adminApi.users({ search, role, status, page }), [search, role, status, page]))

  const change = async (id: string, current: string) => {
    const next = current === 'suspended' ? 'approved' : 'suspended'
    if (!confirm(`${next === 'suspended' ? 'Suspend' : 'Reactivate'} this user?`)) return
    setBusy(id)
    setNotice('')
    setActionError('')
    try {
      await adminApi.userStatus(id, next)
      setNotice(`User ${next === 'suspended' ? 'suspended' : 'reactivated'} successfully.`)
      await resource.retry()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update this user.')
    } finally {
      setBusy('')
    }
  }

  const permanentlyDelete = async (id: string, name: string, email: string) => {
    const confirmed = confirm(`Permanently delete ${name} (${email})?\n\nThis cannot be undone. If operational records reference this account, Foodie will block the deletion.`)
    if (!confirmed) return
    setBusy(id)
    setNotice('')
    setActionError('')
    try {
      await adminApi.deleteUser(id)
      setNotice(`${email} was permanently deleted and can now be registered again.`)
      await resource.retry()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to permanently delete this user.')
    } finally {
      setBusy('')
    }
  }

  return <>
    <div className="portal-title"><div><span className="eyebrow">Account administration</span><h1>Users</h1><p>Search, filter, suspend, reactivate, or permanently delete accounts safely.</p></div></div>
    {notice && <p className="success-banner" role="status">{notice}</p>}
    {actionError && <p className="error-banner" role="alert">{actionError}</p>}
    <AdminFilterBar>
      <label><Search/><input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Name or email"/></label>
      <select value={role} onChange={e => setRole(e.target.value)}><option value="">All roles</option><option value="customer">Customers</option><option value="restaurant_owner">Owners</option><option value="delivery_rider">Riders</option><option value="admin">Admins</option></select>
      <select value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option><option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option><option value="suspended">Suspended</option></select>
    </AdminFilterBar>
    {resource.loading ? <LoadingState/> : resource.error ? <ErrorState message={resource.error} retry={resource.retry}/> :
      <section className="portal-card admin-table-wrap">
        <table className="admin-table"><thead><tr><th>Name</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead><tbody>
          {resource.data?.items.map(user => <tr key={user._id}><td><strong>{user.name}</strong><small>{user.email}</small></td><td>{label(user.role)}</td><td>{new Date(user.createdAt).toLocaleDateString()}</td><td><AdminStatus value={user.accountStatus}/></td><td>{user.role !== 'admin' && <div className="admin-user-actions"><button className="button button--secondary compact" disabled={busy === user._id} onClick={() => void change(user._id, user.accountStatus)}>{busy === user._id ? 'Working…' : user.accountStatus === 'suspended' ? 'Reactivate' : 'Suspend'}</button><button className="button button--secondary compact danger-button" disabled={busy === user._id} onClick={() => void permanentlyDelete(user._id, user.name, user.email)}><Trash2/>Permanently Delete</button></div>}</td></tr>)}
        </tbody></table>
        <div className="admin-pagination"><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {resource.data?.pagination.pages || 1}</span><button disabled={page >= (resource.data?.pagination.pages || 1)} onClick={() => setPage(page + 1)}>Next</button></div>
      </section>}
  </>
}
