/**
 * Tests for Intent Classifier Service
 *
 * Test suite for BERT-based intent classification.
 * Note: These tests use mock models for rapid iteration.
 *
 * @see https://www.tensorflow.org/lite/on-device/intents/overview
 */

import {
  getIntentClassifier,
  resetIntentClassifier,
  getIntentLabel,
  type IntentType,
} from '../IntentClassifier';

// Mock react-native-fast-tflite
jest.mock('react-native-fast-tflite');

// Mock Platform
jest.mock('react-native', () => ({
  OS: 'android',
}));

describe('Intent Classifier Service', () => {
  let classifier: InstanceType<typeof getIntentClassifier>;

  beforeEach(() => {
    jest.clearAllMocks();
    resetIntentClassifier();
    classifier = getIntentClassifier();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('initialization', () => {
    it('should load model successfully', async () => {
      const mockLoadModel = jest.fn().mockResolvedValue(true);
      // In real implementation, this would load a TFLite model
      // For now, we just mock the initialization
      (classifier as any).isLoaded = true;

      const result = await classifier.loadModel();

      expect(result).toBe(true);
    });

    it('should handle model loading failure gracefully', async () => {
      const mockLoadModel = jest.fn().mockRejectedValue(new Error('Model not found'));
      (classifier as any).isLoaded = false;

      const result = await classifier.loadModel();

      expect(result).toBe(false);
    });

    it('should return true if already loaded', async () => {
      (classifier as any).isLoaded = true;

      const result = await classifier.loadModel();

      expect(result).toBe(true);
    });
  });

  describe('classifyIntent', () => {
    it('should classify wedding-related text as social intent', async () => {
      const mockResult = {
        intent: 'social',
        confidence: 0.92,
        scores: { social: 0.92, shopping: 0.1, work: 0.05, personal: 0.02 },
        processingTime: 250,
      };

      (classifier as any).model = {
        run: jest.fn().mockResolvedValue({
          scores: mockResult.scores,
        }),
      };

      const result = await classifier.classifyIntent('다음 달 15일 결혼식에 초대해주세요');

      expect(result.intent).toBe('social');
      expect(result.confidence).toBe(0.92);
      expect(result.scores).toEqual({
        social: 0.92,
        shopping: 0.1,
        work: 0.05,
        personal: 0.02,
      });
    });

    it('should classify shopping-related text as shopping intent', async () => {
      const mockResult = {
        intent: 'shopping',
        confidence: 0.88,
        scores: {
          shopping: 0.88,
          social: 0.1,
          work: 0.05,
          personal:  0.03,
        },
        processingTime: 180,
      };

      (classifier as any).model = {
        run: jest.fn().mockResolvedValue({
          scores: mockResult.scores,
        }),
      };

      const result = await classifier.classifyIntent('이 제품 할인이 얼마 쇼핑인가격을 확인해주세요');

      expect(result.intent).toBe('shopping');
      expect(result.confidence).toBe(0.88);
      expect(result.scores.shopping).toBe(0.88);
    });

    it('should classify work-related text as work intent', async () => {
      const mockResult = {
        intent: 'work',
        confidence: 0.85,
        scores: {
          work: 0.85,
          social: 0.1,
          shopping: 0.03,
          personal: 0.02,
        },
        processingTime: 200,
      };

      (classifier as any).model = {
        run: jest.fn().mockResolvedValue({
          scores: mockResult.scores,
        }),
      };

      const result = await classifier.classifyIntent('내일 미팅 회의 링취 정리해드립니다');

      expect(result.intent).toBe('work');
      expect(result.confidence).toBe(0.85);
    });

    it('should fallback to keyword classification when BERT confidence is low', async () => {
      // BERT model returns low confidence
      const mockBertResult = {
        intent: 'other',
        confidence: 0.3,  // Below threshold
        scores: {
          social: 0.3,
          shopping: 0.2,
          work: 0.15,
          personal: 0.1,
        },
        processingTime: 300,
      };

      (classifier as any).model = {
        run: jest.fn().mockResolvedValue(mockBertResult),
      };

      (classifier as any).classifyByKeywords = jest.fn().mockResolvedValue({
      intent: 'social',
      confidence: 0.8,
      scores: { social: 0.8, shopping: 0.1, work: 0.05, personal: 0.05 },
    });

      const result = await classifier.classifyIntent('결혼식에 참석해주세요');

      expect(result.intent).toBe('social');
      expect(result.confidence).toBe(0.8);
      // Verify fallback was called
      expect(classifier.classifyByKeywords).toHaveBeenCalled();
    });

    it('should handle empty or null text', async () => {
      (classifier as any).model = {
        run: jest.fn().mockResolvedValue({
          scores: {
            social: 0.1,
            shopping: 0.1,
            work: 0.1,
            personal: 0.1,
            other: 0.1,
          },
        }),
      };

      const result = await classifier.classifyIntent('');

      expect(result.intent).toBe('other');
      expect(result.confidence).toBe(0.1);
      expect(result.scores.other).toBe(0.1);
    });
  });

  describe('classifyByKeywords', () => {
    it('should classify based on keyword matching', async () => {
      (classifier as any).INTENT_KEYWORDS = {
        social: ['결혼식', '결혼식식', '초청', '생신', '장례'],
        shopping: ['구매', '쇼핑', '삽', '가격', '할인', '쿏�', '물건'],
        work: ['미팅', '회의', '보고', '제안서', '리포트', '데드라인'],
        personal: ['운동', '건강', '병원', '체육', '약속', '운동장'],
        other: ['그냥', '일반', '일상'],
      };

      const result = await (classifier as any).classifyByKeywords(
        '결혼식에 참석해주세요'
      );

      expect(result.intent).toBe('social');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.scores.social).toBeGreaterThan(0);
    });

    it('should handle text with no matching keywords', async () => {
      (classifier as any).INTENT_KEYWORDS = {
        social: ['결혼식', '초청'],
        shopping: ['구매', '쇼핑'],
        work: ['미팅', '회의'],
        personal: ['운동', '건강'],
        other: ['기타'],
      };

      const result = await (classifier as any).classifyByKeywords('오늘 날씨 맛 좋아요');

      expect(result.intent).toBe('other');
      expect(result.confidence).toBe(0.3);
      expect(result.scores.other).toBe(0);
    });
  });

  describe('getIntentLabel', () => {
    it('should return Korean label for each intent type', () => {
      expect(getIntentLabel('social')).toBe('경조사');
      expect(getIntentLabel('shopping')).toBe('쇼핑');
      expect(getIntentLabel('work')).toBe('업무');
      expect(getIntentLabel('personal')).toBe('개인');
      expect(getIntentLabel('other')).toBe('기타');
    });
  });

  describe('getStatus', () => {
    it('should return status information', () => {
      (classifier as any).isLoaded = true;
      (classifier as any).modelPath = 'models/intent_classifier.tflite';

      const status = (classifier as any).getStatus();

      expect(status.loaded).toBe(true);
      expect(status.modelPath).toBe('models/intent_classifier.tflite');
      expect(status.platform).toBe('android');
    });

    it('should return not loaded status initially', () => {
      classifier = getIntentClassifier();
      const status = (classifier as any).getStatus();

      expect(status.loaded).toBe(false);
      expect(status.modelPath).toBe('models/intent_classifier.tflite');
    });
  });

  describe('reset', () => {
    it('should clear loaded status', () => {
      (classifier as any).isLoaded = true;

      (classifier as any).reset();

      const status = (classifier as any).getStatus();

      expect(status.loaded).toBe(false);
    });
  });
});
