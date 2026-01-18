/**
 * Notification Service Tests
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-008: 알림 서비스 구현
 */

import { NotificationService } from '../NotificationService';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  describe('알림 스케줄링', () => {
    it('D-7 알림을 생성할 수 있어야 한다', () => {
      const eventDate = new Date('2025-02-14T14:00:00');
      const reminderDate = service.createReminderDate(eventDate, -7);

      expect(reminderDate).toEqual(new Date('2025-02-07T14:00:00'));
    });

    it('D-1 알림을 생성할 수 있어야 한다', () => {
      const eventDate = new Date('2025-02-14T14:00:00');
      const reminderDate = service.createReminderDate(eventDate, -1);

      expect(reminderDate).toEqual(new Date('2025-02-13T14:00:00'));
    });

    it('당일 오전 9시 알림을 생성할 수 있어야 한다', () => {
      const eventDate = new Date('2025-02-14T14:00:00');
      const reminderDate = service.createSameDayReminder(eventDate);

      expect(reminderDate.getHours()).toBe(9);
      expect(reminderDate.getDate()).toBe(14);
    });
  });

  describe('알림 권장시간', () => {
    it('장례식은 저녁 9시부터 아침 8시까지 알림을 제한해야 한다', () => {
      const eventDate = new Date('2025-01-20T10:00:00'); // 장례식
      const allowed = service.isNotificationAllowed(eventDate, new Date('2025-01-19T22:00:00'));

      expect(allowed).toBe(false); // 저녁 10시는 허용
    });
  });
});
