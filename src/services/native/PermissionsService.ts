/**
 * Permissions Service
 *
 * Handles all permission requests and checks for the Momentum app.
 * Provides a unified interface for iOS and Android permissions.
 */

import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import { PERMISSIONS, PermissionStatus, check, request, RESULTS, openSettings } from 'react-native-permissions';

/**
 * Permission type enum
 */
export enum PermissionType {
  CAMERA = 'CAMERA',
  PHOTO_LIBRARY = 'PHOTO_LIBRARY',
  MICROPHONE = 'MICROPHONE',
  LOCATION = 'LOCATION',
  NOTIFICATION = 'NOTIFICATION',
  CALENDAR = 'CALENDAR',
}

/**
 * Permission result interface
 */
export interface PermissionResult {
  granted: boolean;
  status: PermissionStatus;
  canOpenSettings?: boolean;
}

/**
 * Platform-specific permission mapping
 */
const PERMISSION_MAP: Record<string, Record<string, string>> = {
  android: {
    [PermissionType.CAMERA]: PERMISSIONS.ANDROID.CAMERA,
    [PermissionType.PHOTO_LIBRARY]: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    [PermissionType.MICROPHONE]: PERMISSIONS.ANDROID.RECORD_AUDIO,
    [PermissionType.LOCATION]: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    [PermissionType.NOTIFICATION]: PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
    [PermissionType.CALENDAR]: PERMISSIONS.ANDROID.WRITE_CALENDAR,
  },
  ios: {
    [PermissionType.CAMERA]: PERMISSIONS.IOS.CAMERA,
    [PermissionType.PHOTO_LIBRARY]: PERMISSIONS.IOS.PHOTO_LIBRARY,
    [PermissionType.MICROPHONE]: PERMISSIONS.IOS.MICROPHONE,
    [PermissionType.LOCATION]: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    [PermissionType.NOTIFICATION]: PERMISSIONS.IOS.NOTIFICATIONS,
    [PermissionType.CALENDAR]: PERMISSIONS.IOS.CALENDARS_WRITE_ONLY,
  },
};

/**
 * Permission rationales for user-friendly messages
 */
const PERMISSION_RATIONALES: Record<PermissionType, { title: string; message: string }> = {
  [PermissionType.CAMERA]: {
    title: 'Camera Access Required',
    message: 'Momentum needs camera access to capture screenshots and photos for context analysis. This helps us provide intelligent suggestions based on what you see.',
  },
  [PermissionType.PHOTO_LIBRARY]: {
    title: 'Photo Library Access Required',
    message: 'Momentum needs access to your photo library to select screenshots and images for analysis. Your photos are processed locally on your device.',
  },
  [PermissionType.MICROPHONE]: {
    title: 'Microphone Access Required',
    message: 'Momentum needs microphone access to record voice notes and meeting transcripts. Audio is processed locally and never shared without your consent.',
  },
  [PermissionType.LOCATION]: {
    title: 'Location Access Required',
    message: 'Momentum needs location access to provide context-aware suggestions based on where you are. Location data is used locally and never tracked.',
  },
  [PermissionType.NOTIFICATION]: {
    title: 'Notification Access Required',
    message: 'Momentum needs notification access to remind you of important actions at the right time. You can customize notification preferences in settings.',
  },
  [PermissionType.CALENDAR]: {
    title: 'Calendar Access Required',
    message: 'Momentum needs calendar access to automatically add events and reminders based on your conversations and context.',
  },
};

/**
 * Permissions Service Class
 */
export class PermissionsService {
  private static instance: PermissionsService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): PermissionsService {
    if (!PermissionsService.instance) {
      PermissionsService.instance = new PermissionsService();
    }
    return PermissionsService.instance;
  }

  /**
   * Check permission status for a given permission type
   */
  async checkPermission(permissionType: PermissionType): Promise<PermissionResult> {
    try {
      const platformPermission = this.getPlatformPermission(permissionType);
      const result = await check(platformPermission);

      return {
        granted: result === RESULTS.GRANTED || result === RESULTS.LIMITED,
        status: result,
        canOpenSettings: result === RESULTS.DENIED || result === RESULTS.BLOCKED,
      };
    } catch (error) {
      console.error(`Error checking permission ${permissionType}:`, error);
      return {
        granted: false,
        status: RESULTS.UNAVAILABLE,
      };
    }
  }

  /**
   * Request permission with user-friendly rationale
   */
  async requestPermission(
    permissionType: PermissionType,
    showRationale: boolean = true
  ): Promise<PermissionResult> {
    try {
      // First check current status
      const checkResult = await this.checkPermission(permissionType);

      // If already granted, return early
      if (checkResult.granted) {
        return checkResult;
      }

      // Show rationale if requested and permission was denied
      if (showRationale && checkResult.status === RESULTS.DENIED) {
        const rationale = PERMISSION_RATIONALES[permissionType];
        await this.showRationaleAlert(rationale.title, rationale.message);
      }

      // Request the permission
      const platformPermission = this.getPlatformPermission(permissionType);
      const result = await request(platformPermission);

      const granted = result === RESULTS.GRANTED || result === RESULTS.LIMITED;

      // Handle blocked/unavailable scenarios
      if (result === RESULTS.BLOCKED) {
        await this.showBlockedAlert(permissionType);
      }

      return {
        granted,
        status: result,
        canOpenSettings: result === RESULTS.BLOCKED || result === RESULTS.DENIED,
      };
    } catch (error) {
      console.error(`Error requesting permission ${permissionType}:`, error);
      return {
        granted: false,
        status: RESULTS.UNAVAILABLE,
      };
    }
  }

  /**
   * Request multiple permissions at once
   */
  async requestMultiplePermissions(
    permissionTypes: PermissionType[]
  ): Promise<Map<PermissionType, PermissionResult>> {
    const results = new Map<PermissionType, PermissionResult>();

    for (const permissionType of permissionTypes) {
      const result = await this.requestPermission(permissionType, false);
      results.set(permissionType, result);
    }

    return results;
  }

  /**
   * Check if all required permissions are granted
   */
  async checkAllPermissions(permissionTypes: PermissionType[]): Promise<boolean> {
    const results = await Promise.all(
      permissionTypes.map((type) => this.checkPermission(type))
    );

    return results.every((result) => result.granted);
  }

  /**
   * Open app settings
   */
  async openAppSettings(): Promise<boolean> {
    try {
      await openSettings();
      return true;
    } catch (error) {
      console.error('Error opening app settings:', error);
      return false;
    }
  }

  /**
   * Get platform-specific permission string
   */
  private getPlatformPermission(permissionType: PermissionType): string {
    const platform = Platform.OS;
    const permissions = PERMISSION_MAP[platform];

    if (!permissions || !permissions[permissionType]) {
      throw new Error(`Permission ${permissionType} not available on ${platform}`);
    }

    return permissions[permissionType];
  }

  /**
   * Show rationale alert to user
   */
  private async showRationaleAlert(title: string, message: string): Promise<void> {
    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(),
          },
          {
            text: 'Continue',
            onPress: () => resolve(),
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * Show blocked permission alert with option to open settings
   */
  private async showBlockedAlert(permissionType: PermissionType): Promise<void> {
    const rationale = PERMISSION_RATIONALES[permissionType];

    return new Promise((resolve) => {
      Alert.alert(
        'Permission Required',
        `${rationale.message}\n\nPlease enable this permission in app settings.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(),
          },
          {
            text: 'Open Settings',
            onPress: async () => {
              await this.openAppSettings();
              resolve();
            },
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * Android-specific: Request permissions with native dialog
   */
  async requestAndroidPermissions(permissions: string[]): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.requestMultiple(permissions as PermissionsAndroid[]);

      return Object.values(granted).every(
        (result) => result === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (error) {
      console.error('Error requesting Android permissions:', error);
      return false;
    }
  }

  /**
   * Check if location services are enabled
   */
  async isLocationEnabled(): Promise<boolean> {
    try {
      const platform = Platform.OS;
      if (platform === 'android') {
        // On Android, check if location provider is enabled
        // This requires additional checks beyond permission
        return true; // Simplified for now
      }
      return true;
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }
}

/**
 * Export singleton instance
 */
export const permissionsService = PermissionsService.getInstance();
