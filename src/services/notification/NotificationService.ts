/**
 * Notification Service
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-008: 알림 서비스 구현
 *
 * 경조사 이벤트 알림 스케줄링 서비스입니다.
 */

export interface ReminderOptions {
  /** 이벤트 날짜 */
  eventDate: Date;
  /** 며칠 일수 (음수) */
  daysBefore?: number;
  /** 시간 (시) */
  hour?: number;
}

/**
 * Notification Service
 */
export class NotificationService {
  /**
   * 며칠 일수 알림 날짜를 생성합니다.
   *
   * @param eventDate - 이벤트 날짜
   * @param daysBefore - 며칠 일수
   * @returns 알림 날짜
   */
  createReminderDate(eventDate: Date, daysBefore: number): Date {
    const reminderDate = new Date(eventDate);
    reminderDate.setDate(reminderDate.getDate() + daysBefore);
    return reminderDate;
  }

  /**
   * 당일 오전 9시 알림을 생성합니다.
   *
   * @param eventDate - 이벤트 날짜
   * @returns 알림 날짜
   */
  createSameDayReminder(eventDate: Date): Date {
    const reminderDate = new Date(eventDate);
    reminderDate.setHours(9, 0, 0, 0);
    return reminderDate;
  }

  /**
   * 알림이 허용되는 시간대인지 확인합니다.
   *
   * @param eventDate - 이벤트 날짜
   * @param scheduledTime - 예정 알림 시간
   * @returns 허용 여부
   */
  isNotificationAllowed(eventDate: Date, scheduledTime: Date): boolean {
    const hour = scheduledTime.getHours();

    // 장례식: 저녁 9시 ~ 아침 8시 제한
    const isFuneral = hour >= 21 || hour < 8;

    return !isFuneral;
  }

  /**
   * D-7, D-1, 당일 알림 일정을 생성합니다.
   *
   * @param eventDate - 이벤트 날짜
   * @returns 알림 일정
   */
  createReminderSchedule(eventDate: Date): Date[] {
    const reminders: Date[] = [];

    // D-7 알림
    reminders.push(this.createReminderDate(eventDate, -7));

    // D-1 알림
    reminders.push(this.createReminderDate(eventDate, -1));

    // 당일 오전 9시
    reminders.push(this.createSameDayReminder(eventDate));

    return reminders;
  }
}
