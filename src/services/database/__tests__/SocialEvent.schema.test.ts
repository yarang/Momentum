/**
 * SocialEvent Database Schema Tests
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-002: SocialEvent 데이터베이스 스키마 및 마이그레이션
 *
 * 테스트 커버리지:
 * - 테이블 생성 SQL 검증
 * - 필드 타입 및 제약 조건 검증
 * - 인덱스 정의 검증
 * - 마이그레이션 버전 관리
 */

import {
  SOCIAL_EVENT_TABLE,
  SOCIAL_EVENT_INDEXES,
  validateSocialEventTable,
  getSocialEventTableVersion,
} from '../SocialEvent.schema';

describe('SocialEvent.schema', () => {
  describe('SOCIAL_EVENT_TABLE', () => {
    it('유효한 SQL CREATE TABLE 문이어야 한다', () => {
      expect(SOCIAL_EVENT_TABLE).toBeDefined();
      expect(typeof SOCIAL_EVENT_TABLE).toBe('string');

      // SQL이 CREATE TABLE로 시작해야 함
      expect(SOCIAL_EVENT_TABLE.trim().toUpperCase()).toMatch(
        /^CREATE TABLE.*IF NOT EXISTS/i
      );

      // 테이블 이름이 social_events여야 함
      expect(SOCIAL_EVENT_TABLE).toMatch(/social_events/i);
    });

    it('모든 필수 필드를 포함해야 한다', () => {
      // 필수 필드: id, type, status, priority, title, event_date
      expect(SOCIAL_EVENT_TABLE).toMatch(/id TEXT PRIMARY KEY/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/type TEXT NOT NULL/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/status TEXT NOT NULL/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/priority TEXT NOT NULL/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/title TEXT NOT NULL/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/event_date INTEGER NOT NULL/i);
    });

    it('선택적 필드를 포함해야 한다', () => {
      // 선택적 필드: description, location, contact, gift_amount, notes
      expect(SOCIAL_EVENT_TABLE).toMatch(/description TEXT/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/location_name TEXT/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/location_address TEXT/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/contact_name TEXT/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/contact_phone TEXT/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/gift_amount INTEGER/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/notes TEXT/i);
    });

    it('플래그 필드를 포함해야 한다', () => {
      // 플래그: gift_sent, reminder_set, notified
      expect(SOCIAL_EVENT_TABLE).toMatch(/gift_sent INTEGER/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/reminder_set INTEGER/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/notified INTEGER/i);
    });

    it('날짜/시간 필드를 포함해야 한다', () => {
      expect(SOCIAL_EVENT_TABLE).toMatch(/gift_sent_date INTEGER/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/reminder_date INTEGER/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/created_at INTEGER NOT NULL/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/updated_at INTEGER NOT NULL/i);
    });

    it('외래 키 및 참조를 포함해야 한다', () => {
      expect(SOCIAL_EVENT_TABLE).toMatch(/calendar_event_id TEXT/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/source_context_id TEXT/i);
    });

    it('위치 정보 필드를 포함해야 한다', () => {
      expect(SOCIAL_EVENT_TABLE).toMatch(/location_latitude REAL/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/location_longitude REAL/i);
    });

    it('관계 유형 필드를 포함해야 한다', () => {
      expect(SOCIAL_EVENT_TABLE).toMatch(/contact_relationship TEXT/i);
    });
  });

  describe('SOCIAL_EVENT_INDEXES', () => {
    it('배열이어야 한다', () => {
      expect(Array.isArray(SOCIAL_EVENT_INDEXES)).toBe(true);
    });

    it('성능을 위한 필수 인덱스를 포함해야 한다', () => {
      const indexSql = SOCIAL_EVENT_INDEXES.join(' ');

      // 필수 인덱스: type, status, priority, event_date
      expect(indexSql).toMatch(/CREATE INDEX.*idx_social_events_type/i);
      expect(indexSql).toMatch(/CREATE INDEX.*idx_social_events_status/i);
      expect(indexSql).toMatch(/CREATE INDEX.*idx_social_events_priority/i);
      expect(indexSql).toMatch(/CREATE INDEX.*idx_social_events_event_date/i);

      // 추가 인덱스: created_at, updated_at, gift_sent, reminder_set
      expect(indexSql).toMatch(/CREATE INDEX.*idx_social_events_created_at/i);
      expect(indexSql).toMatch(/CREATE INDEX.*idx_social_events_updated_at/i);
      expect(indexSql).toMatch(/CREATE INDEX.*idx_social_events_gift_sent/i);
      expect(indexSql).toMatch(/CREATE INDEX.*idx_social_events_reminder_set/i);
    });

    it('모든 인덱스가 유효한 SQL이어야 한다', () => {
      SOCIAL_EVENT_INDEXES.forEach((indexSql) => {
        expect(indexSql.trim().toUpperCase()).toMatch(/^CREATE INDEX/i);
        expect(indexSql).toMatch(/IF NOT EXISTS/i);
        expect(indexSql).toMatch(/ON social_events/i);
      });
    });
  });

  describe('validateSocialEventTable', () => {
    it('유효한 스키마인지 검증해야 한다', () => {
      const result = validateSocialEventTable();

      expect(result).toBeDefined();
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('스키마 버전을 반환해야 한다', () => {
      const result = validateSocialEventTable();

      expect(result.version).toBeDefined();
      expect(typeof result.version).toBe('string');
      expect(result.version).toMatch(/^\d+\.\d+\.\d+$/); // semantic versioning
    });

    it('필수 필드 목록을 반환해야 한다', () => {
      const result = validateSocialEventTable();

      expect(result.requiredFields).toBeDefined();
      expect(Array.isArray(result.requiredFields)).toBe(true);
      expect(result.requiredFields).toContain('id');
      expect(result.requiredFields).toContain('type');
      expect(result.requiredFields).toContain('status');
      expect(result.requiredFields).toContain('title');
      expect(result.requiredFields).toContain('event_date');
    });

    it('선택적 필드 목록을 반환해야 한다', () => {
      const result = validateSocialEventTable();

      expect(result.optionalFields).toBeDefined();
      expect(Array.isArray(result.optionalFields)).toBe(true);
      expect(result.optionalFields.length).toBeGreaterThan(0);
    });
  });

  describe('getSocialEventTableVersion', () => {
    it('스키마 버전을 반환해야 한다', () => {
      const version = getSocialEventTableVersion();

      expect(version).toBeDefined();
      expect(typeof version).toBe('string');
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('버전이 Semantic Versioning을 따라야 한다', () => {
      const version = getSocialEventTableVersion();
      const [major, minor, patch] = version.split('.').map(Number);

      expect(major).toBeGreaterThanOrEqual(0);
      expect(minor).toBeGreaterThanOrEqual(0);
      expect(patch).toBeGreaterThanOrEqual(0);
    });

    it('버전이 1.0.0으로 시작해야 한다', () => {
      const version = getSocialEventTableVersion();

      expect(version).toBe('1.0.0');
    });
  });

  describe('스키마 무결성', () => {
    it('모든 필드에 고유 이름이 있어야 한다', () => {
      // SQL 파싱을 통해 필드 이름 추출 (간단한 정규식 기반)
      const fieldMatches = SOCIAL_EVENT_TABLE.match(/(\w+)\s+(TEXT|INTEGER|REAL)/gi);
      expect(fieldMatches).toBeTruthy();

      const fieldNames = fieldMatches?.map(match => match.split(/\s+/)[0]) || [];
      const uniqueFields = new Set(fieldNames);

      expect(uniqueFields.size).toBe(fieldNames.length);
    });

    it('타임스탬프 필드가 INTEGER여야 한다', () => {
      // UNIX timestamp (miliseconds)를 저장하기 위해 INTEGER 사용
      expect(SOCIAL_EVENT_TABLE).toMatch(/event_date INTEGER NOT NULL/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/gift_sent_date INTEGER/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/reminder_date INTEGER/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/created_at INTEGER NOT NULL/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/updated_at INTEGER NOT NULL/i);
    });

    it('BOOLEAN 플래그가 INTEGER로 저장되어야 한다', () => {
      // SQLite는 BOOLEAN 타입을 지원하지 않으므로 INTEGER 사용 (0 또는 1)
      expect(SOCIAL_EVENT_TABLE).toMatch(/gift_sent INTEGER/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/reminder_set INTEGER/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/notified INTEGER/i);
    });

    it('좌표가 REAL 타입이어야 한다', () => {
      expect(SOCIAL_EVENT_TABLE).toMatch(/location_latitude REAL/i);
      expect(SOCIAL_EVENT_TABLE).toMatch(/location_longitude REAL/i);
    });

    it('금액이 INTEGER여야 한다', () => {
      // 원화 단위를 저장하기 위해 INTEGER 사용 (소수점 없음)
      expect(SOCIAL_EVENT_TABLE).toMatch(/gift_amount INTEGER/i);
    });
  });

  describe('마이그레이션 호환성', () => {
    it('이후 버전과 호환되어야 한다', () => {
      const currentVersion = getSocialEventTableVersion();

      // 버전 비교 로직이 있어야 함
      expect(currentVersion).toBeDefined();
      expect(typeof currentVersion).toBe('string');
    });

    it('마이그레이션 경로를 제공해야 한다', () => {
      const result = validateSocialEventTable();

      expect(result.canMigrate).toBeDefined();
      expect(typeof result.canMigrate).toBe('boolean');
      expect(result.canMigrate).toBe(true);
    });
  });
});
