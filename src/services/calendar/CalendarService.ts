/**
 * Calendar Service
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-006: 캘린더 서비스 (iOS EventKit, Android Calendar)
 *
 * 경조사 이벤트를 기기 캘린더에 동기화하는 서비스입니다.
 * iOS와 Android에서 각각 EventKit과 Calendar API를 사용합니다.
 *
 * @remarks
 * react-native-calendar-events 라이브러리를 사용하여
 * 플랫폼 독립적인 캘린더 연동을 구현합니다.
 */

import { SocialEvent, SocialEventType } from '@/shared/models';
import * as RNCalendarEvents from 'react-native-calendar-events';

/**
 * Calendar Event Configuration
 */
interface CalendarConfig {
  /** 이벤트 제목 */
  title: string;
  /** 시작일시 */
  startDate: Date;
  /** 종료일시 */
  endDate: Date;
  /** 장소 */
  location?: string;
  /** 설명 */
  notes?: string;
  /** 알림 설정 */
  alarms?: Array<{ date: Date }>;
}

/**
 * Calendar Service
 */
export class CalendarService {
  /**
   * 캘린더 권한을 요청합니다.
   *
   * @returns 권한 부 여부
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const authorized = await RNCalendarEvents.requestPermissions();
      return authorized;
    } catch (error) {
      console.error('Calendar permission request failed:', error);
      return false;
    }
  }

  /**
   * SocialEvent를 캘린더에 추가합니다.
   *
   * @param event - 추가할 경조사 이벤트
   * @returns 캘린더 이벤트 ID
   */
  async addEvent(event: SocialEvent): Promise<string | null> {
    try {
      const config = this.createCalendarConfig(event);

      // 이벤트 저장
      const calendarId = await RNCalendarEvents.saveEvent(config);

      // 알림 설정 (있는 경우)
      if (event.reminderSet && event.reminderDate) {
        const alarmConfig: CalendarConfig = {
          title: event.title,
          startDate: event.reminderDate,
          endDate: new Date(event.reminderDate.getTime() + 30 * 60 * 1000), // 30분
          notes: `[알림] ${event.title}\n${event.notes || ''}`,
        };

        await RNCalendarEvents.saveEvent(alarmConfig);
      }

      return calendarId;
    } catch (error) {
      console.error('Failed to add calendar event:', error);
      throw error;
    }
  }

  /**
   * 기존 캘린더 이벤트를 수정합니다.
   *
   * @param calendarId - 캘린더 이벤트 ID
   * @param event - 수정할 경조사 이벤트
   * @returns 수정된 캘린더 이벤트 ID
   */
  async updateEvent(calendarId: string, event: SocialEvent): Promise<string | null> {
    try {
      // 기존 이벤트 삭제
      await RNCalendarEvents.removeEvent(calendarId);

      // 새로운 이벤트로 재생성
      const config = this.createCalendarConfig(event);
      const newCalendarId = await RNCalendarEvents.saveEvent(config);

      return newCalendarId;
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      throw error;
    }
  }

  /**
   * 캘린더에서 이벤트를 삭제합니다.
   *
   * @param calendarId - 삭제할 캘린더 이벤트 ID
   * @returns 삭제 성공 여부
   */
  async removeEvent(calendarId: string): Promise<boolean> {
    try {
      await RNCalendarEvents.removeEvent(calendarId);
      return true;
    } catch (error) {
      console.error('Failed to remove calendar event:', error);
      return false;
    }
  }

  /**
   * 날짜 범위로 이벤트를 조회합니다.
   *
   * @param startDate - 시작일
   * @param endDate - 종료일
   * @returns 조회된 이벤트 목록
   */
  async findEvents(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const events = await RNCalendarEvents.findEvents(
        startDate.toISOString(),
        endDate.toISOString()
      );
      return events || [];
    } catch (error) {
      console.error('Failed to find calendar events:', error);
      return [];
    }
  }

  /**
   * SocialEvent를 캘린더와 동기화합니다.
   *
   * @param event - 동기화할 경조사 이벤트
   * @returns 캘린더 이벤트 ID
   *
   * @remarks
   * - calendarEventId가 없으면 새로 생성
   * - calendarEventId가 있으면 업데이트
   */
  async syncEvent(event: SocialEvent): Promise<string | null> {
    if (!event.calendarEventId) {
      // 새 이벤트 생성
      const calendarId = await this.addEvent(event);
      return calendarId;
    } else {
      // 기존 이벤트 업데이트
      await this.updateEvent(event.calendarEventId, event);
      return event.calendarEventId;
    }
  }

  /**
   * SocialEvent를 캘린더 설정으로 변환합니다.
   *
   * @param event - 경조사 이벤트
   * @returns CalendarConfig
   */
  private createCalendarConfig(event: SocialEvent): CalendarConfig {
    // 이벤트 유형에 따른 기본 시간 설정
    const defaultDurations: Record<SocialEventType, number> = {
      wedding: 2 * 60 * 60 * 1000, // 2시간
      funeral: 1 * 60 * 60 * 1000, // 1시간
      first_birthday: 2 * 60 * 60 * 1000, // 2시간
      sixtieth_birthday: 2 * 60 * 60 * 1000, // 2시간
      birthday: 2 * 60 * 60 * 1000, // 2시간
      graduation: 2 * 60 * 60 * 1000, // 2시간
      etc: 1 * 60 * 60 * 1000, // 1시간
    };

    const duration = defaultDurations[event.type] || 2 * 60 * 60 * 1000;
    const startDate = event.eventDate;
    const endDate = new Date(startDate.getTime() + duration);

    // 제목 생성
    const title = this.createEventTitle(event);

    // 위치 정보
    let location: string | undefined;
    if (event.location) {
      location = event.location.address
        ? `${event.location.name}, ${event.location.address}`
        : event.location.name;
    }

    // 설명 생성
    const notes = this.createEventNotes(event);

    return {
      title,
      startDate,
      endDate,
      location,
      notes,
    };
  }

  /**
   * 이벤트 제목을 생성합니다.
   *
   * @param event - 경조사 이벤트
   * @returns 이벤트 제목
   */
  private createEventTitle(event: SocialEvent): string {
    const typeLabels: Record<SocialEventType, string> = {
      wedding: '결혼식',
      funeral: '장례식',
      first_birthday: '돌잔치',
      sixtieth_birthday: '환갑연',
      birthday: '생일파티',
      graduation: '졸업식',
      etc: '경조사',
    };

    const typeLabel = typeLabels[event.type];

    // 연락처 정보가 있으면 이름 포함
    if (event.contact && event.contact.name) {
      return `${event.contact.name} ${typeLabel}`;
    }

    return event.title || typeLabel;
  }

  /**
   * 이벤트 설명을 생성합니다.
   *
   * @param event - 경조사 이벤트
   * @returns 이벤트 설명
   */
  private createEventNotes(event: SocialEvent): string {
    const notesParts: string[] = [];

    // 유형
    const typeLabels: Record<SocialEventType, string> = {
      wedding: '결혼식',
      funeral: '장례식',
      first_birthday: '돌잔치',
      sixtieth_birthday: '환갑연',
      birthday: '생일파티',
      graduation: '졸업식',
      etc: '경조사',
    };

    notesParts.push(`[${typeLabels[event.type]}]`);

    // 상세 설명
    if (event.description) {
      notesParts.push(event.description);
    }

    // 축의금 정보
    if (event.giftAmount && !event.giftSent) {
      notesParts.push(`축의금: ${event.giftAmount.toLocaleString()}원`);
    }

    // 메모
    if (event.notes) {
      notesParts.push(event.notes);
    }

    return notesParts.join('\n');
  }
}
