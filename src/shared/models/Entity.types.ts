/**
 * Entity Types
 *
 * Represents extracted entities from context analysis such as dates, times, locations, amounts, and people.
 * These entities are the building blocks for understanding user context and creating actionable tasks.
 */

/**
 * Date entity extracted from text or images
 */
export interface DateEntity {
  /** Unique identifier for the entity */
  id: string;
  /** Entity type discriminator */
  type: 'date';
  /** ISO 8601 date string */
  value: string;
  /** Original text that was parsed */
  rawText: string;
  /** Confidence score from extraction (0-1) */
  confidence: number;
}

/**
 * Time entity extracted from text or images
 */
export interface TimeEntity {
  /** Unique identifier for the entity */
  id: string;
  /** Entity type discriminator */
  type: 'time';
  /** ISO 8601 time string (HH:MM:SS) */
  value: string;
  /** Original text that was parsed */
  rawText: string;
  /** Confidence score from extraction (0-1) */
  confidence: number;
}

/**
 * Location entity extracted from text or images
 */
export interface LocationEntity {
  /** Unique identifier for the entity */
  id: string;
  /** Entity type discriminator */
  type: 'location';
  /** Location name or address */
  value: string;
  /** Optional latitude coordinate */
  latitude?: number;
  /** Optional longitude coordinate */
  longitude?: string;
  /** Original text that was parsed */
  rawText: string;
  /** Confidence score from extraction (0-1) */
  confidence: number;
}

/**
 * Amount/Monetary entity extracted from text or images
 */
export interface AmountEntity {
  /** Unique identifier for the entity */
  id: string;
  /** Entity type discriminator */
  type: 'amount';
  /** Numeric value */
  value: string;
  /** Currency code (ISO 4217) */
  currency: string;
  /** Original text that was parsed */
  rawText: string;
  /** Confidence score from extraction (0-1) */
  confidence: number;
  /** Optional metadata for additional information */
  metadata?: {
    currency?: string;
    [key: string]: unknown;
  };
}

/**
 * Person/Contact entity extracted from text or images
 */
export interface PersonEntity {
  /** Unique identifier for the entity */
  id: string;
  /** Entity type discriminator */
  type: 'person';
  /** Person's name */
  value: string;
  /** Optional phone number */
  phone?: string;
  /** Optional email address */
  email?: string;
  /** Original text that was parsed */
  rawText: string;
  /** Confidence score from extraction (0-1) */
  confidence: number;
}

/**
 * Union type of all possible entities
 */
export type Entity =
  | DateEntity
  | TimeEntity
  | LocationEntity
  | AmountEntity
  | PersonEntity;

/**
 * Entity type discriminator values
 */
export type EntityType = Entity['type'];

/**
 * Entity extraction result with metadata
 */
export interface EntityExtractionResult {
  /** Extracted entities grouped by type */
  entities: Entity[];
  /** Overall confidence score (0-1) */
  confidence: number;
  /** Processing timestamp */
  timestamp: number;
}
