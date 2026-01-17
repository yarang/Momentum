/**
 * Validator Utility
 *
 * Validation utilities for various data types and entities.
 */

import { Entity } from '../models';

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors if any */
  errors: string[];
}

/**
 * Validate email address
 * @param email - Email string to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim().length === 0) {
    return false;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate ISO 8601 date string
 * @param dateString - Date string to validate
 * @returns true if valid ISO date format
 */
export function isValidISODate(dateString: string): boolean {
  if (!dateString || dateString.trim().length === 0) {
    return false;
  }
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate coordinates (latitude, longitude)
 * @param latitude - Latitude value
 * @param longitude - Longitude value
 * @returns true if valid coordinates
 */
export function isValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  );
}

/**
 * Validate currency code (ISO 4217)
 * @param currency - Currency code (e.g., 'USD', 'KRW')
 * @returns true if valid currency code
 */
export function isValidCurrency(currency: string): boolean {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'KRW', 'CNY', 'INR', 'AUD', 'CAD'];
  return validCurrencies.includes(currency.toUpperCase());
}

/**
 * Validate entity object
 * @param entity - Entity to validate
 * @returns ValidationResult with errors if any
 */
export function validateEntity(entity: Entity): ValidationResult {
  const errors: string[] = [];

  if (!entity.id || entity.id.trim().length === 0) {
    errors.push('Entity ID is required');
  }

  if (!entity.rawText || entity.rawText.trim().length === 0) {
    errors.push('Entity rawText is required');
  }

  if (typeof entity.confidence !== 'number' || entity.confidence < 0 || entity.confidence > 1) {
    errors.push('Entity confidence must be between 0 and 1');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize string input
 * @param input - String to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input) {
    return '';
  }

  let sanitized = input.trim();
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  if (maxLength > 0 && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}
