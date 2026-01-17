/**
 * Image Picker Service
 *
 * Handles image and screenshot selection from gallery or camera.
 * Provides a unified interface for iOS and Android.
 */

import { Alert, Platform } from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import { permissionsService, PermissionType } from './PermissionsService';

/**
 * Image picker options
 */
export interface ImagePickerOptions {
  includeBase64?: boolean;
  maxHeight?: number;
  maxWidth?: number;
  quality?: number;
  saveToPhotos?: boolean;
  cameraType?: 'back' | 'front';
  mediaType?: 'photo' | 'video' | 'mixed';
  durationLimit?: number;
}

/**
 * Image result interface
 */
export interface ImageResult {
  success: boolean;
  uri?: string;
  type?: string;
  fileName?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  base64?: string;
  error?: string;
  cancelled?: boolean;
}

/**
 * Default options for image picking
 */
const DEFAULT_OPTIONS: ImagePickerOptions = {
  includeBase64: false,
  maxHeight: 1080,
  maxWidth: 1080,
  quality: 0.9,
  saveToPhotos: false,
  cameraType: 'back',
  mediaType: 'photo',
  durationLimit: 30,
};

/**
 * Image Picker Service Class
 */
export class ImagePickerService {
  private static instance: ImagePickerService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ImagePickerService {
    if (!ImagePickerService.instance) {
      ImagePickerService.instance = new ImagePickerService();
    }
    return ImagePickerService.instance;
  }

  /**
   * Launch camera to capture photo
   */
  async launchCamera(options?: ImagePickerOptions): Promise<ImageResult> {
    try {
      // Check/request camera permission
      const cameraPermission = await permissionsService.requestPermission(
        PermissionType.CAMERA,
        true
      );

      if (!cameraPermission.granted) {
        return {
          success: false,
          error: 'Camera permission not granted',
          cancelled: true,
        };
      }

      // Request save to photos permission if needed
      if (options?.saveToPhotos) {
        const storagePermission = await permissionsService.requestPermission(
          PermissionType.PHOTO_LIBRARY,
          false
        );
        if (!storagePermission.granted) {
          return {
            success: false,
            error: 'Storage permission not granted. Photo will not be saved to gallery.',
          };
        }
      }

      const pickerOptions = this.buildPickerOptions({
        ...DEFAULT_OPTIONS,
        ...options,
        cameraType: 'back',
      });

      const response: ImagePickerResponse = await new Promise((resolve) => {
        launchCamera(pickerOptions, resolve);
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error launching camera:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to launch camera',
      };
    }
  }

  /**
   * Launch image library to select photo
   */
  async launchImageLibrary(options?: ImagePickerOptions): Promise<ImageResult> {
    try {
      // Check/request photo library permission
      const libraryPermission = await permissionsService.requestPermission(
        PermissionType.PHOTO_LIBRARY,
        true
      );

      if (!libraryPermission.granted) {
        return {
          success: false,
          error: 'Photo library permission not granted',
          cancelled: true,
        };
      }

      const pickerOptions = this.buildPickerOptions({
        ...DEFAULT_OPTIONS,
        ...options,
      });

      const response: ImagePickerResponse = await new Promise((resolve) => {
        launchImageLibrary(pickerOptions, resolve);
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Error launching image library:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to launch image library',
      };
    }
  }

  /**
   * Pick a single image from library
   */
  async pickSingleImage(options?: ImagePickerOptions): Promise<ImageResult> {
    return this.launchImageLibrary({
      ...options,
      selectionLimit: 1,
    });
  }

  /**
   * Pick multiple images from library
   */
  async pickMultipleImages(options?: ImagePickerOptions): Promise<ImageResult[]> {
    try {
      // Check/request photo library permission
      const libraryPermission = await permissionsService.requestPermission(
        PermissionType.PHOTO_LIBRARY,
        true
      );

      if (!libraryPermission.granted) {
        return [
          {
            success: false,
            error: 'Photo library permission not granted',
            cancelled: true,
          },
        ];
      }

      const pickerOptions = this.buildPickerOptions({
        ...DEFAULT_OPTIONS,
        ...options,
        selectionLimit: 0, // 0 = unlimited
      });

      const response: ImagePickerResponse = await new Promise((resolve) => {
        launchImageLibrary(pickerOptions, resolve);
      });

      if (response.didCancel) {
        return [
          {
            success: false,
            cancelled: true,
          },
        ];
      }

      if (response.errorCode) {
        return [
          {
            success: false,
            error: this.getErrorMessage(response.errorCode),
          },
        ];
      }

      if (response.assets && response.assets.length > 0) {
        return response.assets.map((asset) => this.processAsset(asset));
      }

      return [
        {
          success: false,
          error: 'No images selected',
        },
      ];
    } catch (error) {
      console.error('Error picking multiple images:', error);
      return [
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to pick images',
        },
      ];
    }
  }

  /**
   * Take a screenshot-equivalent photo
   * This is a convenience method for the main use case
   */
  async captureScreenshot(options?: ImagePickerOptions): Promise<ImageResult> {
    // On Android, screenshots are typically taken from the notification shade
    // On iOS, screenshots are taken with power + home buttons
    // This method opens the camera to capture something quickly
    return this.launchCamera({
      ...options,
      saveToPhotos: true, // Save to photos by default for screenshots
      cameraType: 'back',
    });
  }

  /**
   * Pick an image from gallery for screenshot analysis
   */
  async pickScreenshot(options?: ImagePickerOptions): Promise<ImageResult> {
    return this.pickSingleImage(options);
  }

  /**
   * Check if camera is available
   */
  async isCameraAvailable(): Promise<boolean> {
    try {
      // Check permission status
      const permission = await permissionsService.checkPermission(PermissionType.CAMERA);
      return permission.granted;
    } catch (error) {
      console.error('Error checking camera availability:', error);
      return false;
    }
  }

  /**
   * Check if photo library is available
   */
  async isPhotoLibraryAvailable(): Promise<boolean> {
    try {
      const permission = await permissionsService.checkPermission(PermissionType.PHOTO_LIBRARY);
      return permission.granted;
    } catch (error) {
      console.error('Error checking photo library availability:', error);
      return false;
    }
  }

  /**
   * Build picker options for react-native-image-picker
   */
  private buildPickerOptions(options: ImagePickerOptions): any {
    return {
      mediaType: options.mediaType || 'photo',
      selectionLimit: (options as any).selectionLimit || 1,
      includeBase64: options.includeBase64 || false,
      maxHeight: options.maxHeight,
      maxWidth: options.maxWidth,
      quality: options.quality || 0.9,
      saveToPhotos: options.saveToPhotos || false,
      cameraType: options.cameraType || 'back',
      durationLimit: options.durationLimit,
      presentationStyle: 'pageSheet',
    };
  }

  /**
   * Handle image picker response
   */
  private handleResponse(response: ImagePickerResponse): ImageResult {
    if (response.didCancel) {
      return {
        success: false,
        cancelled: true,
      };
    }

    if (response.errorCode) {
      return {
        success: false,
        error: this.getErrorMessage(response.errorCode),
      };
    }

    if (response.assets && response.assets.length > 0) {
      return this.processAsset(response.assets[0]);
    }

    return {
      success: false,
      error: 'No image selected',
    };
  }

  /**
   * Process asset into ImageResult
   */
  private processAsset(asset: Asset): ImageResult {
    return {
      success: true,
      uri: asset.uri,
      type: asset.type,
      fileName: asset.fileName,
      fileSize: asset.fileSize,
      width: asset.width,
      height: asset.height,
      base64: asset.base64,
    };
  }

  /**
   * Get user-friendly error message from error code
   */
  private getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      camera_unavailable: 'Camera is not available on this device',
      permission: 'Permission not granted',
      others: 'An unknown error occurred',
    };

    return errorMessages[errorCode] || errorMessages.others;
  }

  /**
   * Show alert for permission denied
   */
  private async showPermissionAlert(): Promise<void> {
    return new Promise((resolve) => {
      Alert.alert(
        'Permission Required',
        'Please grant camera and photo library permissions to select images.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(),
          },
          {
            text: 'Settings',
            onPress: async () => {
              await permissionsService.openAppSettings();
              resolve();
            },
          },
        ],
        { cancelable: false }
      );
    });
  }
}

/**
 * Export singleton instance
 */
export const imagePickerService = ImagePickerService.getInstance();
