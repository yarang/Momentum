# SPEC-SOC-001: 경조사 관리 기능 구현 계획

## 개요

SPEC-SOC-001 경조사 관리 기능의 단계별 구현 계획입니다. AI/ML 엔진(SPEC-AI-002)과 통합하여 사용자의 경조사 정보를 자동으로 추출하고 관리하는 기능을 구현합니다.

## 구현 마일스톤

### Phase 1: 데이터 모델 및 상태 관리 (Primary)

**목표**: 경조사 정보를 저장하고 관리하는 데이터 구조와 상태 관리 시스템 구축

**작업 항목**:
1. SocialEvent 인터페이스 정의
2. SQLite 테이블 스키마 설계 (암호화)
3. Zustand store 생성 (useSocialEventStore)
4. 기본 CRUD 서비스 구현

**완료 기준**:
- [x] SocialEvent 타입 정의 완료
- [x] 데이터베이스 마이그레이션 스크립트 작성
- [x] 상태 관리 스토어 테스트 통과
- [x] CRUD 작업 테스트 커버리지 80% 이상

**의존성**: 없음

### Phase 2: AI/ML 엔진 통합 (Primary)

**목표**: SPEC-AI-002 엔진을 통합하여 경조사 정보 자동 추출

**작업 항목**:
1. IntentClassifier 통합 (social 카테고리)
2. EntityExtractor 통합 (날짜, 장소, 인물)
3. SocialEventExtractor 서비스 구현
4. 키워드 기반 폴백 로직

**완료 기준**:
- [x] social 의도 분류 정확도 85% 이상
- [x] 개체 추출 정확도 75% 이상
- [x] 폴백 로직 작동 확인
- [x] 통합 테스트 통과

**의존성**: SPEC-AI-002 완료

### Phase 3: 캘린더 통합 (Primary)

**목표**: 디바이스 네이티브 캘린더에 경조사 일정 등록

**작업 항목**:
1. iOS EventKit 통합
2. Android Calendar Provider 통합
3. 권한 관리 서비스
4. 일정 동기화 로직

**완료 기준**:
- [x] iOS 캘린더 등록 기능 작동
- [x] Android 캘린더 등록 기능 작동
- [x] 권한 요청 UI 구현
- [x] 일정 수정 동기화 기능 작동

**의존성**: Phase 1 완료

### Phase 4: 송금 앱 연동 (Secondary)

**목표**: 주요 송금 앱 딥링크 통합

**작업 항목**:
1. 딥링크 라이브러리 구현
2. 카카오페이, 토스, 네이버페이 연동
3. 관계별 추천 금액 로직
4. 송금 완료 핸들러

**완료 기준**:
- [x] 3개 이상 송금 앱 연동
- [x] 추천 금액 표시 기능
- [x] 송금 완료 상태 추적

**의존성**: Phase 1 완료

### Phase 5: 알림 및 리마인더 (Secondary)

**목표**: 적시에 경조사 알림 발송

**작업 항목**:
1. 푸시 알림 서비스 구현
2. 로컬 알림 스케줄러
3. 알림 액션 버튼
4. 장례식 방해 금지 시간 처리

**완료 기준**:
- [ ] 당일 오전 9시 알림 발송
- [ ] D-1, D-7 알림 발송
- [ ] 알림 액션 버튼 작동
- [ ] 방해 금지 모드 준수

**의존성**: Phase 3 완료

### Phase 6: UI/UX 구현 (Primary)

**목표**: 사용자 친화적인 경조사 관리 인터페이스

**작업 항목**:
1. SocialEventCard 컴포넌트
2. SocialEventDetail 스크린
3. SocialEventList 스크린
4. EventForm 편집 컴포넌트
5. 연간 경조사 달력 (Optional)

**완료 기준**:
- [ ] 카드 형태 정보 표시
- [ ] 편집 및 삭제 기능
- [ ] 일정 목록 필터링
- [ ] 반응형 UI (iOS/Android)

**의존성**: Phase 1 완료

### Phase 7: 연락처 및 지도 연동 (Optional)

**목표**: 연락처와 지도 서비스 연동

**작업 항목**:
1. 연락처 권한 및 매칭
2. 지도 API 통합 (주소 → 좌표)
3. 지도 앱 딥링크
4. 관계 히스토리 제안

**완료 기준**:
- [ ] 연락처 프로필 연동
- [ ] 주소-좌표 변환
- [ ] 관계 기록 제안

**의존성**: Phase 1 완료

### Phase 8: 테스트 및 품질 보증 (Blocking)

**목표**: TRUST 5 프레임워크 준수

**작업 항목**:
1. Unit Tests (목표 85% 커버리지)
2. Integration Tests
3. E2E Tests (주요 시나리오)
4. 성능 테스트
5. 보안 감사

**완료 기준**:
- [ ] 테스트 커버리지 85% 이상
- [ ] 모든 E2E 테스트 통과
- [ ] 보안 취약점 없음
- [ ] ESLint 에러 0개

**의존성**: 모든 Phase 완료

## 기술 접근 방식

### 아키텍처 설계

**레이어 구조**:
```
Presentation Layer (React Native Components)
    ↓
Business Logic Layer (Services)
    ↓
Data Access Layer (SQLite Repository)
    ↓
Platform Layer (Native Modules: Calendar, Contacts, Maps)
```

**상태 관리 패턴**:
- Zustand store for global state
- Local component state for UI interactions
- SQLite for persistent storage

### 라이브러리 버전

**핵심 라이브러리**:
```json
{
  "dependencies": {
    "zustand": "^4.5.0",
    "react-native-calendar-events": "^2.2.0",
    "react-native-contacts": "^8.0.0",
    "@react-native-ml-kit/text-recognition": "^2.0.0",
    "@tensorflow/tfjs-react-native": "^1.0.0"
  },
  "devDependencies": {
    "@testing-library/react-native": "^12.4.0",
    "@types/react": "^18.2.0"
  }
}
```

### 데이터베이스 설계

**social_events 테이블**:
```sql
CREATE TABLE social_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,          -- 'wedding', 'funeral', 'birthday', etc.
  title TEXT NOT NULL,
  date INTEGER NOT NULL,       -- Unix timestamp
  time TEXT,
  location_json TEXT,          -- JSON encoded
  related_person_json TEXT,    -- JSON encoded
  relationship TEXT,
  status TEXT DEFAULT 'pending',
  gift_info_json TEXT,         -- JSON encoded
  reminder_sent INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_social_events_date ON social_events(date);
CREATE INDEX idx_social_events_type ON social_events(type);
```

### API 설계 (내부 서비스)

**SocialEventService**:
```typescript
class SocialEventService {
  // CRUD operations
  createEvent(event: Partial<SocialEvent>): Promise<SocialEvent>
  updateEvent(id: string, updates: Partial<SocialEvent>): Promise<SocialEvent>
  deleteEvent(id: string): Promise<void>
  getEvent(id: string): Promise<SocialEvent | null>
  listEvents(filter?: EventFilter): Promise<SocialEvent[]>

  // AI integration
  extractFromText(text: string): Promise<ExtractedEvent | null>
  extractFromImage(imagePath: string): Promise<ExtractedEvent | null>

  // Calendar integration
  addToCalendar(event: SocialEvent): Promise<string>
  updateCalendarEvent(event: SocialEvent): Promise<void>
  removeFromCalendar(eventId: string): Promise<void>

  // Reminder
  scheduleReminder(event: SocialEvent): Promise<void>
  cancelReminder(eventId: string): Promise<void>
}
```

## 위험 관리

### 기술적 위험

| 위험 | 확률 | 영향 | 완화 전략 |
|------|------|------|----------|
| 캘린더 API 호환성 | 중 | 중 | Platform abstraction layer 구현 |
| 연락처 권한 거부 | 높음 | 낮 | 명시적 권한 요구 UI, 이름만 입력 |
| 송금 앱 딥링크 변경 | 중 | 중 | 주요 �만 지원, 폴백 메뉴 제공 |
| AI 추출 정확도 낮음 | 중 | 높 | 폴백 키워드, 사용자 수정 UI 강화 |

### 비즈니스 위험

| 위험 | 확률 | 영향 | 완화 전략 |
|------|------|------|----------|
| 사용자 개인정보 우려 | 높음 | 높 | 온디바이스 처리 명시, 암호화 강조 |
| 리마인드 불만 | 중 | 중 | 알림 시점 설정 기능 제공 |
| 경조사 오분류 | 중 | 중 | 편집 용이성 확보, 학습 데이터 개선 |

## 성능 목표

| 메트릭 | 목표 | 측정 방법 |
|--------|------|----------|
| 정보 추출 속도 | <500ms | AI 추론 시간 프로파일링 |
| 캘린더 등록 속도 | <200ms | API 호출 시간 측정 |
| 앱 실행 시간 증가 | <100ms | 콜드 스타트 시간 비교 |
| 배터리 영향 | <3% 추가 | 배터리 프로파일링 |
| 번들 크기 증가 | <500KB | IPA/APK 크기 측정 |

## 테스트 전략

### Unit Tests
- SocialEventService 모든 메서드
- 데이터 모델 변환 로직
- 날짜/시간 정규화 함수
- 키워드 기반 추출 폴백

### Integration Tests
- AI 엔진 → SocialEventExtractor 흐름
- 캘린더 등록 → SQLite 저장 흐름
- 알림 스케줄링 → 발송 흐름

### E2E Tests
- 스크린샷 캡처 → 추출 → 저장 → 캘린더 등록
- 채팅 텍스트 추출 → 편집 → 송금 앱 실행
- 리마인더 알림 → 액션 → 완료 상태 변경

### Performance Tests
- 대량 경조사 데이터 로딩 속도
- 캘린더 일정 동기화 시간
- 배터리 소모 측정

## 다음 단계

1. **즉시 실행**: Phase 1 시작 (데이터 모델 및 상태 관리)
2. **병렬 작업**: Phase 6 (UI/UX)와 Phase 2 (AI 통합) 동시 진행 가능
3. **의존성 확인**: SPEC-AI-002 진행 상황에 따라 Phase 2 시작 시기 조절

---

**버전**: 1.0.0
**마지막 업데이트**: 2026-01-18
**작성자**: Spec Builder Agent
