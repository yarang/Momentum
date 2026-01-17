/**
 * Text Analyzer Utility
 *
 * Basic text analysis utilities for entity extraction and keyword detection.
 */

/**
 * Analysis result with keywords
 */
export interface KeywordAnalysis {
  /** Detected keywords */
  keywords: string[];
  /** Keyword categories */
  categories: string[];
}

/**
 * Intent keywords for classification
 */
const INTENT_KEYWORDS: Record<string, string[]> = {
  calendar: ['meeting', 'appointment', 'schedule', '일정', '약속', '미팅', 'calendar', 'event'],
  shopping: ['buy', 'purchase', 'shop', 'shopping', 'price', 'sale', '구매', '쇼핑'],
  work: ['deadline', 'task', 'project', 'report', 'work', '업무', '제안', '보고서', '마감'],
  social: ['wedding', 'birthday', 'party', '결혼', '생일', '파티', '경조사', 'celebration'],
};

/**
 * Analyze text for keywords by category
 * @param text - Text to analyze
 * @returns KeywordAnalysis result
 */
export function analyzeKeywords(text: string): KeywordAnalysis {
  const lowerText = text.toLowerCase();
  const keywords: string[] = [];
  const categories: string[] = [];

  for (const [category, categoryKeywords] of Object.entries(INTENT_KEYWORDS)) {
    for (const keyword of categoryKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        if (!keywords.includes(keyword)) {
          keywords.push(keyword);
        }
        if (!categories.includes(category)) {
          categories.push(category);
        }
      }
    }
  }

  return { keywords, categories };
}

/**
 * Extract amount/money from text
 * @param text - Text containing amount information
 * @returns Array of {amount, currency, rawText}
 */
export function extractAmounts(text: string): Array<{ amount: number; currency: string; rawText: string }> {
  const results: Array<{ amount: number; currency: string; rawText: string }> = [];

  // KRW: 50,000원, 10000원
  const krwMatches = text.matchAll(/(\d{1,3}(?:,\d{3})*)\s*원/g);
  for (const match of krwMatches) {
    const valueStr = match[1].replace(/,/g, '');
    const amount = parseFloat(valueStr);
    if (!isNaN(amount)) {
      results.push({
        amount,
        currency: 'KRW',
        rawText: match[0],
      });
    }
  }

  // USD: $100
  const usdMatches = text.matchAll(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
  for (const match of usdMatches) {
    const amount = parseFloat(match[1].replace(/,/g, ''));
    if (!isNaN(amount)) {
      results.push({
        amount,
        currency: 'USD',
        rawText: match[0],
      });
    }
  }

  return results;
}

/**
 * Extract phone numbers from text
 * @param text - Text to analyze
 * @returns Array of phone number strings
 */
export function extractPhoneNumbers(text: string): string[] {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/g;
  const matches = text.match(phoneRegex);
  return matches || [];
}

/**
 * Extract email addresses from text
 * @param text - Text to analyze
 * @returns Array of email strings
 */
export function extractEmails(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  return matches || [];
}

/**
 * Detect urgency from text
 * @param text - Text to analyze
 * @returns Urgency level (1-5, where 5 is most urgent)
 */
export function detectUrgency(text: string): number {
  const lowerText = text.toLowerCase();
  const urgencyKeywords: Record<number, string[]> = {
    5: ['urgent', 'emergency', 'asap', '긴급', '즉시', '당장'],
    4: ['today', 'tonight', '오늘', '이번'],
    3: ['tomorrow', 'important', 'priority', '내일', '중요'],
    2: ['this week', 'next few days', '이번 주'],
    1: ['later', 'eventually', '나중에'],
  };

  for (const [level, keywords] of Object.entries(urgencyKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return parseInt(level);
      }
    }
  }

  return 2; // Default medium urgency
}

/**
 * Clean and normalize text
 * @param text - Text to clean
 * @returns Cleaned text
 */
export function cleanText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}
