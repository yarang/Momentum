/**
 * Shared Constants
 *
 * Application-wide constants and configuration values.
 */

/**
 * App information
 */
export const APP_NAME = 'Momentum';
export const APP_VERSION = '0.1.0';

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  TASKS: '@momentum_tasks',
  CONTEXTS: '@momentum_contexts',
  SETTINGS: '@momentum_settings',
  USER_PREFERENCES: '@momentum_user_preferences',
} as const;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_TIME: 'MMM DD, YYYY HH:mm',
  SHORT: 'MM/DD/YYYY',
} as const;

/**
 * Task priorities
 */
export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

/**
 * Task statuses
 */
export const TASK_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

/**
 * Task categories
 */
export const TASK_CATEGORIES = {
  SOCIAL: 'social',
  SHOPPING: 'shopping',
  WORK: 'work',
  PERSONAL: 'personal',
  OTHER: 'other',
} as const;

/**
 * Context sources
 */
export const CONTEXT_SOURCES = {
  SCREENSHOT: 'screenshot',
  CHAT: 'chat',
  LOCATION: 'location',
  VOICE: 'voice',
  MANUAL: 'manual',
} as const;

/**
 * Action types
 */
export const ACTION_TYPES = {
  CALENDAR: 'calendar',
  PAYMENT: 'payment',
  SHOPPING: 'shopping',
  TASK: 'task',
  NAVIGATION: 'navigation',
  COMMUNICATION: 'communication',
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Time constants (in milliseconds)
 */
export const TIME = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Error messages
 */
export const ERRORS = {
  PERMISSION_DENIED: 'Permission denied. Please grant the required permissions.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_INPUT: 'Invalid input. Please check your data.',
  NOT_FOUND: 'The requested resource was not found.',
  UNKNOWN: 'An unknown error occurred. Please try again.',
} as const;
