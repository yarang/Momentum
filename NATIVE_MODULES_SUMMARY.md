# Native Modules Integration Summary

## Overview

This document summarizes the native module integrations implemented for the Momentum React Native project. All native services have been successfully integrated with proper TypeScript types, error handling, and platform-specific support.

## Services Created

### 1. PermissionsService (`/home/ubuntu/works/Momentum/src/services/native/PermissionsService.ts`)

**Key Methods:**
- `checkPermission(permissionType)` - Check permission status for a specific permission type
- `requestPermission(permissionType, showRationale)` - Request permission with optional user-friendly rationale
- `requestMultiplePermissions(permissionTypes)` - Request multiple permissions at once
- `checkAllPermissions(permissionTypes)` - Check if all required permissions are granted
- `openAppSettings()` - Open app settings for manual permission changes

**Supported Permission Types:**
- `CAMERA` - Camera access
- `PHOTO_LIBRARY` - Photo library access
- `MICROPHONE` - Microphone access
- `LOCATION` - Location services
- `NOTIFICATION` - Push notifications
- `CALENDAR` - Calendar read/write

**Features:**
- Platform-specific permission mapping (iOS/Android)
- User-friendly permission rationales
- Blocked permission handling with settings redirect
- Singleton pattern implementation

---

### 2. ImagePickerService (`/home/ubuntu/works/Momentum/src/services/native/ImagePickerService.ts`)

**Key Methods:**
- `launchCamera(options)` - Open camera to capture photo
- `launchImageLibrary(options)` - Open image gallery
- `pickSingleImage(options)` - Pick one image from library
- `pickMultipleImages(options)` - Pick multiple images
- `captureScreenshot(options)` - Quick screenshot capture
- `pickScreenshot(options)` - Pick screenshot from gallery

**Features:**
- Automatic permission handling
- Base64 support option
- Image quality and size configuration
- Camera type selection (front/back)
- Support for photo and video
- Proper error handling with user-friendly messages

**Configuration Options:**
- `maxHeight`, `maxWidth` - Image dimensions
- `quality` - Image quality (0-1)
- `saveToPhotos` - Save to photo library
- `includeBase64` - Return base64 encoded image

---

### 3. NotificationService (`/home/ubuntu/works/Momentum/src/services/native/NotificationService.ts`)

**Key Methods:**
- `initialize()` - Initialize notification service with channel setup
- `showLocalNotification(data)` - Show notification immediately
- `scheduleNotification(data)` - Schedule notification for specific time
- `cancelNotification(id)` - Cancel specific notification
- `cancelAllNotifications()` - Cancel all notifications
- `showActionReminder(title, description, scheduledDate)` - Show action reminder
- `showSocialEventNotification(eventName, eventDate, location)` - Social event notification
- `showShoppingAlert(productName, currentPrice, targetPrice)` - Price drop alert

**Notification Channels (Android):**
- `momentum-default` - General notifications
- `momentum-actions` - Action reminders
- `momentum-social` - Social events
- `momentum-shopping` - Shopping alerts

**Features:**
- Platform-specific notification handling (iOS/Android)
- Scheduled notifications with repeat support
- Badge count management
- Notification listeners for open events
- Rich notification support (big text, subtext, actions)

---

### 4. LocationService (`/home/ubuntu/works/Momentum/src/services/native/LocationService.ts`)

**Key Methods:**
- `isLocationEnabled()` - Check if location services are enabled
- `requestLocationPermissions(showRationale)` - Request location permissions
- `getCurrentPosition(options)` - Get current location
- `watchPosition(callback, options, listenerId)` - Watch position changes
- `clearWatch(listenerId)` - Stop watching position
- `calculateDistance(from, to, unit)` - Calculate distance between coordinates
- `isWithinRadius(center, point, radiusKm)` - Check if point is within radius
- `getLocationName(coordinate)` - Reverse geocoding (placeholder)

**Features:**
- High-accuracy location tracking
- Distance calculations using Haversine formula
- Position watching with multiple listeners
- Configurable accuracy and update intervals
- Permission handling for foreground location

**Configuration Options:**
- `accuracy` - Location accuracy (low/balanced/high/veryHigh)
- `distanceFilter` - Minimum distance for updates
- `timeout` - Request timeout
- `enableHighAccuracy` - Use GPS when available

---

### 5. AudioRecorderService (`/home/ubuntu/works/Momentum/src/services/native/AudioRecorderService.ts`)

**Key Methods:**
- `startRecording(path, options)` - Start audio recording
- `stopRecording()` - Stop recording and return metadata
- `pauseRecording()` - Pause active recording
- `resumeRecording()` - Resume paused recording
- `startPlayback(path)` - Start audio playback
- `stopPlayback()` - Stop playback
- `pausePlayback()` - Pause playback
- `resumePlayback()` - Resume paused playback
- `seekToPlayer(seconds)` - Seek to position in audio
- `setVolume(volume)` - Set playback volume
- `recordWithDuration(durationSeconds, options)` - Record with auto-stop
- `quickRecord(options)` - Quick 30-second recording

**Features:**
- Recording state management (idle/recording/paused/stopped)
- Playback state management (idle/playing/paused/stopped)
- Recording/playback progress callbacks
- Configurable audio quality and format
- Platform-specific audio encoders
- Duration formatting

**Audio Configuration:**
- Sample rate: 44.1kHz
- Channels: Stereo (2)
- Bit rate: 128kbps
- Format: AAC (iOS), AAC_ADTS (Android)

---

## Core Services Integration

### ContextCaptureService Updates

**New Methods Added:**
- `launchImagePicker(options)` - Launch image picker (camera or gallery)
- `captureCurrentLocation(options)` - Capture current device location
- `startVoiceRecording()` - Start voice recording
- `stopVoiceRecording(transcript, options)` - Stop and save recording
- `quickRecord(options)` - Quick 30-second record

**Updated Methods:**
- `initialize()` - Now initializes audio recorder service
- `isAvailable(source)` - Uses native permission checks
- `checkPermissions(source)` - Uses PermissionsService
- `requestPermissions(source)` - Uses PermissionsService
- `cleanup()` - Cleans up audio recorder resources

**Integration Points:**
- Uses `imagePickerService` for screenshot capture
- Uses `locationService` for location tracking
- Uses `audioRecorderService` for voice recording
- Uses `permissionsService` for permission management

---

### ActionExecutorService Updates

**Updated Methods:**
- `initialize()` - Now initializes notification service
- `requestPermissions(actionType)` - Uses PermissionsService
- `executeNotificationAction(action)` - Uses NotificationService
- `cleanup()` - Cleans up notification resources

**Integration Points:**
- Uses `notificationService` for all notification actions
- Uses `permissionsService` for permission requests
- Proper cleanup of native service resources

---

## Usage Examples

### Initialize Native Services

```typescript
import { initializeNativeServices } from '@/services/native';

// During app startup
const result = await initializeNativeServices();
console.log('Native services initialized:', result);
```

### Request All Permissions

```typescript
import { requestAllPermissions } from '@/services/native';

// During onboarding
const permissions = await requestAllPermissions();
if (!permissions.camera) {
  // Show message that camera is needed
}
```

### Pick Screenshot

```typescript
import { ContextCaptureService } from '@/core/contextCapture';

const captureService = new ContextCaptureService();
const result = await captureService.launchImagePicker({ useCamera: false });
if (result.success) {
  console.log('Screenshot captured:', result.context);
}
```

### Record Voice

```typescript
import { ContextCaptureService } from '@/core/contextCapture';

const captureService = new ContextCaptureService();

// Start recording
const startResult = await captureService.startVoiceRecording();

// ... user speaks ...

// Stop recording
const stopResult = await captureService.stopVoiceRecording('transcript here');
if (stopResult.success) {
  console.log('Voice recorded:', stopResult.context);
}
```

### Get Current Location

```typescript
import { ContextCaptureService } from '@/core/contextCapture';

const captureService = new ContextCaptureService();
const result = await captureService.captureCurrentLocation();
if (result.success) {
  console.log('Location captured:', result.context);
}
```

### Show Notification

```typescript
import { notificationService } from '@/services/native';

// Initialize first
await notificationService.initialize();

// Show action reminder
await notificationService.showActionReminder(
  'Complete task',
  'Don\'t forget to finish your report',
  new Date(Date.now() + 3600000) // 1 hour from now
);
```

---

## Dependencies Added to package.json

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "^1.23.1",
    "react-native-permissions": "^4.1.5",
    "react-native-image-picker": "^7.1.2",
    "react-native-push-notification": "^8.1.1",
    "react-native-geolocation-service": "^5.3.1",
    "react-native-audio-recorder-player": "^5.1.2",
    "uuid": "^9.0.1"
  }
}
```

---

## Installation Steps

After running `npm install`, you need to configure the native modules:

### iOS Setup

```bash
cd ios
pod install
cd ..
```

### Android Setup

The AndroidManifest.xml and build.gradle should already have the necessary permissions and configurations as mentioned in the project structure.

---

## File Structure

```
src/services/native/
├── PermissionsService.ts       # Permission management
├── ImagePickerService.ts       # Image/camera handling
├── NotificationService.ts      # Push/local notifications
├── LocationService.ts          # GPS/location tracking
├── AudioRecorderService.ts     # Audio recording/playback
└── index.ts                    # Exports all services
```

---

## Next Steps

1. **Install Dependencies**: Run `npm install` to install all packages
2. **iOS Pod Install**: Run `cd ios && pod install && cd ..` for iOS
3. **Test Permissions**: Test permission flows on both iOS and Android
4. **Implement OCR**: Add text recognition for screenshots (e.g., react-native-tesseract-ocr)
5. **Implement Speech-to-Text**: Add voice transcription (e.g., react-native-voice)
6. **Add Background Location**: Implement background location updates if needed
7. **Test on Device**: Test all native features on physical devices

---

## Platform-Specific Notes

### iOS
- Requires Info.plist entries for permission descriptions (already present)
- Some permissions require additional explanations in UI
- Background location requires special entitlement

### Android
- Requires runtime permissions for dangerous permissions
- Notification channels required for Android 8.0+
- File provider needed for sharing files
- Background location requires foreground service

---

## Security Considerations

All services follow security best practices:
- Permissions requested with clear rationale
- Sensitive operations (location, microphone) require explicit user consent
- Data processed locally when possible
- No unnecessary permissions requested
- Proper error handling to prevent crashes

---

## Summary

All native module integrations have been successfully implemented with:
- ✅ TypeScript types for all services
- ✅ Platform-specific handling (iOS/Android)
- ✅ Comprehensive error handling
- ✅ User-friendly permission flows
- ✅ Integration with core services
- ✅ Proper resource cleanup
- ✅ Export through services/index.ts

The Momentum app now has full access to device capabilities for context capture and action execution.
