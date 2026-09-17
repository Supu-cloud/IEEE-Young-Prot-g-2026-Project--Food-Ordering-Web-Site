/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { profileApi } from '../api/services'
import { useAuth } from '../auth/AuthContext'

export type Language = 'en' | 'si' | 'ta'
export type Theme = 'system' | 'light' | 'dark'
type Messages = Record<string, string>
const messages: Record<Language, Messages> = {
  en: { home:'Home', restaurants:'Restaurants', orders:'Orders', cart:'Cart', wallet:'Wallet', profile:'Profile', language:'Language', theme:'Theme', system:'System default', light:'Light', dark:'Dark', save:'Save', payNow:'Pay now', trackOrder:'Track order', viewOrder:'View order', leaveReview:'Leave review', reviewed:'Reviewed', pending:'Pending', accepted:'Accepted', preparing:'Preparing', ready_for_pickup:'Ready for pickup', picked_up:'Picked up', out_for_delivery:'Out for delivery', delivered:'Delivered', cancelled:'Cancelled', delivery_failed:'Delivery failed', signOut:'Sign out' },
  si: { home:'මුල් පිටුව', restaurants:'ආපනශාලා', orders:'ඇණවුම්', cart:'කරත්තය', wallet:'පසුම්බිය', profile:'පැතිකඩ', language:'භාෂාව', theme:'තේමාව', system:'පද්ධති පෙරනිමිය', light:'ආලෝකය', dark:'අඳුරු', save:'සුරකින්න', payNow:'දැන් ගෙවන්න', trackOrder:'ඇණවුම හඹා යන්න', viewOrder:'ඇණවුම බලන්න', leaveReview:'සමාලෝචනයක් දාන්න', reviewed:'සමාලෝචනය කර ඇත', pending:'පොරොත්තුවෙන්', accepted:'පිළිගත්', preparing:'සූදානම් කරමින්', ready_for_pickup:'ලබා ගැනීමට සූදානම්', picked_up:'ලබා ගත්තා', out_for_delivery:'බෙදාහරිමින්', delivered:'බෙදාහැරීම අවසන්', cancelled:'අවලංගු කළා', delivery_failed:'බෙදාහැරීම අසාර්ථකයි', signOut:'ඉවත් වන්න' },
  ta: { home:'முகப்பு', restaurants:'உணவகங்கள்', orders:'ஆர்டர்கள்', cart:'வண்டி', wallet:'பணப்பை', profile:'சுயவிவரம்', language:'மொழி', theme:'தீம்', system:'கணினி இயல்புநிலை', light:'வெளிச்சம்', dark:'இருள்', save:'சேமிக்கவும்', payNow:'இப்போது செலுத்தவும்', trackOrder:'ஆர்டரைக் கண்காணிக்கவும்', viewOrder:'ஆர்டரைப் பார்க்கவும்', leaveReview:'மதிப்புரை வழங்கவும்', reviewed:'மதிப்பாய்வு செய்யப்பட்டது', pending:'நிலுவையில்', accepted:'ஏற்றுக்கொள்ளப்பட்டது', preparing:'தயாராகிறது', ready_for_pickup:'பெறத் தயாராக உள்ளது', picked_up:'பெறப்பட்டது', out_for_delivery:'விநியோகத்தில்', delivered:'விநியோகம் முடிந்தது', cancelled:'ரத்து செய்யப்பட்டது', delivery_failed:'விநியோகம் தோல்வியடைந்தது', signOut:'வெளியேறு' },
}
type PreferenceContext = { language: Language; theme: Theme; setLanguage: (value: Language) => void; setTheme: (value: Theme) => void; t: (key: string, fallback?: string) => string }
const Context = createContext<PreferenceContext | null>(null)
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('foodie-language') as Language) || 'en')
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('foodie-theme') as Theme) || 'system')
  useEffect(() => {
    if (!user?.preferences) return
    setLanguageState(user.preferences.language); localStorage.setItem('foodie-language', user.preferences.language)
    setThemeState(user.preferences.theme); localStorage.setItem('foodie-theme', user.preferences.theme)
  }, [user])
  const savePreferences = (nextLanguage: Language, nextTheme: Theme) => { if (!user) return; void profileApi.update({ preferences: { language: nextLanguage, theme: nextTheme } }).catch(() => undefined) }
  const setLanguage = (value: Language) => { setLanguageState(value); localStorage.setItem('foodie-language', value); savePreferences(value, theme) }
  const setTheme = (value: Theme) => { setThemeState(value); localStorage.setItem('foodie-theme', value); savePreferences(language, value) }
  useEffect(() => { const root = document.documentElement; const apply = () => { const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches); root.dataset.theme = dark ? 'dark' : 'light' }; apply(); const media = matchMedia('(prefers-color-scheme: dark)'); media.addEventListener?.('change', apply); return () => media.removeEventListener?.('change', apply) }, [theme])
  const value = useMemo(() => ({ language, theme, setLanguage, setTheme, t: (key: string, fallback?: string) => messages[language][key] || messages.en[key] || fallback || key }), [language, theme])
  return <Context.Provider value={value}>{children}</Context.Provider>
}
export function usePreferences() { const value = useContext(Context); if (!value) throw new Error('PreferencesProvider is missing'); return value }
