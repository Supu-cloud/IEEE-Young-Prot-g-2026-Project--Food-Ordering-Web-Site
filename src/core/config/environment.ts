const trimSlash = (value: string) => value.replace(/\/+$/, '');

export const environment = {
  apiBaseUrl: trimSlash(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'),
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
} as const;