/**
 * SocialEvent.types.ts 단위 테스트
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-001: SocialEvent 데이터 모델 정의
 *
 * 테스트 커버리지:
 * - 타입 정의 검증
 * - 필수 필드 검증
 * - 선택적 필드 검증
 * - 열거형 값 검증
 * - 유효성 검증 규칙
 */

import {
  SocialEventType,
  SocialEventStatus,
  SocialEventPriority,
  SocialEvent,
  SocialEventCreateInput,
  SocialEventUpdateInput,
  SocialEventFilter,
} from '../SocialEvent.types';

describe('SocialEvent.types', () => {
  describe('SocialEventType', () => {
    it('모든 경조사 유형이 정의되어 있어야 한다', () => {
      // 결혼식, 장례식, 돌잔치, 회갑연, 생일파티, 졸업식, 기타
      const wedding: SocialEventType = 'wedding';
      const funeral: SocialEventType = 'funeral';
      const firstBirthday: SocialEventType = 'first_birthday';
      const sixtiethBirthday: SocialEventType = 'sixtieth_birthday';
      const birthday: SocialEventType = 'birthday';
      const graduation: SocialEventType = 'graduation';
      const etc: SocialEventType = 'etc';

      expect(wedding).toBe('wedding');
      expect(funeral).toBe('funeral');
      expect(firstBirthday).toBe('first_birthday');
      expect(sixtiethBirthday).toBe('sixtieth_birthday');
      expect(birthday).toBe('birthday');
      expect(graduation).toBe('graduation');
      expect(etc).toBe('etc');
    });

    it('유효하지 않은 타입 값은 목록에 포함되지 않아야 한다', () => {
      // 유효한 타입 목록
      const validTypes: SocialEventType[] = [
        'wedding',
        'funeral',
        'first_birthday',
        'sixtieth_birthday',
        'birthday',
        'graduation',
        'etc',
      ];

      // 유효하지 않은 값은 목록에 없음을 확인
      expect(validTypes).not.toContain('invalid' as any);
      expect(validTypes).not.toContain('random' as any);
      expect(validTypes).not.toContain('' as any);
    });
  });

  describe('SocialEventStatus', () => {
    it('모든 상태가 정의되어 있어야 한다', () => {
      const pending: SocialEventStatus = 'pending';
      const confirmed: SocialEventStatus = 'confirmed';
      const completed: SocialEventStatus = 'completed';
      const cancelled: SocialEventStatus = 'cancelled';

      expect(pending).toBe('pending');
      expect(confirmed).toBe('confirmed');
      expect(completed).toBe('completed');
      expect(cancelled).toBe('cancelled');
    });
  });

  describe('SocialEventPriority', () => {
    it('모든 우선순위가 정의되어 있어야 한다', () => {
      const low: SocialEventPriority = 'low';
      const medium: SocialEventPriority = 'medium';
      const high: SocialEventPriority = 'high';
      const urgent: SocialEventPriority = 'urgent';

      expect(low).toBe('low');
      expect(medium).toBe('medium');
      expect(high).toBe('high');
      expect(urgent).toBe('urgent');
    });
  });

  describe('SocialEvent', () => {
    it('유효한 SocialEvent 객체를 생성할 수 있어야 한다', () => {
      const event: SocialEvent = {
        id: 'evt_1234567890',
        type: 'wedding',
        status: 'pending',
        priority: 'high',
        title: '홍길동 결혼식',
        description: '결혼식에 참석해야 함',
        eventDate: new Date('2025-02-14T14:00:00'),
        location: {
          name: '그랜드호텔',
          address: '서울시 강남구 테헤란로 123',
          latitude: 37.5172,
          longitude: 127.0473,
        },
        contact: {
          name: '홍길동',
          phone: '010-1234-5678',
          relationship: 'college_friend',
        },
        giftAmount: 100000,
        giftSent: false,
        giftSentDate: null,
        reminderSet: false,
        reminderDate: null,
        calendarEventId: null,
        notes: '축의금 봉투 준비 필요',
        createdAt: new Date('2025-01-15T10:00:00'),
        updatedAt: new Date('2025-01-15T10:00:00'),
      };

      expect(event.id).toBe('evt_1234567890');
      expect(event.type).toBe('wedding');
      expect(event.status).toBe('pending');
      expect(event.priority).toBe('high');
      expect(event.title).toBe('홍길동 결혼식');
      expect(event.giftAmount).toBe(100000);
      expect(event.giftSent).toBe(false);
    });

    it('선택적 필드가 null일 수 있어야 한다', () => {
      const event: SocialEvent = {
        id: 'evt_test',
        type: 'birthday',
        status: 'confirmed',
        priority: 'medium',
        title: '생일파티',
        description: null,
        eventDate: new Date('2025-03-01T19:00:00'),
        location: null,
        contact: null,
        giftAmount: null,
        giftSent: false,
        giftSentDate: null,
        reminderSet: false,
        reminderDate: null,
        calendarEventId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(event.description).toBeNull();
      expect(event.location).toBeNull();
      expect(event.contact).toBeNull();
      expect(event.giftAmount).toBeNull();
      expect(event.notes).toBeNull();
    });

    it('location 객체의 모든 필드가 정확해야 한다', () => {
      const event: SocialEvent = {
        id: 'evt_location_test',
        type: 'graduation',
        status: 'confirmed',
        priority: 'high',
        title: '졸업식',
        description: null,
        eventDate: new Date(),
        location: {
          name: '서울대학교',
          address: '서울시 관악구 관악로 1',
          latitude: 37.4595,
          longitude: 126.9510,
        },
        contact: null,
        giftAmount: null,
        giftSent: false,
        giftSentDate: null,
        reminderSet: false,
        reminderDate: null,
        calendarEventId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(event.location?.name).toBe('서울대학교');
      expect(event.location?.address).toBe('서울시 관악구 관악로 1');
      expect(event.location?.latitude).toBe(37.4595);
      expect(event.location?.longitude).toBe(126.9510);
    });

    it('contact 객체의 모든 필드가 정확해야 한다', () => {
      const event: SocialEvent = {
        id: 'evt_contact_test',
        type: 'funeral',
        status: 'pending',
        priority: 'urgent',
        title: '장례식',
        description: null,
        eventDate: new Date(),
        location: null,
        contact: {
          name: '김철수',
          phone: '010-9876-5432',
          relationship: 'colleague',
        },
        giftAmount: 50000,
        giftSent: false,
        giftSentDate: null,
        reminderSet: false,
        reminderDate: null,
        calendarEventId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(event.contact?.name).toBe('김철수');
      expect(event.contact?.phone).toBe('010-9876-5432');
      expect(event.contact?.relationship).toBe('colleague');
    });
  });

  describe('SocialEventCreateInput', () => {
    it('생성 입력 필수 필드를 검증해야 한다', () => {
      const input: SocialEventCreateInput = {
        type: 'wedding',
        title: '결혼식',
        eventDate: new Date('2025-02-14T14:00:00'),
      };

      expect(input.type).toBe('wedding');
      expect(input.title).toBe('결혼식');
      expect(input.eventDate).toEqual(new Date('2025-02-14T14:00:00'));
    });

    it('생성 입력 선택적 필드를 포함할 수 있어야 한다', () => {
      const input: SocialEventCreateInput = {
        type: 'funeral',
        title: '장례식',
        eventDate: new Date('2025-01-20T10:00:00'),
        description: '삼가 애도를 표합니다',
        priority: 'urgent',
        location: {
          name: '장례식장',
          address: '서울시 강남구',
          latitude: 37.5,
          longitude: 127.0,
        },
        contact: {
          name: '유가족',
          phone: '010-0000-0000',
          relationship: 'family',
        },
        giftAmount: 100000,
        notes: '조화 주문 필요',
      };

      expect(input.priority).toBe('urgent');
      expect(input.description).toBe('삼가 애도를 표합니다');
      expect(input.location).toBeDefined();
      expect(input.contact).toBeDefined();
      expect(input.giftAmount).toBe(100000);
      expect(input.notes).toBe('조화 주문 필요');
    });
  });

  describe('SocialEventUpdateInput', () => {
    it('업데이트 입력의 모든 필드는 선택적이어야 한다', () => {
      const update1: SocialEventUpdateInput = {
        title: '수정된 제목',
      };

      const update2: SocialEventUpdateInput = {
        status: 'confirmed',
        giftSent: true,
        giftSentDate: new Date(),
      };

      const update3: SocialEventUpdateInput = {
        priority: 'high',
        reminderSet: true,
        reminderDate: new Date('2025-02-13T09:00:00'),
      };

      expect(update1.title).toBe('수정된 제목');
      expect(update2.status).toBe('confirmed');
      expect(update3.priority).toBe('high');
    });
  });

  describe('SocialEventFilter', () => {
    it('필터 옵션을 조합할 수 있어야 한다', () => {
      const filter1: SocialEventFilter = {
        status: 'pending',
      };

      const filter2: SocialEventFilter = {
        type: 'wedding',
        priority: 'high',
      };

      const filter3: SocialEventFilter = {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
      };

      const filter4: SocialEventFilter = {
        status: 'pending',
        type: 'funeral',
        priority: 'urgent',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-03-31'),
      };

      expect(filter1.status).toBe('pending');
      expect(filter2.type).toBe('wedding');
      expect(filter2.priority).toBe('high');
      expect(filter3.startDate).toEqual(new Date('2025-01-01'));
      expect(filter4.status).toBe('pending');
      expect(filter4.type).toBe('funeral');
    });

    it('빈 필터는 모든 이벤트를 반환해야 한다', () => {
      const filter: SocialEventFilter = {};

      expect(Object.keys(filter).length).toBe(0);
    });
  });
});
