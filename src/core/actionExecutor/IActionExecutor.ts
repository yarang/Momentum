/**
 * Action Executor Interface
 *
 * Defines the contract for executing actions derived from context analysis.
 * Implementations handle actual execution of calendar, payment, shopping, and task actions.
 */

import { Action, ActionResult } from '@/shared/models';

/**
 * Execution status for monitoring
 */
export interface ExecutionStatus {
  /** Action ID being executed */
  actionId: string;
  /** Current execution stage */
  stage: 'preparing' | 'executing' | 'verifying' | 'completed' | 'failed';
  /** Progress percentage (0-100) */
  progress: number;
  /** Optional status message */
  message?: string;
}

/**
 * Execution options
 */
export interface ExecutionOptions {
  /** Whether to require user confirmation before execution */
  requireConfirmation?: boolean;
  /** Whether to show notifications */
  showNotifications?: boolean;
  /** Retry attempts on failure */
  retryAttempts?: number;
  /** Delay between retries (ms) */
  retryDelay?: number;
  /** Optional timeout (ms) */
  timeout?: number;
}

/**
 * Callback for execution progress updates
 */
export type ExecutionProgressCallback = (status: ExecutionStatus) => void;

/**
 * Interface for action executor implementations
 */
export interface IActionExecutor {
  /**
   * Initialize the executor (setup services, permissions)
   */
  initialize(): Promise<boolean>;

  /**
   * Execute a single action
   * @param action - The action to execute
   * @param options - Optional execution configuration
   * @param onProgress - Optional progress callback
   */
  execute(
    action: Action,
    options?: ExecutionOptions,
    onProgress?: ExecutionProgressCallback
  ): Promise<ActionResult>;

  /**
   * Execute multiple actions in batch
   * @param actions - Array of actions to execute
   * @param options - Optional execution configuration
   * @param onProgress - Optional progress callback
   */
  executeBatch(
    actions: Action[],
    options?: ExecutionOptions,
    onProgress?: ExecutionProgressCallback
  ): Promise<ActionResult[]>;

  /**
   * Prepare an action for execution (validate, gather required data)
   * @param action - The action to prepare
   */
  prepare(action: Action): Promise<{
    /** Whether preparation was successful */
    success: boolean;
    /** Whether action is ready to execute */
    isReady: boolean;
    /** Missing required data */
    missingData?: string[];
    /** Error message if preparation failed */
    error?: string;
  }>;

  /**
   * Validate an action before execution
   * @param action - The action to validate
   */
  validate(action: Action): Promise<{
    /** Whether action is valid */
    valid: boolean;
    /** Validation errors */
    errors?: string[];
  }>;

  /**
   * Cancel an executing action
   * @param actionId - The ID of the action to cancel
   */
  cancel(actionId: string): Promise<boolean>;

  /**
   * Get execution status for an action
   * @param actionId - The action ID
   */
  getStatus(actionId: string): Promise<ExecutionStatus | null>;

  /**
   * Check if executor can handle a specific action type
   * @param actionType - The action type to check
   */
  canExecute(actionType: Action['type']): Promise<boolean>;

  /**
   * Get required permissions for an action type
   * @param actionType - The action type
   */
  getRequiredPermissions(actionType: Action['type']): Promise<string[]>;

  /**
   * Request required permissions for an action type
   * @param actionType - The action type
   */
  requestPermissions(actionType: Action['type']): Promise<boolean>;

  /**
   * Cleanup and release resources
   */
  cleanup(): Promise<void>;
}

/**
 * Specific executor interfaces for each action type
 */

/**
 * Calendar action executor interface
 */
export interface ICalendarActionExecutor {
  /**
   * Create a calendar event
   * @param title - Event title
   * @param startTime - Event start time (ISO 8601)
   * @param endTime - Event end time (ISO 8601)
   * @param options - Optional event details
   */
  createEvent(
    title: string,
    startTime: string,
    endTime: string,
    options?: {
      location?: string;
      attendees?: string[];
      reminderMinutes?: number;
      description?: string;
    }
  ): Promise<ActionResult>;
}

/**
 * Payment action executor interface
 */
export interface IPaymentActionExecutor {
  /**
   * Initiate a payment transfer
   * @param recipient - Recipient name or ID
   * @param amount - Amount to transfer
   * @param currency - Currency code
   * @param options - Optional payment details
   */
  initiatePayment(
    recipient: string,
    amount: number,
    currency: string,
    options?: {
      memo?: string;
      deepLink?: string;
    }
  ): Promise<ActionResult>;
}

/**
 * Shopping action executor interface
 */
export interface IShoppingActionExecutor {
  /**
   * Add product to wishlist
   * @param productName - Product name
   * @param price - Product price
   * @param currency - Currency code
   * @param options - Optional product details
   */
  addToWishlist(
    productName: string,
    price: number,
    currency: string,
    options?: {
      productUrl?: string;
      targetPrice?: number;
    }
  ): Promise<ActionResult>;

  /**
   * Open product page or app
   * @param deepLink - Deep link to product
   */
  openProduct(deepLink: string): Promise<ActionResult>;
}

/**
 * Task action executor interface
 */
export interface ITaskActionExecutor {
  /**
   * Create a task in the task manager
   * @param title - Task title
   * @param deadline - Deadline timestamp
   * @param options - Optional task details
   */
  createTask(
    title: string,
    deadline: number,
    options?: {
      description?: string;
      tags?: string[];
      parentTaskId?: string;
    }
  ): Promise<ActionResult>;
}

/**
 * Navigation action executor interface
 */
export interface INavigationActionExecutor {
  /**
   * Open navigation app with destination
   * @param destination - Destination name or address
   * @param options - Optional navigation details
   */
  openNavigation(
    destination: string,
    options?: {
      latitude?: number;
      longitude?: number;
      transportMode?: 'driving' | 'walking' | 'transit' | 'cycling';
    }
  ): Promise<ActionResult>;
}

/**
 * Communication action executor interface
 */
export interface ICommunicationActionExecutor {
  /**
   * Send a message or initiate communication
   * @param recipient - Recipient contact info
   * @param commType - Communication type
   * @param options - Optional message details
   */
  send(
    recipient: string,
    commType: 'email' | 'sms' | 'chat' | 'call',
    options?: {
      messageTemplate?: string;
      scheduledTime?: number;
    }
  ): Promise<ActionResult>;
}
