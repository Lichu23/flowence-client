/**
 * Application Constants
 * Global constants used throughout the application
 */

/**
 * API Configuration Constants
 */
export const API_CONFIG = {
  /** Base URL for API requests */
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',

  /** Token refresh interval in milliseconds (25 minutes) */
  TOKEN_REFRESH_INTERVAL: 25 * 60 * 1000,

  /** Token expiry time in milliseconds (30 minutes) */
  TOKEN_EXPIRY: 30 * 60 * 1000,

  /** Default request timeout in milliseconds */
  REQUEST_TIMEOUT: 30000,
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * User Roles
 */
export const ROLES = {
  OWNER: 'owner',
  EMPLOYEE: 'employee',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  CURRENT_STORE_ID: 'currentStoreId',
} as const;

/**
 * Date and Time Format Patterns
 */
export const DATE_FORMATS = {
  US: 'MM/DD/YYYY',
  EU: 'DD/MM/YYYY',
  ISO: 'YYYY-MM-DD',
} as const;

export const TIME_FORMATS = {
  TWELVE_HOUR: '12h',
  TWENTY_FOUR_HOUR: '24h',
} as const;

/**
 * Supported Currency Codes
 */
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  ARS: 'ARS',
  BRL: 'BRL',
  MXN: 'MXN',
  JPY: 'JPY',
} as const;

export type CurrencyCode = typeof CURRENCIES[keyof typeof CURRENCIES];

/**
 * Default Pagination Settings
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Toast Notification Durations (in milliseconds)
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000,
} as const;

/**
 * Print Job Status Values
 */
export const PRINT_STATUS = {
  PENDING: 'pending',
  PRINTING: 'printing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type PrintStatus = typeof PRINT_STATUS[keyof typeof PRINT_STATUS];

/**
 * Product Stock Thresholds
 */
export const STOCK_THRESHOLDS = {
  /** Minimum stock warning threshold */
  LOW_STOCK: 10,

  /** Out of stock threshold */
  OUT_OF_STOCK: 0,
} as const;

/**
 * Default Timezones
 */
export const TIMEZONES = {
  UTC: 'UTC',
  AMERICA_NEW_YORK: 'America/New_York',
  AMERICA_ARGENTINA_BUENOS_AIRES: 'America/Argentina/Buenos_Aires',
  EUROPE_LONDON: 'Europe/London',
  ASIA_TOKYO: 'Asia/Tokyo',
} as const;

/**
 * Feature Flags
 */
export const FEATURES = {
  /** Enable Scandit barcode scanner */
  BARCODE_SCANNER: !!process.env.NEXT_PUBLIC_SCANDIT_LICENSE_KEY,

  /** Enable Stripe payments */
  STRIPE_PAYMENTS: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
} as const;
