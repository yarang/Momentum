/**
 * Action Types
 *
 * Represents executable actions derived from analyzed context.
 * Actions are the bridge between understanding user intent and taking concrete steps.
 */

import { Entity } from './Entity.types';

/**
 * Action type discriminator
 */
export type ActionType =
  | 'calendar'
  | 'payment'
  | 'shopping'
  | 'task'
  | 'navigation'
  | 'communication'
  | 'notification';

/**
 * Base action interface
 */
export interface BaseAction {
  /** Unique identifier for the action */
  id: string;
  /** Action type discriminator */
  type: ActionType;
  /** Human-readable title */
  title: string;
  /** Detailed description of the action */
  description: string;
  /** Associated entities extracted from context */
  entities: Entity[];
  /** Source context ID that generated this action */
  sourceContextId: string;
  /** Execution status */
  status: 'pending' | 'ready' | 'executed' | 'failed' | 'cancelled';
  /** Priority level (1 = lowest, 5 = highest) */
  priority: 1 | 2 | 3 | 4 | 5;
  /** Timestamp when action was created */
  createdAt: number;
  /** Timestamp when action should be executed (for scheduled actions) */
  scheduledFor?: number;
  /** Timestamp when action was executed */
  executedAt?: number;
  /** Error message if execution failed */
  error?: string;
  /** Optional tags for categorization */
  tags?: string[];
  /** Optional metadata for action-specific parameters */
  metadata?: Record<string, unknown>;
}

/**
 * Calendar action for scheduling events
 */
export interface CalendarAction extends BaseAction {
  type: 'calendar';
  /** Event title */
  eventTitle: string;
  /** Event start time (ISO 8601) */
  startTime: string;
  /** Event end time (ISO 8601) */
  endTime: string;
  /** Optional location for the event */
  location?: string;
  /** Optional attendees (emails or contact IDs) */
  attendees?: string[];
  /** Optional reminder time (minutes before event) */
  reminderMinutes?: number;
}

/**
 * Payment action for financial transactions
 */
export interface PaymentAction extends BaseAction {
  type: 'payment';
  /** Recipient name or ID */
  recipient: string;
  /** Amount to transfer */
  amount: number;
  /** Currency code (ISO 4217) */
  currency: string;
  /** Optional transaction memo */
  memo?: string;
  /** Bank or payment app deep link */
  deepLink?: string;
}

/**
 * Shopping action for product management
 */
export interface ShoppingAction extends BaseAction {
  type: 'shopping';
  /** Product name */
  productName: string;
  /** Current price */
  price: number;
  /** Currency code */
  currency: string;
  /** Product URL or store identifier */
  productUrl?: string;
  /** Optional target price for price drop alerts */
  targetPrice?: number;
  /** Action subtype */
  action: 'add_to_wishlist' | 'track_price' | 'add_to_cart' | 'purchase';
}

/**
 * Task action for todo or work items
 */
export interface TaskAction extends BaseAction {
  type: 'task';
  /** Task title */
  taskTitle: string;
  /** Optional detailed description */
  taskDescription?: string;
  /** Deadline timestamp */
  deadline: number;
  /** Optional tags or categories */
  tags?: string[];
  /** Optional parent task ID for subtasks */
  parentTaskId?: string;
}

/**
 * Navigation action for location-based directions
 */
export interface NavigationAction extends BaseAction {
  type: 'navigation';
  /** Destination name or address */
  destination: string;
  /** Latitude coordinate */
  latitude?: number;
  /** Longitude coordinate */
  longitude?: number;
  /** Optional departure time */
  departureTime?: number;
  /** Transportation mode */
  transportMode?: 'driving' | 'walking' | 'transit' | 'cycling';
}

/**
 * Communication action for sending messages
 */
export interface CommunicationAction extends BaseAction {
  type: 'communication';
  /** Communication subtype */
  commType: 'email' | 'sms' | 'chat' | 'call';
  /** Recipient contact info */
  recipient: string;
  /** Message content template */
  messageTemplate?: string;
  /** Optional scheduled send time */
  scheduledTime?: number;
}

/**
 * Notification action for sending reminders and alerts
 */
export interface NotificationAction extends BaseAction {
  type: 'notification';
  /** Notification title */
  notificationTitle: string;
  /** Notification message body */
  notificationBody: string;
  /** Optional scheduled delivery time */
  scheduledTime?: number;
  /** Optional notification priority */
  priority?: 'low' | 'default' | 'high';
}

/**
 * Union type of all possible actions
 */
export type Action =
  | CalendarAction
  | PaymentAction
  | ShoppingAction
  | TaskAction
  | NavigationAction
  | CommunicationAction
  | NotificationAction;

/**
 * Execution result for an action
 */
export interface ActionResult {
  /** Action ID */
  actionId: string;
  /** Whether execution was successful */
  success: boolean;
  /** Optional result data */
  data?: unknown;
  /** Optional error message */
  error?: string;
  /** Execution timestamp (required) */
  timestamp: number;
  /** Timestamp of execution (alias for timestamp, for backward compatibility) */
  executedAt?: number;
  /** Optional metadata with additional result information */
  metadata?: {
    message?: string;
    [key: string]: unknown;
  };
}
