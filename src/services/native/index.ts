/**
 * Native Services Module
 *
 * Exports all native service integrations for Momentum app.
 * Provides unified access to platform-specific functionality.
 */

// Permissions Service
export {
  PermissionsService,
  permissionsService,
  PermissionType,
  PermissionResult,
} from './PermissionsService';

// Image Picker Service
export {
  ImagePickerService,
  imagePickerService,
  ImagePickerOptions,
  ImageResult,
} from './ImagePickerService';

// Notification Service
export {
  NotificationService,
  notificationService,
  NotificationChannel,
  NotificationData,
  ScheduledNotification,
  NotificationPermissionResult,
} from './NotificationService';

// Location Service
export {
  LocationService,
  locationService,
  Coordinate,
  LocationData,
  LocationOptions,
  DistanceResult,
} from './LocationService';

// Audio Recorder Service
export {
  AudioRecorderService,
  audioRecorderService,
  RecordingState,
  PlaybackState,
  RecordingMetadata,
  RecordingOptions,
  RecordingProgress,
  PlaybackProgress,
} from './AudioRecorderService';

/**
 * Initialize all native services
 *
 * Call this during app startup to ensure all native services are ready.
 * Services will request necessary permissions if needed.
 */
export async function initializeNativeServices(): Promise<{
  permissions: boolean;
  notifications: boolean;
  location: boolean;
  audioRecorder: boolean;
}> {
  try {
    // Initialize notification service (requires permissions)
    const notificationService = await import('./NotificationService').then(
      (m) => m.notificationService
    );
    const notifications = await notificationService.initialize();

    // Initialize audio recorder service
    const audioRecorderService = await import('./AudioRecorderService').then(
      (m) => m.audioRecorderService
    );
    const audioRecorder = await audioRecorderService.initialize();

    // Permissions and location don't require initialization
    // They will request permissions on-demand

    return {
      permissions: true,
      notifications,
      location: true,
      audioRecorder,
    };
  } catch (error) {
    console.error('Failed to initialize native services:', error);
    return {
      permissions: false,
      notifications: false,
      location: false,
      audioRecorder: false,
    };
  }
}

/**
 * Cleanup all native services
 *
 * Call this during app shutdown or logout to release resources.
 */
export async function cleanupNativeServices(): Promise<void> {
  try {
    const { notificationService } = await import('./NotificationService');
    const { audioRecorderService } = await import('./AudioRecorderService');
    const { locationService } = await import('./LocationService');

    notificationService.cleanup();
    audioRecorderService.cleanup();
    locationService.cleanup();
  } catch (error) {
    console.error('Failed to cleanup native services:', error);
  }
}

/**
 * Request all required permissions at once
 *
 * Use this during onboarding to request all permissions upfront.
 * Shows user-friendly rationales for each permission.
 */
export async function requestAllPermissions(): Promise<{
  camera: boolean;
  photoLibrary: boolean;
  microphone: boolean;
  location: boolean;
  notification: boolean;
}> {
  try {
    const { permissionsService, PermissionType } = await import('./PermissionsService');

    // Request all permissions
    const [camera, photoLibrary, microphone, location, notification] =
      await Promise.all([
        permissionsService.requestPermission(PermissionType.CAMERA, true),
        permissionsService.requestPermission(PermissionType.PHOTO_LIBRARY, true),
        permissionsService.requestPermission(PermissionType.MICROPHONE, true),
        permissionsService.requestPermission(PermissionType.LOCATION, true),
        permissionsService.requestPermission(PermissionType.NOTIFICATION, true),
      ]);

    return {
      camera: camera.granted,
      photoLibrary: photoLibrary.granted,
      microphone: microphone.granted,
      location: location.granted,
      notification: notification.granted,
    };
  } catch (error) {
    console.error('Failed to request all permissions:', error);
    return {
      camera: false,
      photoLibrary: false,
      microphone: false,
      location: false,
      notification: false,
    };
  }
}

/**
 * Check all permission statuses
 */
export async function checkAllPermissions(): Promise<{
  camera: boolean;
  photoLibrary: boolean;
  microphone: boolean;
  location: boolean;
  notification: boolean;
}> {
  try {
    const { permissionsService, PermissionType } = await import('./PermissionsService');

    const [camera, photoLibrary, microphone, location, notification] =
      await Promise.all([
        permissionsService.checkPermission(PermissionType.CAMERA),
        permissionsService.checkPermission(PermissionType.PHOTO_LIBRARY),
        permissionsService.checkPermission(PermissionType.MICROPHONE),
        permissionsService.checkPermission(PermissionType.LOCATION),
        permissionsService.checkPermission(PermissionType.NOTIFICATION),
      ]);

    return {
      camera: camera.granted,
      photoLibrary: photoLibrary.granted,
      microphone: microphone.granted,
      location: location.granted,
      notification: notification.granted,
    };
  } catch (error) {
    console.error('Failed to check all permissions:', error);
    return {
      camera: false,
      photoLibrary: false,
      microphone: false,
      location: false,
      notification: false,
    };
  }
}
