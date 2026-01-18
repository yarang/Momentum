/**
 * SocialEvent DAO Tests
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-004: 기본 CRUD 작업 구현 (SocialEventDAO)
 *
 * 테스트 커버리지:
 * - CREATE: 이벤트 생성
 * - READ: 단일/다중 이벤트 조회, 필터링
 * - UPDATE: 이벤트 수정
 * - DELETE: 이벤트 삭제
 * - 데이터 변환: DB row ↔ Entity
 */

import { SocialEventDAO } from '../SocialEventDAO';
import { DatabaseService } from '../DatabaseService';
import {
  SocialEvent,
  SocialEventCreateInput,
  SocialEventUpdateInput,
  SocialEventFilter,
} from '@/shared/models';

// Mock DatabaseService
jest.mock('../DatabaseService');

describe('SocialEventDAO', () => {
  let dao: SocialEventDAO;
  let mockDb: jest.Mocked<DatabaseService>;

  beforeEach(() => {
    // Mock database service
    mockDb = {
      execute: jest.fn(),
      executeAsync: jest.fn(),
      initialize: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<DatabaseService>;

    dao = new SocialEventDAO(mockDb);
    jest.clearAllMocks();
  });

  describe('데이터 변환 (rowToEvent)', () => {
    it('데이터베이스 행을 SocialEvent 엔티티로 변환해야 한다', () => {
      const row = {
        id: 'evt_test123',
        type: 'wedding',
        status: 'pending',
        priority: 'high',
        title: '결혼식',
        description: '결혼식 참석',
        event_date: 1705224000000, // 2024-01-14T14:00:00
        location_name: '그랜드호텔',
        location_address: '서울시 강남구',
        location_latitude: 37.5172,
        location_longitude: 127.0473,
        contact_name: '홍길동',
        contact_phone: '010-1234-5678',
        contact_relationship: 'college_friend',
        gift_amount: 100000,
        gift_sent: 0,
        gift_sent_date: null,
        reminder_set: 0,
        reminder_date: null,
        notified: 0,
        calendar_event_id: 'cal_123',
        source_context_id: 'ctx_123',
        notes: '축의금 봉투 준비',
        created_at: 1705224000000,
        updated_at: 1705224000000,
      };

      const event = dao.rowToEvent(row);

      expect(event.id).toBe('evt_test123');
      expect(event.type).toBe('wedding');
      expect(event.status).toBe('pending');
      expect(event.priority).toBe('high');
      expect(event.title).toBe('결혼식');
      expect(event.description).toBe('결혼식 참석');
      expect(event.eventDate).toEqual(new Date(1705224000000));
      expect(event.location).toEqual({
        name: '그랜드호텔',
        address: '서울시 강남구',
        latitude: 37.5172,
        longitude: 127.0473,
      });
      expect(event.contact).toEqual({
        name: '홍길동',
        phone: '010-1234-5678',
        relationship: 'college_friend',
      });
      expect(event.giftAmount).toBe(100000);
      expect(event.giftSent).toBe(false);
      expect(event.giftSentDate).toBeNull();
      expect(event.reminderSet).toBe(false);
      expect(event.calendarEventId).toBe('cal_123');
      expect(event.notes).toBe('축의금 봉투 준비');
    });

    it('NULL 필드를 적절히 처리해야 한다', () => {
      const row = {
        id: 'evt_null',
        type: 'birthday',
        status: 'confirmed',
        priority: 'medium',
        title: '생일파티',
        description: null,
        event_date: 1705224000000,
        location_name: null,
        location_address: null,
        location_latitude: null,
        location_longitude: null,
        contact_name: null,
        contact_phone: null,
        contact_relationship: null,
        gift_amount: null,
        gift_sent: 0,
        gift_sent_date: null,
        reminder_set: 0,
        reminder_date: null,
        notified: 0,
        calendar_event_id: null,
        source_context_id: null,
        notes: null,
        created_at: 1705224000000,
        updated_at: 1705224000000,
      };

      const event = dao.rowToEvent(row);

      expect(event.description).toBeNull();
      expect(event.location).toBeNull();
      expect(event.contact).toBeNull();
      expect(event.giftAmount).toBeNull();
      expect(event.calendarEventId).toBeNull();
      expect(event.notes).toBeNull();
    });

    it('BOOLEAN 필드를 INTEGER에서 변환해야 한다', () => {
      const row = {
        id: 'evt_bool',
        type: 'wedding',
        status: 'pending',
        priority: 'medium',
        title: '테스트',
        description: null,
        event_date: 1705224000000,
        location_name: null,
        location_address: null,
        location_latitude: null,
        location_longitude: null,
        contact_name: null,
        contact_phone: null,
        contact_relationship: null,
        gift_amount: null,
        gift_sent: 1, // true
        gift_sent_date: 1705310400000,
        reminder_set: 1, // true
        reminder_date: 1705137600000,
        notified: 1, // true
        calendar_event_id: null,
        source_context_id: null,
        notes: null,
        created_at: 1705224000000,
        updated_at: 1705224000000,
      };

      const event = dao.rowToEvent(row);

      expect(event.giftSent).toBe(true);
      expect(event.reminderSet).toBe(true);
      expect(event.notified).toBe(true);
    });
  });

  describe('CREATE (insert)', () => {
    it('새로운 이벤트를 생성할 수 있어야 한다', async () => {
      const event: SocialEvent = {
        id: 'evt_new',
        type: 'wedding',
        status: 'pending',
        priority: 'high',
        title: '새 결혼식',
        description: '참석해야 함',
        eventDate: new Date('2025-02-14T14:00:00'),
        location: {
          name: '웨딩홀',
          address: '서울시',
          latitude: 37.5,
          longitude: 127.0,
        },
        contact: {
          name: '신랑',
          phone: '010-0000-0000',
          relationship: 'friend',
        },
        giftAmount: 100000,
        giftSent: false,
        giftSentDate: null,
        reminderSet: false,
        reminderDate: null,
        calendarEventId: null,
        sourceContextId: null,
        notes: '축의금 준비',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.executeAsync = jest.fn().mockResolvedValue(undefined);

      await dao.insert(event);

      expect(mockDb.executeAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO social_events'),
        expect.arrayContaining([
          'evt_new',
          'wedding',
          'pending',
          'high',
          '새 결혼식',
          expect.any(Number), // eventDate timestamp
          '웨딩홀',
          '서울시',
          37.5,
          127.0,
          '신랑',
          '010-0000-0000',
          'friend',
          100000,
          0, // giftSent as integer
          0, // reminderSet as integer
          '축의금 준비',
          expect.any(Number), // createdAt timestamp
          expect.any(Number), // updatedAt timestamp
        ])
      );
    });

    it('최소 필드만으로 이벤트를 생성할 수 있어야 한다', async () => {
      const minimalEvent: SocialEvent = {
        id: 'evt_minimal',
        type: 'birthday',
        status: 'pending',
        priority: 'medium',
        title: '생일',
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
        sourceContextId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.executeAsync = jest.fn().mockResolvedValue(undefined);

      await dao.insert(minimalEvent);

      expect(mockDb.executeAsync).toHaveBeenCalled();
    });
  });

  describe('READ (findById, findAll)', () => {
    it('ID로 이벤트를 조회할 수 있어야 한다', async () => {
      const mockRow = {
        id: 'evt_123',
        type: 'wedding',
        status: 'pending',
        priority: 'high',
        title: '결혼식',
        description: null,
        event_date: 1705224000000,
        location_name: null,
        location_address: null,
        location_latitude: null,
        location_longitude: null,
        contact_name: null,
        contact_phone: null,
        contact_relationship: null,
        gift_amount: null,
        gift_sent: 0,
        gift_sent_date: null,
        reminder_set: 0,
        reminder_date: null,
        notified: 0,
        calendar_event_id: null,
        source_context_id: null,
        notes: null,
        created_at: 1705224000000,
        updated_at: 1705224000000,
      };

      mockDb.executeAsync = jest.fn().mockResolvedValue({
        rows: {
          length: 1,
          item: (i: number) => mockRow,
          raw: () => [mockRow],
        },
      });

      const event = await dao.findById('evt_123');

      expect(event).toBeDefined();
      expect(event?.id).toBe('evt_123');
      expect(event?.type).toBe('wedding');
      expect(mockDb.executeAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM social_events WHERE id = ?'),
        ['evt_123']
      );
    });

    it('존재하지 않는 ID로 조회 시 null을 반환해야 한다', async () => {
      mockDb.executeAsync = jest.fn().mockResolvedValue({
        rows: {
          length: 0,
          item: () => null,
          raw: () => [],
        },
      });

      const event = await dao.findById('nonexistent');

      expect(event).toBeNull();
    });

    it('모든 이벤트를 조회할 수 있어야 한다', async () => {
      const mockRows = [
        {
          id: 'evt_1',
          type: 'wedding',
          status: 'pending',
          priority: 'high',
          title: '결혼식 1',
          description: null,
          event_date: 1705224000000,
          location_name: null,
          location_address: null,
          location_latitude: null,
          location_longitude: null,
          contact_name: null,
          contact_phone: null,
          contact_relationship: null,
          gift_amount: null,
          gift_sent: 0,
          gift_sent_date: null,
          reminder_set: 0,
          reminder_date: null,
          notified: 0,
          calendar_event_id: null,
          source_context_id: null,
          notes: null,
          created_at: 1705224000000,
          updated_at: 1705224000000,
        },
        {
          id: 'evt_2',
          type: 'funeral',
          status: 'pending',
          priority: 'urgent',
          title: '장례식',
          description: null,
          event_date: 1705224000000,
          location_name: null,
          location_address: null,
          location_latitude: null,
          location_longitude: null,
          contact_name: null,
          contact_phone: null,
          contact_relationship: null,
          gift_amount: null,
          gift_sent: 0,
          gift_sent_date: null,
          reminder_set: 0,
          reminder_date: null,
          notified: 0,
          calendar_event_id: null,
          source_context_id: null,
          notes: null,
          created_at: 1705224000000,
          updated_at: 1705224000000,
        },
      ];

      mockDb.executeAsync = jest.fn().mockResolvedValue({
        rows: {
          length: 2,
          item: (i: number) => mockRows[i],
          raw: () => mockRows,
        },
      });

      const events = await dao.findAll();

      expect(events).toHaveLength(2);
      expect(events[0].id).toBe('evt_1');
      expect(events[1].id).toBe('evt_2');
    });

    it('필터링 조건으로 이벤트를 조회할 수 있어야 한다', async () => {
      const filter: SocialEventFilter = {
        status: 'pending',
        type: 'wedding',
      };

      mockDb.executeAsync = jest.fn().mockResolvedValue({
        rows: {
          length: 1,
          item: (i: number) => ({
            id: 'evt_filtered',
            type: 'wedding',
            status: 'pending',
            priority: 'high',
            title: '결혼식',
            description: null,
            event_date: 1705224000000,
            location_name: null,
            location_address: null,
            location_latitude: null,
            location_longitude: null,
            contact_name: null,
            contact_phone: null,
            contact_relationship: null,
            gift_amount: null,
            gift_sent: 0,
            gift_sent_date: null,
            reminder_set: 0,
            reminder_date: null,
            notified: 0,
            calendar_event_id: null,
            source_context_id: null,
            notes: null,
            created_at: 1705224000000,
            updated_at: 1705224000000,
          }),
          raw: () => [],
        },
      });

      const events = await dao.findAll(filter);

      expect(events).toHaveLength(1);
      expect(mockDb.executeAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining(['pending', 'wedding'])
      );
    });
  });

  describe('UPDATE', () => {
    it('이벤트를 수정할 수 있어야 한다', async () => {
      const updateData: SocialEventUpdateInput = {
        title: '수정된 제목',
        status: 'confirmed',
        priority: 'urgent',
      };

      mockDb.executeAsync = jest.fn().mockResolvedValue({
        rowsAffected: 1,
      });

      await dao.update('evt_123', updateData);

      expect(mockDb.executeAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE social_events SET'),
        expect.arrayContaining([
          '수정된 제목',
          'confirmed',
          'urgent',
          'evt_123', // WHERE id = ?
        ])
      );
    });

    it('updatedAt 필드를 자동으로 업데이트해야 한다', async () => {
      mockDb.executeAsync = jest.fn().mockResolvedValue({
        rowsAffected: 1,
      });

      await dao.update('evt_123', { title: '수정' });

      expect(mockDb.executeAsync).toHaveBeenCalledWith(
        expect.stringContaining('updated_at = ?'),
        expect.any(Array)
      );
    });
  });

  describe('DELETE', () => {
    it('이벤트를 삭제할 수 있어야 한다', async () => {
      mockDb.executeAsync = jest.fn().mockResolvedValue({
        rowsAffected: 1,
      });

      await dao.delete('evt_123');

      expect(mockDb.executeAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM social_events WHERE id = ?'),
        ['evt_123']
      );
    });
  });

  describe('COUNT', () => {
    it('전체 이벤트 수를 조회할 수 있어야 한다', async () => {
      mockDb.executeAsync = jest.fn().mockResolvedValue({
        rows: {
          item: (i: number) => ({ count: 10 }),
          length: 1,
        },
      });

      const count = await dao.count();

      expect(count).toBe(10);
      expect(mockDb.executeAsync).toHaveBeenCalled();
      expect(mockDb.executeAsync).toHaveBeenCalledTimes(1);

      // SQL 확인
      const calls = (mockDb.executeAsync as jest.Mock).mock.calls;
      expect(calls[0][0]).toContain('SELECT COUNT(*) as count FROM social_events');
    });

    it('필터링된 이벤트 수를 조회할 수 있어야 한다', async () => {
      mockDb.executeAsync = jest.fn().mockResolvedValue({
        rows: {
          item: (i: number) => ({ count: 5 }),
          length: 1,
        },
      });

      const count = await dao.count({ status: 'pending' });

      expect(count).toBe(5);
    });
  });
});
