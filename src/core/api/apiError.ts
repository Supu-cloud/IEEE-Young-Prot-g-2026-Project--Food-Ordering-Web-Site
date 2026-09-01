import axios from 'axios'

export class AppApiError extends Error {
  status?: number
  constructor(message: string, status?: number) { super(message); this.name = 'AppApiError'; this.status = status }
}

export function toApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = typeof error.response?.data?.message === 'string' ? error.response.data.message : error.code === 'ECONNABORTED' ? 'The request took too long. Please try again.' : 'Unable to connect to Foodie. Check your connection and try again.'
    return new AppApiError(message, error.response?.status)
  }
  return error instanceof Error ? error : new AppApiError('Something went wrong. Please try again.')
}
