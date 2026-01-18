# Momentum (모멘텀)

> "기억을 행동으로" - AI 기반 Context-Action Agent

업무 중 무심코 남긴 메모, 녹음, 대화를 AI가 이해하고, 적시에 실행 가능한 행동으로 변환하는 스마트 비서

![Status](https://img.shields.io/badge/status-MVP%20Development-yellow)
![Platform](https://img.shields.io/badge/platform-Android-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📖 목차

- [프로젝트 소개](#프로젝트-소개)
- [핵심 기능](#핵심-기능)
- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [개발 가이드](#개발-가이드)
- [기술 스택](#기술-스택)
- [로드맵](#로드맵)
- [기여하기](#기여하기)
- [라이선스](#라이선스)

---

## 🎯 프로젝트 소개

### 문제 정의
현대 직장인들은 하루에도 수십 개의 업무 요청을 받습니다. 미팅 중 "다음 주까지 보고서 보내주세요"라는 말을 듣고 메모하지만, 90%는 잊혀집니다.

### 해결 방안
**Momentum**은 사용자가 남긴 디지털 흔적(녹음, 메모, 채팅)을 AI가 분석하여, 업무를 자동으로 정리하고 적시에 알림과 실행 환경을 제공합니다.

### 타겟 사용자
- 동시다발적 업무를 처리하는 직장인
- 미팅과 이메일에 치이는 프로젝트 매니저
- 데드라인 관리에 어려움을 겪는 프리랜서

---

## ✨ 핵심 기능

### 1. 💝 경조사 관리 (Social Event Management)
- **AI 기반 정보 추출**: 채팅, 스크린샷에서 결혼식, 장례, 생일 등 자동 감지
- **캘린더 연동**: 경조사 일정 자동 등록 및 리마인드
- **축의금 송금**: 카카오페이, 토스, 네이버페이 연동
- **관계별 추천**: 관계에 따른 적정 축의금 금액 제안

**예시**:
```
친구 카톡: "다음 달 15일 결혼식이야" + 청첩장 이미지
        ↓
자동 추출: 일정(다음 달 15일), 유형(결혼식), 인물(친구)
        ↓
액션:
  1. 캘린더 등록 (알림: 당일 오전 9시, D-1, D-7)
  2. 축의금 송금 화면 준비 (관계별 추천 금액)
  3. 교통편 안내 (지도 앱 연동)
```

### 2. 🎤 자동 맥락 수집 (Context Capture)
- **미팅 녹음 분석**: 음성을 텍스트로 변환하여 업무 추출
- **채팅 메시지 분석**: Slack, 카톡에서 업무 키워드 자동 감지
- **스크린샷 OCR**: 화면 캡처에서 업무 정보 추출

**예시**:
```
미팅 녹음: "다음 주 금요일까지 Q4 제안서 초안 보내드릴게요"
        ↓
자동 추출: 업무(제안서 작성), 데드라인(다음 주 금요일), 유형(초안)
```

### 2. 🧠 지능형 업무 분석 (Context Analysis)
- **의도 분류**: 업무 요청, 일정 조율, 정보 공유 등 자동 분류
- **엔티티 추출**: 날짜, 시간, 담당자, 파일명 등 핵심 정보 식별
- **우선순위 판단**: 데드라인, 중요도, 관련자에 따른 우선순위 설정

**AI 처리 파이프라인**:
```
음성/텍스트 입력 → 전처리 → BERT 분석 → 엔티티 추출 → 업무 객체 생성
```

### 3. ⚡ 적시 행동 실행 (Just-in-Time Action)
- **할일 자동 등록**: Notion, Todoist 등 업무 관리 도구 연동
- **스마트 알림**: 데드라인 3일 전, 관련 자료 자동 준비
- **원클릭 작업 시작**: 문서 앱 실행 + 템플릿 로딩

**액션 실행 예시**:
```
데드라인 3일 전 알림:
┌─────────────────────────────────────┐
│ 📋 제안서 작성 시간입니다           │
│                                     │
│ 📁 참고 자료 준비됨:                │
│  - 지난 분기 제안서 (Q3_proposal.docx)│
│  - 고객사 요구사항 (requirements.pdf) │
│                                     │
│ [지금 시작하기] [1시간 후 알림]     │
└─────────────────────────────────────┘
```

---

## 🚀 시작하기

### 필수 요구사항

#### 개발 환경
- **Node.js**: 18.x 이상
- **npm**: 9.x 이상 또는 **yarn**: 1.22.x 이상
- **Android Studio**: Arctic Fox (2020.3.1) 이상
- **JDK**: 11 이상

#### Android 기기/에뮬레이터
- **Android OS**: 8.0 (API 26) 이상
- **권한**: 접근성 서비스, 마이크, 저장소

### 설치 방법

#### 1. 저장소 클론
```bash
git clone https://github.com/your-org/momentum.git
cd momentum
```

#### 2. 의존성 설치
```bash
# npm 사용 시
npm install

# yarn 사용 시
yarn install
```

#### 3. Android 설정
```bash
# Android 빌드 디렉토리로 이동
cd android

# Gradle 래퍼 실행 권한 부여
chmod +x gradlew

# 의존성 다운로드
./gradlew build
```

#### 4. 환경 변수 설정
```bash
# 루트 디렉토리에 .env 파일 생성
cp .env.example .env

# .env 파일 편집 (필요한 API 키 입력)
# NOTION_API_KEY=your_notion_key
# SLACK_WEBHOOK=your_slack_webhook
```

#### 5. 개발 서버 실행
```bash
# Metro 번들러 시작
npm start

# 새 터미널에서 Android 앱 실행
npm run android
```

### 빠른 테스트

#### 1. 에뮬레이터에서 실행
```bash
# Android 에뮬레이터 시작 (Android Studio에서 AVD 생성 필요)
emulator -avd Pixel_5_API_30

# 앱 빌드 및 설치
npm run android
```

#### 2. 실제 기기에서 실행
```bash
# USB 디버깅 활성화 확인
adb devices

# 앱 설치
npm run android

# 로그 확인
adb logcat | grep Momentum
```

---

## 📁 프로젝트 구조

```
momentum/
├── src/
│   ├── core/                      # 핵심 AI 엔진
│   │   ├── contextCapture/       # 맥락 수집 모듈
│   │   │   ├── AudioRecorder.ts       # 음성 녹음
│   │   │   ├── SpeechToText.ts        # 음성→텍스트
│   │   │   └── ChatExtractor.ts       # 채팅 분석
│   │   │
│   │   ├── contextAnalysis/      # 맥락 분석 모듈
│   │   │   ├── IntentClassifier.ts    # 의도 분류
│   │   │   ├── EntityExtractor.ts     # 엔티티 추출
│   │   │   └── TaskBuilder.ts         # 업무 객체 생성
│   │   │
│   │   └── actionExecutor/       # 액션 실행 모듈
│   │       ├── TaskManager.ts         # 할일 관리
│   │       ├── NotificationService.ts # 알림 서비스
│   │       └── AppLauncher.ts         # 앱 실행
│   │
│   ├── features/                 # 기능 모듈
│   │   ├── social/               # 경조사 관리 ✅
│   │   │   ├── components/           # UI 컴포넌트
│   │   │   ├── screens/              # 화면
│   │   │   └── services/             # 비즈니스 로직
│   │   └── work/                 # 업무 관리
│   │       ├── screens/
│   │       │   ├── TaskListScreen.tsx
│   │       │   ├── TaskDetailScreen.tsx
│   │       │   └── MeetingRecordScreen.tsx
│   │       ├── components/
│   │       │   ├── TaskCard.tsx
│   │       │   ├── RecordButton.tsx
│   │       │   └── ActionButton.tsx
│   │       └── services/
│   │           ├── TaskService.ts
│   │           └── MeetingService.ts
│   │
│   ├── shared/                   # 공통 모듈
│   │   ├── components/           # 재사용 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Input.tsx
│   │   ├── hooks/                # 커스텀 훅
│   │   │   ├── useAudioRecorder.ts
│   │   │   ├── useTaskManager.ts
│   │   │   └── useNotification.ts
│   │   ├── utils/                # 유틸리티
│   │   │   ├── dateUtils.ts
│   │   │   ├── textUtils.ts
│   │   │   └── storageUtils.ts
│   │   ├── models/               # 데이터 모델
│   │   │   ├── Task.ts
│   │   │   ├── Context.ts
│   │   │   └── Action.ts
│   │   └── constants/            # 상수
│   │       ├── colors.ts
│   │       ├── sizes.ts
│   │       └── config.ts
│   │
│   ├── navigation/               # 내비게이션
│   │   ├── AppNavigator.tsx
│   │   └── routes.ts
│   │
│   ├── store/                    # 전역 상태 (Zustand)
│   │   ├── taskStore.ts
│   │   ├── contextStore.ts
│   │   └── userStore.ts
│   │
│   └── services/                 # 외부 서비스 연동
│       ├── NotionService.ts
│       ├── SlackService.ts
│       └── StorageService.ts
│
├── android/                      # Android 네이티브 코드
│   ├── app/
│   │   └── src/
│   │       └── main/
│   │           ├── java/         # 접근성 서비스 등
│   │           └── AndroidManifest.xml
│   └── build.gradle
│
├── assets/                       # 정적 리소스
│   ├── images/
│   ├── fonts/
│   └── ai-models/               # TensorFlow Lite 모델
│       └── intent-classifier.tflite
│
├── __tests__/                    # 테스트
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/                         # 문서
│   ├── ARCHITECTURE.md          # 아키텍처 설명
│   ├── API.md                   # 내부 API 문서
│   └── DEPLOYMENT.md            # 배포 가이드
│
├── .env.example                  # 환경 변수 템플릿
├── .eslintrc.js                  # ESLint 설정
├── .prettierrc                   # Prettier 설정
├── tsconfig.json                 # TypeScript 설정
├── package.json                  # 의존성 관리
├── CLAUDE.md                     # Claude Code 컨텍스트
├── CONTRIBUTING.md               # 기여 가이드
└── README.md                     # 이 파일
```

---

## 🛠 개발 가이드

### 코딩 컨벤션

#### TypeScript 스타일
```typescript
// ✅ 좋은 예시
interface TaskProps {
  id: string;
  title: string;
  deadline: Date;
  onComplete: () => void;
}

async function analyzeContext(text: string): Promise<TaskContext> {
  // 함수 로직
  return taskContext;
}

// ❌ 나쁜 예시
function analyze(t) {
  // 타입 정의 없음
}
```

#### 네이밍 규칙
- **파일**: PascalCase (예: `TaskCard.tsx`)
- **컴포넌트**: PascalCase (예: `TaskCard`)
- **함수/변수**: camelCase (예: `extractEntities`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_RECORDING_TIME`)
- **타입/인터페이스**: PascalCase (예: `TaskContext`)

#### Import 순서
```typescript
// 1. React
import React, { useState, useEffect } from 'react';

// 2. 써드파티 라이브러리
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 3. 내부 모듈 (절대 경로)
import { TaskService } from '@/services/TaskService';
import { useTaskStore } from '@/store/taskStore';

// 4. 상대 경로
import { TaskCard } from './TaskCard';

// 5. 타입
import type { Task } from '@/models/Task';

// 6. 스타일
import styles from './styles';
```

### 테스트 작성

#### Unit Test 예시
```typescript
// __tests__/unit/EntityExtractor.test.ts
import { EntityExtractor } from '@/core/contextAnalysis/EntityExtractor';

describe('EntityExtractor', () => {
  describe('extractDeadline', () => {
    it('should extract relative date', () => {
      const text = "다음 주 금요일까지 보고서 제출";
      const deadline = EntityExtractor.extractDeadline(text);
      
      expect(deadline).toBeDefined();
      expect(deadline.getDay()).toBe(5); // 금요일
    });

    it('should extract absolute date', () => {
      const text = "2025년 1월 20일까지 제안서 작성";
      const deadline = EntityExtractor.extractDeadline(text);
      
      expect(deadline).toEqual(new Date('2025-01-20'));
    });
  });
});
```

#### Integration Test 예시
```typescript
// __tests__/integration/TaskCreation.test.ts
import { TaskService } from '@/services/TaskService';
import { IntentClassifier } from '@/core/contextAnalysis/IntentClassifier';

describe('Task Creation Flow', () => {
  it('should create task from meeting transcript', async () => {
    const transcript = "다음 주까지 제안서 초안 보내드리겠습니다";
    
    // 1. 의도 분류
    const intent = await IntentClassifier.classify(transcript);
    expect(intent.type).toBe('task_creation');
    
    // 2. 업무 생성
    const task = await TaskService.createFromContext(transcript);
    expect(task.title).toContain('제안서');
    expect(task.deadline).toBeDefined();
  });
});
```

### 브랜치 전략

```
main                    # 프로덕션 릴리스
  └── develop           # 개발 통합
        ├── feature/meeting-recorder    # 미팅 녹음 기능
        ├── feature/task-notification   # 업무 알림 기능
        └── feature/notion-integration  # Notion 연동
```

#### 브랜치 네이밍
- `feature/[기능명]`: 새 기능 개발
- `fix/[버그명]`: 버그 수정
- `refactor/[대상]`: 리팩토링
- `test/[테스트명]`: 테스트 추가

#### 커밋 메시지
```bash
# 형식
<type>(<scope>): <subject>

# 예시
feat(capture): add audio recording functionality
fix(analysis): resolve date parsing error for Korean text
refactor(task): extract validation logic to separate module
test(notification): add unit tests for alarm scheduling
docs(readme): update installation guide for Android
```

### 개발 워크플로우

```bash
# 1. 브랜치 생성
git checkout -b feature/meeting-recorder

# 2. 개발 진행
# ... 코드 작성 ...

# 3. 테스트 실행
npm test

# 4. 린트 검사
npm run lint

# 5. 커밋
git add .
git commit -m "feat(capture): add meeting recording with pause/resume"

# 6. Push
git push origin feature/meeting-recorder

# 7. Pull Request 생성 (GitHub에서)
```

---

## 🔧 기술 스택

### Frontend/Mobile
| 카테고리 | 기술 | 버전 | 사용 이유 |
|---------|------|------|----------|
| **프레임워크** | React Native | 0.73.x | 빠른 개발, 풍부한 생태계 |
| **언어** | TypeScript | 5.3.x | 타입 안정성, 개발자 경험 |
| **상태 관리** | Zustand | 4.5.x | 간결한 API, 작은 번들 크기 |
| **내비게이션** | React Navigation | 6.x | RN 표준 네비게이션 |
| **UI** | React Native Paper | 5.x | Material Design 기반 |
| **캘린더** | react-native-calendar-events | 2.2.x | iOS/Android 캘린더 통합 |

### AI/ML
| 카테고리 | 기술 | 버전 | 사용 이유 |
|---------|------|------|----------|
| **온디바이스 ML** | TensorFlow Lite | 2.15.x | 모바일 최적화 |
| **NLP** | BERT (경량) | - | 한국어 의도 분류 |
| **음성 인식** | Whisper (tiny) | - | 정확도와 속도 균형 |
| **OCR** | ML Kit | - | Google 제공, 무료 |

### Backend/Storage
| 카테고리 | 기술 | 버전 | 사용 이유 |
|---------|------|------|----------|
| **로컬 DB** | SQLite | 3.x | 경량, 내장형 |
| **암호화** | SQLCipher | 4.x | DB 보안 |
| **스토리지** | AsyncStorage | - | RN 표준 |

### 개발 도구
| 카테고리 | 기술 | 용도 |
|---------|------|------|
| **번들러** | Metro | RN 기본 번들러 |
| **린터** | ESLint | 코드 품질 |
| **포매터** | Prettier | 코드 스타일 |
| **테스트** | Jest | 단위/통합 테스트 |
| **E2E 테스트** | Detox | 엔드투엔드 테스트 |
| **CI/CD** | GitHub Actions | 자동화 빌드/배포 |

---

## 🗓 로드맵

### MVP Phase 1: 핵심 기능 (4주) ✅ 완료

#### Week 1-2: Context Capture
- [x] 프로젝트 초기 설정
- [x] 기본 UI 스캐폴딩
- [x] 경조사 데이터 모델 구현
- [x] 로컬 DB 구축 (SQLite)

#### Week 3-4: Context Analysis & Action
- [x] 키워드 기반 분류 구현
- [x] 캘린더 연동 구현
- [x] 송금 앱 딥링크 구현
- [x] 경조사 UI 컴포넌트 개발

### MVP Phase 2: Action Executor (4주)

#### Week 5-6: 알림 시스템
- [ ] 데드라인 기반 알림
- [ ] 우선순위 계산 로직
- [ ] 백그라운드 작업 스케줄링

#### Week 7-8: 외부 연동
- [ ] Notion API 연동
- [ ] 관련 파일 자동 검색
- [ ] 원클릭 작업 시작

### Phase 3: 고도화 (4주)

#### Week 9-10: 정확도 개선
- [ ] 학습 데이터 수집
- [ ] 모델 파인튜닝
- [ ] A/B 테스트

#### Week 11-12: 사용자 경험
- [ ] 온보딩 플로우
- [ ] 피드백 루프
- [ ] 성능 최적화

### 향후 계획
- **Q2 2025**: 업무 관리 기능 고도화
- **Q3 2025**: 쇼핑 관리 기능 추가
- **Q4 2025**: iOS 버전 출시

---

## 🤝 기여하기

### 기여 방법
1. 이슈 확인 또는 생성
2. 브랜치 생성 (`feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

자세한 내용은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참조하세요.

### 행동 강령
- 존중과 배려: 모든 기여자를 존중합니다
- 건설적 피드백: 개선을 위한 구체적 제안
- 투명한 소통: 이슈와 PR에서 명확히 소통

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 📞 연락처

- **이슈 트래커**: [GitHub Issues](https://github.com/your-org/momentum/issues)
- **이메일**: momentum-dev@example.com
- **Slack**: [Momentum Workspace](https://momentum-dev.slack.com)

---

## 🙏 감사의 말

- **TensorFlow Lite**: 온디바이스 ML 지원
- **OpenAI Whisper**: 음성 인식 모델
- **React Native Community**: 풍부한 생태계

---

**마지막 업데이트**: 2025-01-16  
**문서 버전**: 1.0.0  
**현재 상태**: MVP 개발 중
