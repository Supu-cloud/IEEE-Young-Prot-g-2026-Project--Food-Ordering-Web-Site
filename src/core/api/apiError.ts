import axios from 'axios'

export class AppApiError extends Error {
  status?: number
  errors: Record<string, string>
  constructor(message: string, status?: number, errors: Record<string, string> = {}) { super(message); this.name = 'AppApiError'; this.status = status; this.errors = errors }
}

export function toApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = typeof error.response?.data?.message === 'string' ? error.response.data.message : error.code === 'ECONNABORTED' ? 'The request took too long. Please try again.' : 'Unable to connect to Foodie. Check your connection and try again.'
    return new AppApiError(message, error.response?.status, error.response?.data?.errors ?? {})
  }
  return error instanceof Error ? error : new AppApiError('Something went wrong. Please try again.')
}
