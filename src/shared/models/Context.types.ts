/**
 * Context Types
 *
 * Represents contextual data captured from various sources such as screenshots, chat messages,
 * location information, and voice recordings. This data is used to understand user intent
 * and create actionable tasks.
 */

import { Entity } from './Entity.types';

/**
 * Source type for context data
 */
export type ContextSource =
  | 'screenshot'
  | 'chat'
  | 'location'
  | 'voice'
  | 'manual';

/**
 * Screenshot context data
 */
export interface ScreenshotContextData {
  /** Source discriminator */
  source: 'screenshot';
  /** File path or URI to the screenshot image */
  imagePath: string;
  /** Extracted text from OCR */
  extractedText: string;
  /** Timestamp when screenshot was captured */
  timestamp: number;
  /** Optional metadata about the app/screen */
  metadata?: {
    /** App package name (if available) */
    packageName?: string;
    /** Screen title or description */
    screenTitle?: string;
  };
}

/**
 * Chat context data
 */
export interface ChatContextData {
  /** Source discriminator */
  source: 'chat';
  /** Chat platform (e.g., 'kakao', 'whatsapp', 'telegram') */
  platform: string;
  /** Sender name or ID */
  sender: string;
  /** Message content */
  message: string;
  /** Chat room or conversation ID */
  conversationId: string;
  /** Timestamp when message was sent */
  timestamp: number;
  /** Optional attached images or media */
  attachments?: Array<{
    type: 'image' | 'video' | 'file';
    uri: string;
  }>;
}

/**
 * Location context data
 */
export interface LocationContextData {
  /** Source discriminator */
  source: 'location';
  /** Location name or address */
  locationName: string;
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Timestamp when location was recorded */
  timestamp: number;
  /** Optional address details */
  address?: {
    /** Street address */
    street?: string;
    /** City name */
    city?: string;
    /** Country name */
    country?: string;
    /** Postal code */
    postalCode?: string;
  };
}

/**
 * Voice context data
 */
export interface VoiceContextData {
  /** Source discriminator */
  source: 'voice';
  /** File path or URI to the audio recording */
  audioPath: string;
  /** Duration in seconds */
  duration: number;
  /** Transcribed text from speech recognition */
  transcript: string;
  /** Timestamp when recording was made */
  timestamp: number;
  /** Optional language code (ISO 639-1) */
  language?: string;
}

/**
 * Manual context data (user-created)
 */
export interface ManualContextData {
  /** Source discriminator */
  source: 'manual';
  /** User-provided text or note */
  content: string;
  /** Timestamp when entry was created */
  timestamp: number;
  /** Optional tags or labels */
  tags?: string[];
}

/**
 * Union type of all context data variants
 */
export type ContextData =
  | ScreenshotContextData
  | ChatContextData
  | LocationContextData
  | VoiceContextData
  | ManualContextData;

/**
 * Complete context object with analysis results
 */
export interface Context {
  /** Unique identifier for the context */
  id: string;
  /** Context data variant */
  data: ContextData;
  /** Extracted entities from the context */
  entities: Entity[];
  /** Processing status */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** Timestamp when context was created */
  createdAt: number;
  /** Timestamp when context was last updated */
  updatedAt: number;
}

/**
 * Context filter options for querying
 */
export interface ContextFilterOptions {
  /** Filter by source type */
  source?: ContextSource;
  /** Filter by creation date range */
  dateRange?: {
    /** Start timestamp (inclusive) */
    start: number;
    /** End timestamp (inclusive) */
    end: number;
  };
  /** Filter by processing status */
  status?: Context['status'];
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}
