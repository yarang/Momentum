/**
 * Notification Service
 *
 * Handles local and push notifications for Momentum app.
 * Provides a unified interface for iOS and Android.
 */

import { Platform, Alert } from 'react-native';
import PushNotification, { Importance } from 'react-native-push-notification';
import { permissionsService, PermissionType } from './PermissionsService';

/**
 * Notification channel interface (Android)
 */
export interface NotificationChannel {
  channelId: string;
  channelName: string;
  channelDescription: string;
  importance: Importance;
  vibrate: boolean;
  sound: boolean;
}

/**
 * Notification data interface
 */
export interface NotificationData {
  id?: number;
  title: string;
  message: string;
  bigText?: string;
  subText?: string;
  ticker?: string;
  autoCancel?: boolean;
  largeIcon?: string;
  smallIcon?: string;
  bigLargeIcon?: string;
  bigSmallIcon?: string;
  sound?: string;
  vibrate?: boolean | number[];
  vibration?: number;
  priority?: number;
  importance?: Importance;
  playSound?: boolean;
  soundName?: string;
  number?: number;
  category?: string;
  userInfo?: any;
  actions?: string[];
  invokeApp?: boolean;
  when?: number;
  usesChronometer?: boolean;
  timeoutAfter?: number;
  color?: string;
  onlyAlertOnce?: boolean;
  showWhen?: boolean;
  ongoing?: boolean;
  foreground?: boolean;
  userInteraction?: boolean;
  idInGroup?: string;
  group?: string;
  groupSummary?: boolean;
}

/**
 * Scheduled notification interface
 */
export interface ScheduledNotification extends NotificationData {
  date: Date;
  repeatType?: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  allowWhileIdle?: boolean;
  exact?: boolean;
}

/**
 * Notification permission result
 */
export interface NotificationPermissionResult {
  granted: boolean;
  canRequest?: boolean;
}

/**
 * Default notification channels for Android
 */
const DEFAULT_CHANNELS: NotificationChannel[] = [
  {
    channelId: 'momentum-default',
    channelName: 'Default Notifications',
    channelDescription: 'General notifications from Momentum',
    importance: Importance.HIGH,
    vibrate: true,
    sound: true,
  },
  {
    channelId: 'momentum-actions',
    channelName: 'Action Reminders',
    channelDescription: 'Reminders for pending actions and tasks',
    importance: Importance.HIGH,
    vibrate: true,
    sound: true,
  },
  {
    channelId: 'momentum-social',
    channelName: 'Social Events',
    channelDescription: 'Notifications for social events and occasions',
    importance: Importance.DEFAULT,
    vibrate: true,
    sound: true,
  },
  {
    channelId: 'momentum-shopping',
    channelName: 'Shopping Alerts',
    channelDescription: 'Price alerts and shopping recommendations',
    importance: Importance.DEFAULT,
    vibrate: false,
    sound: true,
  },
];

/**
 * Notification Service Class
 */
export class NotificationService {
  private static instance: NotificationService;
  private initialized: boolean = false;
  private notificationChannels: Map<string, NotificationChannel> = new Map();
  private onNotificationListeners: Array<(notification: any) => void> = [];
  private onOpenNotificationListeners: Array<(notification: any) => void> = [];

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification service
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.initialized) {
        return true;
      }

      // Configure push notifications
      PushNotification.configure({
        onRegister: this.handleRegister.bind(this),
        onNotification: this.handleNotification.bind(this),
        onAction: this.handleAction.bind(this),
        onRegistrationError: this.handleRegistrationError.bind(this),
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
        popInitialNotification: true,
        requestPermissions: Platform.OS === 'ios',
      });

      // Create notification channels for Android
      if (Platform.OS === 'android') {
        this.createNotificationChannels(DEFAULT_CHANNELS);
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
      return false;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<NotificationPermissionResult> {
    try {
      if (Platform.OS === 'ios') {
        return new Promise((resolve) => {
          PushNotification.requestPermissions().then(({ alert, badge, sound }) => {
            const granted = alert || badge || sound;
            resolve({
              granted,
              canRequest: true,
            });
          });
        });
      } else {
        // Android
        const result = await permissionsService.requestPermission(
          PermissionType.NOTIFICATION,
          false
        );
        return {
          granted: result.granted,
          canRequest: true,
        };
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return {
        granted: false,
        canRequest: false,
      };
    }
  }

  /**
   * Check notification permissions
   */
  async checkPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        // iOS doesn't provide a check method, assume not granted
        return false;
      } else {
        const result = await permissionsService.checkPermission(PermissionType.NOTIFICATION);
        return result.granted;
      }
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  /**
   * Show local notification immediately
   */
  showLocalNotification(data: NotificationData): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        PushNotification.localNotification({
          ...data,
          channelId: 'momentum-default',
        });
        resolve();
      } catch (error) {
        console.error('Error showing local notification:', error);
        reject(error);
      }
    });
  }

  /**
   * Schedule notification for specific time
   */
  scheduleNotification(data: ScheduledNotification): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        PushNotification.localNotificationSchedule({
          ...data,
          channelId: 'momentum-default',
          date: data.date,
          repeatType: data.repeatType,
          allowWhileIdle: data.allowWhileIdle || false,
          exact: data.exact || false,
        });
        resolve();
      } catch (error) {
        console.error('Error scheduling notification:', error);
        reject(error);
      }
    });
  }

  /**
   * Cancel specific notification
   */
  cancelNotification(id: number): void {
    try {
      PushNotification.cancelLocalNotifications({ id: id.toString() });
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Cancel all local notifications
   */
  cancelAllNotifications(): void {
    try {
      PushNotification.cancelAllLocalNotifications();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications (Android only)
   */
  getScheduledNotifications(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (Platform.OS === 'android') {
        PushNotification.getScheduledLocalNotifications((notifications) => {
          resolve(notifications);
        });
      } else {
        // iOS doesn't support this
        resolve([]);
      }
    });
  }

  /**
   * Cancel all scheduled notifications
   */
  cancelAllScheduledNotifications(): void {
    try {
      PushNotification.cancelAllLocalNotifications();
    } catch (error) {
      console.error('Error canceling all scheduled notifications:', error);
    }
  }

  /**
   * Set application badge count
   */
  setApplicationIconBadgeNumber(number: number): void {
    try {
      PushNotification.setApplicationIconBadgeNumber(number);
    } catch (error) {
      console.error('Error setting badge number:', error);
    }
  }

  /**
   * Get application badge count
   */
  getApplicationIconBadgeNumber(callback: (number: number) => void): void {
    try {
      PushNotification.getApplicationIconBadgeNumber(callback);
    } catch (error) {
      console.error('Error getting badge number:', error);
      callback(0);
    }
  }

  /**
   * Create notification channels (Android only)
   */
  createNotificationChannels(channels: NotificationChannel[]): void {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      channels.forEach((channel) => {
        PushNotification.createChannel(
          {
            channelId: channel.channelId,
            channelName: channel.channelName,
            channelDescription: channel.channelDescription,
            importance: channel.importance,
            vibrate: channel.vibrate,
            sound: channel.sound,
          },
          (created) => {
            if (created) {
              this.notificationChannels.set(channel.channelId, channel);
              console.log(`Notification channel created: ${channel.channelId}`);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error creating notification channels:', error);
    }
  }

  /**
   * Add notification listener
   */
  addNotificationListener(listener: (notification: any) => void): void {
    this.onNotificationListeners.push(listener);
  }

  /**
   * Add open notification listener
   */
  addOpenNotificationListener(listener: (notification: any) => void): void {
    this.onOpenNotificationListeners.push(listener);
  }

  /**
   * Remove notification listener
   */
  removeNotificationListener(listener: (notification: any) => void): void {
    const index = this.onNotificationListeners.indexOf(listener);
    if (index > -1) {
      this.onNotificationListeners.splice(index, 1);
    }
  }

  /**
   * Remove open notification listener
   */
  removeOpenNotificationListener(listener: (notification: any) => void): void {
    const index = this.onOpenNotificationListeners.indexOf(listener);
    if (index > -1) {
      this.onOpenNotificationListeners.splice(index, 1);
    }
  }

  /**
   * Handle device registration for push notifications
   */
  private handleRegister(token: string): void {
    console.log('Notification token received:', token);
    // TODO: Send token to backend server
  }

  /**
   * Handle incoming notification
   */
  private handleNotification(notification: any): void {
    console.log('Notification received:', notification);

    // Notify all listeners
    this.onNotificationListeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });

    // Handle notification opened
    if (notification.userInteraction) {
      this.onOpenNotificationListeners.forEach((listener) => {
        try {
          listener(notification);
        } catch (error) {
          console.error('Error in open notification listener:', error);
        }
      });
    }
  }

  /**
   * Handle notification action press
   */
  private handleAction(notification: any): void {
    console.log('Notification action received:', notification);
    // TODO: Handle notification actions
  }

  /**
   * Handle registration error
   */
  private handleRegistrationError(error: any): void {
    console.error('Notification registration error:', error);
  }

  /**
   * Show action reminder notification
   */
  async showActionReminder(
    actionTitle: string,
    actionDescription: string,
    scheduledDate?: Date
  ): Promise<void> {
    const notification: ScheduledNotification = {
      id: Date.now(),
      title: 'Action Reminder',
      message: actionTitle,
      bigText: actionDescription,
      subText: 'Tap to view details',
      channelId: 'momentum-actions',
      importance: Importance.HIGH,
      vibrate: true,
      sound: true,
      playSound: true,
      soundName: 'default',
      category: 'action',
      userInfo: {
        type: 'action_reminder',
        title: actionTitle,
        description: actionDescription,
      },
      date: scheduledDate || new Date(),
      allowWhileIdle: true,
    };

    if (scheduledDate) {
      await this.scheduleNotification(notification);
    } else {
      await this.showLocalNotification(notification);
    }
  }

  /**
   * Show social event notification
   */
  async showSocialEventNotification(
    eventName: string,
    eventDate: string,
    location?: string
  ): Promise<void> {
    const message = location
      ? `${eventName} at ${location} on ${eventDate}`
      : `${eventName} on ${eventDate}`;

    await this.showLocalNotification({
      id: Date.now(),
      title: 'Upcoming Event',
      message,
      bigText: message,
      channelId: 'momentum-social',
      importance: Importance.DEFAULT,
      vibrate: true,
      sound: true,
      playSound: true,
      soundName: 'default',
      category: 'social',
      userInfo: {
        type: 'social_event',
        name: eventName,
        date: eventDate,
        location,
      },
    });
  }

  /**
   * Show shopping alert notification
   */
  async showShoppingAlert(
    productName: string,
    currentPrice: number,
    targetPrice?: number
  ): Promise<void> {
    const message = targetPrice
      ? `${productName} is now ${currentPrice} (target: ${targetPrice})`
      : `${productName} price dropped to ${currentPrice}`;

    await this.showLocalNotification({
      id: Date.now(),
      title: 'Price Drop Alert',
      message,
      bigText: message,
      channelId: 'momentum-shopping',
      importance: Importance.DEFAULT,
      vibrate: false,
      sound: true,
      playSound: true,
      soundName: 'default',
      category: 'shopping',
      userInfo: {
        type: 'shopping_alert',
        product: productName,
        currentPrice,
        targetPrice,
      },
    });
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.onNotificationListeners = [];
    this.onOpenNotificationListeners = [];
    this.initialized = false;
  }
}

/**
 * Export singleton instance
 */
export const notificationService = NotificationService.getInstance();
