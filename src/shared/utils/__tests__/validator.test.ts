/**
 * Tests for Validator Utility
 *
 * Test suite for validation functions including email, date, coordinates,
 * currency, entity validation, and string sanitization.
 */

import {
  isValidEmail,
  isValidISODate,
  isValidCoordinates,
  isValidCurrency,
  validateEntity,
  sanitizeString,
  ValidationResult,
} from '../validator';
import { Entity } from '../../models';

describe('Validator Utility', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('first+last@sub.domain.org')).toBe(true);
      expect(isValidEmail('  test@example.com  ')).toBe(true); // Trims whitespace
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('   ')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('test..email@example.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidEmail(undefined as unknown as string)).toBe(false);
      expect(isValidEmail(null as unknown as string)).toBe(false);
    });
  });

  describe('isValidISODate', () => {
    it('should return true for valid ISO date strings', () => {
      expect(isValidISODate('2025-01-16')).toBe(true);
      expect(isValidISODate('2025-01-16T10:30:00')).toBe(true);
      expect(isValidISODate('2025-01-16T10:30:00Z')).toBe(true);
      expect(isValidISODate('2025-12-31T23:59:59.999Z')).toBe(true);
      expect(isValidISODate('  2025-01-16  ')).toBe(true); // Trims whitespace
    });

    it('should return false for invalid date strings', () => {
      expect(isValidISODate('')).toBe(false);
      expect(isValidISODate('   ')).toBe(false);
      expect(isValidISODate('not-a-date')).toBe(false);
      expect(isValidISODate('2025-13-01')).toBe(false); // Invalid month
      expect(isValidISODate('2025-01-32')).toBe(false); // Invalid day
      expect(isValidISODate('9999-99-99')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidISODate(undefined as unknown as string)).toBe(false);
      expect(isValidISODate(null as unknown as string)).toBe(false);
    });
  });

  describe('isValidCoordinates', () => {
    it('should return true for valid coordinates', () => {
      expect(isValidCoordinates(0, 0)).toBe(true); // Equator, Prime Meridian
      expect(isValidCoordinates(37.7749, -122.4194)).toBe(true); // San Francisco
      expect(isValidCoordinates(-33.8688, 151.2093)).toBe(true); // Sydney
      expect(isValidCoordinates(90, 180)).toBe(true); // North, East limits
      expect(isValidCoordinates(-90, -180)).toBe(true); // South, West limits
    });

    it('should return false for invalid coordinates', () => {
      expect(isValidCoordinates(91, 0)).toBe(false); // Latitude too high
      expect(isValidCoordinates(-91, 0)).toBe(false); // Latitude too low
      expect(isValidCoordinates(0, 181)).toBe(false); // Longitude too high
      expect(isValidCoordinates(0, -181)).toBe(false); // Longitude too low
      expect(isValidCoordinates(NaN, 0)).toBe(false); // NaN latitude
      expect(isValidCoordinates(0, NaN)).toBe(false); // NaN longitude
    });

    it('should handle edge cases', () => {
      expect(isValidCoordinates(NaN as unknown as number, 0)).toBe(false);
      expect(isValidCoordinates(0, undefined as unknown as number)).toBe(false);
      expect(isValidCoordinates(null as unknown as number, 0)).toBe(false);
    });
  });

  describe('isValidCurrency', () => {
    it('should return true for valid currency codes', () => {
      expect(isValidCurrency('USD')).toBe(true);
      expect(isValidCurrency('EUR')).toBe(true);
      expect(isValidCurrency('KRW')).toBe(true);
      expect(isValidCurrency('JPY')).toBe(true);
      expect(isValidCurrency('usd')).toBe(true); // Case insensitive
      expect(isValidCurrency('Usd')).toBe(true); // Mixed case
    });

    it('should return false for invalid currency codes', () => {
      expect(isValidCurrency('')).toBe(false);
      expect(isValidCurrency('XXX')).toBe(false);
      expect(isValidCurrency('ABC')).toBe(false);
      expect(isValidCurrency('12')).toBe(false);
      expect(isValidCurrency('USDD')).toBe(false); // Too long
    });

    it('should handle edge cases', () => {
      expect(isValidCurrency(undefined as unknown as string)).toBe(false);
      expect(isValidCurrency(null as unknown as string)).toBe(false);
    });
  });

  describe('validateEntity', () => {
    const validEntity: Entity = {
      id: 'test-entity-1',
      type: 'date',
      value: '2025-01-16',
      rawText: '2025-01-16',
      confidence: 0.95,
    };

    it('should return valid result for complete entity', () => {
      const result: ValidationResult = validateEntity(validEntity);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid result for entity with missing id', () => {
      const invalidEntity = { ...validEntity, id: '' };
      const result: ValidationResult = validateEntity(invalidEntity);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Entity ID is required');
    });

    it('should return invalid result for entity with missing rawText', () => {
      const invalidEntity = { ...validEntity, rawText: '' };
      const result: ValidationResult = validateEntity(invalidEntity);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Entity rawText is required');
    });

    it('should return invalid result for entity with invalid confidence', () => {
      const invalidEntity1 = { ...validEntity, confidence: -0.1 };
      const result1: ValidationResult = validateEntity(invalidEntity1);
      expect(result1.valid).toBe(false);
      expect(result1.errors).toContain('Entity confidence must be between 0 and 1');

      const invalidEntity2 = { ...validEntity, confidence: 1.1 };
      const result2: ValidationResult = validateEntity(invalidEntity2);
      expect(result2.valid).toBe(false);
      expect(result2.errors).toContain('Entity confidence must be between 0 and 1');
    });

    it('should return multiple errors for entity with multiple issues', () => {
      const invalidEntity: Entity = {
        id: '',
        type: 'date',
        value: '2025-01-16',
        rawText: '',
        confidence: 1.5,
      };
      const result: ValidationResult = validateEntity(invalidEntity);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('sanitizeString', () => {
    it('should return empty string for empty input', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString(undefined as unknown as string)).toBe('');
      expect(sanitizeString(null as unknown as string)).toBe('');
    });

    it('should trim whitespace from input', () => {
      expect(sanitizeString('  test  ')).toBe('test');
      expect(sanitizeString('\t\n test \n\t')).toBe('test');
    });

    it('should remove control characters', () => {
      expect(sanitizeString('test\x00string')).toBe('teststring');
      expect(sanitizeString('test\x1Fstring')).toBe('teststring');
      expect(sanitizeString('test\x7Fstring')).toBe('teststring');
    });

    it('should truncate string to max length', () => {
      const longString = 'a'.repeat(100);
      expect(sanitizeString(longString, 50)).toHaveLength(50);
      expect(sanitizeString('test', 10)).toBe('test');
    });

    it('should not truncate when maxLength is 0', () => {
      const longString = 'a'.repeat(1000);
      expect(sanitizeString(longString, 0)).toBe(longString);
    });

    it('should handle multiple sanitization steps', () => {
      const input = '  \x00test\x1F  string\x7F  ';
      const result = sanitizeString(input, 20);
      expect(result).toBe('test string');
    });
  });
});
