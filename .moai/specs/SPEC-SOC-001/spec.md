# SPEC-SOC-001: 경조사 관리 기능 (Social Feature)

## 메타데이터

| 항목 | 값 |
|------|------|
| **SPEC ID** | SPEC-SOC-001 |
| **제목** | 경조사 관리 기능 구현 |
| **상태** | Completed |
| **우선순위** | High |
| **작성일** | 2026-01-18 |
| **완료일** | 2026-01-18 |
| **도메인** | Social |
| **라벨** | social, event, calendar, reminder, relationship |
| **의존 SPEC** | SPEC-AI-002 (AI/ML 엔진) |

## 개요

Momentum 앱의 핵심 유스케이스인 경조사(결혼식, 장례, 생일, 돌잔치 등) 관리 기능을 구현합니다. 사용자의 디지털 흔적(스크린샷, 채팅, 초대장 이미지)에서 경조사 정보를 자동으로 추출하고, 캘린더 등록, 리마인드, 송금 화면 준비 등 실행 가능한 상태로 변환합니다.

## 환경

### 시스템 환경
- **플랫폼**: React Native 0.73.6 (iOS, Android)
- **언어**: TypeScript 5.3+
- **노드 버전**: 18+

### 기술 스택
| 구성 요소 | 기술 | 버전 | 목적 |
|-----------|------|------|------|
| 상태 관리 | Zustand | 4.5+ | 경조사 상태 관리 |
| 데이터베이스 | SQLite (SQLCipher) | - | 암호화 로컬 저장 |
| AI/ML 엔진 | TensorFlow Lite | 2.0.0+ | 의도 분류, 개체 추출 |
| 캘린더 | React Native Calendar | - | 일정 표시 |

### 아키텍처 원칙
- **Privacy First**: 모든 데이터는 온디바이스에 암호화 저장
- **Invisible Input**: 별도 입력 없이 자동으로 정보 추출
- **Just-in-Time Action**: 실행 가능한 상태까지 준비

## 가정

### 기술적 가정
1. **High Confidence**: AI/ML 엔진(SPEC-AI-002)이 의도 분류(social)와 개체 추출(날짜, 장소, 인물)을 정확히 수행
2. **Medium Confidence**: 디바이스 네이티브 캘린더 API 접근 권한 획득 가능
3. **Medium Confidence**: 송금 앱(카카오페이, 토스 등) 딥링크 연동 가능

### 비즈니스 가정
1. **High Confidence**: 사용자는 경조사 정보를 수동 입력하는 것을 번거로워함
2. **Medium Confidence**: 사용자는 리마인드 알림 시점을 조정하고 싶어함
3. **Low Confidence**: 사용자는 자동 추출 정보 수정 기능을 자주 사용할 수 있음

### 위험 요소
- **정확도**: AI 추출 오류로 인한 잘못된 일정 등록 가능성
- **프라이버시**: 연락처 접근 권한 사용자 거부 가능성
- **호환성**: iOS/Android 캘린더 API 차이로 인한 이슈

## 요구사항 (EARS 형식)

### Ubiquitous Requirements (시스템 전체 항시 적용)

**REQ-SOC-001**: 시스템은 **항상** 경조사 정보를 암호화하여 저장해야 한다
- **이유**: 민감한 개인정보 보호
- **검증**: SQLite 데이터베이스 암호화 확인

**REQ-SOC-002**: 시스템은 **항상** 사용자 연락처에 접근 전 명시적 동의를 요구해야 한다
- **이유**: 프라이버시 정책 준수
- **검증**: 권한 요청 다이얼로그 표시 확인

**REQ-SOC-003**: 시스템은 **항상** 추출된 정보를 사용자에게 표시하고 수정 가능하게 해야 한다
- **이유**: AI 오류 수정 및 사용자 확인
- **검증**: 편집 UI 존재 확인

**REQ-SOC-004**: 시스템은 **항상** 경조사 유형(결혼식, 장례, 생일, 돌잔치, 기념일)을 분류해야 한다
- **지원 유형**: wedding(결혼식), funeral(장례), birthday(생일), first_birthday(돌잔치), anniversary(기념일)
- **검증**: 분류 태그 존재 확인

### Event-Driven Requirements (이벤트 기반)

**REQ-SOC-101**: **WHEN** 경조사 관련 텍스트가 감지되면, 시스템은 **즉시** 경조사 정보를 추출해야 한다
- **감지 키워드**: 결혼, 장례, 장례식, 생일, 돌, 기념일, 축하, 조의 등
- **입력 소스**: 스크린샷, 채팅 메시지, 초대장 이미지
- **출력**: Event 데이터 구조 (유형, 날짜, 시간, 장소, 관련 인물)

**REQ-SOC-102**: **WHEN** 경조사 정보가 추출되면, 시스템은 **즉시** 사용자에게 정보를 표시하고 확인을 요구해야 한다
- **UI 요소**: 카드 형태 정보 표시, 편집 버튼, 저장 버튼
- **타임아웃**: 24시간 내 응답 없으면 자동 삭제 (개인정보 보호)

**REQ-SOC-103**: **WHEN** 사용자가 경조사 정보를 저장하면, 시스템은 **즉시** 디바이스 캘린더에 일정을 등록해야 한다
- **캘린더 통합**: iOS EventKit, Android CalendarProvider
- **일정 제목**: "[결혼식] 김철수씨 결혼식" 형식
- **알림**: 당일 오전 9시, 1일 전, 7일 전

**REQ-SOC-104**: **WHEN** 결혼식/장례가 감지되면, 시스템은 **즉시** 축의금/조의금 송금 화면을 준비해야 한다
- **준비 항목**: 송금 앱 딥링크, 추천 금액(관계별), 수수료 정보
- **관계별 금액**: 직장 동료(5-10만원), 친구(3-10만원), 가족(10-30만원)

**REQ-SOC-105**: **WHEN** 경조사 일정 당일이 되면, 시스템은 **오전 9시**에 리마인드 알림을 발송해야 한다
- **알림 내용**: 일정 정보, 장소, 축의금/조의금 송금 버튼
- **알림 액션**: "지도에서 열기", "송금하기", "완료"

**REQ-SOC-106**: **WHEN** 경조사 정보가 수정되면, 시스템은 **즉시** 캘린더 일정을 동기화해야 한다
- **동기화 항목**: 날짜, 시간, 장소, 제목
- **충돌 처리**: 사용자에게 알림 후 덮어쓰기 선택

### State-Driven Requirements (상태 기반)

**REQ-SOC-201**: **IF** 추출된 날짜가 명확하지 않으면(예: "다음 주 금요일"), 시스템은 현재 날짜 기준으로 계산해야 한다
- **상대적 날짜**: "다음 주", "이번 달", "내년" 등
- **기준**: 현재 날짜로부터 계산
- **불확실성**: 사용자에게 날짜 확인 요구

**REQ-SOC-202**: **IF** 추출된 장소가 주소만 있으면, 시스템은 지도 API로 좌표를 변환해야 한다
- **지도 통합**: Google Maps API, Kakao Maps API
- **캐싱**: 변환 결과 로컬 캐시 (30일)
- **폴백**: API 실패 시 주소 텍스트만 저장

**REQ-SOC-203**: **IF** 관련 인물이 연락처에 존재하면, 시스템은 프로필 정보(사진, 전화번호)를 연동해야 한다
- **연락처 매칭**: 이름 기반 검색
- **프라이버시**: 매칭 실패 시 이름만 저장
- **동의**: 연락처 접근 권한 필요

**REQ-SOC-204**: **IF** 사용자가 같은 인물의 경조사를 두 번 이상 등록하면, 시스템은 관계 히스토리를 제안해야 한다
- **제공 내용**: 지난 경조사 기록, 참여 여부, 송금 내역
- **목적**: 중복 등록 방지, 관계 맥락 제공

**REQ-SOC-205**: **IF** 축의금/조의금 송급이 완료되면, 시스템은 상태를 "송금 완료"로 변경해야 한다
- **상태**: pending, completed, cancelled
- **검증**: 송금 앱 리턴 핸들러

### Unwanted Requirements (금지 동작)

**REQ-SOC-301**: 시스템은 **절대로** 사용자 동의 없이 캘린더에 일정을 등록해서는 안 된다
- **검증**: 명시적 저장 버튼 클릭 필요

**REQ-SOC-302**: 시스템은 **절대로** 추출된 연락처 정보를 원격 서버로 전송해서는 안 된다
- **검증**: 네트워크 로그 분석

**REQ-SOC-303**: 시스템은 **절대로** 송금 앱에서 사용자 인증 정보(비밀번호, PIN)를 저장해서는 안 된다
- **검증**: 딥링크 방식만 사용, 인증은 송금 앱에서 처리

**REQ-SOC-304**: 시스템은 **절대로** 장례 관련 알림을 방해 금지 시간대(오후 9시-오전 8시)에 발송해서는 안 된다
- **예외**: 사용자이 명시적으로 설정한 경우

**REQ-SOC-305**: 시스템은 **절대로** AI 추출 오류로 인해 잘못된 경조사 정보를 자동 등록해서는 안 된다
- **검증**: 사용자 확인 단계 필수

### Optional Requirements (선택적 기능)

**REQ-SOC-401**: **가능하면** 경조사 유형별 맞춤 알림 톤을 제공해야 한다
- **결혼식**: 축하 톤
- **장례**: 조의 톤 (무음, 진동)

**REQ-SOC-402**: **가능하면** 교통편 안내를 제공해야 한다
- **기능**: 장소까지 경로, 소요 시간, 교통수단 추천
- **지도 연동**: 지도 앱 딥링크

**REQ-SOC-403**: **가능하면** 경조사 참여자 그룹 채팅을 감지하여 정보를 공유해야 한다
- **대상**: 동일한 일정에 등록된 사용자들
- **기능**: 팁 공유, 동선 조율

**REQ-SOC-404**: **가능하면** 연간 경조사 달력을 제공해야 한다
- **기능**: 한눈에 올해 경조사 일정 확인
- **필터**: 유형별, 관계별 필터링

**REQ-SOC-405**: **가능하면** 경조사 기록을 통계로 제공해야 한다
- **통계**: 연간 참여 횟수, 총 금액, 유형별 비중
- **기간**: 월별, 연간 리포트

## 세부 사양

### SP-SOC-001: 경조사 데이터 모델

**Event 데이터 구조**:
```typescript
interface SocialEvent {
  id: string;                    // UUID
  type: EventType;               // wedding, funeral, birthday, etc.
  title: string;                 // "김철수씨 결혼식"
  date: Date;                    // ISO 8601
  time?: string;                 // "14:00"
  location?: Location;           // 장소 정보
  relatedPerson: Person;         // 관련 인물
  relationship: RelationshipType; // family, friend, colleague, etc.
  status: EventStatus;           // pending, confirmed, completed, cancelled
  giftInfo?: GiftInfo;           // 축의금/조의금 정보
  reminderSent: boolean;         // 리마인드 발송 여부
  createdAt: Date;
  updatedAt: Date;
}
```

### SP-SOC-002: AI/ML 통합

**의도 분류**: SPEC-AI-002 IntentClassifier
- **social** 하위 카테고리: wedding, funeral, birthday, anniversary

**개체 추출**: SPEC-AI-002 EntityExtractor
- **필요 엔티티**: 날짜(DAT), 시간(TIM), 장소(LOC), 인물(PER), 조직(ORG)

### SP-SOC-003: 캘린더 통합

**iOS**: EventKit Framework
- **권한**: EKEventStore authorization for .event
- **일정 생성**: EKEvent save
- **알림**: EKAlarm

**Android**: Calendar Provider
- **권한**: WRITE_CALENDAR
- **일정 생성**: ContentResolver insert
- **알림**: CalendarContract.Reminders

### SP-SOC-004: 송금 앱 연동

**딥링크 형식**:
| 송금 앱 | 스킴 | 예시 |
|---------|------|------|
| 카카오페이 | kakaotalk:// | kakaopay://sendMoney?amount=50000 |
| 토스 | supertoss:// | supertoss://send?amount=50000 |
| 네이버페이 | naverpay:// | naverpay://pay?amount=50000 |

**추천 금액**:
| 관계 | 결혼식 | 장례 | 생일 |
|------|--------|------|------|
| 직장 동료 | 5-10만원 | 3-5만원 | 1-3만원 |
| 친구 | 3-10만원 | 2-5만원 | 1-5만원 |
| 가족 | 10-30만원 | 10-50만원 | 5-20만원 |
| 윗사람 | 10-50만원 | 10-50만원 | 5-10만원 |

## 추적성 태그

| 요구사항 | 관련 컴포넌트 | 테스트 시나리오 |
|----------|--------------|----------------|
| REQ-SOC-001 | DatabaseService | SOC-PRIV-001 |
| REQ-SOC-002 | PermissionService | SOC-PERM-001 |
| REQ-SOC-003 | SocialEventScreen | SOC-UI-001 |
| REQ-SOC-004 | IntentClassifier | SOC-AI-001 |
| REQ-SOC-101 | ContextCaptureService | SOC-EXT-001 |
| REQ-SOC-102 | SocialEventCard | SOC-UI-002 |
| REQ-SOC-103 | CalendarService | SOC-CAL-001 |
| REQ-SOC-104 | PaymentService | SOC-PAY-001 |
| REQ-SOC-105 | NotificationService | SOC-NOT-001 |
| REQ-SOC-106 | CalendarService | SOC-SYNC-001 |
| REQ-SOC-201 | DateNormalizer | SOC-DATE-001 |
| REQ-SOC-202 | MapService | SOC-LOC-001 |
| REQ-SOC-203 | ContactService | SOC-CONT-001 |
| REQ-SOC-204 | HistoryService | SOC-HIST-001 |
| REQ-SOC-205 | PaymentService | SOC-PAY-002 |
| REQ-SOC-301 | CalendarService | SOC-CAL-002 |
| REQ-SOC-302 | NetworkMonitor | SOC-PRIV-002 |
| REQ-SOC-303 | PaymentService | SEC-PAY-001 |
| REQ-SOC-304 | NotificationService | SOC-NOT-002 |
| REQ-SOC-305 | SocialEventService | SOC-VAL-001 |

---

**버전**: 1.0.0
**마지막 업데이트**: 2026-01-18
**작성자**: Spec Builder Agent
