# Momentum (모멘텀) - AI Context-Action Agent

## 프로젝트 개요

### 비전
"기억을 행동으로" - 사용자의 디지털 흔적을 맥락으로 이해하고, 적시에 실행 가능한 행동으로 변환하는 AI 에이전트

### 핵심 가치 제안
- **Invisible Input**: 별도 입력 없이 스크린샷, 채팅, 위치 등에서 자동으로 맥락 추출
- **Just-in-Time Action**: 단순 리마인더가 아닌, 실행 가능한 상태(Actionable State)까지 준비
- **Privacy First**: 온디바이스 AI 처리로 개인정보 보호

### 타겟 사용자
현대의 "게으른 완벽주의자" - 정보 수집은 잘하지만, 정리와 실행에 어려움을 겪는 사람들

---

## 기술 스택 (가정 - 검토 필요)

### Frontend/Mobile
| 기술 | 선택 | 이유 |
|------|------|------|
| **프레임워크** | React Native | 크로스플랫폼, 빠른 개발, 풍부한 생태계 |
| **상태 관리** | Zustand | 가볍고 간단한 상태 관리 |
| **UI 라이브러리** | React Native Paper | Material Design 기반 일관된 UI |
| **내비게이션** | React Navigation | 표준 네비게이션 솔루션 |

### AI/ML
| 기술 | 선택 | 이유 |
|------|------|------|
| **온디바이스 ML** | TensorFlow Lite | 모바일 최적화, 경량화 |
| **텍스트 분석** | BERT (경량 모델) | 맥락 이해, NLP |
| **이미지 인식** | Vision API / ML Kit | OCR, 객체 인식 |
| **음성 인식** | Whisper (경량) | 미팅 녹음 분석 |

### Backend (Optional)
| 기술 | 선택 | 이유 |
|------|------|------|
| **서버** | Node.js + Express | 필요시 최소한의 동기화 |
| **데이터베이스** | SQLite (로컬) | 온디바이스 저장 |
| **클라우드 백업** | Supabase | 선택적 클라우드 동기화 |

### 개발 도구
- **패키지 관리**: npm/yarn
- **타입 체크**: TypeScript
- **테스트**: Jest + React Native Testing Library
- **CI/CD**: GitHub Actions
- **코드 품질**: ESLint + Prettier

---

## 프로젝트 구조

```
momentum/
├── src/
│   ├── core/                    # 핵심 AI 엔진
│   │   ├── contextCapture/     # 맥락 수집
│   │   │   ├── ScreenshotCapture.ts
│   │   │   ├── ChatExtractor.ts
│   │   │   └── LocationTracker.ts
│   │   ├── contextAnalysis/    # 맥락 분석
│   │   │   ├── IntentClassifier.ts
│   │   │   ├── EntityExtractor.ts
│   │   │   └── TemporalAnalyzer.ts
│   │   └── actionExecutor/     # 액션 실행
│   │       ├── CalendarAction.ts
│   │       ├── PaymentAction.ts
│   │       └── ShoppingAction.ts
│   │
│   ├── features/               # 주요 기능
│   │   ├── social/            # 경조사 관리
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   └── services/
│   │   ├── shopping/          # 쇼핑 관리
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   └── services/
│   │   └── work/              # 업무 관리
│   │       ├── screens/
│   │       ├── components/
│   │       └── services/
│   │
│   ├── shared/                # 공통 모듈
│   │   ├── components/        # 재사용 컴포넌트
│   │   ├── hooks/             # 커스텀 훅
│   │   ├── utils/             # 유틸리티
│   │   ├── models/            # 데이터 모델
│   │   └── constants/         # 상수
│   │
│   ├── navigation/            # 내비게이션
│   ├── store/                 # 전역 상태
│   └── services/              # 외부 서비스 연동
│
├── assets/                    # 정적 리소스
├── __tests__/                # 테스트
├── android/                  # Android 네이티브
├── ios/                      # iOS 네이티브
└── docs/                     # 문서

```

---

## 핵심 기능 모듈

### 1. Context Capture (맥락 수집)
**목적**: 사용자의 디지털 행동에서 자동으로 정보 추출

#### 수집 대상
- **스크린샷**: OCR을 통한 텍스트 추출, 이미지 분류
- **채팅 메시지**: 키워드, 날짜, 장소 추출
- **위치 정보**: 장소 기반 컨텍스트
- **음성 녹음**: 음성→텍스트 변환 후 분석

#### 기술적 고려사항
- 백그라운드 처리 최적화 (배터리 효율)
- 접근성 권한 관리 (Android Accessibility, iOS Screen Recording)
- 개인정보 필터링 (민감 정보 제외)

### 2. Context Analysis (맥락 분석)
**목적**: 수집된 데이터를 의미있는 인텐트로 변환

#### 분석 단계
1. **Intent Classification**: 사용자의 의도 분류 (일정, 쇼핑, 업무 등)
2. **Entity Extraction**: 날짜, 시간, 장소, 금액, 인물 추출
3. **Temporal Analysis**: 데드라인, 우선순위 판단
4. **Relationship Mapping**: 관련 정보 간 연결

#### AI 모델 구조
```
입력 → 전처리 → 특징 추출 → 분류 → 엔티티 추출 → 맥락 생성
```

### 3. Action Executor (액션 실행)
**목적**: 분석된 맥락을 실행 가능한 행동으로 변환

#### 액션 유형
- **Calendar Action**: 일정 자동 등록, 리마인더 설정
- **Payment Action**: 송금 앱 실행, 금액 입력
- **Shopping Action**: 장바구니 추가, 가격 추적
- **Task Action**: 업무 관리 도구 연동, 파일 준비

#### 실행 시점 판단
- **즉시**: 긴급하거나 간단한 작업
- **적시**: 최적의 타이밍에 알림 (월급날, 세일 기간 등)
- **조건부**: 특정 조건 충족 시 (위치 기반, 시간 기반)

---

## 주요 유스케이스

### Use Case 1: 경조사 관리 (Social Care)
```
입력: 친구 카톡 "다음 달 15일 결혼식이야" + 청첩장 이미지
  ↓
분석: 날짜(다음 달 15일), 이벤트(결혼식), 인물(친구)
  ↓
액션: 
  1. 캘린더 등록 (날짜, 장소)
  2. 당일 아침 알림 + 축의금 송금 화면 준비
  3. 교통편 안내 (지도 앱 연동)
```

### Use Case 2: 쇼핑 관리 (Sniper Shopping)
```
입력: 인스타그램 광고 스크린샷
  ↓
분석: 상품 정보, 가격, 쇼핑몰 URL
  ↓
액션:
  1. 위시리스트 저장
  2. 가격 추적 (세일 알림)
  3. 월급날/세일 기간 알림 + 장바구니 링크
```

### Use Case 3: 업무 관리 (Meeting Follow-up)
```
입력: 미팅 녹음 "다음 주까지 제안서 초안 보내드리겠습니다"
  ↓
분석: 업무(제안서 작성), 데드라인(다음 주), 관련자(미팅 참석자)
  ↓
액션:
  1. 할일 등록 (Notion/Slack 연동)
  2. 데드라인 3일 전 알림 + 참고 자료 준비
  3. 작업 시작 버튼 (문서 앱 실행)
```

---

## 개발 가이드라인

### 코딩 컨벤션
- **네이밍**: 
  - 파일: PascalCase (예: `ContextAnalyzer.ts`)
  - 컴포넌트: PascalCase (예: `ActionButton`)
  - 함수/변수: camelCase (예: `extractEntities`)
  - 상수: UPPER_SNAKE_CASE (예: `MAX_CONTEXT_AGE`)
  
- **폴더 구조**: Feature-based organization
- **Import 순서**: React → 써드파티 → 내부 모듈 → 스타일
- **주석**: 복잡한 로직, AI 모델 파라미터, 개인정보 처리 부분에 필수

### TypeScript 사용 규칙
```typescript
// 모든 props에 타입 정의
interface ActionButtonProps {
  onPress: () => void;
  label: string;
  disabled?: boolean;
}

// 모든 함수에 반환 타입 명시
async function analyzeContext(text: string): Promise<ContextResult> {
  // ...
}
```

### 테스트 전략
- **Unit Tests**: 모든 유틸리티 함수, AI 분석 로직 (커버리지 80% 이상)
- **Integration Tests**: 맥락 수집 → 분석 → 액션 실행 파이프라인
- **E2E Tests**: 주요 유스케이스 3가지 (Detox 사용)
- **Privacy Tests**: 민감 정보 필터링, 권한 관리

### 성능 요구사항
- **맥락 분석 속도**: <500ms (온디바이스)
- **배터리 영향**: 백그라운드 처리 시 <5% 추가 소모
- **메모리 사용**: 상시 <100MB
- **앱 실행 시간**: <2초

### 보안 및 개인정보 보호
- **온디바이스 처리**: 모든 AI 분석은 로컬에서 수행
- **데이터 암호화**: SQLite 데이터베이스 암호화 (SQLCipher)
- **권한 최소화**: 필요한 권한만 요청, 사용자 명확히 고지
- **데이터 보유 기간**: 30일 후 자동 삭제 (사용자 설정 가능)
- **민감 정보 필터링**: 금융 정보, 의료 정보 등 자동 제외

---

## MVP (Minimum Viable Product) 범위

### Phase 1: 핵심 기능 구현 (4주)
#### Week 1-2: Context Capture
- [ ] 스크린샷 캡처 및 OCR
- [ ] 기본 텍스트 분석 (날짜, 시간 추출)
- [ ] 로컬 데이터베이스 구축

#### Week 3-4: Action Executor
- [ ] 캘린더 연동 (일정 등록)
- [ ] 기본 알림 시스템
- [ ] 단순 UI (리스트 뷰)

### Phase 2: 유스케이스 확장 (4주)
- [ ] 경조사 관리 기능
- [ ] 쇼핑 위시리스트 기능
- [ ] 가격 추적 (웹 스크래핑)

### Phase 3: AI 고도화 (4주)
- [ ] BERT 모델 통합 (의도 분류)
- [ ] 엔티티 추출 정확도 향상
- [ ] 적시 알림 로직 최적화

---

## 외부 연동 계획

### 필수 연동
- **캘린더**: Google Calendar API, Apple Calendar
- **알림**: FCM (Android), APNs (iOS)
- **권한**: Accessibility Service (Android), Screen Recording (iOS)

### 선택적 연동
- **뱅킹**: 딥링크 방식 (앱 간 전환)
- **쇼핑몰**: 주요 쇼핑몰 API (쿠팡, 네이버 쇼핑 등)
- **업무 도구**: Slack API, Notion API
- **위치**: Google Maps API, Kakao Maps API

---

## 기술적 도전 과제

### 1. 온디바이스 AI 성능
- **문제**: 모바일 환경에서 ML 모델 실행 속도 및 배터리 소모
- **해결 방안**: 
  - 모델 경량화 (Quantization, Pruning)
  - 배치 처리 및 우선순위 큐
  - 백그라운드 처리 최적화

### 2. 접근성 권한 확보
- **문제**: Android/iOS 플랫폼별 권한 정책 차이
- **해결 방안**:
  - Android: Accessibility Service 활용
  - iOS: 제한적 접근 (Screen Recording 권한)
  - 대안: 사용자가 수동으로 스크린샷 공유

### 3. 개인정보 보호
- **문제**: 민감한 정보 처리 시 법적/윤리적 리스크
- **해결 방안**:
  - 온디바이스 처리 원칙
  - 명확한 개인정보 처리 방침
  - 데이터 자동 삭제 정책

### 4. 맥락 이해의 정확도
- **문제**: AI가 의도를 잘못 해석할 경우 잘못된 액션 실행
- **해결 방안**:
  - 액션 실행 전 사용자 확인 단계
  - 학습 데이터 지속적 개선
  - 사용자 피드백 루프 구축

---

## 비즈니스 모델 (참고)

### 프리미엄 기능 (월 구독)
- 무제한 맥락 저장 (무료: 최근 30일)
- 고급 AI 분석 (의도 분류 정확도 향상)
- 다중 기기 동기화
- 우선 고객 지원

### 목표 지표
- DAU (Daily Active Users): 10,000명 (6개월 내)
- 유료 전환율: 5%
- 일일 액션 실행 수: 평균 3회/사용자
- 사용자 만족도: NPS 50+ 

---

## 팀 협업 규칙

### Git 워크플로우
- **브랜치 전략**: Git Flow
  - `main`: 프로덕션
  - `develop`: 개발 통합
  - `feature/*`: 기능 개발
  - `hotfix/*`: 긴급 수정

- **커밋 메시지 규칙**:
```
<type>(<scope>): <subject>

type: feat, fix, refactor, test, docs, chore
scope: capture, analysis, action, ui 등

예시:
feat(capture): add screenshot OCR functionality
fix(analysis): resolve date parsing error
```

### 코드 리뷰 프로세스
- 모든 PR은 1명 이상 리뷰 필수
- AI 분석 로직은 2명 이상 리뷰
- 개인정보 관련 코드는 보안 체크리스트 확인

### 문서화
- 새로운 기능 추가 시 `docs/` 업데이트
- API 변경 시 CHANGELOG.md 작성
- 복잡한 알고리즘은 별도 문서 작성

---

## 다음 단계

### 즉시 필요한 작업
1. **기술 스택 확정**: 위 가정된 스택 검토 및 확정
2. **개발 환경 설정**: React Native 프로젝트 초기화
3. **데이터 모델 설계**: Context, Action, User 스키마 정의
4. **프로토타입 개발**: MVP Phase 1 시작

### 논의 필요 사항
- [ ] 플랫폼 우선순위 (iOS 먼저 vs Android 먼저 vs 동시 개발)
- [ ] AI 모델 선택 (TensorFlow Lite vs ONNX vs 기타)
- [ ] 클라우드 백업 필요 여부
- [ ] 팀 구성 및 역할 분담

---

## 참고 자료
- [React Native 공식 문서](https://reactnative.dev/)
- [TensorFlow Lite 모바일 가이드](https://www.tensorflow.org/lite/guide)
- [Android Accessibility Guide](https://developer.android.com/guide/topics/ui/accessibility)
- [iOS Screen Recording API](https://developer.apple.com/documentation/replaykit)

---

**마지막 업데이트**: 2025-01-16
**문서 버전**: 0.1.0 (초안)
**작성자**: DevInstructor + User
