/**
 * SocialEvent Extractor Service
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-005: AI/ML 엔진 통합 (IntentClassifier, EntityExtractor)
 *
 * 경조사 관련 정보 추출 서비스입니다.
 * 텍스트에서 경조사 유형, 날짜, 장소, 연락처, 금액 등의 정보를 추출합니다.
 *
 * @remarks
 * 현재는 키워드 기반 분류를 사용합니다.
 * 추후 TensorFlow Lite 기반 ML 모델로 대체 예정 (SPEC-AI-002).
 */

import {
  SocialEventType,
  SocialEventPriority,
} from '@/shared/models';

/**
 * 의도 분류 결과
 */
export interface IntentResult {
  /** 경조사 유형 */
  type: SocialEventType;
  /** 신뢰도 (0-1) */
  confidence: number;
}

/**
 * 추출된 엔티티 정보
 */
export interface ExtractedEntities {
  /** 날짜/시간 목록 */
  dates: Date[];
  /** 장소 이름 목록 */
  locations: string[];
  /** 전화번호 목록 */
  phoneNumbers: string[];
  /** 사람 이름 목록 */
  names: string[];
  /** 금액 목록 */
  amounts: number[];
  /** 관계 유형 목록 */
  relationships: string[];
}

/**
 * 추출 결과
 */
export interface ExtractionResult {
  /** 경조사 유형 */
  type: SocialEventType;
  /** 추출된 엔티티 */
  entities: ExtractedEntities;
  /** 추론된 우선순위 */
  priority: SocialEventPriority;
  /** 신뢰도 */
  confidence: number;
}

/**
 * 경조사 키워드 정의
 */
const SOCIAL_EVENT_KEYWORDS: Record<SocialEventType, string[]> = {
  wedding: [
    '결혼', 'wedding', 'marriage', '예식', '웨딩',
    '신랑', '신부', '신혼', '신혼여행', '피로연',
    '예식장', '웨딩홀', '결혼식',
  ],
  funeral: [
    '장례', 'funeral', '장례식', '빈소', '상가', '발인',
    '별세', '소천', '사망', '돌아가심', '애도',
    '조문', '조상', '삼가', '임종',
  ],
  first_birthday: [
    '돌', '돌잔치', '첫생일', 'first birthday', '돌잔',
    '周岁', '돌잔치', '돌선물',
  ],
  sixtieth_birthday: [
    '환갑', '회갑', '칠순', '팔순', '희수', '회갑연',
    '60th birthday', '환갑잔치', '고례', '수연',
  ],
  birthday: [
    '생일', 'birthday', '생신', '파티', 'party',
    '축하', 'celebration',
  ],
  graduation: [
    '졸업', 'graduation', '졸업식', '학사', '석사', '박사',
    '학위', '대학', '대학원',
  ],
  etc: [],
};

/**
 * 관계 키워드 매핑
 */
const RELATIONSHIP_KEYWORDS: Record<string, string> = {
  '대학 친구': 'college_friend',
  '고등학교 친구': 'high_school_friend',
  '친구': 'friend',
  '회사 동료': 'colleague',
  '직장 동료': 'colleague',
  '동료': 'colleague',
  '상사': 'boss',
  '가족': 'family',
  '친척': 'relative',
  '이웃': 'neighbor',
};

/**
 * SocialEvent Extractor Service
 */
export class SocialEventExtractor {
  /**
   * 텍스트에서 경조사 의도를 분류합니다.
   *
   * @param text - 분석할 텍스트
   * @returns IntentResult
   */
  classifyIntent(text: string): IntentResult {
    if (!text || text.trim().length === 0) {
      return { type: 'etc', confidence: 0 };
    }

    const lowerText = text.toLowerCase();

    // 각 유형별 키워드 매칭 수 계산
    const scores: Record<SocialEventType, number> = {
      wedding: 0,
      funeral: 0,
      first_birthday: 0,
      sixtieth_birthday: 0,
      birthday: 0,
      graduation: 0,
      etc: 0,
    };

    for (const [type, keywords] of Object.entries(SOCIAL_EVENT_KEYWORDS)) {
      if (type === 'etc') {continue;}

      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          scores[type as SocialEventType]++;
        }
      }
    }

    // 가장 높은 점수의 유형 선택
    let maxScore = 0;
    let bestType: SocialEventType = 'etc';

    for (const [type, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestType = type as SocialEventType;
      }
    }

    // 신뢰도 계산 (최대 2개 키워드 매칭 시 1.0으로 조정)
    const confidence = maxScore > 0 ? Math.min(maxScore / 2, 1.0) : 0;

    return { type: bestType, confidence };
  }

  /**
   * 텍스트에서 엔티티를 추출합니다.
   *
   * @param text - 분석할 텍스트
   * @returns ExtractedEntities
   */
  extractEntities(text: string): ExtractedEntities {
    const entities: ExtractedEntities = {
      dates: [],
      locations: [],
      phoneNumbers: [],
      names: [],
      amounts: [],
      relationships: [],
    };

    if (!text || text.trim().length === 0) {
      return entities;
    }

    // 날짜/시간 추출
    entities.dates = this.extractDates(text);

    // 전화번호 추출
    entities.phoneNumbers = this.extractPhoneNumbers(text);

    // 금액 추출
    entities.amounts = this.extractAmounts(text);

    // 관계 추출
    entities.relationships = this.extractRelationships(text);

    // 장소 추출 (간단 구현)
    entities.locations = this.extractLocations(text);

    // 이름 추출 (간단 구현 - 한글 이름)
    entities.names = this.extractNames(text);

    return entities;
  }

  /**
   * 날짜/시간 추출
   */
  private extractDates(text: string): Date[] {
    const dates: Date[] = [];

    // YYYY-MM-DD 형식
    const datePattern1 = /(\d{4})-(\d{1,2})-(\d{1,2})/g;
    let match = datePattern1.exec(text);
    while (match !== null) {
      const [, year, month, day] = match;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      dates.push(date);
      match = datePattern1.exec(text);
    }
    // Reset regex
    datePattern1.lastIndex = 0;

    // MM월 DD일 형식
    const datePattern2 = /(\d{1,2})월\s*(\d{1,2})일/g;
    match = datePattern2.exec(text);
    const currentYear = new Date().getFullYear();
    while (match !== null) {
      const [, month, day] = match;
      const date = new Date(currentYear, parseInt(month) - 1, parseInt(day));
      dates.push(date);
      match = datePattern2.exec(text);
    }

    // 상대적 날짜: 내일
    if (text.includes('내일')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dates.push(tomorrow);
    }

    // 상대적 날짜: 모레
    if (text.includes('모레')) {
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      dates.push(dayAfterTomorrow);
    }

    // 상대적 날짜: 다음 주
    if (text.includes('다음 주')) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      dates.push(nextWeek);
    }

    // 시간 추출: 오후 N시
    const timePattern = /(오전|오후)\s*(\d{1,2})시/;
    match = timePattern.exec(text);
    if (match) {
      const [, ampm, hourStr] = match;
      let hour = parseInt(hourStr);

      if (ampm === '오후' && hour < 12) {
        hour += 12;
      } else if (ampm === '오전' && hour === 12) {
        hour = 0;
      }

      // 날짜가 없으면 오늘 날짜 사용
      if (dates.length === 0) {
        const today = new Date();
        today.setHours(hour, 0, 0, 0);
        dates.push(today);
      } else {
        // 가장 최근 날짜에 시간 적용
        const lastDate = dates[dates.length - 1];
        lastDate.setHours(hour, 0, 0, 0);
      }
    }

    return dates;
  }

  /**
   * 전화번호 추출
   */
  private extractPhoneNumbers(text: string): string[] {
    const phoneNumbers: string[] = [];

    // 010-XXXX-XXXX 형식
    const phonePattern = /010-?\d{4}-?\d{4}/g;
    let match = phonePattern.exec(text);
    while (match !== null) {
      phoneNumbers.push(match[0]);
      match = phonePattern.exec(text);
    }

    // 011-XXX-XXXX 등 다른 형식도 추가 가능
    const phonePattern2 = /01[1|6|7|8|9]-?\d{3,4}-?\d{4}/g;
    match = phonePattern2.exec(text);
    while (match !== null) {
      if (!phoneNumbers.includes(match[0])) {
        phoneNumbers.push(match[0]);
      }
      match = phonePattern2.exec(text);
    }

    return phoneNumbers;
  }

  /**
   * 금액 추출
   */
  private extractAmounts(text: string): number[] {
    const amounts: number[] = [];

    // N만 원, N만원 형식 (공백 허용)
    const manPattern = /(\d+)\s*만\s*원/g;
    let match = manPattern.exec(text);
    while (match !== null) {
      const amount = parseInt(match[1]) * 10000;
      amounts.push(amount);
      match = manPattern.exec(text);
    }

    // N천 원 형식
    const cheonPattern = /(\d+)\s*천\s*원/g;
    match = cheonPattern.exec(text);
    while (match !== null) {
      const amount = parseInt(match[1]) * 1000;
      amounts.push(amount);
      match = cheonPattern.exec(text);
    }

    // N,NNN원 형식
    const commaPattern = /(\d{1,3}(?:,\d{3})+)\s*원/g;
    match = commaPattern.exec(text);
    while (match !== null) {
      const amount = parseInt(match[1].replace(/,/g, ''));
      amounts.push(amount);
      match = commaPattern.exec(text);
    }

    // 숫자+원 형식 (단순 숫자+원)
    const numberPattern = /(\d{4,})\s*원/g;
    match = numberPattern.exec(text);
    while (match !== null) {
      const amount = parseInt(match[1]);
      if (amount > 1000) { // 1000원 이상만 추출
        amounts.push(amount);
      }
      match = numberPattern.exec(text);
    }

    // 한글 숫자: 십만 원, 백만 원 등
    const koreanNumbers: Record<string, number> = {
      '십만': 100000,
      '백만': 1000000,
      '천만': 10000000,
      '일만': 10000,
      '이만': 20000,
      '삼만': 30000,
      '사만': 40000,
      '오만': 50000,
      '육만': 60000,
      '칠만': 70000,
      '팔만': 80000,
      '구만': 90000,
    };

    for (const [korean, value] of Object.entries(koreanNumbers)) {
      if (text.includes(korean)) {
        amounts.push(value);
      }
    }

    return amounts;
  }

  /**
   * 관계 추출
   */
  private extractRelationships(text: string): string[] {
    const relationships: string[] = [];

    for (const [keyword, type] of Object.entries(RELATIONSHIP_KEYWORDS)) {
      if (text.includes(keyword)) {
        relationships.push(type);
      }
    }

    return relationships;
  }

  /**
   * 장소 추출 (간단 구현)
   */
  private extractLocations(text: string): string[] {
    const locations: string[] = [];

    // 일반적인 장소 키워드
    const locationKeywords = [
      '호텔', '예식장', '웨딩홀', '장례식장', '병원', '식당',
      '집', '교회', '성당', '빌딩', '센터',
    ];

    for (const keyword of locationKeywords) {
      if (text.includes(keyword)) {
        // 앞뒤 단어 포함하여 추출 (조사 제거)
        const regex = new RegExp(`[^.\\s]*${keyword}[^.\\s]*`, 'g');
        const matches = text.match(regex);
        if (matches) {
          // 조사 제거: 에서, 에, 의, 으로, 등
          const cleaned = matches.map(m =>
            m.replace(/(에서|에|의|으로|로|으로부터|부터)$/g, '')
          );
          locations.push(...cleaned);
        }
      }
    }

    return locations;
  }

  /**
   * 이름 추출 (간단 구현)
   */
  private extractNames(text: string): string[] {
    const names: string[] = [];

    // 한글 이름 패턴 (성+이름 2자 이상)
    const koreanNamePattern = /[가-힣]{2,4}/g;
    let match = koreanNamePattern.exec(text);
    while (match !== null) {
      const name = match[0];
      // 일반적인 단어 및 존칭 제거
      const commonWords = ['결혼식', '장례식', '돌잔치', '생신', '파티', '축하', '초대', '예약'];
      const suffixes = ['님', '씨', '교수', '박사', '박사님', '교수님'];

      // 존칭 제거
      let cleanName = name;
      for (const suffix of suffixes) {
        if (cleanName.endsWith(suffix)) {
          cleanName = cleanName.slice(0, -suffix.length);
          break;
        }
      }

      if (!commonWords.includes(name) && cleanName.length >= 2) {
        names.push(cleanName);
      }
      match = koreanNamePattern.exec(text);
    }

    return names;
  }

  /**
   * 텍스트에서 우선순위를 추론합니다.
   *
   * @param text - 분석할 텍스트
   * @returns SocialEventPriority
   */
  inferPriority(text: string): SocialEventPriority {
    if (!text || text.trim().length === 0) {
      return 'medium';
    }

    const lowerText = text.toLowerCase();

    // 장례식은 항상 긴급
    if (SOCIAL_EVENT_KEYWORDS.funeral.some(kw => lowerText.includes(kw.toLowerCase()))) {
      return 'urgent';
    }

    // 내일, 모레 등 가까운 일정
    if (lowerText.includes('내일') || lowerText.includes('모레') || lowerText.includes('당장')) {
      return 'high';
    }

    // 다음 주 등
    if (lowerText.includes('다음 주')) {
      return 'medium';
    }

    // 내년, 몇 달 후 등 먼 미래
    if (lowerText.includes('내년') || lowerText.includes('년 후') || lowerText.includes('달 후')) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * 텍스트에서 경조사 정보를 종합적으로 추출합니다.
   *
   * @param text - 분석할 텍스트
   * @returns ExtractionResult
   */
  extract(text: string): ExtractionResult {
    if (!text || text.trim().length === 0) {
      return {
        type: 'etc',
        entities: {
          dates: [],
          locations: [],
          phoneNumbers: [],
          names: [],
          amounts: [],
          relationships: [],
        },
        priority: 'medium',
        confidence: 0,
      };
    }

    const intent = this.classifyIntent(text);
    const entities = this.extractEntities(text);
    const priority = this.inferPriority(text);

    return {
      type: intent.type,
      entities,
      priority,
      confidence: intent.confidence,
    };
  }
}
