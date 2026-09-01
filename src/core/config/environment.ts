const trimSlash = (value: string) => value.replace(/\/+$/, '');

export const environment = {
  apiBaseUrl: trimSlash(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'),
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51UA06yAwpDTe7AUK395Aon2q1Qpx8B3j81BHp0TuZtNDfYfCgI2nAZUq5pD0K9X667HHyxSK4irMjVeF37I7mosL000PteOxcD',
} as const;