/**
 * Tests for OCR Service
 *
 * Test suite for Google ML Kit OCR functionality.
 * Note: These tests may require device/emulator for full integration testing.
 *
 * @see https://firebase.google.com/docs/ml-kit/android/recognize-text
 */

import {
  getOCRService,
  resetOCRService,
} from '../OCRService';
import { MLKitTextRecognition } from '@react-native-ml-kit/text-recognition';

// Mock ML Kit Text Recognition
jest.mock('@react-native-ml-kit/text-recognition', () => ({
  TextRecognition: 'MLKitTextRecognition',
}));

// Mock Platform
jest.mock('react-native', () => ({
  OS: 'android',
}));

describe('OCR Service', () => {
  let ocrService: InstanceType<typeof getOCRService>;

  beforeEach(() => {
    jest.clearAllMocks();
    resetOCRService();
    ocrService = getOCRService();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('initialization', () => {
    it('should initialize OCR service', async () => {
      const mockInitialize = jest.fn().mockResolvedValue(true);
      MLKitTextRecognition.initialize = mockInitialize;

      const result = await ocrService.initialize();

      expect(result).toBe(true);
      expect(mockInitialize).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      const mockInitialize = jest.fn().mockRejectedValue(new Error('Failed to initialize'));
      MLKitTextRecognition.initialize = mockInitialize;

      const result = await ocrService.initialize();

      expect(result).toBe(false);
      expect(mockInitialize).toHaveBeenCalled();
    });

    it('should return true if already initialized', async () => {
      MLKitTextRecognition.initialize = jest.fn().mockResolvedValue(true);
      await ocrService.initialize();

      const result = await ocrService.initialize();

      expect(result).toBe(true);
      expect(MLKitTextRecognition.initialize).not.toHaveBeenCalled();
    });
  });

  describe('recognizeText', () => {
    it('should successfully recognize English text', async () => {
      const mockResult = {
        text: 'Hello World',
        confidence: 0.95,
        language: 'en',
      };
      MLKitTextRecognition.recognize = jest.fn().mockResolvedValue(mockResult);

      const result = await ocrService.recognizeText('/path/to/image.png');

      expect(result.text).toBe('Hello World');
      expect(result.confidence).toBe(0.95);
      expect(result.isKorean).toBe(false);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(MLKitTextRecognition.recognize).toHaveBeenCalledWith(
        '/path/to/image.png',
        expect.objectContaining({
          language: 'en',
        })
      );
    });

    it('should successfully recognize Korean text', async () => {
      const mockResult = {
        text: '안녕하세요',
        confidence: 0.90,
        language: 'ko',
      };
      MLKitTextRecognition.recognize = jest.fn().mockResolvedValue(mockResult);

      const result = await ocrService.recognizeText('/path/to/image.png', {
        enableKorean: true,
      });

      expect(result.text).toBe('안녕하세요');
      expect(result.isKorean).toBe(true);
      expect(result.confidence).toBe(0.90);
    });

    it('should handle low confidence results', async () => {
      const mockResult = {
        text: '',
        confidence: 0.3,
      };
      MLKitTextRecognition.recognize = jest.fn().mockResolvedValue(mockResult);

      const result = await ocrService.recognizeText('/path/to/blurry-image.png');

      expect(result.text).toBe('');
      expect(result.confidence).toBe(0.3);
    });

    it('should throw error for invalid image path', async () => {
      MLKitTextRecognition.recognize = jest.fn();

      await expect(ocrService.recognizeText('')).rejects.toThrow('Image path is required');
    });
  });

  describe('extractText', () => {
    it('should extract Korean text with high confidence', async () => {
      const mockResult = {
        text: '다음 달 15일 결혼식입니다',
        confidence: 0.92,
        language: 'ko',
      };
      MLKitTextRecognition.recognize = jest.fn().mockResolvedValue(mockResult);

      const result = await ocrService.extractText('/path/to/wedding.png', true);

      expect(result.text).toBe('다음 달 15일 결혼식입니다');
      expect(result.confidence).toBe(0.92);
      expect(result.isKorean).toBe(true);
    });

    it('should fall back to English when Korean OCR fails', async () => {
      const mockKoResult = {
        text: '',
        confidence: 0.1,
      };
      const mockEnResult = {
        text: 'Next month meeting',
        confidence: 0.85,
        language: 'en',
      };
      MLKitTextRecognition.recognize = jest.fn()
        .mockRejectedValueOnce(new Error('Korean OCR failed'))
        .mockResolvedValueOnce(mockEnResult);

      const result = await ocrService.extractText('/path/to/image.png', true);

      expect(result.text).toBe('Next month meeting');
      expect(result.isKorean).toBe(false);
      expect(result.confidence).toBe(0.85);
    });
  });

  describe('normalizeText', () => {
    it('should normalize extra whitespace', () => {
      const input = 'Hello    World';
      const result = (ocrService as any).normalizeText(input);

      expect(result).toBe('Hello World');
    });

    it('should correct common OCR errors', () => {
      const input = 'lnterllng World'; // l→1, I→1, n→N
      const result = (ocrService as any).normalizeText(input);

      expect(result).toBe('111ng World');
    });
  });

  describe('isAvailable', () => {
    it('should return true when initialized', async () => {
      MLKitTextRecognition.initialize = jest.fn().mockResolvedValue(true);

      const result = await ocrService.isAvailable();

      expect(result).toBe(true);
    });

    it('should return false when initialization fails', async () => {
      MLKitTextRecognition.initialize = jest.fn().mockRejectedValue(new Error('Init failed'));

      const result = await ocrService.isAvailable();

      expect(result).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('should return initialized status for Android', () => {
      const status = (ocrService as any).getStatus();

      expect(status.platform).toBe('android');
      expect(status.initialized).toBe(false);
    });

    it('should return true for iOS after initialization', async () => {
      MLKitTextRecognition.initialize = jest.fn().mockResolvedValue(true);

      await ocrService.initialize();
      const status = (ocrService as any).getStatus();

      expect(status.initialized).toBe(true);
    });
  });

  describe('clear', () => {
    it('should reset initialization state', () => {
      (ocrService as any).initialized = true;

      (ocrService as any).clear();

      expect((ocrService as any).initialized).toBe(false);
    });
  });
});
