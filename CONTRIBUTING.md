# Contributing to Momentum

Momentum 프로젝트에 기여해주셔서 감사합니다! 이 문서는 프로젝트에 효과적으로 기여하는 방법을 안내합니다.

---

## 목차

1. [시작하기 전에](#시작하기-전에)
2. [개발 환경 설정](#개발-환경-설정)
3. [작업 프로세스](#작업-프로세스)
4. [코딩 컨벤션](#코딩-컨벤션)
5. [커밋 가이드라인](#커밋-가이드라인)
6. [Pull Request 프로세스](#pull-request-프로세스)
7. [테스트 가이드](#테스트-가이드)
8. [문서화 가이드](#문서화-가이드)
9. [코드 리뷰 프로세스](#코드-리뷰-프로세스)
10. [버그 리포트](#버그-리포트)
11. [기능 제안](#기능-제안)

---

## 시작하기 전에

### 행동 강령

이 프로젝트는 기여자 규약 행동 강령을 따릅니다:

- **존중**: 모든 기여자를 존중하고 배려합니다
- **건설적 피드백**: 개선을 위한 구체적이고 친절한 제안을 합니다
- **투명한 소통**: 문제와 해결 과정을 명확히 공유합니다
- **협력**: 팀의 성공을 개인의 성과보다 우선합니다

### 기여 유형

다음과 같은 방식으로 기여할 수 있습니다:

- 🐛 **버그 수정**: 발견한 버그를 수정합니다
- ✨ **새로운 기능**: 기능을 구현합니다
- 📝 **문서 개선**: 문서를 작성하거나 개선합니다
- 🧪 **테스트 추가**: 테스트 커버리지를 높입니다
- 🎨 **UI/UX 개선**: 사용자 경험을 향상시킵니다
- ⚡ **성능 최적화**: 앱 성능을 개선합니다
- 🌐 **번역**: 다국어 지원을 추가합니다

### 커뮤니케이션 채널

- **GitHub Issues**: 버그 리포트, 기능 제안
- **GitHub Discussions**: 일반적인 질문, 토론
- **Slack**: [Momentum Workspace](https://momentum-dev.slack.com)
- **이메일**: momentum-dev@example.com

---

## 개발 환경 설정

### 1. 저장소 포크 및 클론

```bash
# 1. GitHub에서 저장소 포크

# 2. 포크한 저장소 클론
git clone https://github.com/YOUR_USERNAME/momentum.git
cd momentum

# 3. 원본 저장소를 upstream으로 추가
git remote add upstream https://github.com/original-org/momentum.git

# 4. upstream 확인
git remote -v
```

### 2. 의존성 설치

```bash
# Node.js 의존성 설치
npm install

# Android 의존성 설치
cd android
./gradlew build
cd ..

# iOS 의존성 설치 (Mac에서만, 향후 지원)
# cd ios
# pod install
# cd ..
```

### 3. 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 편집
# NOTION_API_KEY=your_key_here
# SLACK_WEBHOOK=your_webhook_here
```

### 4. 개발 서버 실행

```bash
# Metro 번들러 시작
npm start

# 새 터미널에서 Android 앱 실행
npm run android

# 개발 중 로그 확인
adb logcat | grep Momentum
```

### 5. 개발 도구 설정

#### VS Code 확장 프로그램 (권장)

- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포맷팅
- **React Native Tools**: RN 디버깅
- **TypeScript**: 타입 체크
- **GitLens**: Git 히스토리 시각화

#### VS Code 설정

`.vscode/settings.json` 파일 생성:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## 작업 프로세스

### 1. 이슈 확인 및 생성

작업 시작 전에 관련 이슈를 확인하거나 생성합니다:

```bash
# GitHub Issues에서 할당된 이슈 확인
# 또는 새 이슈 생성
```

이슈 템플릿:

```markdown
## 설명
[이슈에 대한 명확한 설명]

## 재현 방법 (버그인 경우)
1. ...
2. ...

## 예상 동작
[무엇이 일어나야 하는지]

## 실제 동작
[실제로 무엇이 일어났는지]

## 환경
- OS: [예: Android 12]
- 앱 버전: [예: 1.0.0]

## 스크린샷
[필요시 스크린샷 첨부]
```

### 2. 브랜치 생성

```bash
# develop 브랜치에서 최신 코드 받기
git checkout develop
git pull upstream develop

# 새 브랜치 생성
git checkout -b feature/meeting-recorder

# 브랜치 네이밍 규칙:
# feature/[기능명]  - 새 기능
# fix/[버그명]      - 버그 수정
# refactor/[대상]   - 리팩토링
# test/[테스트명]   - 테스트 추가
# docs/[문서명]     - 문서 작업
```

### 3. 개발 진행

```bash
# 코드 작성
# ...

# 변경사항 확인
git status
git diff

# 린트 검사
npm run lint

# 타입 체크
npm run type-check

# 테스트 실행
npm test
```

### 4. 커밋

```bash
# 변경사항 스테이징
git add .

# 커밋 (커밋 메시지 규칙 준수)
git commit -m "feat(capture): add audio recording pause functionality"

# 커밋 전 자동 검사 (husky)
# - ESLint
# - TypeScript 타입 체크
# - 유닛 테스트
```

### 5. Push 및 Pull Request

```bash
# 원격 브랜치에 푸시
git push origin feature/meeting-recorder

# GitHub에서 Pull Request 생성
# Base: develop ← Compare: feature/meeting-recorder
```

---

## 코딩 컨벤션

### TypeScript 스타일

#### 네이밍 규칙

```typescript
// ✅ 좋은 예시

// 파일명: PascalCase
// TaskCard.tsx, AudioRecorder.ts

// 컴포넌트: PascalCase
function TaskCard({ task }: TaskCardProps) { ... }

// 함수/변수: camelCase
const extractEntities = (text: string) => { ... };
const userTask = await getTask(id);

// 상수: UPPER_SNAKE_CASE
const MAX_RECORDING_TIME = 3600;
const API_BASE_URL = 'https://api.momentum.com';

// 타입/인터페이스: PascalCase
interface Task { ... }
type TaskStatus = 'pending' | 'completed';

// Boolean: is/has/can 접두사
const isRecording = true;
const hasPermission = await checkPermission();
const canEdit = user.role === 'admin';

// Private 메서드: _ 접두사
class AudioRecorder {
  private _validateState() { ... }
}
```

#### 타입 정의

```typescript
// ✅ 모든 함수에 명시적 타입
async function analyzeContext(text: string): Promise<TaskContext> {
  // ...
}

// ✅ 인터페이스 우선, type은 유니온이나 복잡한 타입에만
interface Task {
  id: string;
  title: string;
}

type TaskStatus = 'pending' | 'in_progress' | 'completed';

// ✅ 제네릭 활용
async function fetchData<T>(url: string): Promise<T> {
  // ...
}

// ❌ any 사용 금지 (불가피한 경우 unknown 사용 후 타입 가드)
function process(data: any) { ... } // ❌

function process(data: unknown) {   // ✅
  if (typeof data === 'string') {
    // ...
  }
}
```

#### Import 순서

```typescript
// 1. React
import React, { useState, useEffect } from 'react';

// 2. 써드파티 라이브러리
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 3. 내부 모듈 (절대 경로)
import { TaskService } from '@/services/TaskService';
import { useTaskStore } from '@/store/taskStore';

// 4. 상대 경로 컴포넌트
import { TaskCard } from './TaskCard';
import { RecordButton } from './RecordButton';

// 5. 타입
import type { Task, TaskContext } from '@/models/Task';

// 6. 스타일
import styles from './TaskList.styles';
```

### React Native 컴포넌트

#### 컴포넌트 구조

```typescript
// src/features/work/components/TaskCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { Task } from '@/models/Task';
import styles from './TaskCard.styles';

// 1. Props 인터페이스 정의
interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onComplete: (taskId: string) => void;
  style?: ViewStyle;
}

// 2. 컴포넌트 함수
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onComplete,
  style,
}) => {
  // 3. Hooks
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 4. Event handlers
  const handlePress = () => {
    setIsExpanded(!isExpanded);
    onPress(task);
  };
  
  const handleComplete = () => {
    onComplete(task.id);
  };
  
  // 5. Render helpers (필요시)
  const renderDeadline = () => {
    if (!task.deadline) return null;
    return <Text style={styles.deadline}>{formatDate(task.deadline)}</Text>;
  };
  
  // 6. Main render
  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={handlePress}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        {renderDeadline()}
      </View>
      {isExpanded && (
        <Text style={styles.description}>{task.description}</Text>
      )}
      <TouchableOpacity onPress={handleComplete}>
        <Text style={styles.completeButton}>완료</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
```

#### 스타일 정의

```typescript
// TaskCard.styles.ts

import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/shared/constants';

export default StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    flex: 1,
  },
  deadline: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  // ...
});
```

### 주석 작성 규칙

```typescript
// ❌ 나쁜 주석 (코드가 이미 명확함)
// 사용자 ID를 가져옴
const userId = user.id;

// ✅ 좋은 주석 (의도나 이유 설명)
// 캐시를 우회하여 최신 데이터를 가져옴
// 결제 처리 중에는 동시성 문제를 방지하기 위해 필요
const userData = await getUserById(userId, { bypassCache: true });

// ✅ 복잡한 로직 설명
/**
 * Luhn 알고리즘을 사용하여 신용카드 번호 유효성 검증
 * 
 * 알고리즘:
 * 1. 오른쪽에서 두 번째 자리부터 시작하여 매 두 번째 자리의 숫자를 2배로
 * 2. 2배 값이 10 이상이면 각 자리 숫자를 더함
 * 3. 모든 숫자의 합이 10으로 나누어 떨어지면 유효
 */
function validateCreditCard(number: string): boolean {
  // ...
}

// ✅ JSDoc 주석 (public API)
/**
 * 오디오 파일을 텍스트로 변환합니다.
 * 
 * @param audioFile - 변환할 오디오 파일
 * @param options - 변환 옵션
 * @returns 변환된 텍스트 및 메타데이터
 * @throws {RecordingError} 파일 형식이 지원되지 않을 경우
 * 
 * @example
 * ```typescript
 * const transcript = await stt.convert(audioFile, {
 *   language: 'ko-KR',
 *   enablePunctuation: true
 * });
 * ```
 */
async function convert(
  audioFile: AudioFile,
  options?: STTOptions
): Promise<Transcript> {
  // ...
}
```

---

## 커밋 가이드라인

### 커밋 메시지 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type

- **feat**: 새로운 기능
- **fix**: 버그 수정
- **refactor**: 리팩토링 (기능 변경 없음)
- **style**: 코드 포맷팅 (세미콜론, 들여쓰기 등)
- **test**: 테스트 추가 또는 수정
- **docs**: 문서 변경
- **chore**: 빌드, 설정 파일 변경
- **perf**: 성능 개선

#### Scope

변경된 모듈이나 영역:

- `capture`: Context Capture 모듈
- `analysis`: Context Analysis 모듈
- `action`: Action Executor 모듈
- `ui`: UI 컴포넌트
- `task`: Task 관련 기능
- `notification`: 알림 기능
- `storage`: 데이터 저장
- `api`: API 통합

#### Subject

- 50자 이내로 간결하게
- 명령형 현재 시제 사용 (add, fix, update)
- 첫 글자는 소문자
- 마침표 없음

#### Body (선택)

- 72자마다 줄바꿈
- 무엇을, 왜 변경했는지 설명
- 어떻게 변경했는지는 코드를 보면 알 수 있으므로 생략

#### Footer (선택)

- 이슈 참조: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`

### 커밋 예시

#### 기본 커밋

```bash
feat(capture): add audio recording pause functionality
```

#### 상세 설명 포함

```bash
feat(capture): add audio recording pause functionality

Users can now pause and resume recording during meetings.
This helps when there's a break or sensitive information being discussed.

- Add pause() and resume() methods to AudioRecorder
- Update recording state machine
- Add tests for pause/resume flow

Closes #45
```

#### 버그 수정

```bash
fix(analysis): resolve date parsing error for Korean text

Fixed an issue where relative dates like "다음 주" were not
correctly parsed. Now supports various Korean date expressions.

Fixes #78
```

#### Breaking Change

```bash
refactor(api): change Task interface structure

BREAKING CHANGE: Task.assignee is now Task.assignees (array)

This allows multiple assignees per task. Migration script provided
in scripts/migrate-assignees.ts

Closes #92
```

---

## Pull Request 프로세스

### 1. PR 생성 전 체크리스트

- [ ] 코드가 lint 검사를 통과하는가?
- [ ] 타입 체크가 통과하는가?
- [ ] 유닛 테스트가 통과하는가?
- [ ] 새 기능에 대한 테스트를 추가했는가?
- [ ] 문서를 업데이트했는가?
- [ ] 커밋 메시지가 규칙을 따르는가?
- [ ] 브랜치가 develop의 최신 코드를 반영하는가?

```bash
# develop 최신화
git checkout develop
git pull upstream develop
git checkout feature/my-feature
git rebase develop

# 검사 실행
npm run lint
npm run type-check
npm test
```

### 2. PR 템플릿

```markdown
## 변경 사항
[변경 내용을 간단히 설명]

## 변경 이유
[왜 이 변경이 필요한지 설명]

## 테스트 방법
1. [테스트 단계 1]
2. [테스트 단계 2]
3. [예상 결과]

## 스크린샷 (UI 변경인 경우)
[Before]
[After]

## 체크리스트
- [ ] 코드 린트 통과
- [ ] 타입 체크 통과
- [ ] 유닛 테스트 추가
- [ ] 문서 업데이트
- [ ] Self-review 완료

## 관련 이슈
Closes #[이슈 번호]

## 추가 컨텍스트
[필요시 추가 정보]
```

### 3. PR 규칙

#### 크기

- 가능한 작게 유지 (변경 라인 수 300라인 이하 권장)
- 큰 작업은 여러 PR로 분할

#### 리뷰어

- 최소 1명의 리뷰어 지정
- AI/ML 관련 코드는 2명 이상
- 개인정보 관련 코드는 보안 리뷰 필수

#### 리뷰 응답 시간

- 리뷰어는 24시간 이내 응답 목표
- 긴급한 경우 Slack에서 알림

---

## 테스트 가이드

### 테스트 전략

```
총 테스트 커버리지: 80% 이상

- Unit Tests: 70%
- Integration Tests: 20%
- E2E Tests: 10%
```

### Unit Test

```typescript
// __tests__/unit/EntityExtractor.test.ts

import { EntityExtractor } from '@/core/contextAnalysis/EntityExtractor';

describe('EntityExtractor', () => {
  let extractor: EntityExtractor;
  
  beforeEach(() => {
    extractor = new EntityExtractor();
  });
  
  describe('extractDeadline', () => {
    it('should extract relative date', async () => {
      const text = "다음 주 금요일까지 보고서 제출";
      const deadline = await extractor.extractDeadline(text);
      
      expect(deadline).toBeDefined();
      expect(deadline!.getDay()).toBe(5); // 금요일
    });
    
    it('should extract absolute date', async () => {
      const text = "2025년 1월 20일까지 제안서 작성";
      const deadline = await extractor.extractDeadline(text);
      
      expect(deadline).toEqual(new Date('2025-01-20'));
    });
    
    it('should return null for no deadline', async () => {
      const text = "회의록을 공유합니다";
      const deadline = await extractor.extractDeadline(text);
      
      expect(deadline).toBeNull();
    });
  });
});
```

### Integration Test

```typescript
// __tests__/integration/TaskCreation.test.ts

import { TaskService } from '@/services/TaskService';
import { IntentClassifier } from '@/core/contextAnalysis/IntentClassifier';
import { EntityExtractor } from '@/core/contextAnalysis/EntityExtractor';

describe('Task Creation Flow', () => {
  let taskService: TaskService;
  let classifier: IntentClassifier;
  let extractor: EntityExtractor;
  
  beforeAll(async () => {
    // 테스트 DB 초기화
    await setupTestDatabase();
    
    taskService = new TaskService();
    classifier = new IntentClassifier();
    extractor = new EntityExtractor();
  });
  
  afterAll(async () => {
    await cleanupTestDatabase();
  });
  
  it('should create task from meeting transcript', async () => {
    const transcript = "다음 주 금요일까지 제안서 초안 보내드리겠습니다";
    
    // 1. 의도 분류
    const intent = await classifier.classify(transcript);
    expect(intent.type).toBe('task_creation');
    
    // 2. 엔티티 추출
    const entities = await extractor.extract(transcript, intent.type);
    expect(entities.taskTitle).toContain('제안서');
    
    // 3. 업무 생성
    const task = await taskService.createFromContext({
      id: 'test-ctx-1',
      type: 'text',
      transcript: { text: transcript, ... },
      intent,
      entities,
      createdAt: new Date(),
    });
    
    // 4. 검증
    expect(task.title).toBe('제안서 초안');
    expect(task.deadline).toBeDefined();
    expect(task.status).toBe('pending');
    
    // 5. DB 확인
    const savedTask = await taskService.getTask(task.id);
    expect(savedTask).toEqual(task);
  });
});
```

### E2E Test

```typescript
// __tests__/e2e/RecordAndCreateTask.e2e.ts

import { by, device, element, expect as detoxExpect } from 'detox';

describe('Record and Create Task', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  
  beforeEach(async () => {
    await device.reloadReactNative();
  });
  
  it('should record meeting and create task', async () => {
    // 1. 미팅 녹음 화면으로 이동
    await element(by.id('record-tab')).tap();
    
    // 2. 녹음 시작
    await element(by.id('record-button')).tap();
    await detoxExpect(element(by.id('recording-indicator'))).toBeVisible();
    
    // 3. 잠시 대기 (시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 4. 녹음 중지
    await element(by.id('stop-button')).tap();
    
    // 5. 분석 진행 대기
    await waitFor(element(by.id('analysis-complete')))
      .toBeVisible()
      .withTimeout(10000);
    
    // 6. 생성된 업무 확인
    await element(by.id('task-tab')).tap();
    await detoxExpect(element(by.id('task-item-0'))).toBeVisible();
    
    // 7. 업무 세부 정보 확인
    await element(by.id('task-item-0')).tap();
    await detoxExpect(element(by.id('task-title'))).toHaveText('제안서 초안');
  });
});
```

---

## 문서화 가이드

### 코드 문서화

모든 public API는 JSDoc 주석 필수:

```typescript
/**
 * 오디오 파일을 텍스트로 변환합니다.
 * 
 * 이 메서드는 Whisper 모델을 사용하여 음성 인식을 수행합니다.
 * 처리 시간은 오디오 길이의 약 0.5배입니다.
 * 
 * @param audioFile - 변환할 오디오 파일
 * @param options - 변환 옵션
 * @param options.language - 언어 코드 (기본값: 'ko-KR')
 * @param options.enablePunctuation - 구두점 추가 여부 (기본값: true)
 * 
 * @returns 변환된 텍스트 및 메타데이터를 포함한 Transcript 객체
 * 
 * @throws {RecordingError} 파일 형식이 지원되지 않을 경우
 * @throws {AnalysisError} 음성 인식 실패 시
 * 
 * @example
 * ```typescript
 * const stt = new SpeechToText();
 * const transcript = await stt.convert(audioFile, {
 *   language: 'ko-KR',
 *   enablePunctuation: true
 * });
 * console.log(transcript.text);
 * ```
 * 
 * @see {@link Transcript} 반환 타입 상세
 * @see {@link STTOptions} 옵션 상세
 * 
 * @since 1.0.0
 */
async function convert(
  audioFile: AudioFile,
  options?: STTOptions
): Promise<Transcript> {
  // ...
}
```

### README 업데이트

새 기능 추가 시 README.md 업데이트:

- 기능 설명 추가
- 사용 예시 추가
- 스크린샷 업데이트 (UI 변경 시)

### 문서 파일 업데이트

관련 문서 파일 업데이트:

- **ARCHITECTURE.md**: 아키텍처 변경 시
- **API.md**: API 변경 시
- **CHANGELOG.md**: 모든 변경사항

---

## 코드 리뷰 프로세스

### 리뷰어 역할

#### 확인 사항

- [ ] 코드가 요구사항을 충족하는가?
- [ ] 코드가 이해하기 쉬운가?
- [ ] 코딩 컨벤션을 따르는가?
- [ ] 테스트가 충분한가?
- [ ] 성능 이슈가 없는가?
- [ ] 보안 취약점이 없는가?
- [ ] 에러 처리가 적절한가?
- [ ] 문서가 업데이트되었는가?

#### 리뷰 코멘트 예시

```markdown
# 좋은 코멘트 ✅

**제안:** 이 함수가 100줄이 넘어서 가독성이 떨어집니다. 
검증 로직을 별도 함수로 분리하는 건 어떨까요?

```typescript
function validateTask(task: Task): ValidationResult {
  // 검증 로직
}
```

**질문:** deadline이 과거인 경우는 어떻게 처리하나요? 
테스트 케이스에 추가하면 좋을 것 같습니다.

**긍정적 피드백:** 에러 처리가 잘 되어 있네요! 
특히 재시도 로직이 robust합니다. 👍
```

```markdown
# 나쁜 코멘트 ❌

이 코드는 잘못되었습니다. 다시 작성하세요.
→ 구체적 개선 방안 없음

왜 이렇게 작성했나요?
→ 비판적인 톤, 건설적이지 않음

이건 상식 아닌가요?
→ 무례함, 초보자 배려 부족
```

### 작성자 역할

#### 피드백 수용

- 모든 코멘트에 응답
- 변경 사항은 새 커밋으로 추가
- 논의가 필요한 경우 Slack에서 실시간 논의
- 리뷰 완료 후 "리뷰 반영 완료" 코멘트

#### 변경 요청 처리

```bash
# 리뷰 피드백 반영
git add .
git commit -m "refactor: extract validation logic as suggested"
git push origin feature/my-feature

# PR에 코멘트
# "리뷰 피드백을 반영했습니다. 다시 확인 부탁드립니다."
```

---

## 버그 리포트

버그를 발견하면 GitHub Issues에 등록해주세요.

### 버그 리포트 템플릿

```markdown
## 버그 설명
[버그에 대한 명확하고 간결한 설명]

## 재현 방법
1. '...' 로 이동
2. '...' 클릭
3. '...' 스크롤
4. 오류 확인

## 예상 동작
[무엇이 일어나야 하는지]

## 실제 동작
[실제로 무엇이 일어났는지]

## 스크린샷
[필요시 스크린샷 첨부]

## 환경
- OS: [예: Android 12]
- 디바이스: [예: Samsung Galaxy S21]
- 앱 버전: [예: 1.0.0]

## 추가 컨텍스트
[버그와 관련된 추가 정보]

## 가능한 해결 방법
[해결 방법을 알고 있다면 제안]
```

---

## 기능 제안

새로운 기능을 제안하려면 GitHub Issues에 등록해주세요.

### 기능 제안 템플릿

```markdown
## 기능 설명
[제안하는 기능에 대한 명확한 설명]

## 문제/동기
[이 기능이 해결하는 문제 또는 필요한 이유]

## 제안하는 해결 방법
[기능이 어떻게 작동해야 하는지]

## 대안
[고려한 다른 해결 방법]

## 추가 컨텍스트
[스크린샷, 목업, 또는 관련 예시]

## 우선순위
- [ ] Critical (필수)
- [ ] High (높음)
- [ ] Medium (보통)
- [ ] Low (낮음)
```

---

## 질문이 있으신가요?

- **Slack**: [Momentum Workspace](https://momentum-dev.slack.com)
- **Email**: momentum-dev@example.com
- **GitHub Discussions**: [Discussions](https://github.com/org/momentum/discussions)

---

**감사합니다!** 🎉

여러분의 기여가 Momentum을 더 나은 프로젝트로 만듭니다.
