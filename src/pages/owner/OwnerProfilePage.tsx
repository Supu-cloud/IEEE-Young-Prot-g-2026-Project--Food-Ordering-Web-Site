import { Mail, Phone, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { profileApi } from '../../core/api/services'
import { useAsyncResource } from '../../core/api/useAsyncResource'

export function OwnerProfilePage(){
 const resource=useAsyncResource(profileApi.get);const[saving,setSaving]=useState(false);const[notice,setNotice]=useState('');const[error,setError]=useState('')
 if(resource.loading)return <LoadingState label="Loading your profile…"/>;if(resource.error)return <ErrorState message={resource.error} retry={resource.retry}/>
 const user=resource.data!;const save=async(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const form=new FormData(event.currentTarget);setSaving(true);setNotice('');setError('');try{await profileApi.update({name:String(form.get('name')).trim(),phone:String(form.get('phone')).trim(),address:String(form.get('address')).trim()});await resource.retry();setNotice('Profile updated successfully.')}catch(caught){setError(caught instanceof Error?caught.message:'Unable to update your profile.')}finally{setSaving(false)}}
 return <><div className="portal-title"><div><span className="eyebrow">Owner account</span><h1>Profile</h1><p>Manage the supported details for your Foodie account.</p></div></div>{notice&&<p className="success-banner" role="status">{notice}</p>}{error&&<p className="error-banner" role="alert">{error}</p>}<form className="portal-card owner-account-form" onSubmit={event=>void save(event)}><div className="rider-profile-head"><span className="rider-avatar"><UserRound/></span><div><h2>{user.name}</h2><p>{user.email}</p><span>{user.accountStatus}</span></div></div><div className="form-grid"><label>Name<input name="name" required defaultValue={user.name}/></label><label><Phone/>Phone<input name="phone" defaultValue={user.phone}/></label><label className="full"><Mail/>Email<input value={user.email} disabled/></label><label className="full">Address<textarea name="address" defaultValue={user.address}/></label><label>Role<input value="Restaurant owner" disabled/></label><label>Account status<input value={user.accountStatus} disabled/></label></div><button className="button button--primary" disabled={saving}>{saving?'Saving…':'Save profile'}</button></form></>
}
