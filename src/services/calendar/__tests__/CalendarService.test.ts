/**
 * Calendar Service Tests
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-006: 캘린더 서비스 (iOS EventKit, Android Calendar)
 *
 * 테스트 커버리지:
 * - 캘린더 이벤트 생성
 * - iOS EventKit 통합 (mock)
 * - Android Calendar 통합 (mock)
 * - 이벤트 수정 및 삭제
 * - 권한 관리
 * - 이벤트 동기화
 */

import { CalendarService } from '../CalendarService';
import { SocialEvent } from '@/shared/models';

// Mock react-native-calendar-events
jest.mock('react-native-calendar-events', () => ({
  authorize: jest.fn(),
  findEvents: jest.fn(),
  saveEvent: jest.fn(),
  removeEvent: jest.fn(),
  requestPermissions: jest.fn(),
}));

describe('CalendarService', () => {
  let calendarService: CalendarService;
  let mockEvent: SocialEvent;

  beforeEach(() => {
    calendarService = new CalendarService();

    mockEvent = {
      id: 'evt_test123',
      type: 'wedding',
      status: 'confirmed',
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
      contact: null,
      giftAmount: 100000,
      giftSent: false,
      giftSentDate: null,
      reminderSet: true,
      reminderDate: new Date('2025-02-13T09:00:00'),
      calendarEventId: null,
      sourceContextId: null,
      notes: '축의금 봉투 준비 필요',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('캘린더 서비스를 생성할 수 있어야 한다', () => {
      expect(calendarService).toBeDefined();
    });

    it('캘린더 권한을 요청할 수 있어야 있다', async () => {
      const RNCalendarEvents = require('react-native-calendar-events');

      RNCalendarEvents.requestPermissions.mockResolvedValue(true);

      const authorized = await calendarService.requestPermissions();

      expect(authorized).toBe(true);
      expect(RNCalendarEvents.requestPermissions).toHaveBeenCalled();
    });

    it('권한 요청이 거부되면 false를 반환해야 한다', async () => {
      const RNCalendarEvents = require('react-native-calendar-events');

      RNCalendarEvents.requestPermissions.mockResolvedValue(false);

      const authorized = await calendarService.requestPermissions();

      expect(authorized).toBe(false);
    });
  });

  describe('이벤트 생성', () => {
    it('SocialEvent를 캘린더 이벤트로 변환할 수 있어야 있다', async () => {
      const RNCalendarEvents = require('react-native-calendar-events');

      RNCalendarEvents.saveEvent.mockResolvedValue('cal_event_123');

      const calendarId = await calendarService.addEvent(mockEvent);

      expect(calendarId).toBe('cal_event_123');
      expect(RNCalendarEvents.saveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '홍길동 결혼식',
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          location: '그랜드호텔, 서울시 강남구 테헤란로 123',
          notes: expect.stringContaining('결혼식'),
        }),
        expect.any(Object)
      );
    });

    it('이벤트 제목에 경조사 유형을 포함해야 한다', async () => {
      const RNCalendarEvents = require('react-native-calendar-events');

      RNCalendarEvents.saveEvent.mockResolvedValue('cal_event_123');

      await calendarService.addEvent(mockEvent);

      const callArgs = RNCalendarEvents.saveEvent.mock.calls[0][0];

      expect(callArgs.title).toContain('결혼식');
    });

    it('이벤트 기간을 2시간으로 설정해야 한다', async () => {
      const RNCalendarEvents = require('react-native-calendar-events');

      RNCalendarEvents.saveEvent.mockResolvedValue('cal_event_123');

      await calendarService.addEvent(mockEvent);

      const callArgs = RNCalendarEvents.saveEvent.mock.calls[0][0];

      const startDate = callArgs.startDate.getTime();
      const endDate = callArgs.endDate.getTime();
      const duration = endDate - startDate;

      expect(duration).toBe(2 * 60 * 60 * 1000); // 2 hours in milliseconds
    });

    it('장례식은 1시간으로 설정해야 한다', async () => {
      const RNCalendarEvents = require('react-native-calendar-events');

      RNCalendarEvents.saveEvent.mockResolvedValue('cal_event_123');

      const funeralEvent = { ...mockEvent, type: 'funeral' as const };
      await calendarService.addEvent(funeralEvent);

      const callArgs = RNCalendarEvents.saveEvent.mock.calls[0][0];

      const startDate = callArgs.startDate.getTime();
      const endDate = callArgs.endDate.getTime();
      const duration = endDate - startDate;

      expect(duration).toBe(1 * 60 * 60 * 1000); // 1 hour
    });

    it('알림을 설정해야 한다', async () => {
      const RNCalendarEvents = require('react-native-calendar-events');

      RNCalendarEvents.saveEvent.mockResolvedValue('cal_event_123');

      await calendarService.addEvent(mockEvent);

      const callArgs = RNCalendarEvents.saveEvent.mock.calls[1]; // Second call for alarm

      expect(callArgs).toBeDefined();
      expect(RNCalendarEvents.saveEvent).toHaveBeenCalledTimes(2);
    });
  });

  describe('이벤트 수정', () => {
    it('기존 이벤트를 수정할 수 있어야 한다', async () => {
      const RNCalendarEvents = require('react-native-calendar-events');

      RNCalendarEvents.saveEvent.mockResolvedValue('cal_event_123');

      // 먼저 이벤트 생성
      await calendarService.addEvent(mockEvent);

      // 이벤트 수정
      const updatedEvent = {
        ...mockEvent,
        title: '홍길동 결혼식 (수정)',
        eventDate: new Date('2025-02-15T14:00:00'),
      };

      await calendarService.updateEvent('cal_event_123', updatedEvent);

      expect(RNCalendarEvents.saveEvent).toHaveBeenCalledTimes(2); // add + update
    });

    it('캘린더 ID를 업데이트해야 한다', async () => {
      const RNCalendarEvents = require('react-native-calendar-events');

      RNCalendarEvents.saveEvent.mockResolvedValue('cal_event_123');

      await calendarService.addEvent(mockEvent);

      // 이벤트 수정 시 calendarEventId가 업데이트되어야 함
      expect(mockEvent.calendarEventId).toBe('cal_event_123');
    });
  });

  describe('이벤트 삭제', () => {
    it('캘린더에서 이벤트를 삭제할 수 있어야 한다', async () => {
      const RNCalendarEvents = require('react-native-calendar-events');

      RNCalendarEvents.removeEvent.mockResolvedValue(true);

      await calendarService.removeEvent('cal_event_123');

      expect(RNCalendarEvents.removeEvent).toHaveBeenCalledWith('cal_event_123');
    });

    it('삭제 실패 시 false를 반환해야 한다', async () => {
      const RNCalendarEvents = require('react-native-calendar-events');

      RNCalendarEvents.removeEvent.mockResolvedValue(false);

      const result = await calendarService.removeEvent('cal_event_123');

      expect(result).toBe(false);
    });
  });

  describe('이벤트 조회', () => {
    it('날짜 범위로 이벤트를 조회할 수 있어야 한다', async () => {
      const RNCalendarEvents = require('react-native-calendar-events');

      const mockEvents = [
        {
          id: 'cal_1',
          title: '결혼식',
          startDate: new Date('2025-02-14T14:00:00').toISOString(),
          endDate: new Date('2025-02-14T16:00:00').toISOString(),
          location: '그랜드호텔',
        },
      ];

      RNCalendarEvents.findEvents.mockResolvedValue(mockEvents);

      const startDate = new Date('2025-02-01');
      const endDate = new Date('2025-02-28');

      const events = await calendarService.findEvents(startDate, endDate);

      expect(events).toHaveLength(1);
      expect(RNCalendarEvents.findEvents).toHaveBeenCalledWith(
        startDate.toISOString(),
        endDate.toISOString()
      );
    });
  });

  describe('에러 처리', () => {
    it('권한이 없을 때 에러를 처리해야 한다', async () => {
      const RNCalendarEvents = require('react-native-calendar-events');

      RNCalendarEvents.requestPermissions.mockResolvedValue(false);

      await expect(calendarService.requestPermissions()).resolves.toBe(false);
    });

    it('이벤트 생성 실패 시 에러를 처리해야 한다', async () => {
      const RNCalendarEvents = require('react-native-calendar-events');

      RNCalendarEvents.saveEvent.mockRejectedValue(new Error('Calendar error'));

      await expect(calendarService.addEvent(mockEvent)).rejects.toThrow('Calendar error');
    });
  });

  describe('이벤트 동기화', () => {
    it('SocialEvent와 캘린더 이벤트를 동기화할 수 있어야 한다', async () => {
      const RNCalendarEvents = require('react-native-calendar-events');

      RNCalendarEvents.saveEvent.mockResolvedValue('cal_event_123');

      // calendarEventId가 없는 경우에만 생성
      await calendarService.syncEvent(mockEvent);

      expect(mockEvent.calendarEventId).toBe('cal_event_123');
      expect(RNCalendarEvents.saveEvent).toHaveBeenCalled();
    });

    it('이미 동기화된 이벤트는 건너뛰어야 한다', async () => {
      const RNCalendarEvents = require('react-native-calendar-events');

      const syncedEvent = {
        ...mockEvent,
        calendarEventId: 'cal_existing_123',
      };

      await calendarService.syncEvent(syncedEvent);

      expect(RNCalendarEvents.saveEvent).not.toHaveBeenCalled();
    });
  });
});
