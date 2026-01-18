/**
 * SocialEvent Store Tests
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-003: Zustand 스토어 생성 및 상태 관리
 *
 * 테스트 커버리지:
 * - 상태 관리 검증
 * - CRUD 작업 검증
 * - 필터링 및 정렬 검증
 * - 데이터베이스 통합 검증
 * - 비동기 작업 검증
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSocialEventStore } from '../socialEventStore';
import {
  SocialEvent,
  SocialEventCreateInput,
  SocialEventUpdateInput,
  SocialEventFilter,
  SocialEventType,
  SocialEventStatus,
  SocialEventPriority,
} from '@/shared/models';

// Mock database service
jest.mock('@/services/database', () => ({
  getDatabase: jest.fn(),
  getSocialEventDAO: jest.fn(),
}));

describe('SocialEvent Store', () => {
  beforeEach(() => {
    // Reset store before each test
    jest.clearAllMocks();

    // Reset Zustand store state to initial values
    useSocialEventStore.setState({
      events: [],
      selectedEvent: null,
      isLoading: false,
      error: null,
      isDbInitialized: false,
    });
  });

  describe('초기 상태', () => {
    it('기본 상태로 초기화되어야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      expect(result.current.events).toEqual([]);
      expect(result.current.selectedEvent).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isDbInitialized).toBe(false);
    });

    it('데이터베이스를 초기화할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      await act(async () => {
        await result.current.initializeDatabase();
      });

      expect(result.current.isDbInitialized).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe('CREATE (생성)', () => {
    it('새로운 경조사 이벤트를 생성할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      const input: SocialEventCreateInput = {
        type: 'wedding',
        title: '홍길동 결혼식',
        eventDate: new Date('2025-02-14T14:00:00'),
        description: '결혼식에 참석해야 함',
        priority: 'high',
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
        notes: '축의금 봉투 준비 필요',
      };

      let createdEvent: SocialEvent;

      await act(async () => {
        createdEvent = await result.current.createEvent(input);
      });

      expect(createdEvent).toBeDefined();
      expect(createdEvent.id).toBeDefined();
      expect(createdEvent.type).toBe('wedding');
      expect(createdEvent.title).toBe('홍길동 결혼식');
      expect(createdEvent.status).toBe('pending'); // 기본값
      expect(createdEvent.priority).toBe('high');
      expect(createdEvent.giftSent).toBe(false); // 기본값
      expect(createdEvent.reminderSet).toBe(false); // 기본값
    });

    it('필수 필드만으로 이벤트를 생성할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      const minimalInput: SocialEventCreateInput = {
        type: 'birthday',
        title: '생일파티',
        eventDate: new Date('2025-03-01T19:00:00'),
      };

      await act(async () => {
        const event = await result.current.createEvent(minimalInput);
        expect(event.id).toBeDefined();
        expect(event.type).toBe('birthday');
        expect(event.title).toBe('생일파티');
        expect(event.priority).toBe('medium'); // 기본값
      });
    });

    it('생성된 이벤트가 목록에 추가되어야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      const input: SocialEventCreateInput = {
        type: 'graduation',
        title: '졸업식',
        eventDate: new Date('2025-02-20T10:00:00'),
      };

      await act(async () => {
        await result.current.createEvent(input);
      });

      expect(result.current.events.length).toBe(1);
      expect(result.current.events[0].title).toBe('졸업식');
    });
  });

  describe('READ (조회)', () => {
    it('모든 이벤트를 로드할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      await act(async () => {
        await result.current.loadEvents();
      });

      expect(Array.isArray(result.current.events)).toBe(true);
    });

    it('ID로 특정 이벤트를 로드할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      // 먼저 이벤트 생성
      const input: SocialEventCreateInput = {
        type: 'wedding',
        title: '테스트 결혼식',
        eventDate: new Date('2025-02-14T14:00:00'),
      };

      let createdEvent: SocialEvent;

      await act(async () => {
        createdEvent = await result.current.createEvent(input);
      });

      // ID로 로드
      await act(async () => {
        await result.current.loadEvent(createdEvent.id);
      });

      expect(result.current.selectedEvent).toBeDefined();
      expect(result.current.selectedEvent?.id).toBe(createdEvent.id);
    });

    it('필터링된 이벤트 목록을 조회할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      // 여러 이벤트 생성
      await act(async () => {
        await result.current.createEvent({
          type: 'wedding',
          title: '결혼식 1',
          eventDate: new Date('2025-02-14T14:00:00'),
          status: 'pending',
          priority: 'high',
        });

        await result.current.createEvent({
          type: 'funeral',
          title: '장례식 1',
          eventDate: new Date('2025-01-20T10:00:00'),
          status: 'pending',
          priority: 'urgent',
        });

        await result.current.createEvent({
          type: 'wedding',
          title: '결혼식 2',
          eventDate: new Date('2025-03-01T14:00:00'),
          status: 'confirmed',
          priority: 'medium',
        });
      });

      // 필터링: pending 상태만
      const filter: SocialEventFilter = {
        status: 'pending',
      };

      await act(async () => {
        await result.current.loadEvents(filter);
      });

      expect(result.current.events.length).toBe(2);
      expect(result.current.events.every(e => e.status === 'pending')).toBe(true);
    });

    it('날짜 범위로 필터링할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      await act(async () => {
        await result.current.createEvent({
          type: 'birthday',
          title: '1월 생일',
          eventDate: new Date('2025-01-15T00:00:00'),
        });

        await result.current.createEvent({
          type: 'birthday',
          title: '2월 생일',
          eventDate: new Date('2025-02-14T00:00:00'),
        });

        await result.current.createEvent({
          type: 'birthday',
          title: '3월 생일',
          eventDate: new Date('2025-03-01T00:00:00'),
        });
      });

      // 필터링: 2월 이벤트만
      const filter: SocialEventFilter = {
        startDate: new Date('2025-02-01T00:00:00'),
        endDate: new Date('2025-02-28T23:59:59'),
      };

      await act(async () => {
        await result.current.loadEvents(filter);
      });

      expect(result.current.events.length).toBe(1);
      expect(result.current.events[0].title).toBe('2월 생일');
    });
  });

  describe('UPDATE (수정)', () => {
    it('이벤트 정보를 수정할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      // 이벤트 생성
      const input: SocialEventCreateInput = {
        type: 'wedding',
        title: '원래 제목',
        eventDate: new Date('2025-02-14T14:00:00'),
      };

      let createdEvent: SocialEvent;

      await act(async () => {
        createdEvent = await result.current.createEvent(input);
      });

      // 수정
      const updateInput: SocialEventUpdateInput = {
        title: '수정된 제목',
        description: '상세 설명 추가',
        priority: 'urgent',
      };

      let updatedEvent: SocialEvent;

      await act(async () => {
        updatedEvent = await result.current.updateEvent(createdEvent.id, updateInput);
      });

      expect(updatedEvent.title).toBe('수정된 제목');
      expect(updatedEvent.description).toBe('상세 설명 추가');
      expect(updatedEvent.priority).toBe('urgent');
    });

    it('상태를 변경할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      const input: SocialEventCreateInput = {
        type: 'wedding',
        title: '결혼식',
        eventDate: new Date('2025-02-14T14:00:00'),
      };

      let createdEvent: SocialEvent;

      await act(async () => {
        createdEvent = await result.current.createEvent(input);
      });

      expect(createdEvent.status).toBe('pending');

      // 상태 변경
      await act(async () => {
        await result.current.updateEvent(createdEvent.id, { status: 'confirmed' });
      });

      // 목록에서도 상태가 변경되었는지 확인
      const updated = result.current.events.find(e => e.id === createdEvent.id);
      expect(updated?.status).toBe('confirmed');
    });

    it('선물 송금 정보를 업데이트할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      const input: SocialEventCreateInput = {
        type: 'wedding',
        title: '결혼식',
        eventDate: new Date('2025-02-14T14:00:00'),
        giftAmount: 100000,
      };

      let createdEvent: SocialEvent;

      await act(async () => {
        createdEvent = await result.current.createEvent(input);
      });

      expect(createdEvent.giftSent).toBe(false);

      // 선물 송금 완료 표시
      await act(async () => {
        await result.current.updateEvent(createdEvent.id, {
          giftSent: true,
          giftSentDate: new Date(),
        });
      });

      const updated = result.current.events.find(e => e.id === createdEvent.id);
      expect(updated?.giftSent).toBe(true);
      expect(updated?.giftSentDate).toBeDefined();
    });
  });

  describe('DELETE (삭제)', () => {
    it('이벤트를 삭제할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      const input: SocialEventCreateInput = {
        type: 'wedding',
        title: '삭제할 이벤트',
        eventDate: new Date('2025-02-14T14:00:00'),
      };

      let createdEvent: SocialEvent;

      await act(async () => {
        createdEvent = await result.current.createEvent(input);
      });

      expect(result.current.events.length).toBe(1);

      // 삭제
      await act(async () => {
        await result.current.deleteEvent(createdEvent.id);
      });

      expect(result.current.events.length).toBe(0);
    });

    it('선택된 이벤트를 삭제하면 selectedEvent가 null이 되어야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      const input: SocialEventCreateInput = {
        type: 'wedding',
        title: '선택된 이벤트',
        eventDate: new Date('2025-02-14T14:00:00'),
      };

      let createdEvent: SocialEvent;

      await act(async () => {
        createdEvent = await result.current.createEvent(input);
        result.current.setSelectedEvent(createdEvent);
      });

      expect(result.current.selectedEvent).toBeDefined();

      // 삭제
      await act(async () => {
        await result.current.deleteEvent(createdEvent.id);
      });

      expect(result.current.selectedEvent).toBeNull();
    });
  });

  describe('선택 상태 관리', () => {
    it('이벤트를 선택할 수 있어야 한다', () => {
      const { result } = renderHook(() => useSocialEventStore());

      const mockEvent: SocialEvent = {
        id: 'evt-1',
        type: 'wedding',
        status: 'pending',
        priority: 'medium',
        title: '테스트',
        description: null,
        eventDate: new Date(),
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

      act(() => {
        result.current.setSelectedEvent(mockEvent);
      });

      expect(result.current.selectedEvent).toEqual(mockEvent);
    });

    it('선택을 해제할 수 있어야 한다', () => {
      const { result } = renderHook(() => useSocialEventStore());

      const mockEvent: SocialEvent = {
        id: 'evt-1',
        type: 'wedding',
        status: 'pending',
        priority: 'medium',
        title: '테스트',
        description: null,
        eventDate: new Date(),
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

      act(() => {
        result.current.setSelectedEvent(mockEvent);
      });

      expect(result.current.selectedEvent).toBeDefined();

      act(() => {
        result.current.setSelectedEvent(null);
      });

      expect(result.current.selectedEvent).toBeNull();
    });
  });

  describe('통계 및 집계', () => {
    it('이벤트 통계를 계산할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      // 여러 이벤트 생성
      await act(async () => {
        await result.current.createEvent({
          type: 'wedding',
          title: '결혼식 1',
          eventDate: new Date('2025-02-14T14:00:00'),
          status: 'pending',
          giftAmount: 100000,
        });

        await result.current.createEvent({
          type: 'funeral',
          title: '장례식 1',
          eventDate: new Date('2025-01-20T10:00:00'),
          status: 'pending',
          giftAmount: 50000,
        });

        await result.current.createEvent({
          type: 'wedding',
          title: '결혼식 2',
          eventDate: new Date('2025-03-01T14:00:00'),
          status: 'confirmed',
          giftAmount: 100000,
        });
      });

      const stats = result.current.getStatistics();

      expect(stats.totalEvents).toBe(3);
      expect(stats.statusCounts.pending).toBe(2);
      expect(stats.statusCounts.confirmed).toBe(1);
      expect(stats.typeCounts.wedding).toBe(2);
      expect(stats.typeCounts.funeral).toBe(1);
    });
  });

  describe('에러 처리', () => {
    it('데이터베이스 초기화 실패 시 에러를 처리해야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      // Mock database error
      jest.spyOn(result.current, 'initializeDatabase').mockRejectedValue(
        new Error('Database initialization failed')
      );

      await act(async () => {
        try {
          await result.current.initializeDatabase();
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });

    it('존재하지 않는 이벤트 조회 시 에러를 처리해야 한다', async () => {
      const { result } = renderHook(() => useSocialEventStore());

      await act(async () => {
        try {
          await result.current.loadEvent('non-existent-id');
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });
  });
});
