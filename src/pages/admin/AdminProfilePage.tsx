import { useCallback } from 'react'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { profileApi } from '../../core/api/services'
import { useAsyncResource } from '../../core/api/useAsyncResource'
export function AdminProfilePage(){const resource=useAsyncResource(useCallback(()=>profileApi.get(),[]));if(resource.loading)return <LoadingState/>;if(resource.error||!resource.data)return <ErrorState message={resource.error||'Profile unavailable'} retry={resource.retry}/>;const user=resource.data;return <><div className="portal-title"><div><span className="eyebrow">Administrator account</span><h1>Profile</h1><p>Secure administrator identity and contact information.</p></div></div><section className="portal-card admin-profile"><span className="initial large">{user.name.slice(0,1)}</span><div><h2>{user.name}</h2><p>{user.email}</p><b>Administrator · {user.accountStatus}</b></div></section></>}
