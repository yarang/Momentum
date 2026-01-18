/**
 * Context Capture Service
 *
 * Main implementation of context capture functionality.
 * Handles capturing context from screenshots, chat, location, and voice.
 */

import { Context, ContextSource, ContextType } from '@/shared/models';
import {
  IContextCapture,
  ContextCaptureResult,
  ContextCaptureOptions,
} from './IContextCapture';
import { v4 as uuidv4 } from 'uuid';
import {
  imagePickerService,
  locationService,
  audioRecorderService,
  permissionsService,
  PermissionType,
} from '@/services/native';

/**
 * Context Capture Service Implementation
 */
export class ContextCaptureService implements IContextCapture {
  private initialized: boolean = false;

  /**
   * Initialize the capture service
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize native modules
      await audioRecorderService.initialize();

      // Check if location services are available
      const locationEnabled = await locationService.isLocationEnabled();
      if (!locationEnabled) {
        console.warn('Location services are disabled');
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize ContextCaptureService:', error);
      return false;
    }
  }

  /**
   * Check if a capture source is available
   */
  async isAvailable(source: ContextSource): Promise<boolean> {
    switch (source) {
      case 'screenshot':
        const photoPermission = await permissionsService.checkPermission(
          PermissionType.PHOTO_LIBRARY
        );
        return photoPermission.granted;
      case 'chat':
        return true; // Always available (text input)
      case 'location':
        return await locationService.isLocationEnabled();
      case 'voice':
        const micPermission = await permissionsService.checkPermission(
          PermissionType.MICROPHONE
        );
        return micPermission.granted;
      case 'manual':
        return true; // Always available
      default:
        return false;
    }
  }

  /**
   * Capture context from a screenshot
   */
  async captureScreenshot(
    imagePath: string,
    options?: ContextCaptureOptions
  ): Promise<ContextCaptureResult> {
    try {
      if (!imagePath || imagePath.trim().length === 0) {
        return {
          success: false,
          error: 'Image path is required',
        };
      }

      // Extract text using OCR
      const { text: extractedText, confidence: ocrConfidence } =
        await this.extractTextFromImage(imagePath, options?.enableOCR !== false);

      const context: Context = {
        id: uuidv4(),
        type: 'screenshot' as ContextType,
        source: 'screenshot' as ContextSource,
        data: {
          imagePath,
          timestamp: new Date().toISOString(),
          extractedText,
        },
        extractedEntities: [],
        suggestedIntent: null,
        confidence: ocrConfidence || 0.5,
        createdAt: new Date().toISOString(),
        status: 'pending',
        tags: options?.tags || [],
      };

      return {
        success: true,
        context,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Launch image picker to select or capture a screenshot
   */
  async launchImagePicker(
    options?: { useCamera?: boolean; multiple?: boolean }
  ): Promise<ContextCaptureResult> {
    try {
      const imageResult = options?.useCamera
        ? await imagePickerService.launchCamera()
        : await imagePickerService.pickSingleImage();

      if (!imageResult.success) {
        return {
          success: false,
          error: imageResult.error || 'Failed to pick image',
        };
      }

      if (imageResult.cancelled) {
        return {
          success: false,
          error: 'Image picking cancelled',
        };
      }

      // Create context from picked image
      return this.captureScreenshot(imageResult.uri!, options);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Capture context from a chat message
   */
  async captureChat(
    platform: string,
    sender: string,
    message: string,
    conversationId: string,
    options?: ContextCaptureOptions
  ): Promise<ContextCaptureResult> {
    try {
      if (!message || message.trim().length === 0) {
        return {
          success: false,
          error: 'Message content is required',
        };
      }

      const context: Context = {
        id: uuidv4(),
        type: 'chat' as ContextType,
        source: 'chat' as ContextSource,
        data: {
          platform,
          sender,
          message,
          conversationId,
          timestamp: new Date().toISOString(),
        },
        extractedEntities: [],
        suggestedIntent: null,
        confidence: 0.7,
        createdAt: new Date().toISOString(),
        status: 'pending',
        tags: options?.tags || [],
      };

      return {
        success: true,
        context,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Capture context from location
   */
  async captureLocation(
    locationName: string,
    latitude: number,
    longitude: number,
    options?: ContextCaptureOptions
  ): Promise<ContextCaptureResult> {
    try {
      if (!locationName || locationName.trim().length === 0) {
        return {
          success: false,
          error: 'Location name is required',
        };
      }

      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return {
          success: false,
          error: 'Invalid coordinates',
        };
      }

      const context: Context = {
        id: uuidv4(),
        type: 'location' as ContextType,
        source: 'location' as ContextSource,
        data: {
          locationName,
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        },
        extractedEntities: [],
        suggestedIntent: null,
        confidence: 0.9,
        createdAt: new Date().toISOString(),
        status: 'pending',
        tags: options?.tags || [],
      };

      return {
        success: true,
        context,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Capture current device location
   */
  async captureCurrentLocation(
    options?: ContextCaptureOptions
  ): Promise<ContextCaptureResult> {
    try {
      // Check permissions
      const hasPermission = await permissionsService.checkPermission(
        PermissionType.LOCATION
      );

      if (!hasPermission.granted) {
        return {
          success: false,
          error: 'Location permission not granted',
        };
      }

      // Get current location
      const locationData = await locationService.getCurrentPosition();

      // Get location name (reverse geocoding)
      const locationName = await locationService.getLocationName({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });

      return this.captureLocation(
        locationName,
        locationData.latitude,
        locationData.longitude,
        options
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Capture context from voice recording
   */
  async captureVoice(
    audioPath: string,
    duration: number,
    transcript: string,
    options?: ContextCaptureOptions
  ): Promise<ContextCaptureResult> {
    try {
      if (!audioPath || audioPath.trim().length === 0) {
        return {
          success: false,
          error: 'Audio path is required',
        };
      }

      const context: Context = {
        id: uuidv4(),
        type: 'voice' as ContextType,
        source: 'voice' as ContextSource,
        data: {
          audioPath,
          duration,
          transcript,
          timestamp: new Date().toISOString(),
        },
        extractedEntities: [],
        suggestedIntent: null,
        confidence: transcript ? 0.8 : 0.5,
        createdAt: new Date().toISOString(),
        status: 'pending',
        tags: options?.tags || [],
      };

      return {
        success: true,
        context,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Start voice recording
   */
  async startVoiceRecording(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check microphone permission
      const hasPermission = await permissionsService.checkPermission(
        PermissionType.MICROPHONE
      );

      if (!hasPermission.granted) {
        const granted = await permissionsService.requestPermission(
          PermissionType.MICROPHONE,
          true
        );

        if (!granted.granted) {
          return {
            success: false,
            error: 'Microphone permission not granted',
          };
        }
      }

      // Start recording
      await audioRecorderService.startRecording();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Stop voice recording and capture context
   */
  async stopVoiceRecording(
    transcript?: string,
    options?: ContextCaptureOptions
  ): Promise<ContextCaptureResult> {
    try {
      // Stop recording
      const metadata = await audioRecorderService.stopRecording();

      // Create context from recording
      return this.captureVoice(
        metadata.path,
        metadata.duration,
        transcript || '',
        options
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Quick record (30 seconds)
   */
  async quickRecord(
    options?: ContextCaptureOptions
  ): Promise<ContextCaptureResult> {
    try {
      // Check microphone permission
      const hasPermission = await permissionsService.checkPermission(
        PermissionType.MICROPHONE
      );

      if (!hasPermission.granted) {
        const granted = await permissionsService.requestPermission(
          PermissionType.MICROPHONE,
          true
        );

        if (!granted.granted) {
          return {
            success: false,
            error: 'Microphone permission not granted',
          };
        }
      }

      // Quick record for 30 seconds
      const metadata = await audioRecorderService.quickRecord();

      // Create context (without transcript for now)
      return this.captureVoice(metadata.path, metadata.duration, '', options);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a manual context entry
   */
  async createManual(
    content: string,
    options?: ContextCaptureOptions
  ): Promise<ContextCaptureResult> {
    try {
      if (!content || content.trim().length === 0) {
        return {
          success: false,
          error: 'Content is required',
        };
      }

      const context: Context = {
        id: uuidv4(),
        type: 'manual' as ContextType,
        source: 'manual' as ContextSource,
        data: {
          content,
          timestamp: new Date().toISOString(),
        },
        extractedEntities: [],
        suggestedIntent: null,
        confidence: 1.0,
        createdAt: new Date().toISOString(),
        status: 'pending',
        tags: options?.tags || [],
      };

      return {
        success: true,
        context,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Batch capture multiple contexts
   */
  async batchCapture(
    contexts: any[],
    options?: ContextCaptureOptions
  ): Promise<ContextCaptureResult[]> {
    const results: ContextCaptureResult[] = [];

    for (const contextData of contexts) {
      let result: ContextCaptureResult;

      switch (contextData.source) {
        case 'screenshot':
          result = await this.captureScreenshot(
            contextData.imagePath,
            options
          );
          break;
        case 'chat':
          result = await this.captureChat(
            contextData.platform,
            contextData.sender,
            contextData.message,
            contextData.conversationId,
            options
          );
          break;
        case 'location':
          result = await this.captureLocation(
            contextData.locationName,
            contextData.latitude,
            contextData.longitude,
            options
          );
          break;
        case 'voice':
          result = await this.captureVoice(
            contextData.audioPath,
            contextData.duration,
            contextData.transcript,
            options
          );
          break;
        case 'manual':
          result = await this.createManual(contextData.content, options);
          break;
        default:
          result = {
            success: false,
            error: `Unknown source: ${contextData.source}`,
          };
      }

      results.push(result);
    }

    return results;
  }

  /**
   * Check permissions for a source
   */
  async checkPermissions(source: ContextSource): Promise<boolean> {
    try {
      switch (source) {
        case 'screenshot':
          const photoPermission = await permissionsService.checkPermission(
            PermissionType.PHOTO_LIBRARY
          );
          return photoPermission.granted;
        case 'location':
          return await locationService.isLocationEnabled();
        case 'voice':
          const micPermission = await permissionsService.checkPermission(
            PermissionType.MICROPHONE
          );
          return micPermission.granted;
        default:
          return true;
      }
    } catch (error) {
      console.error(`Error checking permissions for ${source}:`, error);
      return false;
    }
  }

  /**
   * Request permissions for a source
   */
  async requestPermissions(source: ContextSource): Promise<boolean> {
    try {
      let permissionType: PermissionType;

      switch (source) {
        case 'screenshot':
          permissionType = PermissionType.PHOTO_LIBRARY;
          break;
        case 'location':
          permissionType = PermissionType.LOCATION;
          break;
        case 'voice':
          permissionType = PermissionType.MICROPHONE;
          break;
        default:
          return true;
      }

      const result = await permissionsService.requestPermission(permissionType, true);
      return result.granted;
    } catch (error) {
      console.error(`Error requesting permissions for ${source}:`, error);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;
    await audioRecorderService.cleanup();
  }
}
