/**
 * Date Parser Utility
 *
 * Parses various date formats from text input.
 * Supports Korean and English date expressions for MVP.
 */

/**
 * Parsed date result
 */
export interface ParsedDate {
  /** ISO 8601 date string (YYYY-MM-DD) */
  isoDate: string;
  /** Original text that was parsed */
  rawText: string;
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Parse date from text input
 * @param text - Text containing date information
 * @returns ParsedDate result or null if no date found
 */
export function parseDate(text: string): ParsedDate | null {
  if (!text || text.trim().length === 0) {
    return null;
  }

  // ISO 8601 format (2024-01-15)
  const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const date = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`);
    if (!isNaN(date.getTime())) {
      return {
        isoDate: date.toISOString().split('T')[0],
        rawText: isoMatch[0],
        confidence: 0.95,
      };
    }
  }

  // Korean: MM월 DD일
  const koreanMonthDay = text.match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (koreanMonthDay) {
    const now = new Date();
    const date = new Date(now.getFullYear(), parseInt(koreanMonthDay[1]) - 1, parseInt(koreanMonthDay[2]));
    if (!isNaN(date.getTime())) {
      return {
        isoDate: date.toISOString().split('T')[0],
        rawText: koreanMonthDay[0],
        confidence: 0.85,
      };
    }
  }

  // Relative: 내일 (tomorrow)
  if (text.includes('내일')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      isoDate: tomorrow.toISOString().split('T')[0],
      rawText: '내일',
      confidence: 0.6,
    };
  }

  return null;
}

/**
 * Format date for display
 * @param isoDate - ISO 8601 date string
 * @param locale - Locale for formatting (default: 'ko-KR')
 * @returns Formatted date string
 */
export function formatDate(isoDate: string, locale: string = 'ko-KR'): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
