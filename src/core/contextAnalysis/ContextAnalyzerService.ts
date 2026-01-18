/**
 * Context Analyzer Service
 *
 * Main implementation of context analysis functionality.
 * Handles intent classification, entity extraction, and action suggestion.
 */

import {
  Context,
  Entity,
  EntityType,
  Action,
  ActionType,
  TaskPriority,
} from '@/shared/models';
import { parseDate } from '@/shared/utils/dateParser';
import {
  extractAmounts,
  extractPhoneNumbers,
  extractEmails,
  detectUrgency,
} from '@/shared/utils/textAnalyzer';
import {
  IContextAnalyzer,
  IntentClassificationResult,
  AnalysisResult,
  AnalysisOptions,
  RelatedContext,
} from './IContextAnalyzer';
import { v4 as uuidv4 } from 'uuid';

/**
 * Intent keywords for classification
 */
const INTENT_KEYWORDS: Record<string, string[]> = {
  calendar: [
    'meeting',
    'appointment',
    'schedule',
    '일정',
    '약속',
    '미팅',
    '회의',
    'calendar',
    'event',
    'time',
    'when',
    '언제',
    '시간',
  ],
  shopping: [
    'buy',
    'purchase',
    'shop',
    'shopping',
    'price',
    'sale',
    'discount',
    'cart',
    '구매',
    '쇼핑',
    '가격',
    '할인',
    '장바구니',
  ],
  work: [
    'deadline',
    'task',
    'project',
    'report',
    'work',
    '업무',
    '제안',
    '보고서',
    '마감',
    '제출',
    'deadline',
    'task',
  ],
  social: [
    'wedding',
    'birthday',
    'party',
    '결혼',
    '생일',
    '파티',
    '경조사',
    '축하',
    'celebration',
    'invitation',
    '초대',
  ],
  payment: [
    'send',
    'transfer',
    'pay',
    '송금',
    '이체',
    '결제',
    'won',
    '원',
  ],
};

/**
 * Context Analyzer Service Implementation
 */
export class ContextAnalyzerService implements IContextAnalyzer {
  private initialized: boolean = false;

  /**
   * Initialize the analyzer
   */
  async initialize(): Promise<boolean> {
    try {
      // TODO: Load ML models for advanced analysis
      // - BERT model for intent classification
      // - NER model for entity extraction
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize ContextAnalyzerService:', error);
      return false;
    }
  }

  /**
   * Analyze a context and extract meaning
   */
  async analyze(
    context: Context,
    options?: AnalysisOptions
  ): Promise<AnalysisResult> {
    try {
      // Classify intent
      const intent = await this.classifyIntent(context);

      // Extract entities
      const entities = await this.extractEntities(context, options);

      // Suggest actions
      const suggestedActions = await this.suggestActions(
        context,
        intent,
        entities
      );

      return {
        contextId: context.id,
        entities,
        intent,
        suggestedActions,
        success: true,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        contextId: context.id,
        entities: [],
        intent: {
          intent: 'unknown',
          confidence: 0,
        },
        suggestedActions: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Classify intent from context using BERT
   */
  async classifyIntent(
    context: Context
  ): Promise<IntentClassificationResult> {
    // Extract text content from context data
    const text = this.extractTextFromContext(context);

    // Use BERT-based classification
    const { classifyContextIntent } = require('./IntentClassifier');

    try {
      // Load BERT model if not already loaded
      const isReady = await classifyContextIntent.isReady();

      if (!isReady) {
        console.log('[ContextAnalyzer] BERT model not ready, initializing...');
        const loaded = await classifyContextIntent.loadModel();
        if (!loaded) {
          // Fallback to keyword classification if BERT fails
          console.log('[ContextAnalyzer] BERT loading failed, using keyword fallback');
          return this.classifyByKeywords(text);
        }
      }

      // Run BERT classification
      const result = await classifyContextIntent.classifyIntent(text, {
        minConfidence: 0.6,
        enableFallback: true,
      });

      return result;
    } catch (error) {
      console.error('[ContextAnalyzer] BERT classification failed:', error);
      // Fallback to keyword-based classification
      return this.classifyByKeywords(text);
    }
  }

  /**
   * Fallback keyword-based classification (original implementation)
   */
  private async classifyByKeywords(text: string): Promise<IntentClassificationResult> {
    // Original keyword-based implementation
    const scores: Record<string, number> = {};

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          score += 1;
        }
      }
      scores[intent] = score;
    }

    // Find highest scoring intent
    let maxScore = 0;
    let primaryIntent = 'unknown';
    for (const [intent, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        primaryIntent = intent;
      }
    }

    // Calculate confidence based on keyword matches
    const confidence = maxScore > 0 ? Math.min(0.5 + maxScore * 0.1, 0.95) : 0.3;

    // Generate alternatives
    const alternatives = Object.entries(scores)
      .filter(([intent, score]) => intent !== primaryIntent && score > 0)
      .map(([intent, score]) => ({
        intent,
        confidence: Math.min(0.3 + score * 0.1, 0.8),
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2);

    return {
      intent: primaryIntent as string,
      confidence,
      alternatives: alternatives.length > 0 ? alternatives : undefined,
    };
  }

  /**
   * Extract entities from context
   */
  async extractEntities(
    context: Context,
    options?: AnalysisOptions
  ): Promise<Entity[]> {
    const entities: Entity[] = [];
    const text = this.extractTextFromContext(context);
    const minConfidence = options?.minConfidence ?? 0.7;

    // Extract dates
    const dateResult = parseDate(text);
    if (dateResult && dateResult.confidence >= minConfidence) {
      entities.push({
        id: uuidv4(),
        type: 'date' as EntityType,
        rawText: dateResult.rawText || dateResult.originalText,
        value: dateResult.isoDate,
        confidence: dateResult.confidence,
      });
    }

    // Extract amounts
    const amounts = extractAmounts(text);
    for (const amount of amounts) {
      entities.push({
        id: uuidv4(),
        type: 'amount' as EntityType,
        rawText: amount.rawText,
        value: amount.amount.toString(),
        confidence: 0.9,
        metadata: {
          currency: amount.currency,
        },
      });
    }

    // Extract phone numbers
    const phones = extractPhoneNumbers(text);
    for (const phone of phones) {
      entities.push({
        id: uuidv4(),
        type: 'person' as EntityType,
        rawText: phone,
        value: phone,
        confidence: 0.85,
      });
    }

    // Extract emails
    const emails = extractEmails(text);
    for (const email of emails) {
      entities.push({
        id: uuidv4(),
        type: 'person' as EntityType,
        rawText: email,
        value: email,
        confidence: 0.95,
      });
    }

    // Extract locations (simple keyword-based)
    const locationKeywords = [
      'at',
      'in',
      '서울',
      '부산',
      '강남',
      '홍대',
      '신촌',
      'gangnam',
      'hongdae',
      '신사',
      '삼성',
    ];
    for (const keyword of locationKeywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        entities.push({
          id: uuidv4(),
          type: 'location' as EntityType,
          rawText: keyword,
          value: keyword,
          confidence: 0.7,
        });
      }
    }

    // Extract person names (Korean and English patterns)
    const namePattern =
      /([가-힣]{2,3})\s?(님|씨)?|([A-Z][a-z]+\s+[A-Z][a-z]+)/g;
    const names = text.match(namePattern);
    if (names) {
      for (const name of names) {
        entities.push({
          id: uuidv4(),
          type: 'person' as EntityType,
          rawText: name,
          value: name,
          confidence: 0.75,
        });
      }
    }

    return entities;
  }

  /**
   * Suggest actions based on analysis
   */
  async suggestActions(
    context: Context,
    intent: IntentClassificationResult,
    entities: Entity[]
  ): Promise<Action[]> {
    const actions: Action[] = [];
    const text = this.extractTextFromContext(context);

    // Find date entity for scheduling
    const dateEntity = entities.find((e) => e.type === 'date');
    const amountEntity = entities.find((e) => e.type === 'amount');
    const locationEntity = entities.find((e) => e.type === 'location');

    // Suggest based on intent
    switch (intent.intent) {
      case 'calendar':
        if (dateEntity) {
          actions.push({
            id: uuidv4(),
            type: 'calendar' as ActionType,
            title: '일정 등록',
            description: `캘린더에 일정을 등록합니다`,
            entities: [dateEntity],
            confidence: 0.9,
            status: 'pending',
            metadata: {
              date: dateEntity.value,
            },
          });
        }
        break;

      case 'shopping':
        actions.push({
          id: uuidv4(),
          type: 'shopping' as ActionType,
          title: '위시리스트 추가',
          description: '쇼핑 위시리스트에 추가합니다',
          entities: entities.filter((e) => e.type === 'amount'),
          confidence: 0.8,
          status: 'pending',
        });

        if (amountEntity) {
          actions.push({
            id: uuidv4(),
            type: 'notification' as ActionType,
            title: '가격 알림 설정',
            description: '가격 하락 시 알림을 받습니다',
            entities: [amountEntity],
            confidence: 0.85,
            status: 'pending',
          });
        }
        break;

      case 'work':
        if (dateEntity) {
          actions.push({
            id: uuidv4(),
            type: 'task' as ActionType,
            title: '업무 등록',
            description: '업무 관리 도구에 할 일을 등록합니다',
            entities: [dateEntity],
            confidence: 0.9,
            status: 'pending',
            metadata: {
              priority: this.calculatePriority(text, dateEntity),
              deadline: dateEntity.value,
            },
          });
        }
        break;

      case 'social':
        if (dateEntity) {
          actions.push({
            id: uuidv4(),
            type: 'calendar' as ActionType,
            title: '경조사 일정 등록',
            description: '캘린더에 경조사 일정을 등록합니다',
            entities: [dateEntity, locationEntity].filter(
              (e): e is Entity => e !== undefined
            ),
            confidence: 0.9,
            status: 'pending',
          });
        }

        if (amountEntity) {
          actions.push({
            id: uuidv4(),
            type: 'payment' as ActionType,
            title: '축의금 송금 준비',
            description: '송금 앱을 실행하고 금액을 입력합니다',
            entities: [amountEntity],
            confidence: 0.85,
            status: 'pending',
          });
        }
        break;

      case 'payment':
        if (amountEntity) {
          actions.push({
            id: uuidv4(),
            type: 'payment' as ActionType,
            title: '송금 실행',
            description: '송금 앱을 실행하고 금액을 입력합니다',
            entities: [amountEntity],
            confidence: 0.9,
            status: 'pending',
          });
        }
        break;
    }

    // Always suggest a notification action for urgent items
    const urgency = detectUrgency(text);
    if (urgency >= 4) {
      actions.push({
        id: uuidv4(),
        type: 'notification' as ActionType,
        title: '긴급 알림',
        description: '즉시 확인이 필요한 알림을 설정합니다',
        entities: [],
        confidence: 0.95,
        status: 'pending',
        metadata: {
          urgency,
        },
      });
    }

    return actions;
  }

  /**
   * Find related contexts
   */
  async findRelated(context: Context, _limit = 5): Promise<RelatedContext[]> {
    // TODO: Implement similarity-based matching
    // For MVP, return empty array
    return [];
  }

  /**
   * Perform temporal analysis
   */
  async analyzeTemporal(
    context: Context,
    entities: Entity[]
  ): Promise<{
    deadline?: number;
    urgency: number;
    optimalExecutionTime?: number;
  }> {
    const text = this.extractTextFromContext(context);
    const dateEntity = entities.find((e) => e.type === 'date');

    let deadline: number | undefined;
    if (dateEntity && dateEntity.value) {
      deadline = new Date(dateEntity.value).getTime();
    }

    const urgency = detectUrgency(text);

    // Calculate optimal execution time
    let optimalExecutionTime: number | undefined;
    if (deadline) {
      const now = Date.now();
      const timeUntilDeadline = deadline - now;
      const daysUntilDeadline = timeUntilDeadline / (1000 * 60 * 60 * 24);

      if (daysUntilDeadline > 7) {
        // For deadlines more than a week away, remind 3 days before
        optimalExecutionTime = deadline - 3 * 24 * 60 * 60 * 1000;
      } else if (daysUntilDeadline > 2) {
        // For deadlines 2-7 days away, remind 1 day before
        optimalExecutionTime = deadline - 1 * 24 * 60 * 60 * 1000;
      } else {
        // For urgent deadlines, remind immediately
        optimalExecutionTime = now;
      }
    }

    return {
      deadline,
      urgency,
      optimalExecutionTime,
    };
  }

  /**
   * Batch analyze multiple contexts
   */
  async batchAnalyze(
    contexts: Context[],
    options?: AnalysisOptions
  ): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];

    for (const context of contexts) {
      const result = await this.analyze(context, options);
      results.push(result);
    }

    return results;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;
  }

  /**
   * Helper: Extract text content from context data
   */
  private extractTextFromContext(context: Context): string {
    const data = context.data as any;

    switch (context.type) {
      case 'chat':
        return data.message || '';
      case 'voice':
        return data.transcript || '';
      case 'manual':
        return data.content || '';
      case 'screenshot':
        return data.extractedText || '';
      case 'location':
        return data.locationName || '';
      default:
        return '';
    }
  }

  /**
   * Helper: Calculate task priority from text and date
   */
  private calculatePriority(text: string, _dateEntity: Entity): TaskPriority {
    const urgency = detectUrgency(text);
    if (urgency >= 4) return 'high';
    if (urgency >= 3) return 'medium';
    return 'low';
  }
}
