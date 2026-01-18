/**
 * SocialEvent 타입 정의
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-001: SocialEvent 데이터 모델 정의
 *
 * 경조사(Social Event) 관리를 위한 데이터 모델입니다.
 * 결혼식, 장례식, 돌잔치, 회갑연 등 다양한 경조사 이벤트를 관리합니다.
 */

/**
 * 경조사 이벤트 유형
 *
 * @remarks
 * - wedding: 결혼식
 * - funeral: 장례식
 * - first_birthday: 돌잔치
 * - sixtieth_birthday: 회갑연 (환갑)
 * - birthday: 생일파티
 * - graduation: 졸업식
 * - etc: 기타 경조사
 */
export type SocialEventType =
  | 'wedding'
  | 'funeral'
  | 'first_birthday'
  | 'sixtieth_birthday'
  | 'birthday'
  | 'graduation'
  | 'etc';

/**
 * 경조사 이벤트 상태
 *
 * @remarks
 * - pending: 확정되지 않은 상태 (정보 수집 중)
 * - confirmed: 확정된 상태 (일정 확정)
 * - completed: 완료된 상태 (이벤트 종료)
 * - cancelled: 취소된 상태
 */
export type SocialEventStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

/**
 * 경조사 이벤트 우선순위
 *
 * @remarks
 * - low: 낮음 (예: 먼 미래의 일반적인 이벤트)
 * - medium: 중간 (기본 우선순위)
 * - high: 높음 (예: 가까운 일정, 중요한 인물)
 * - urgent: 긴급 (예: 며칠 내의 장례식, 당일 결혼식)
 */
export type SocialEventPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * 관계 유형
 *
 * @remarks
 * 연락처와의 관계를 나타냅니다.
 */
export type RelationshipType =
  | 'family'           // 가족
  | 'relative'         // 친척
  | 'friend'           // 친구
  | 'college_friend'   // 대학 친구
  | 'high_school_friend' // 고등학교 친구
  | 'colleague'        // 직장 동료
  | 'boss'            // 상사
  | 'business_client'  // 비즈니스 파트너
  | 'neighbor'        // 이웃
  | 'etc';            // 기타

/**
 * 위치 정보
 *
 * @remarks
 * 이벤트가 열리는 장소의 상세 정보
 */
export interface SocialEventLocation {
  /** 장소 이름 */
  name: string;
  /** 주소 */
  address: string;
  /** 위도 (optional) */
  latitude?: number;
  /** 경도 (optional) */
  longitude?: number;
}

/**
 * 연락처 정보
 *
 * @remarks
 * 이벤트 관련자의 연락처 정보
 */
export interface SocialEventContact {
  /** 이름 */
  name: string;
  /** 전화번호 */
  phone: string;
  /** 관계 유형 */
  relationship: RelationshipType;
}

/**
 * 경조사 이벤트 핵심 데이터 모델
 *
 * @remarks
 * 모든 경조사 이벤트의 기본이 되는 데이터 구조입니다.
 * 캘린더 연동, 알림, 선물 관리 등 다양한 기능에서 활용됩니다.
 */
export interface SocialEvent {
  /** 고유 ID (UUID 또는 사용자 정의 ID) */
  id: string;

  /** 이벤트 유형 */
  type: SocialEventType;

  /** 이벤트 상태 */
  status: SocialEventStatus;

  /** 우선순위 */
  priority: SocialEventPriority;

  /** 이벤트 제목 */
  title: string;

  /** 상세 설명 (optional) */
  description: string | null;

  /** 이벤트 날짜 및 시간 */
  eventDate: Date;

  /** 장소 정보 (optional) */
  location: SocialEventLocation | null;

  /** 연락처 정보 (optional) */
  contact: SocialEventContact | null;

  /** 축의금/조의금 금액 (optional) */
  giftAmount: number | null;

  /** 선물 송금 여부 */
  giftSent: boolean;

  /** 선물 송금일 (optional) */
  giftSentDate: Date | null;

  /** 알림 설정 여부 */
  reminderSet: boolean;

  /** 알림일 (optional) */
  reminderDate: Date | null;

  /** 캘린더 이벤트 ID (optional) */
  calendarEventId: string | null;

  /** 추가 메모 (optional) */
  notes: string | null;

  /** 생성일 */
  createdAt: Date;

  /** 수정일 */
  updatedAt: Date;
}

/**
 * 경조사 이벤트 생성 입력
 *
 * @remarks
 * 새 이벤트 생성 시 필요한 필수 및 선택적 필드를 정의합니다.
 */
export interface SocialEventCreateInput {
  /** 이벤트 유형 */
  type: SocialEventType;

  /** 이벤트 제목 */
  title: string;

  /** 이벤트 날짜 및 시간 */
  eventDate: Date;

  /** 상세 설명 (optional) */
  description?: string;

  /** 이벤트 상태 (optional, 기본값: pending) */
  status?: SocialEventStatus;

  /** 우선순위 (optional, 기본값: medium) */
  priority?: SocialEventPriority;

  /** 장소 정보 (optional) */
  location?: SocialEventLocation;

  /** 연락처 정보 (optional) */
  contact?: SocialEventContact;

  /** 축의금/조의금 금액 (optional) */
  giftAmount?: number;

  /** 추가 메모 (optional) */
  notes?: string;
}

/**
 * 경조사 이벤트 업데이트 입력
 *
 * @remarks
 * 기존 이벤트 수정 시 사용할 수 있는 모든 필드는 선택적입니다.
 */
export interface SocialEventUpdateInput {
  /** 이벤트 유형 (optional) */
  type?: SocialEventType;

  /** 이벤트 상태 (optional) */
  status?: SocialEventStatus;

  /** 우선순위 (optional) */
  priority?: SocialEventPriority;

  /** 이벤트 제목 (optional) */
  title?: string;

  /** 상세 설명 (optional) */
  description?: string | null;

  /** 이벤트 날짜 및 시간 (optional) */
  eventDate?: Date;

  /** 장소 정보 (optional) */
  location?: SocialEventLocation | null;

  /** 연락처 정보 (optional) */
  contact?: SocialEventContact | null;

  /** 축의금/조의금 금액 (optional) */
  giftAmount?: number | null;

  /** 선물 송금 여부 (optional) */
  giftSent?: boolean;

  /** 선물 송금일 (optional) */
  giftSentDate?: Date | null;

  /** 알림 설정 여부 (optional) */
  reminderSet?: boolean;

  /** 알림일 (optional) */
  reminderDate?: Date | null;

  /** 캘린더 이벤트 ID (optional) */
  calendarEventId?: string | null;

  /** 추가 메모 (optional) */
  notes?: string | null;
}

/**
 * 경조사 이벤트 필터 옵션
 *
 * @remarks
 * 이벤트 목록 조회 시 사용할 수 있는 필터링 옵션입니다.
 */
export interface SocialEventFilter {
  /** 이벤트 유형으로 필터링 (optional) */
  type?: SocialEventType;

  /** 이벤트 상태로 필터링 (optional) */
  status?: SocialEventStatus;

  /** 우선순위로 필터링 (optional) */
  priority?: SocialEventPriority;

  /** 시작일 (optional) */
  startDate?: Date;

  /** 종료일 (optional) */
  endDate?: Date;

  /** 선물 미송부만 필터링 (optional) */
  giftNotSent?: boolean;

  /** 알림 미설정만 필터링 (optional) */
  reminderNotSet?: boolean;
}

/**
 * 경조사 이벤트 통계 정보
 *
 * @remarks
 * 대시보드 및 분석을 위한 통계 데이터입니다.
 */
export interface SocialEventStatistics {
  /** 전체 이벤트 수 */
  totalEvents: number;

  /** 상태별 이벤트 수 */
  statusCounts: Record<SocialEventStatus, number>;

  /** 유형별 이벤트 수 */
  typeCounts: Record<SocialEventType, number>;

  /** 이번 달 예상 선물 지출 */
  expectedGiftExpense: number;

  /** 실제 송부한 선물 총액 */
  totalGiftSent: number;

  /** 미송부 선물 총액 */
  pendingGiftAmount: number;
}
