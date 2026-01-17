/**
 * Context Analyzer Interface
 *
 * Defines the contract for analyzing captured context and extracting meaning.
 * Implementations handle intent classification, entity extraction, and action suggestion.
 */

import { Context, Entity, Action, Task } from '@/shared/models';

/**
 * Intent classification result
 */
export interface IntentClassificationResult {
  /** Primary intent category */
  intent: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Alternative intents with scores */
  alternatives?: Array<{
    intent: string;
    confidence: number;
  }>;
}

/**
 * Analysis result containing all extracted information
 */
export interface AnalysisResult {
  /** Original context being analyzed */
  contextId: string;
  /** Extracted entities */
  entities: Entity[];
  /** Intent classification */
  intent: IntentClassificationResult;
  /** Suggested actions */
  suggestedActions: Action[];
  /** Whether analysis was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Analysis timestamp */
  timestamp: number;
}

/**
 * Configuration for context analysis
 */
export interface AnalysisOptions {
  /** Minimum confidence threshold for entity extraction */
  minConfidence?: number;
  /** Maximum number of actions to suggest */
  maxActions?: number;
  /** Whether to use temporal analysis */
  analyzeTemporal?: boolean;
  /** Whether to find related contexts */
  findRelated?: boolean;
}

/**
 * Related context with similarity score
 */
export interface RelatedContext {
  /** Related context ID */
  contextId: string;
  /** Similarity score (0-1) */
  similarity: number;
  /** Relationship type (e.g., 'duplicate', 'follow-up', 'related') */
  relationship: 'duplicate' | 'follow-up' | 'related' | 'reference';
}

/**
 * Interface for context analyzer implementations
 */
export interface IContextAnalyzer {
  /**
   * Initialize the analyzer (load models, setup resources)
   */
  initialize(): Promise<boolean>;

  /**
   * Analyze a context and extract meaning
   * @param context - The context to analyze
   * @param options - Optional analysis configuration
   */
  analyze(context: Context, options?: AnalysisOptions): Promise<AnalysisResult>;

  /**
   * Classify intent from context data
   * @param context - The context to classify
   */
  classifyIntent(context: Context): Promise<IntentClassificationResult>;

  /**
   * Extract entities from context
   * @param context - The context to extract from
   * @param options - Optional configuration
   */
  extractEntities(
    context: Context,
    options?: AnalysisOptions
  ): Promise<Entity[]>;

  /**
   * Suggest actions based on analysis
   * @param context - The analyzed context
   * @param intent - Classified intent
   * @param entities - Extracted entities
   */
  suggestActions(
    context: Context,
    intent: IntentClassificationResult,
    entities: Entity[]
  ): Promise<Action[]>;

  /**
   * Find related contexts
   * @param context - The context to find relations for
   * @param limit - Maximum number of related contexts
   */
  findRelated(context: Context, limit?: number): Promise<RelatedContext[]>;

  /**
   * Perform temporal analysis (detect deadlines, urgency)
   * @param context - The context to analyze
   * @param entities - Extracted entities
   */
  analyzeTemporal(context: Context, entities: Entity[]): Promise<{
    /** Detected deadline timestamp */
    deadline?: number;
    /** Urgency level (1-5) */
    urgency: number;
    /** Optimal execution time */
    optimalExecutionTime?: number;
  }>;

  /**
   * Batch analyze multiple contexts
   * @param contexts - Array of contexts to analyze
   * @param options - Optional configuration
   */
  batchAnalyze(
    contexts: Context[],
    options?: AnalysisOptions
  ): Promise<AnalysisResult[]>;

  /**
   * Cleanup and release resources
   */
  cleanup(): Promise<void>;
}
