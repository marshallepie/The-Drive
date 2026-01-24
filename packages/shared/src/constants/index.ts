export const API_ROUTES = {
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    WALLET_AUTH: '/api/v1/auth/wallet-auth',
  },
  VEHICLES: {
    LIST: '/api/v1/vehicles',
    DETAIL: (id: string) => `/api/v1/vehicles/${id}`,
    CREATE: '/api/v1/vehicles',
    UPDATE: (id: string) => `/api/v1/vehicles/${id}`,
    DELETE: (id: string) => `/api/v1/vehicles/${id}`,
  },
  USERS: {
    PROFILE: '/api/v1/users/profile',
    UPDATE_PROFILE: '/api/v1/users/profile',
    LISTINGS: '/api/v1/users/listings',
  },
  TRANSACTIONS: {
    INITIATE: '/api/v1/transactions/initiate',
    DETAIL: (id: string) => `/api/v1/transactions/${id}`,
    CONFIRM: (id: string) => `/api/v1/transactions/${id}/confirm`,
    STRIPE_WEBHOOK: '/api/v1/transactions/webhook/stripe',
  },
  FINANCE: {
    APPLICATIONS: '/api/v1/finance/applications',
    APPLICATION_DETAIL: (id: string) => `/api/v1/finance/applications/${id}`,
    REVIEW: (id: string) => `/api/v1/finance/applications/${id}/review`,
    LOANS: '/api/v1/finance/loans',
  },
  MESSAGES: {
    CONVERSATIONS: '/api/v1/messages/conversations',
    CONVERSATION_DETAIL: (id: string) => `/api/v1/messages/conversations/${id}`,
    SEND_MESSAGE: (id: string) => `/api/v1/messages/conversations/${id}/messages`,
  },
}

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
}

export const SUPPORTED_CURRENCIES = {
  FIAT: ['USD', 'EUR', 'GBP'],
  CRYPTO: ['USDC', 'USDT', 'DAI'],
}

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  VIN_LENGTH: 17,
  MAX_UPLOAD_SIZE_MB: 10,
  MAX_IMAGES_PER_VEHICLE: 20,
}
