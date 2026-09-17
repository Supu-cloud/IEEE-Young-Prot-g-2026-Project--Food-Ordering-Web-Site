import { CoordinateFields } from '../../components/CoordinateFields'
import { Clock3, ImagePlus, MapPin, Store } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { ErrorState, LoadingState } from '../../components/ui/AsyncState'
import { ownerApi, restaurantApi } from '../../core/api/services'
import { AppApiError } from '../../core/api/apiError'
import { restaurantImageUrl } from '../../core/api/imageUrl'
import { useAsyncResource } from '../../core/api/useAsyncResource'
import type { ApiRestaurant, RestaurantInput, RestaurantOptions } from '../../core/types/api'
import './restaurantSetup.css'

const loadSetup = async () => {
  const [restaurant, options] = await Promise.all([ownerApi.restaurant(), restaurantApi.options()])
  return { restaurant, options }
}
const inputFor = (restaurant: ApiRestaurant | null): RestaurantInput => ({
  latitude: restaurant?.latitude, longitude: restaurant?.longitude,
  name: restaurant?.name ?? '', category: restaurant?.category ?? '', description: restaurant?.description ?? '',
  phone: restaurant?.phone ?? '', address: restaurant?.address ?? '', imageUrl: restaurant?.imageUrl ?? '',
  isOpen: restaurant?.isOpen ?? false, operatingHours: restaurant?.operatingHours ?? {},
})

export function OwnerProfileConnectedPage() {
  const resource = useAsyncResource(loadSetup)
  if (resource.loading) return <LoadingState label="Loading your restaurant?" />
  if (resource.error || !resource.data) return <ErrorState message={resource.error || 'Unable to load setup.'} retry={resource.retry} />
  return <RestaurantSetup restaurant={resource.data.restaurant} options={resource.data.options} />
}

function RestaurantSetup({ restaurant, options }: { restaurant: ApiRestaurant | null; options: RestaurantOptions }) {
  const [current, setCurrent] = useState(restaurant)
  const [form, setForm] = useState(() => inputFor(restaurant))
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState('')
  const [stage, setStage] = useState<'idle' | 'uploading' | 'saving'>('idle')
  const [progress, setProgress] = useState(0)
  const busy = stage !== 'idle'
  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    // The preview URL is derived from a newly selected browser file.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  const change = <K extends keyof RestaurantInput>(key: K, value: RestaurantInput[K]) => {
    setForm(previous => ({ ...previous, [key]: value }))
    setErrors(previous => ({ ...previous, [key]: '' }))
    setNotice('')
  }
  const fieldError = (key: string) => errors[key] ? <small id={`error-${key}`} className="restaurant-field-error" role="alert">{errors[key]}</small> : null
  const selectLogo = (selected?: File) => {
    if (!selected) return
    const error = !options.image.types.includes(selected.type) ? 'Choose a JPG, PNG or WebP image.' : selected.size > options.image.maxBytes || !selected.size ? `Choose an image up to ${options.image.maxBytes / 1024 / 1024} MB.` : ''
    setErrors(previous => ({ ...previous, imageUrl: error }))
    if (!error) { setFile(selected); setNotice('') }
  }
  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    const found: Record<string, string> = {}
    for (const field of ['name', 'description', 'phone', 'address'] as const) if (!form[field].trim()) found[field] = 'Please complete this field.'
    for (const [field, limit] of Object.entries(options.limits)) if (String(form[field as keyof RestaurantInput]).trim().length > limit) found[field] = `Use ${limit} characters or fewer.`
    if (!options.categories.includes(form.category)) found.category = 'Choose a category from the list.'
    if (!new RegExp(options.phonePattern).test(form.phone.replace(/[\s()-]/g, ''))) found.phone = 'Use a Sri Lankan number, such as 0771234567 or +94771234567.'
    for (const [day, hours] of Object.entries(form.operatingHours ?? {})) {
      if (!hours.closed && (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(hours.open) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(hours.close) || hours.open === hours.close)) found[`operatingHours.${day}`] = 'Enter different opening and closing times.'
    }
    if ((form.latitude === undefined) !== (form.longitude === undefined) || (form.latitude !== undefined && (!Number.isFinite(form.latitude) || Math.abs(form.latitude) > 90)) || (form.longitude !== undefined && (!Number.isFinite(form.longitude) || Math.abs(form.longitude) > 180))) found.latitude = 'Enter valid latitude and longitude together.'
    if (errors.imageUrl) found.imageUrl = errors.imageUrl
    setErrors(found); setMessage(''); setNotice('')
    if (Object.keys(found).length) { setMessage('Please check the highlighted fields.'); return }
    try {
      let imageUrl = form.imageUrl
      if (file) {
        setStage('uploading'); setProgress(0)
        imageUrl = (await ownerApi.uploadLogo(file, setProgress)).imageUrl
        setForm(previous => ({ ...previous, imageUrl }))
        setFile(null); setPreview('')
      }
      setStage('saving')
      await ownerApi.saveRestaurant({ ...form, imageUrl })
      const refreshed = await ownerApi.restaurant()
      if (!refreshed) throw new Error('Saved, but unable to reload your restaurant. Please try again.')
      setCurrent(refreshed); setForm(inputFor(refreshed))
      setNotice('Your restaurant is saved. Customers will see these details on the website and app when they refresh.')
    } catch (caught) {
      if (caught instanceof AppApiError) setErrors(caught.errors)
      setMessage(caught instanceof Error ? caught.message : 'Unable to save. Please try again.')
    } finally { setStage('idle') }
  }
  const logo = file && preview ? preview : restaurantImageUrl(form.imageUrl)
  return <>
    <div className="portal-title"><div><span className="eyebrow">Your Foodie storefront</span><h1>My Restaurant</h1><p>{current ? 'Keep your details fresh and help customers find you.' : 'Welcome! Let?s introduce your restaurant to Foodie.'}</p></div><span className={`restaurant-status ${form.isOpen ? 'is-open' : ''}`}>{form.isOpen ? 'Open for orders' : 'Currently closed'}</span></div>
    {message && <p className="error-banner" role="alert">{message}</p>}
    {notice && <p className="restaurant-success" role="status">{notice}</p>}
    <form className="restaurant-setup" onSubmit={event => void save(event)} noValidate aria-busy={busy}>
      <fieldset disabled={busy} className="restaurant-setup-fields">
        <div className="restaurant-main-fields">
          <section className="portal-card"><h2><Store />Restaurant identity</h2><p className="restaurant-helper">The details customers see when discovering your food.</p>
            <div className="form-grid">
              <label>Restaurant name<input value={form.name} onChange={e => change('name', e.target.value)} required maxLength={options.limits.name} autoComplete="organization" aria-invalid={!!errors.name} aria-describedby="error-name" placeholder="Your restaurant name" />{fieldError('name')}</label>
              <label>Category<select value={form.category} onChange={e => change('category', e.target.value)} required aria-invalid={!!errors.category} aria-describedby="error-category"><option value="">Choose a category</option>{form.category && !options.categories.includes(form.category) && <option value={form.category} disabled>{form.category} ? please choose a new category</option>}{options.categories.map(category => <option key={category}>{category}</option>)}</select>{fieldError('category')}</label>
              <label className="full">Description<textarea value={form.description} onChange={e => change('description', e.target.value)} required maxLength={options.limits.description} rows={4} aria-invalid={!!errors.description} aria-describedby="error-description" placeholder="Tell customers what makes your food special?" /><small className="restaurant-helper">{form.description.length} / {options.limits.description}</small>{fieldError('description')}</label>
            </div>
            <div className="restaurant-logo-upload"><div className="restaurant-logo-preview">{logo ? <img src={logo} alt="Restaurant logo preview" /> : <div><ImagePlus /><span>Your restaurant logo</span></div>}</div><div><label className="restaurant-upload-button"><ImagePlus />Upload Restaurant Logo<input type="file" accept=".jpg,.jpeg,.png,.webp" aria-label="Upload Restaurant Logo" onChange={e => { selectLogo(e.target.files?.[0]); e.target.value = '' }} /></label><p className="restaurant-helper">JPG, PNG or WebP ? up to {options.image.maxBytes / 1024 / 1024} MB. Your whole logo will stay visible.</p>{file && <p className="restaurant-selected-file">{file.name} <button type="button" onClick={() => { setFile(null); setPreview(''); setErrors(previous => ({ ...previous, imageUrl: '' })) }}>Cancel selection</button></p>}{fieldError('imageUrl')}{stage === 'uploading' && <p role="status">Uploading logo? {progress}%</p>}</div></div>
          </section>
          <section className="portal-card"><h2><MapPin />Contact &amp; location</h2><div className="form-grid"><label>Phone<input type="tel" autoComplete="tel" value={form.phone} onChange={e => change('phone', e.target.value)} required aria-invalid={!!errors.phone} aria-describedby="error-phone" placeholder="0771234567" /><small className="restaurant-helper">Sri Lankan mobile or landline; +94 also accepted.</small>{fieldError('phone')}</label><label>Address<textarea value={form.address} onChange={e => change('address', e.target.value)} required maxLength={options.limits.address} autoComplete="street-address" rows={2} aria-invalid={!!errors.address} aria-describedby="error-address" placeholder="Street, area and city" />{fieldError('address')}</label></div><CoordinateFields label="Restaurant pickup location" value={form} onChange={point => { change('latitude', point.latitude); change('longitude', point.longitude) }} />{fieldError('latitude')}{fieldError('longitude')}</section>
        </div>
        <section className="portal-card restaurant-business"><h2><Clock3 />Business settings</h2><label className="restaurant-open-toggle"><span><strong>Open for orders</strong><small>Turn off to pause new orders.</small></span><input type="checkbox" checked={form.isOpen} onChange={e => change('isOpen', e.target.checked)} /></label>{fieldError('isOpen')}<h3>Operating hours</h3><p className="restaurant-helper">Add only the days you know. Unset days display ?Not specified?. A closing time before opening means the next day. Hours describe your schedule; the switch above controls orders.</p>
          <div className="restaurant-hours">{options.days.map(day => {
            const hours = form.operatingHours?.[day]
            const update = (patch: Partial<NonNullable<RestaurantInput['operatingHours']>[string]>) => change('operatingHours', { ...form.operatingHours, [day]: { open: '', close: '', closed: false, ...hours, ...patch } })
            return <div className="restaurant-hours-day" key={day}><div className="restaurant-day-heading"><strong>{day}</strong><select aria-label={`${day} schedule`} value={!hours ? 'unset' : hours.closed ? 'closed' : 'open'} onChange={e => { if (e.target.value === 'unset') { const next = { ...form.operatingHours }; delete next[day]; change('operatingHours', next) } else update({ closed: e.target.value === 'closed' }) }}><option value="unset">Not specified</option><option value="open">Set hours</option><option value="closed">Closed</option></select></div>{hours && !hours.closed && <div className="restaurant-time-inputs"><label>Opens<input type="time" value={hours.open} onChange={e => update({ open: e.target.value })} aria-label={`${day} opening time`} /></label><span>to</span><label>Closes<input type="time" value={hours.close} onChange={e => update({ close: e.target.value })} aria-label={`${day} closing time`} /></label></div>}{fieldError(`operatingHours.${day}`)}</div>
          })}</div>{fieldError('operatingHours')}
        </section>
      </fieldset>
      <div className="restaurant-save-bar"><p>One restaurant profile, shared across Foodie.</p><button className="button button--primary" disabled={busy} type="submit">{stage === 'uploading' ? `Uploading logo? ${progress}%` : stage === 'saving' ? 'Saving?' : current ? 'Save Changes' : 'Create Restaurant'}</button></div>
    </form>
  </>
}
