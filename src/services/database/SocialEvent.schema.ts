/**
 * SocialEvent Database Schema
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-002: SocialEvent 데이터베이스 스키마 및 마이그레이션
 *
 * SQLite database schema for social events (경조사) management.
 * 테이블: social_events
 *
 * @see https://github.com/margelo/react-native-quick-sqlite
 */

/**
 * SocialEvent 테이블 스키마
 *
 * @remarks
 * 경조사 이벤트 정보를 저장하는 테이블입니다.
 * 위치 및 연락처 정보는 JSON 형태로 직렬화하여 저장하지 않고,
 * 검색 및 필터링을 위해 개별 컬럼으로 분리하여 저장합니다.
 *
 * SQLite 타입 매핑:
 * - TEXT: 문자열 (id, title, description 등)
 * - INTEGER: 정수 (타임스탬프, 플래그, 금액)
 * - REAL: 실수 (위도, 경도)
 */
export const SOCIAL_EVENT_TABLE = `
  CREATE TABLE IF NOT EXISTS social_events (
    /* 기본 정보 */
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    title TEXT NOT NULL,
    description TEXT,

    /* 이벤트 날짜/시간 (UNIX timestamp in milliseconds) */
    event_date INTEGER NOT NULL,

    /* 위치 정보 */
    location_name TEXT,
    location_address TEXT,
    location_latitude REAL,
    location_longitude REAL,

    /* 연락처 정보 */
    contact_name TEXT,
    contact_phone TEXT,
    contact_relationship TEXT,

    /* 선물 정보 */
    gift_amount INTEGER,
    gift_sent INTEGER DEFAULT 0,
    gift_sent_date INTEGER,

    /* 알림 정보 */
    reminder_set INTEGER DEFAULT 0,
    reminder_date INTEGER,
    notified INTEGER DEFAULT 0,

    /* 외부 참조 */
    calendar_event_id TEXT,
    source_context_id TEXT,

    /* 추가 정보 */
    notes TEXT,

    /* 감사 기록 */
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,

    /* 외래 키 제약 조건 */
    FOREIGN KEY (source_context_id) REFERENCES contexts(id) ON DELETE SET NULL
  );
`;

/**
 * SocialEvent 테이블 인덱스
 *
 * @remarks
 * 성능 최적화를 위한 인덱스 정의입니다.
 * 자주 조회되는 컬럼에 인덱스를 생성합니다.
 */
export const SOCIAL_EVENT_INDEXES = [
  /* 유형별 조회 */
  'CREATE INDEX IF NOT EXISTS idx_social_events_type ON social_events(type);',

  /* 상태별 조회 */
  'CREATE INDEX IF NOT EXISTS idx_social_events_status ON social_events(status);',

  /* 우선순위별 조회 */
  'CREATE INDEX IF NOT EXISTS idx_social_events_priority ON social_events(priority);',

  /* 날짜 범위 조회 */
  'CREATE INDEX IF NOT EXISTS idx_social_events_event_date ON social_events(event_date);',

  /* 생성일 순 정렬 */
  'CREATE INDEX IF NOT EXISTS idx_social_events_created_at ON social_events(created_at);',

  /* 수정일 순 정렬 */
  'CREATE INDEX IF NOT EXISTS idx_social_events_updated_at ON social_events(updated_at);',

  /* 선물 미송부 필터 */
  'CREATE INDEX IF NOT EXISTS idx_social_events_gift_sent ON social_events(gift_sent);',

  /* 알림 미설정 필터 */
  'CREATE INDEX IF NOT EXISTS idx_social_events_reminder_set ON social_events(reminder_set);',

  /* 알림 미전송 필터 */
  'CREATE INDEX IF NOT EXISTS idx_social_events_notified ON social_events(notified);',

  /* 캘린더 연동 조회 */
  'CREATE INDEX IF NOT EXISTS idx_social_events_calendar_id ON social_events(calendar_event_id);',

  /* 컨텍스트 소스 조회 */
  'CREATE INDEX IF NOT EXISTS idx_social_events_source_context_id ON social_events(source_context_id);',

  /* 복합 인덱스: 상태 + 날짜 (대시보드 조회) */
  'CREATE INDEX IF NOT EXISTS idx_social_events_status_date ON social_events(status, event_date);',

  /* 복합 인덱스: 유형 + 상태 (필터링) */
  'CREATE INDEX IF NOT EXISTS idx_social_events_type_status ON social_events(type, status);',
];

/**
 * SocialEvent 스키마 버전
 *
 * @remarks
 * 데이터베이스 마이그레이션을 위한 버전 정보입니다.
 * Semantic Versioning (MAJOR.MINOR.PATCH)을 따릅니다.
 * - MAJOR: 테이블 구조 변경 (호환되지 않는 변경)
 * - MINOR: 필드 추가 (호환되는 변경)
 * - PATCH: 버그 수정, 기본값 변경
 */
export const SOCIAL_EVENT_SCHEMA_VERSION = '1.0.0';

/**
 * SocialEvent 스키마 필수 필드 목록
 */
export const SOCIAL_EVENT_REQUIRED_FIELDS = [
  'id',
  'type',
  'status',
  'priority',
  'title',
  'event_date',
  'created_at',
  'updated_at',
] as const;

/**
 * SocialEvent 스키마 선택적 필드 목록
 */
export const SOCIAL_EVENT_OPTIONAL_FIELDS = [
  'description',
  'location_name',
  'location_address',
  'location_latitude',
  'location_longitude',
  'contact_name',
  'contact_phone',
  'contact_relationship',
  'gift_amount',
  'gift_sent',
  'gift_sent_date',
  'reminder_set',
  'reminder_date',
  'notified',
  'calendar_event_id',
  'source_context_id',
  'notes',
] as const;

/**
 * SocialEvent 스키마 유효성 검증 결과
 */
export interface SocialEventSchemaValidationResult {
  /** 스키마가 유효한지 여부 */
  isValid: boolean;
  /** 스키마 버전 */
  version: string;
  /** 필수 필드 목록 */
  requiredFields: readonly string[];
  /** 선택적 필드 목록 */
  optionalFields: readonly string[];
  /** 검증 에러 목록 */
  errors: string[];
  /** 마이그레이션 가능 여부 */
  canMigrate: boolean;
}

/**
 * SocialEvent 테이블 스키마 유효성 검증
 *
 * @returns 스키마 유효성 검증 결과
 *
 * @remarks
 * 스키마 정의가 올바른지 검증합니다.
 * 필수 필드, 인덱스, 버전 정보 등을 확인합니다.
 */
export function validateSocialEventTable(): SocialEventSchemaValidationResult {
  const errors: string[] = [];

  // 테이블 정의 검증
  if (!SOCIAL_EVENT_TABLE || typeof SOCIAL_EVENT_TABLE !== 'string') {
    errors.push('SOCIAL_EVENT_TABLE이 정의되지 않았거나 문자열이 아닙니다.');
  }

  if (!SOCIAL_EVENT_TABLE.includes('CREATE TABLE IF NOT EXISTS social_events')) {
    errors.push('social_events 테이블 생성문이 올바르지 않습니다.');
  }

  // 필수 필드 검증
  SOCIAL_EVENT_REQUIRED_FIELDS.forEach((field) => {
    if (!SOCIAL_EVENT_TABLE.includes(`${field} `)) {
      errors.push(`필수 필드 '${field}'가 누락되었습니다.`);
    }
  });

  // 인덱스 정의 검증
  if (!Array.isArray(SOCIAL_EVENT_INDEXES)) {
    errors.push('SOCIAL_EVENT_INDEXES가 배열이 아닙니다.');
  }

  if (SOCIAL_EVENT_INDEXES.length === 0) {
    errors.push('인덱스가 정의되지 않았습니다.');
  }

  // 필수 인덱스 검증
  const requiredIndexes = [
    'idx_social_events_type',
    'idx_social_events_status',
    'idx_social_events_priority',
    'idx_social_events_event_date',
  ];

  const indexSql = SOCIAL_EVENT_INDEXES.join(' ');
  requiredIndexes.forEach((indexName) => {
    if (!indexSql.includes(indexName)) {
      errors.push(`필수 인덱스 '${indexName}'가 누락되었습니다.`);
    }
  });

  return {
    isValid: errors.length === 0,
    version: SOCIAL_EVENT_SCHEMA_VERSION,
    requiredFields: SOCIAL_EVENT_REQUIRED_FIELDS,
    optionalFields: SOCIAL_EVENT_OPTIONAL_FIELDS,
    errors,
    canMigrate: true, // v1.0.0은 항상 마이그레이션 가능
  };
}

/**
 * SocialEvent 테이블 스키마 버전 반환
 *
 * @returns 스키마 버전 (Semantic Versioning)
 *
 * @remarks
 * 현재 스키마 버전을 반환합니다.
 * 마이그레이션 시 버전 비교에 사용됩니다.
 */
export function getSocialEventTableVersion(): string {
  return SOCIAL_EVENT_SCHEMA_VERSION;
}

/**
 * SocialEvent 테이블 초기화 SQL
 *
 * @remarks
 * 테이블 생성과 인덱스 생성을 포함한 모든 SQL 문장입니다.
 * DatabaseService 초기화 시 사용됩니다.
 */
export const SOCIAL_EVENT_INIT_SQL = [
  SOCIAL_EVENT_TABLE,
  ...SOCIAL_EVENT_INDEXES,
];

/**
 * SocialEvent 테이블 삭제 SQL
 *
 * @remarks
 * 테스트 또는 마이그레이션을 위해 테이블을 삭제할 때 사용합니다.
 * 주의: 모든 데이터가 삭제됩니다.
 */
export const SOCIAL_EVENT_DROP_SQL = `
  DROP TABLE IF EXISTS social_events;
`;

/**
 * SocialEvent 테이블 컬럼 정보
 *
 * @remarks
 * 타입스크립트 타입과 SQLite 타입의 매핑 정보입니다.
 */
export const SOCIAL_EVENT_COLUMNS = {
  // 기본 정보
  ID: 'id',
  TYPE: 'type',
  STATUS: 'status',
  PRIORITY: 'priority',
  TITLE: 'title',
  DESCRIPTION: 'description',

  // 날짜/시간
  EVENT_DATE: 'event_date',

  // 위치 정보
  LOCATION_NAME: 'location_name',
  LOCATION_ADDRESS: 'location_address',
  LOCATION_LATITUDE: 'location_latitude',
  LOCATION_LONGITUDE: 'location_longitude',

  // 연락처 정보
  CONTACT_NAME: 'contact_name',
  CONTACT_PHONE: 'contact_phone',
  CONTACT_RELATIONSHIP: 'contact_relationship',

  // 선물 정보
  GIFT_AMOUNT: 'gift_amount',
  GIFT_SENT: 'gift_sent',
  GIFT_SENT_DATE: 'gift_sent_date',

  // 알림 정보
  REMINDER_SET: 'reminder_set',
  REMINDER_DATE: 'reminder_date',
  NOTIFIED: 'notified',

  // 외부 참조
  CALENDAR_EVENT_ID: 'calendar_event_id',
  SOURCE_CONTEXT_ID: 'source_context_id',

  // 추가 정보
  NOTES: 'notes',

  // 감사 기록
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;
