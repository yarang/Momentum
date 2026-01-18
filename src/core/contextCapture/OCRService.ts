/**
 * OCR Service
 *
 * Optical Character Recognition service using Google ML Kit.
 * Extracts text from images with support for Korean and English.
 *
 * @see https://firebase.google.com/docs/docs/ml-kit/android/recognize-text
 */

import { NativeModules, Platform } from 'react-native';
import { MLKitTextRecognition } from '@react-native-ml-kit/text-recognition';

/**
 * OCR result interface
 */
export interface OCRResult {
  /** Extracted text content */
  text: string;
  /** Recognition confidence (0-1) */
  confidence: number;
  /** Whether Korean text was detected */
  isKorean: boolean;
  /** Processing time in milliseconds */
  processingTime: number;
}

/**
 * OCR options
 */
export interface OCROptions {
  /** Enable Korean language detection */
  enableKorean?: boolean;
  /** Minimum confidence threshold (0-1) */
  minConfidence?: number;
  /** Image quality check */
  validateQuality?: boolean;
}

/**
 * Default OCR options
 */
const DEFAULT_OPTIONS: OCROptions = {
  enableKorean: true,
  minConfidence: 0.5,
  validateQuality: true,
};

/**
 * OCR Service class
 */
export class OCRService {
  private isInitialized: boolean = false;

  /**
   * Initialize ML Kit OCR
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      if (Platform.OS === 'android') {
        // Android requires explicit initialization
        await MLKitTextRecognition.initialize();
      }

      this.isInitialized = true;
      console.log('[OCR] ML Kit Text Recognition initialized');
      return true;
    } catch (error) {
      console.error('[OCR] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Extract text from image
   */
  async recognizeText(imagePath: string, options: OCROptions = {}): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      // Initialize if not already done
      await this.initialize();

      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

      // Check if image file exists
      if (!imagePath || imagePath.trim().length === 0) {
        throw new Error('Image path is required');
      }

      // Run OCR
      const result = await MLKitTextRecognition.recognize(imagePath, {
        language: mergedOptions.enableKorean ? 'ko' : 'en',
        minConfidence: mergedOptions.minConfidence,
      });

      const processingTime = Date.now() - startTime;

      // Detect if Korean text is present
      const isKorean = this.detectKoreanText(result.text);

      return {
        text: result.text,
        confidence: result.confidence || 0.8,
        isKorean,
        processingTime,
      };
    } catch (error) {
      console.error('[OCR] Text recognition failed:', error);
      throw error;
    }
  }

  /**
   * Extract text from image path
   */
  async extractText(imagePath: string, options?: OCROptions): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      // Initialize if not already done
      await this.initialize();

      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

      // Validate image quality if requested
      if (mergedOptions.validateQuality) {
        const isValid = await this.validateImageQuality(imagePath);
        if (!isValid) {
          return {
            text: '',
            confidence: 0,
            isKorean: false,
            processingTime: Date.now() - startTime,
          };
        }
      }

      // Run OCR with Korean language support
      const result = await MLKitTextRecognition.recognize(imagePath, {
        language: 'ko', // Korean language
        minConfidence: mergedOptions.minConfidence,
      });

      const processingTime = Date.now() - startTime;

      return {
        text: result.text,
        confidence: result.confidence || 0.8,
        isKorean: true,
        processingTime,
      };
    } catch (error) {
      console.error('[OCR] Korean OCR failed, falling back to English:', error);
      // Fallback to English if Korean fails
      try {
        const result = await MLKitTextRecognition.recognize(imagePath, {
          language: 'en',
          minConfidence: mergedOptions.minConfidence,
        });

        const processingTime = Date.now() - startTime;

        return {
          text: result.text,
          confidence: result.confidence || 0.8,
          isKorean: false,
          processingTime,
        };
      } catch (fallbackError) {
        console.error('[OCR] Fallback OCR also failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  /**
   * Batch OCR for multiple images
   */
  async batchRecognize(
    imagePaths: string[],
    options?: OCROptions
  ): Promise<OCRResult[]> {
    const results: OCRResult[] = [];
    const startTime = Date.now();

    try {
      // Initialize if not already done
      await this.initialize();

      // Process images in parallel
      const promises = imagePaths.map((imagePath) =>
        this.recognizeText(imagePath, options).catch((error) => ({
          text: '',
          confidence: 0,
          isKorean: false,
          processingTime: Date.now() - startTime,
        }))
      );

      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('[OCR] Batch recognition failed:', error);
      throw error;
    }
  }

  /**
   * Detect if text contains Korean characters
   */
  private detectKoreanText(text: string): boolean {
    const koreanRegex = /[가-힣]/;
    return koreanRegex.test(text);
  }

  /**
   * Validate image quality for OCR
   */
  private async validateImageQuality(imagePath: string): Promise<boolean> {
    try {
      // Check file exists
      const fs = require('fs');
      if (!fs.existsSync(imagePath)) {
        return false;
      }

      // Basic validation: check file size (should be >10KB)
      const stats = fs.statSync(imagePath);
      return stats.size > 10240; // 10KB minimum
    } catch {
      return false;
    }
  }

  /**
   * Clean up and normalize OCR output
   */
  normalizeText(text: string): string {
    if (!text) return '';

    // Remove extra whitespace
    const cleaned = text.replace(/\s+/g, ' ').trim();

    // Remove common OCR errors
    const cleaned2 = cleaned
      .replace(/[l|]/g, '1') // l → 1, I → 1
      .replace(/[o|0]/g, 'o') // o → o, 0 → o
      .replace(/[s|5]/g, 'S') // s → S, 5 → S
      .replace(/[z|2]/g, 'Z'); // z → Z, 2 → Z

    return cleaned2;
  }

  /**
   * Check if OCR service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      return this.isInitialized || (await this.initialize());
    } catch {
      return false;
    }
  }

  /**
   * Get OCR service status
   */
  getStatus(): { initialized: boolean; platform: string } {
    return {
      initialized: this.isInitialized,
      platform: Platform.OS,
    };
  }

  /**
   * Clear initialization (for testing)
   */
  clear(): void {
    this.isInitialized = false;
  }
}

/**
 * Singleton OCR instance
 */
let ocrServiceInstance: OCRService | null = null;

/**
 * Get or create OCR service instance
 */
export function getOCRService(): OCRService {
  if (!ocrServiceInstance) {
    ocrServiceInstance = new OCRService();
  }
  return ocrService;
}

/**
 * Reset OCR service instance
 */
export function resetOCRService(): void {
  ocrServiceInstance = null;
}
