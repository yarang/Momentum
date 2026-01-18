/**
 * Action Executor Service
 *
 * Main implementation of action execution functionality.
 * Handles executing calendar, payment, shopping, task, navigation, and communication actions.
 */

import { Action, ActionResult, Task } from '@/shared/models';
import { Linking } from 'react-native';
import {
  IActionExecutor,
  ExecutionStatus,
  ExecutionOptions,
  ExecutionProgressCallback,
  ICalendarActionExecutor,
  IPaymentActionExecutor,
  IShoppingActionExecutor,
  ITaskActionExecutor,
  INavigationActionExecutor,
  ICommunicationActionExecutor,
} from './IActionExecutor';
import { v4 as uuidv4 } from 'uuid';
import { notificationService, permissionsService, PermissionType } from '@/services/native';

/**
 * Action Executor Service Implementation
 */
export class ActionExecutorService
  implements
    IActionExecutor,
    ICalendarActionExecutor,
    IPaymentActionExecutor,
    IShoppingActionExecutor,
    ITaskActionExecutor,
    INavigationActionExecutor,
    ICommunicationActionExecutor
{
  private initialized: boolean = false;
  private executingActions: Map<string, boolean> = new Map();
  private actionStatuses: Map<string, ExecutionStatus> = new Map();

  /**
   * Initialize the executor
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize notification service
      const notifications = await notificationService.initialize();

      // Request notification permissions
      const notificationPermission = await permissionsService.requestPermission(
        PermissionType.NOTIFICATION,
        false
      );

      if (!notificationPermission.granted) {
        console.warn('Notification permission not granted');
      }

      this.initialized = true;
      return notifications;
    } catch (error) {
      console.error('Failed to initialize ActionExecutorService:', error);
      return false;
    }
  }

  /**
   * Execute a single action
   */
  async execute(
    action: Action,
    options?: ExecutionOptions,
    onProgress?: ExecutionProgressCallback
  ): Promise<ActionResult> {
    try {
      // Update status
      this.updateStatus(action.id, 'preparing', 0);
      onProgress?.(this.actionStatuses.get(action.id)!);

      // Check if confirmation is required
      if (options?.requireConfirmation) {
        // TODO: Show confirmation dialog to user
        // For now, proceed with execution
      }

      // Validate action
      const validation = await this.validate(action);
      if (!validation.valid) {
        this.updateStatus(action.id, 'failed', 0, validation.errors?.join(', '));
        return {
          actionId: action.id,
          success: false,
          error: validation.errors?.join(', ') || 'Validation failed',
          timestamp: Date.now(),
        };
      }

      // Update status
      this.updateStatus(action.id, 'executing', 50);
      onProgress?.(this.actionStatuses.get(action.id)!);

      // Execute based on action type
      let result: ActionResult;

      switch (action.type) {
        case 'calendar':
          result = await this.executeCalendarAction(action);
          break;
        case 'payment':
          result = await this.executePaymentAction(action);
          break;
        case 'shopping':
          result = await this.executeShoppingAction(action);
          break;
        case 'task':
          result = await this.executeTaskAction(action);
          break;
        case 'navigation':
          result = await this.executeNavigationAction(action);
          break;
        case 'communication':
          result = await this.executeCommunicationAction(action);
          break;
        case 'notification':
          result = await this.executeNotificationAction(action);
          break;
        default:
          result = {
            actionId: action.id,
            success: false,
            error: `Unknown action type: ${action.type}`,
            timestamp: Date.now(),
          };
      }

      // Update final status
      if (result.success) {
        this.updateStatus(action.id, 'completed', 100);
      } else {
        this.updateStatus(action.id, 'failed', 0, result.error);
      }
      onProgress?.(this.actionStatuses.get(action.id)!);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.updateStatus(action.id, 'failed', 0, errorMessage);
      return {
        actionId: action.id,
        success: false,
        error: errorMessage,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Execute multiple actions in batch
   */
  async executeBatch(
    actions: Action[],
    options?: ExecutionOptions,
    onProgress?: ExecutionProgressCallback
  ): Promise<ActionResult[]> {
    const results: ActionResult[] = [];

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const result = await this.execute(action, options, onProgress);
      results.push(result);

      // Update overall progress
      const overallProgress = Math.round(((i + 1) / actions.length) * 100);
      onProgress?.({
        actionId: 'batch',
        stage: 'executing',
        progress: overallProgress,
        message: `Completed ${i + 1}/${actions.length} actions`,
      });
    }

    return results;
  }

  /**
   * Prepare an action for execution
   */
  async prepare(action: Action): Promise<{
    success: boolean;
    isReady: boolean;
    missingData?: string[];
    error?: string;
  }> {
    const missingData: string[] = [];

    // Check required data based on action type
    switch (action.type) {
      case 'calendar':
        if (!action.metadata?.date) {
          missingData.push('date');
        }
        break;
      case 'payment':
        if (!action.entities?.some((e) => e.type === 'amount')) {
          missingData.push('amount');
        }
        break;
      case 'task':
        if (!action.metadata?.deadline) {
          missingData.push('deadline');
        }
        break;
    }

    return {
      success: true,
      isReady: missingData.length === 0,
      missingData: missingData.length > 0 ? missingData : undefined,
    };
  }

  /**
   * Validate an action before execution
   */
  async validate(action: Action): Promise<{
    valid: boolean;
    errors?: string[];
  }> {
    const errors: string[] = [];

    if (!action.id || action.id.trim().length === 0) {
      errors.push('Action ID is required');
    }

    if (!action.title || action.title.trim().length === 0) {
      errors.push('Action title is required');
    }

    if (action.entities && !Array.isArray(action.entities)) {
      errors.push('Entities must be an array');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Cancel an executing action
   */
  async cancel(actionId: string): Promise<boolean> {
    // TODO: Implement actual cancellation logic
    this.executingActions.delete(actionId);
    return true;
  }

  /**
   * Get execution status for an action
   */
  async getStatus(actionId: string): Promise<ExecutionStatus | null> {
    return this.actionStatuses.get(actionId) || null;
  }

  /**
   * Check if executor can handle a specific action type
   */
  async canExecute(actionType: Action['type']): Promise<boolean> {
    const supportedTypes: Action['type'][] = [
      'calendar',
      'payment',
      'shopping',
      'task',
      'navigation',
      'communication',
      'notification',
    ];
    return supportedTypes.includes(actionType);
  }

  /**
   * Get required permissions for an action type
   */
  async getRequiredPermissions(actionType: Action['type']): Promise<string[]> {
    switch (actionType) {
      case 'calendar':
        return ['READ_CALENDAR', 'WRITE_CALENDAR'];
      case 'notification':
        return ['POST_NOTIFICATIONS', 'VIBRATE', 'WAKE_LOCK'];
      case 'navigation':
        return ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'];
      default:
        return [];
    }
  }

  /**
   * Request required permissions for an action type
   */
  async requestPermissions(actionType: Action['type']): Promise<boolean> {
    try {
      switch (actionType) {
        case 'calendar':
          const calendarPermission = await permissionsService.requestPermission(
            PermissionType.CALENDAR,
            true
          );
          return calendarPermission.granted;
        case 'notification':
          const notificationPermission = await permissionsService.requestPermission(
            PermissionType.NOTIFICATION,
            true
          );
          return notificationPermission.granted;
        case 'navigation':
          const locationPermission = await permissionsService.requestPermission(
            PermissionType.LOCATION,
            true
          );
          return locationPermission.granted;
        default:
          return true;
      }
    } catch (error) {
      console.error(`Error requesting permissions for ${actionType}:`, error);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.executingActions.clear();
    this.actionStatuses.clear();
    this.initialized = false;
    await notificationService.cleanup();
  }

  // Calendar Action Executor Methods

  /**
   * Create a calendar event
   */
  async createEvent(
    title: string,
    startTime: string,
    endTime: string,
    options?: {
      location?: string;
      attendees?: string[];
      reminderMinutes?: number;
      description?: string;
    }
  ): Promise<ActionResult> {
    try {
      // TODO: Implement actual calendar event creation
      // using react-native-calendars or platform-specific APIs
      console.log('Creating calendar event:', {
        title,
        startTime,
        endTime,
        options,
      });

      return {
        actionId: uuidv4(),
        success: true,
        timestamp: Date.now(),
        metadata: {
          eventId: `event_${Date.now()}`,
          message: 'Calendar event created successfully',
        },
      };
    } catch (error) {
      return {
        actionId: uuidv4(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  // Payment Action Executor Methods

  /**
   * Initiate a payment transfer
   */
  async initiatePayment(
    recipient: string,
    amount: number,
    currency: string,
    options?: {
      memo?: string;
      deepLink?: string;
    }
  ): Promise<ActionResult> {
    try {
      if (options?.deepLink) {
        // Open banking app via deep link
        const supported = await Linking.canOpenURL(options.deepLink);
        if (supported) {
          await Linking.openURL(options.deepLink);
        }
      }

      return {
        actionId: uuidv4(),
        success: true,
        timestamp: Date.now(),
        metadata: {
          message: 'Payment app opened',
          recipient,
          amount,
          currency,
        },
      };
    } catch (error) {
      return {
        actionId: uuidv4(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  // Shopping Action Executor Methods

  /**
   * Add product to wishlist
   */
  async addToWishlist(
    productName: string,
    price: number,
    currency: string,
    _options?: {
      productUrl?: string;
      targetPrice?: number;
    }
  ): Promise<ActionResult> {
    try {
      // TODO: Implement actual wishlist storage
      // using AsyncStorage or database

      return {
        actionId: uuidv4(),
        success: true,
        timestamp: Date.now(),
        metadata: {
          message: 'Product added to wishlist',
          productName,
          price,
          currency,
        },
      };
    } catch (error) {
      return {
        actionId: uuidv4(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Open product page or app
   */
  async openProduct(deepLink: string): Promise<ActionResult> {
    try {
      const supported = await Linking.canOpenURL(deepLink);
      if (!supported) {
        throw new Error(`Cannot open URL: ${deepLink}`);
      }

      await Linking.openURL(deepLink);

      return {
        actionId: uuidv4(),
        success: true,
        timestamp: Date.now(),
        metadata: {
          message: 'Product page opened',
          url: deepLink,
        },
      };
    } catch (error) {
      return {
        actionId: uuidv4(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  // Task Action Executor Methods

  /**
   * Create a task in the task manager
   */
  async createTask(
    title: string,
    deadline: number,
    options?: {
      description?: string;
      tags?: string[];
      parentTaskId?: string;
    }
  ): Promise<ActionResult> {
    try {
      // TODO: Implement actual task creation
      // using Zustand store or database

      const task: Task = {
        id: uuidv4(),
        title,
        description: options?.description || '',
        status: 'pending',
        priority: this.calculatePriorityFromDeadline(deadline),
        category: 'other',
        deadline,
        tags: options?.tags || [],
        entities: [],
        sourceContextId: `action_${Date.now()}`,
        actions: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        notified: false,
      };

      return {
        actionId: uuidv4(),
        success: true,
        timestamp: Date.now(),
        metadata: {
          taskId: task.id,
          message: 'Task created successfully',
        },
      };
    } catch (error) {
      return {
        actionId: uuidv4(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  // Navigation Action Executor Methods

  /**
   * Open navigation app with destination
   */
  async openNavigation(
    destination: string,
    options?: {
      latitude?: number;
      longitude?: number;
      transportMode?: 'driving' | 'walking' | 'transit' | 'cycling';
    }
  ): Promise<ActionResult> {
    try {
      // Construct navigation URL based on platform
      let url: string;

      if (options?.latitude && options?.longitude) {
        // Use coordinates
        url = `https://www.google.com/maps/dir/?api=1&destination=${options.latitude},${options.longitude}&travelmode=${options?.transportMode || 'driving'}`;
      } else {
        // Use destination name
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
      }

      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        throw new Error(`Cannot open URL: ${url}`);
      }

      await Linking.openURL(url);

      return {
        actionId: uuidv4(),
        success: true,
        timestamp: Date.now(),
        metadata: {
          message: 'Navigation opened',
          destination,
          url,
        },
      };
    } catch (error) {
      return {
        actionId: uuidv4(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  // Communication Action Executor Methods

  /**
   * Send a message or initiate communication
   */
  async send(
    recipient: string,
    commType: 'email' | 'sms' | 'chat' | 'call',
    options?: {
      messageTemplate?: string;
      scheduledTime?: number;
    }
  ): Promise<ActionResult> {
    try {
      let url: string;

      switch (commType) {
        case 'email':
          url = `mailto:${recipient}${
            options?.messageTemplate
              ? `?body=${encodeURIComponent(options.messageTemplate)}`
              : ''
          }`;
          break;
        case 'sms':
          url = `sms:${recipient}${
            options?.messageTemplate
              ? `?body=${encodeURIComponent(options.messageTemplate)}`
              : ''
          }`;
          break;
        case 'call':
          url = `tel:${recipient}`;
          break;
        default:
          throw new Error(`Unsupported communication type: ${commType}`);
      }

      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        throw new Error(`Cannot open URL: ${url}`);
      }

      await Linking.openURL(url);

      return {
        actionId: uuidv4(),
        success: true,
        timestamp: Date.now(),
        metadata: {
          message: `${commType} initiated`,
          recipient,
          url,
        },
      };
    } catch (error) {
      return {
        actionId: uuidv4(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  // Private Helper Methods

  /**
   * Execute calendar action
   */
  private async executeCalendarAction(action: Action): Promise<ActionResult> {
    const dateEntity = action.entities?.find((e) => e.type === 'date');
    const locationEntity = action.entities?.find((e) => e.type === 'location');

    if (!dateEntity?.value) {
      return {
        actionId: action.id,
        success: false,
        error: 'Date entity required for calendar action',
        timestamp: Date.now(),
      };
    }

    const startTime = new Date(dateEntity.value);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    return this.createEvent(action.title, startTime.toISOString(), endTime.toISOString(), {
      location: locationEntity?.value as string,
      description: action.description,
    });
  }

  /**
   * Execute payment action
   */
  private async executePaymentAction(action: Action): Promise<ActionResult> {
    const amountEntity = action.entities?.find((e) => e.type === 'amount');
    const personEntity = action.entities?.find((e) => e.type === 'person');

    if (!amountEntity?.value) {
      return {
        actionId: action.id,
        success: false,
        error: 'Amount entity required for payment action',
        timestamp: Date.now(),
      };
    }

    return this.initiatePayment(
      (personEntity?.value as string) || 'Unknown',
      parseFloat(amountEntity.value),
      amountEntity.metadata?.currency as string || 'KRW',
      {
        deepLink: action.metadata?.deepLink as string,
      }
    );
  }

  /**
   * Execute shopping action
   */
  private async executeShoppingAction(action: Action): Promise<ActionResult> {
    const amountEntity = action.entities?.find((e) => e.type === 'amount');

    if (amountEntity?.value) {
      return this.addToWishlist(
        action.title,
        parseFloat(amountEntity.value),
        amountEntity.metadata?.currency as string || 'KRW',
        {
          productUrl: action.metadata?.productUrl as string,
          targetPrice: action.metadata?.targetPrice as number,
        }
      );
    }

    // If no price, just add to wishlist
    return this.addToWishlist(action.title, 0, 'KRW');
  }

  /**
   * Execute task action
   */
  private async executeTaskAction(action: Action): Promise<ActionResult> {
    const dateEntity = action.entities?.find((e) => e.type === 'date');

    const deadline = dateEntity?.value
      ? new Date(dateEntity.value).getTime()
      : Date.now() + 7 * 24 * 60 * 60 * 1000; // Default 1 week

    return this.createTask(action.title, deadline, {
      description: action.description,
      tags: action.tags,
    });
  }

  /**
   * Execute navigation action
   */
  private async executeNavigationAction(action: Action): Promise<ActionResult> {
    const locationEntity = action.entities?.find((e) => e.type === 'location');

    const destination = (locationEntity?.value as string) || action.title;

    return this.openNavigation(destination, {
      latitude: action.metadata?.latitude as number | undefined,
      longitude: action.metadata?.longitude as number | undefined,
      transportMode: action.metadata?.transportMode as
        | 'driving'
        | 'walking'
        | 'transit'
        | 'cycling'
        | undefined,
    });
  }

  /**
   * Execute communication action
   */
  private async executeCommunicationAction(action: Action): Promise<ActionResult> {
    const personEntity = action.entities?.find((e) => e.type === 'person');

    if (!personEntity?.value) {
      return {
        actionId: action.id,
        success: false,
        error: 'Person entity required for communication action',
        timestamp: Date.now(),
      };
    }

    return this.send(
      personEntity.value as string,
      (action.metadata?.commType as 'email' | 'sms' | 'chat' | 'call') || 'email',
      {
        messageTemplate: action.metadata?.messageTemplate as string,
      }
    );
  }

  /**
   * Execute notification action
   */
  private async executeNotificationAction(action: Action): Promise<ActionResult> {
    try {
      await notificationService.showActionReminder(
        action.title,
        action.description || 'Action reminder'
      );

      return {
        actionId: action.id,
        success: true,
        timestamp: Date.now(),
        metadata: {
          message: 'Notification sent',
        },
      };
    } catch (error) {
      return {
        actionId: action.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Update execution status
   */
  private updateStatus(
    actionId: string,
    stage: ExecutionStatus['stage'],
    progress: number,
    message?: string
  ): void {
    const status: ExecutionStatus = {
      actionId,
      stage,
      progress,
      message,
    };
    this.actionStatuses.set(actionId, status);
  }

  /**
   * Calculate priority from deadline
   */
  private calculatePriorityFromDeadline(deadline: number): 'low' | 'medium' | 'high' {
    const now = Date.now();
    const daysUntilDeadline = (deadline - now) / (1000 * 60 * 60 * 24);

    if (daysUntilDeadline <= 2) {return 'high';}
    if (daysUntilDeadline <= 7) {return 'medium';}
    return 'low';
  }
}
