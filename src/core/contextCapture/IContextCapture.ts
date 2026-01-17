/**
 * Context Capture Interface
 *
 * Defines the contract for capturing contextual data from various sources.
 * Implementations handle data extraction from screenshots, chat messages, location, and voice.
 */

import { Context, ContextData, ContextSource } from '@/shared/models';

/**
 * Result of a context capture operation
 */
export interface ContextCaptureResult {
  /** Whether capture was successful */
  success: boolean;
  /** Captured context data (if successful) */
  context?: Context;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Configuration options for context capture
 */
export interface ContextCaptureOptions {
  /** Whether to automatically extract entities */
  extractEntities?: boolean;
  /** Whether to analyze intent immediately */
  analyzeIntent?: boolean;
  /** Optional metadata tags */
  tags?: string[];
}

/**
 * Interface for context capture implementations
 */
export interface IContextCapture {
  /**
   * Initialize the capture mechanism (request permissions, setup services)
   */
  initialize(): Promise<boolean>;

  /**
   * Check if capture from a specific source is available
   * @param source - The context source type to check
   */
  isAvailable(source: ContextSource): Promise<boolean>;

  /**
   * Capture context from a screenshot
   * @param imagePath - File path or URI to the screenshot image
   * @param options - Optional configuration
   */
  captureScreenshot(
    imagePath: string,
    options?: ContextCaptureOptions
  ): Promise<ContextCaptureResult>;

  /**
   * Capture context from a chat message
   * @param platform - Chat platform identifier
   * @param sender - Message sender
   * @param message - Message content
   * @param conversationId - Conversation identifier
   * @param options - Optional configuration
   */
  captureChat(
    platform: string,
    sender: string,
    message: string,
    conversationId: string,
    options?: ContextCaptureOptions
  ): Promise<ContextCaptureResult>;

  /**
   * Capture context from location information
   * @param locationName - Location name or address
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param options - Optional configuration
   */
  captureLocation(
    locationName: string,
    latitude: number,
    longitude: number,
    options?: ContextCaptureOptions
  ): Promise<ContextCaptureResult>;

  /**
   * Capture context from a voice recording
   * @param audioPath - File path or URI to audio file
   * @param duration - Recording duration in seconds
   * @param transcript - Transcribed text from speech recognition
   * @param options - Optional configuration
   */
  captureVoice(
    audioPath: string,
    duration: number,
    transcript: string,
    options?: ContextCaptureOptions
  ): Promise<ContextCaptureResult>;

  /**
   * Create a manual context entry (user-created)
   * @param content - User-provided text or note
   * @param options - Optional configuration
   */
  createManual(
    content: string,
    options?: ContextCaptureOptions
  ): Promise<ContextCaptureResult>;

  /**
   * Batch capture multiple contexts
   * @param contexts - Array of context data to capture
   * @param options - Optional configuration
   */
  batchCapture(
    contexts: ContextData[],
    options?: ContextCaptureOptions
  ): Promise<ContextCaptureResult[]>;

  /**
   * Check required permissions for a capture source
   * @param source - The context source type
   */
  checkPermissions(source: ContextSource): Promise<boolean>;

  /**
   * Request permissions for a capture source
   * @param source - The context source type
   */
  requestPermissions(source: ContextSource): Promise<boolean>;

  /**
   * Cleanup and release resources
   */
  cleanup(): Promise<void>;
}
