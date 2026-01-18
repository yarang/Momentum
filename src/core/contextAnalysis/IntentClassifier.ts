/**
 * Intent Classifier Service
 *
 * BERT-based intent classification using TensorFlow Lite.
 * Classifies user text into predefined intent categories.
 *
 * @see https://www.tensorflow.org/lite/on-device/intents/overview
 */

import { loadTensorflowModel, Model } from 'react-native-fast-tflite';
import { Platform } from 'react-native';

/**
 * Intent categories for Momentum app
 */
export type IntentType =
  | 'social'       // 경조사/이벤트 관련
  | 'shopping'     // 쇼핑/구매 관련
  | 'work'         // 업무/미팅/일정 관련
  | 'personal'     // 개인/건강/재정 관련
  | 'other';       // 그 외

/**
 * Intent classification result
 */
export interface IntentClassificationResult {
  /** Classified intent */
  intent: IntentType;
  /** Confidence score (0-1) */
  confidence: number;
  /** All intent scores */
  scores: Record<IntentType, number>;
  /** Processing time in milliseconds */
  processingTime: number;
}

/**
 * Intent classification options
 */
export interface IntentClassifierOptions {
  /** Minimum confidence threshold (0-1) */
  minConfidence?: number;
  /** Whether to fallback to keyword matching on low confidence */
  enableFallback?: boolean;
  /** Model file path (defaults to bundled model) */
  modelPath?: string;
}

/**
 * Default intent classifier options
 */
const DEFAULT_OPTIONS: IntentClassifierOptions = {
  minConfidence: 0.6,
  enableFallback: true,
  modelPath: 'models/intent_classifier.tflite',
};

/**
 * Intent Classifier Service class
 */
export class IntentClassifierService {
  private model: Model | null = null;
  private isLoaded: boolean = false;
  private modelPath: string;

  constructor(options?: Partial<IntentClassifierOptions>) {
    this.modelPath = options?.modelPath || DEFAULT_OPTIONS.modelPath;
  }

  /**
   * Load the BERT model
   */
  async loadModel(): Promise<boolean> {
    try {
      if (this.isLoaded && this.model) {
        return true;
      }

      console.log('[IntentClassifier] Loading model from:', this.modelPath);

      // In a real implementation, you would load a TFLite model here
      // For now, we'll create a mock model for development
      this.model = {
        run: async (inputs: unknown[]) => {
          // Simulate BERT inference
          return await this.mockInference(inputs);
        },
      };

      this.isLoaded = true;
      console.log('[IntentClassifier] Model loaded successfully');
      return true;
    } catch (error) {
      console.error('[IntentClassifier] Model loading failed:', error);
      return false;
    }
  }

  /**
   * Classify intent from text
   */
  async classifyIntent(
    text: string,
    options: IntentClassifierOptions = {}
  ): Promise<IntentClassificationResult> {
    const startTime = Date.now();

    try {
      // Load model if not loaded
      if (!this.isLoaded) {
        const loaded = await this.loadModel();
        if (!loaded) {
          throw new Error('Failed to load intent classifier model');
        }
      }

      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

      // Prepare input tensor (tokenization happens in model)
      const input = this.prepareInput(text);

      // Run inference
      const outputs = await this.model.run([input]);

      // Process outputs
      const result = this.processOutputs(outputs);

      const processingTime = Date.now() - startTime;

      // Apply confidence threshold
      if (result.confidence < mergedOptions.minConfidence) {
        // Fallback to keyword-based classification
        if (mergedOptions.enableFallback) {
          const fallbackResult = this.classifyByKeywords(text);
          return {
            ...fallbackResult,
            processingTime,
          };
        }
      }

      return {
        ...result,
        processingTime,
      };
    } catch (error) {
      console.error('[IntentClassifier] Classification failed:', error);
      throw error;
    }
  }

  /**
   * Prepare input text for BERT model
   */
  private prepareInput(text: string): string {
    // In a real implementation, this would:
    // 1. Tokenize text using Wordpiece/Sentencepiece tokenizer
    // 2. Add special tokens ([CLS], [SEP], etc.)
    // 3. Truncate/pad to model input length (typically 128 or 512 tokens)

    // For now, just clean the text
    return text.trim().substring(0, 512);
  }

  /**
   * Mock BERT inference (for development)
   */
  private async mockInference(inputs: unknown[]): Promise<unknown> {
    const input = inputs[0] as string;

    // Simulate BERT inference
    const scores = this.calculateIntentScores(input);

    // Return mock tensor outputs
    return {
      scores,
      logits: [],
      hidden_states: [],
    };
  }

  /**
   * Calculate intent scores from text (keyword-based fallback)
   */
  private calculateIntentScores(text: string): Record<IntentType, number> {
    const scores: Record<IntentType, number> = {
      social: 0,
      shopping: 0,
      work: 0,
      personal: 0,
      other: 0,
    };

    const lowerText = text.toLowerCase();

    // Social keywords
    const socialKeywords = [
      '결혼식', '결혼식식', '초청', '생신', '장례', '식당', '방문', '모임',
      'wedding', 'party', 'funeral', 'graduation', 'ceremony', 'event',
      '축의', '축하', '부모님', '선생님', '가족', '친구',
    ];

    // Shopping keywords
    const shoppingKeywords = [
      '구매', '삽', '쇼핑', '쇼핑몰', '할인', '세일', '가격', '쿠폰',
      '바견', '할인', '쿠폰', '물건', '구매하다',
    ];

    // Work keywords
    const workKeywords = [
      '미팅', '회의', '보고', '제안서', '리포트', '데드라인', '마감',
      '프로젝트', '업무', '태스크', '일정', '마감', '완료',
    ];

    // Personal keywords
    const personalKeywords = [
      '운동', '건강', '병원', '체육', '약속', '운동장', '병원원',
      '운동장', '헬스', '요가', '스케줄', '트레이닝',
    ];

    // Calculate scores
    socialKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        scores.social += 0.2;
      }
    });

    shoppingKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        scores.shopping += 0.2;
      }
    });

    workKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        scores.work += 0.2;
      }
    });

    personalKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        scores.personal += 0.2;
      }
    });

    // Normalize scores to 0-1 range
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
      Object.keys(scores).forEach(key => {
        scores[key as IntentType] /= maxScore;
      });
    }

    return scores;
  }

  /**
   * Process model outputs into classification result
   */
  private processOutputs(outputs: unknown): IntentClassificationResult {
    const result = outputs as {
      scores: Record<IntentType, number>,
      logits: number[][],
      hidden_states: number[][],
    };

    // Find intent with highest score
    let maxIntent: IntentType = 'other';
    let maxScore = 0;

    Object.entries(result.scores).forEach(([intent, score]) => {
      if (score > maxScore) {
        maxIntent = intent as IntentType;
        maxScore = score;
      }
    });

    return {
      intent: maxIntent,
      confidence: maxScore,
      scores: result.scores,
      processingTime: 0, // Will be set by caller
    };
  }

  /**
   * Fallback keyword-based classification
   */
  private classifyByKeywords(text: string): IntentClassificationResult {
    const scores = this.calculateIntentScores(text);

    let maxIntent: IntentType = 'other';
    let maxScore = 0;

    Object.entries(scores).forEach(([intent, score]) => {
      if (score > maxScore) {
        maxIntent = intent as IntentType;
        maxScore = score;
      }
    });

    return {
      intent: maxIntent,
      confidence: maxScore,
      scores,
      processingTime: 0,
    };
  }

  /**
   * Check if classifier is ready
   */
  async isReady(): Promise<boolean> {
    return this.isLoaded && this.model !== null;
  }

  /**
   * Get classifier status
   */
  getStatus(): { loaded: boolean; modelPath: string; platform: string } {
    return {
      loaded: this.isLoaded,
      modelPath: this.modelPath,
      platform: Platform.OS,
    };
  }

  /**
   * Reset classifier (for testing)
   */
  reset(): void {
    this.model = null;
    this.isLoaded = false;
  }
}

/**
 * Singleton intent classifier instance
 */
let intentClassifierInstance: IntentClassifierService | null = null;

/**
 * Get or create intent classifier instance
 */
export function getIntentClassifier(
  options?: Partial<IntentClassifierOptions>
): IntentClassifierService {
  if (!intentClassifierInstance) {
    intentClassifierInstance = new IntentClassifierService(options);
  }
  return intentClassifierInstance;
}

/**
 * Reset intent classifier instance
 */
export function resetIntentClassifier(): void {
  intentClassifierInstance = null;
}

/**
 * Helper: Get intent label in Korean
 */
export function getIntentLabel(intent: IntentType): string {
  const labels: Record<IntentType, string> = {
    social: '경조사',
    shopping: '쇼핑',
    work: '업무',
    personal: '개인',
    other: '기타',
  };
  return labels[intent] || '기타';
}

/**
 * Intent classification from context
 */
export async function classifyContextIntent(
  text: string,
  options?: IntentClassifierOptions
): Promise<IntentClassificationResult> {
  const classifier = getIntentClassifier(options);
  return classifier.classifyIntent(text, options);
}
