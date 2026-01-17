/**
 * Mock for react-native-push-notification
 */

export const PushNotification = {
  configure: jest.fn(),
  localNotification: jest.fn(),
  localNotificationSchedule: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
  cancelLocalNotifications: jest.fn(),
  getScheduledLocalNotifications: jest.fn(),
  requestPermissions: jest.fn(),
  abandonPermissions: jest.fn(),
  checkPermissions: jest.fn(),
  getApplicationIconBadgeNumber: jest.fn(),
  setApplicationIconBadgeNumber: jest.fn(),
  subscribeToTopic: jest.fn(),
  unsubscribeFromTopic: jest.fn(),
};

export const PushNotificationIOS = {
  requestPermissions: jest.fn(),
  checkPermissions: jest.fn(),
  abandonPermissions: jest.fn(),
  setApplicationIconBadgeNumber: jest.fn(),
  getApplicationIconBadgeNumber: jest.fn(),
 addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

export default {
  PushNotification,
  PushNotificationIOS,
};
