import axios from 'axios'
import { environment } from '../config/environment'
import { tokenStorage } from '../auth/tokenStorage'
import { AppApiError, toApiError } from './apiError'

export const apiClient = axios.create({ baseURL: environment.apiBaseUrl, timeout: 15_000, headers: { Accept: 'application/json', 'Content-Type': 'application/json' } })
apiClient.interceptors.request.use((config) => { const token = tokenStorage.getAccessToken(); if (token) config.headers.Authorization = `Bearer ${token}`; return config })
apiClient.interceptors.response.use((response) => response, (error) => { const parsed = toApiError(error); if (parsed instanceof AppApiError && parsed.status === 401 && tokenStorage.getAccessToken()) { tokenStorage.clear(); window.dispatchEvent(new Event('foodie:session-expired')) } return Promise.reject(parsed) })
