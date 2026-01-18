# Momentum - Internal API Documentation

## 문서 개요

이 문서는 Momentum 앱 내부 모듈 간 API를 정의합니다. 각 모듈의 인터페이스, 타입, 사용 예시를 포함합니다.

**작성일**: 2025-01-16  
**버전**: 1.0.0  
**대상**: 개발자

---

## 목차

1. [Core APIs](#core-apis)
   - [Context Capture](#context-capture-api)
   - [Context Analysis](#context-analysis-api)
   - [Action Executor](#action-executor-api)
2. [Feature APIs](#feature-apis)
   - [Task Management](#task-management-api)
   - [Notification](#notification-api)
3. [Service APIs](#service-apis)
   - [Storage](#storage-api)
   - [External Integrations](#external-integration-apis)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)

---

## Core APIs

### Context Capture API

#### AudioRecorder

음성 녹음을 관리하는 핵심 모듈

##### Interface

```typescript
interface IAudioRecorder {
  /**
   * 녹음 시작
   * @throws {PermissionError} 마이크 권한이 없을 경우
   * @throws {RecordingError} 이미 녹음 중인 경우
   */
  start(): Promise<void>;
  
  /**
   * 녹음 일시 정지
   * @throws {RecordingError} 녹음 중이 아닐 경우
   */
  pause(): Promise<void>;
  
  /**
   * 녹음 재개
   * @throws {RecordingError} 일시정지 상태가 아닐 경우
   */
  resume(): Promise<void>;
  
  /**
   * 녹음 중지 및 파일 반환
   * @returns {AudioFile} 녹음된 오디오 파일 정보
   * @throws {RecordingError} 녹음 중이 아닐 경우
   */
  stop(): Promise<AudioFile>;
  
  /**
   * 현재 녹음 상태 확인
   * @returns {RecordingState} 현재 상태
   */
  getStatus(): RecordingState;
  
  /**
   * 녹음 시간 (초 단위)
   * @returns {number} 현재 녹음된 시간
   */
  getDuration(): number;
  
  /**
   * 실시간 음성 파형 데이터
   * @returns {number[]} 진폭 값 배열 (0-1 정규화)
   */
  getWaveform(): number[];
  
  /**
   * 이벤트 리스너 등록
   */
  on(event: AudioRecorderEvent, callback: (data: any) => void): void;
  off(event: AudioRecorderEvent, callback: (data: any) => void): void;
}
```

##### Types

```typescript
type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

type AudioRecorderEvent =
  | 'recordingStarted'
  | 'recordingPaused'
  | 'recordingResumed'
  | 'recordingStopped'
  | 'recordingError'
  | 'amplitudeChange';

interface AudioFile {
  path: string;
  duration: number; // 초 단위
  size: number; // 바이트 단위
  format: 'aac' | 'mp3' | 'wav';
  sampleRate: number;
  channels: number;
  createdAt: Date;
}

interface RecordingOptions {
  sampleRate?: number; // default: 16000
  channels?: number; // default: 1 (mono)
  encoding?: 'aac' | 'mp3' | 'wav'; // default: 'aac'
  bitRate?: number; // default: 128000
  maxDuration?: number; // 최대 녹음 시간 (초), default: 3600
}
```

##### Usage Example

```typescript
import { AudioRecorder } from '@/core/contextCapture/AudioRecorder';

// 초기화
const recorder = new AudioRecorder({
  sampleRate: 16000,
  channels: 1,
  encoding: 'aac',
});

// 이벤트 리스너
recorder.on('recordingStarted', () => {
  console.log('녹음 시작됨');
});

recorder.on('amplitudeChange', (amplitude: number) => {
  updateWaveformUI(amplitude);
});

// 녹음 시작
try {
  await recorder.start();
} catch (error) {
  if (error instanceof PermissionError) {
    // 권한 요청 UI 표시
    requestMicrophonePermission();
  }
}

// 녹음 중지
const audioFile = await recorder.stop();
console.log(`녹음 완료: ${audioFile.path}`);
```

---

#### SpeechToText

음성을 텍스트로 변환하는 모듈

##### Interface

```typescript
interface ISpeechToText {
  /**
   * 오디오 파일을 텍스트로 변환
   * @param {AudioFile} audioFile - 변환할 오디오 파일
   * @param {STTOptions} options - 변환 옵션
   * @returns {Transcript} 변환된 텍스트 및 메타데이터
   */
  convert(audioFile: AudioFile, options?: STTOptions): Promise<Transcript>;
  
  /**
   * 실시간 스트리밍 변환
   * @param {ReadableStream} audioStream - 오디오 스트림
   * @returns {Observable<PartialTranscript>} 실시간 변환 결과
   */
  convertStream(audioStream: ReadableStream): Observable<PartialTranscript>;
  
  /**
   * 지원 언어 목록
   * @returns {string[]} 지원 언어 코드 배열
   */
  getSupportedLanguages(): string[];
}
```

##### Types

```typescript
interface STTOptions {
  language?: string; // default: 'ko-KR'
  enablePunctuation?: boolean; // default: true
  enableDiarization?: boolean; // 화자 구분, default: false
  maxSpeakers?: number; // 화자 구분 시 최대 화자 수
  profanityFilter?: boolean; // 욕설 필터링, default: false
}

interface Transcript {
  text: string;
  segments: TranscriptSegment[];
  language: string;
  confidence: number; // 0-1
  duration: number; // 초 단위
  wordCount: number;
  processedAt: Date;
}

interface TranscriptSegment {
  text: string;
  start: number; // 시작 시간 (초)
  end: number; // 종료 시간 (초)
  confidence: number;
  speaker?: string; // 화자 ID (diarization 활성화 시)
  words?: Word[];
}

interface Word {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

interface PartialTranscript {
  text: string;
  isFinal: boolean;
  confidence: number;
}
```

##### Usage Example

```typescript
import { SpeechToText } from '@/core/contextCapture/SpeechToText';

const stt = new SpeechToText();

// 기본 변환
const transcript = await stt.convert(audioFile, {
  language: 'ko-KR',
  enablePunctuation: true,
  enableDiarization: true,
  maxSpeakers: 5,
});

console.log(`변환된 텍스트: ${transcript.text}`);
console.log(`신뢰도: ${transcript.confidence * 100}%`);

// 화자 구분
transcript.segments.forEach((segment) => {
  console.log(`[${segment.speaker}] ${segment.text}`);
});

// 실시간 변환
const stream = getAudioStream();
stt.convertStream(stream).subscribe({
  next: (partial) => {
    if (partial.isFinal) {
      console.log(`확정: ${partial.text}`);
    } else {
      console.log(`임시: ${partial.text}`);
    }
  },
  error: (error) => console.error(error),
  complete: () => console.log('변환 완료'),
});
```

---

### Context Analysis API

#### IntentClassifier

텍스트에서 사용자의 의도를 분류하는 모듈

##### Interface

```typescript
interface IIntentClassifier {
  /**
   * 텍스트의 의도 분류
   * @param {string} text - 분석할 텍스트
   * @param {ClassificationOptions} options - 분류 옵션
   * @returns {Intent} 분류된 의도
   */
  classify(text: string, options?: ClassificationOptions): Promise<Intent>;
  
  /**
   * 배치 분류 (성능 최적화)
   * @param {string[]} texts - 분석할 텍스트 배열
   * @returns {Intent[]} 분류된 의도 배열
   */
  classifyBatch(texts: string[]): Promise<Intent[]>;
  
  /**
   * 모델 재학습 (사용자 피드백 반영)
   * @param {TrainingData[]} data - 학습 데이터
   */
  retrain(data: TrainingData[]): Promise<void>;
}
```

##### Types

```typescript
type IntentType =
  | 'task_creation' // 업무 생성 요청
  | 'task_update' // 업무 변경 요청
  | 'meeting_schedule' // 미팅 일정 조율
  | 'information_sharing' // 정보 공유
  | 'status_inquiry' // 진행 상황 문의
  | 'deadline_extension' // 데드라인 연장 요청
  | 'task_delegation' // 업무 위임
  | 'unknown'; // 분류 불가

interface Intent {
  type: IntentType;
  confidence: number; // 0-1
  needsConfirmation: boolean; // 사용자 확인 필요 여부
  alternativeIntents?: Array<{
    type: IntentType;
    confidence: number;
  }>;
  extractedPhrases: string[]; // 의도 판단에 사용된 핵심 문구
}

interface ClassificationOptions {
  threshold?: number; // 최소 신뢰도 (default: 0.7)
  includeAlternatives?: boolean; // 대체 의도 포함 여부
  maxAlternatives?: number; // 최대 대체 의도 수
}

interface TrainingData {
  text: string;
  intent: IntentType;
  feedback: 'correct' | 'incorrect';
}
```

##### Usage Example

```typescript
import { IntentClassifier } from '@/core/contextAnalysis/IntentClassifier';

const classifier = new IntentClassifier();

// 단일 분류
const intent = await classifier.classify(
  "다음 주 금요일까지 제안서 초안 보내드리겠습니다",
  { threshold: 0.7, includeAlternatives: true }
);

if (intent.needsConfirmation) {
  // 사용자에게 확인 요청
  const confirmed = await askUserConfirmation(
    `"${intent.type}"로 인식했습니다. 맞습니까?`
  );
  
  if (!confirmed && intent.alternativeIntents) {
    // 대체 의도 중 선택
    showAlternativeIntents(intent.alternativeIntents);
  }
}

// 배치 분류 (성능 향상)
const segments = transcript.segments.map(s => s.text);
const intents = await classifier.classifyBatch(segments);

intents.forEach((intent, index) => {
  console.log(`Segment ${index}: ${intent.type} (${intent.confidence})`);
});
```

---

#### EntityExtractor

텍스트에서 핵심 엔티티를 추출하는 모듈

##### Interface

```typescript
interface IEntityExtractor {
  /**
   * 텍스트에서 엔티티 추출
   * @param {string} text - 분석할 텍스트
   * @param {IntentType} intent - 의도 유형 (추출 전략에 영향)
   * @returns {ExtractedEntities} 추출된 엔티티
   */
  extract(text: string, intent: IntentType): Promise<ExtractedEntities>;
  
  /**
   * 특정 엔티티 유형만 추출
   * @param {string} text - 분석할 텍스트
   * @param {EntityType} entityType - 추출할 엔티티 유형
   * @returns {any} 추출된 엔티티 값
   */
  extractSpecific<T>(text: string, entityType: EntityType): Promise<T | null>;
}
```

##### Types

```typescript
interface ExtractedEntities {
  // 시간 관련
  deadline?: Date;
  startDate?: Date;
  endDate?: Date;
  duration?: Duration;
  
  // 업무 관련
  taskTitle: string;
  taskType: TaskType;
  deliverables: string[];
  priority?: Priority;
  
  // 사람 관련
  assignee?: string;
  collaborators: string[];
  stakeholders: string[];
  
  // 위치 관련
  location?: string;
  meetingRoom?: string;
  
  // 파일/문서 관련
  referencedFiles: string[];
  templateName?: string;
  
  // 기타
  estimatedDuration?: Duration;
  budget?: Money;
  tags: string[];
}

type EntityType =
  | 'date'
  | 'person'
  | 'organization'
  | 'location'
  | 'file'
  | 'money'
  | 'duration'
  | 'email'
  | 'phone';

interface Duration {
  value: number;
  unit: 'minute' | 'hour' | 'day' | 'week' | 'month';
}

interface Money {
  amount: number;
  currency: string; // ISO 4217
}
```

##### Usage Example

```typescript
import { EntityExtractor } from '@/core/contextAnalysis/EntityExtractor';

const extractor = new EntityExtractor();

// 전체 엔티티 추출
const entities = await extractor.extract(
  "다음 주 금요일까지 Q4 제안서 초안을 김철수 팀장님께 보내드리겠습니다",
  'task_creation'
);

console.log('업무 제목:', entities.taskTitle); // "Q4 제안서 초안"
console.log('데드라인:', entities.deadline); // Date 객체
console.log('담당자:', entities.assignee); // "김철수 팀장"

// 특정 엔티티만 추출
const deadline = await extractor.extractSpecific<Date>(
  "내일까지 완료하겠습니다",
  'date'
);

// 상대적 날짜 처리
const relativeDate = await extractor.extractSpecific<Date>(
  "3일 후 미팅",
  'date'
);
console.log(relativeDate); // 현재로부터 3일 후 Date 객체
```

---

### Action Executor API

#### TaskManager

업무 생성, 수정, 조회를 담당하는 모듈

##### Interface

```typescript
interface ITaskManager {
  /**
   * 맥락에서 업무 생성
   * @param {TaskContext} context - 업무 컨텍스트
   * @returns {Task} 생성된 업무
   */
  createTask(context: TaskContext): Promise<Task>;
  
  /**
   * 업무 수정
   * @param {string} taskId - 업무 ID
   * @param {Partial<Task>} updates - 수정할 필드
   * @returns {Task} 수정된 업무
   */
  updateTask(taskId: string, updates: Partial<Task>): Promise<Task>;
  
  /**
   * 업무 완료 처리
   * @param {string} taskId - 업무 ID
   * @returns {Task} 완료된 업무
   */
  completeTask(taskId: string): Promise<Task>;
  
  /**
   * 업무 삭제
   * @param {string} taskId - 업무 ID
   */
  deleteTask(taskId: string): Promise<void>;
  
  /**
   * 업무 조회
   * @param {string} taskId - 업무 ID
   * @returns {Task | null} 업무 또는 null
   */
  getTask(taskId: string): Promise<Task | null>;
  
  /**
   * 업무 목록 조회
   * @param {TaskFilter} filter - 필터 조건
   * @returns {Task[]} 업무 배열
   */
  getTasks(filter?: TaskFilter): Promise<Task[]>;
  
  /**
   * 관련 파일 준비
   * @param {string} taskId - 업무 ID
   * @returns {Workspace} 작업 공간 정보
   */
  prepareWorkspace(taskId: string): Promise<Workspace>;
}
```

##### Types

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  
  // 시간
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
  completedAt?: Date;
  
  // 분류
  type: TaskType;
  priority: Priority;
  status: TaskStatus;
  
  // 관계
  assignee?: string;
  collaborators: string[];
  relatedTasks: string[];
  
  // 맥락
  sourceContext: TaskContext;
  relatedFiles: FileReference[];
  
  // 메타
  tags: string[];
  estimatedDuration?: Duration;
  actualDuration?: Duration;
  
  // 진행률
  progress: number; // 0-100
  subtasks: Subtask[];
}

type TaskType =
  | 'document_creation'
  | 'presentation'
  | 'code_review'
  | 'meeting_preparation'
  | 'report_submission'
  | 'data_analysis'
  | 'design'
  | 'other';

type Priority = 'urgent' | 'high' | 'medium' | 'low';

type TaskStatus = 
  | 'pending' // 대기 중
  | 'in_progress' // 진행 중
  | 'blocked' // 차단됨
  | 'completed' // 완료
  | 'cancelled'; // 취소됨

interface TaskFilter {
  status?: TaskStatus[];
  priority?: Priority[];
  type?: TaskType[];
  deadline?: {
    before?: Date;
    after?: Date;
  };
  assignee?: string;
  tags?: string[];
  search?: string; // 제목/설명 검색
  sortBy?: 'deadline' | 'priority' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface TaskContext {
  id: string;
  type: 'audio' | 'text' | 'chat' | 'screenshot';
  rawData: string | Buffer;
  transcript?: Transcript;
  intent: Intent;
  entities: ExtractedEntities;
  createdAt: Date;
}

interface Workspace {
  task: Task;
  relatedFiles: FileReference[];
  referenceDocs: DocumentReference[];
  apps: AppLink[];
  suggestedTemplates: TemplateReference[];
}

interface FileReference {
  id: string;
  path: string;
  name: string;
  type: string;
  size: number;
  modifiedAt: Date;
  relevanceScore: number; // 0-1
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}
```

##### Usage Example

```typescript
import { TaskManager } from '@/core/actionExecutor/TaskManager';

const taskManager = new TaskManager();

// 업무 생성
const context: TaskContext = {
  id: 'ctx-123',
  type: 'audio',
  transcript: transcript,
  intent: intent,
  entities: entities,
  createdAt: new Date(),
};

const task = await taskManager.createTask(context);
console.log(`업무 생성됨: ${task.title}`);

// 업무 조회
const urgentTasks = await taskManager.getTasks({
  priority: ['urgent', 'high'],
  status: ['pending', 'in_progress'],
  deadline: {
    before: addDays(new Date(), 3), // 3일 이내
  },
  sortBy: 'deadline',
  sortOrder: 'asc',
});

// 작업 공간 준비
const workspace = await taskManager.prepareWorkspace(task.id);

// 관련 파일 열기
workspace.relatedFiles.forEach((file) => {
  if (file.relevanceScore > 0.8) {
    openFile(file.path);
  }
});

// 앱 실행
if (workspace.apps.length > 0) {
  launchApp(workspace.apps[0]);
}
```

---

#### NotificationService

알림 및 리마인더를 관리하는 모듈

##### Interface

```typescript
interface INotificationService {
  /**
   * 즉시 알림 전송
   * @param {Notification} notification - 알림 정보
   */
  sendNow(notification: Notification): Promise<void>;
  
  /**
   * 예약 알림 등록
   * @param {ScheduledNotification} notification - 예약 알림 정보
   * @returns {string} 알림 ID
   */
  schedule(notification: ScheduledNotification): Promise<string>;
  
  /**
   * 예약 알림 취소
   * @param {string} notificationId - 알림 ID
   */
  cancel(notificationId: string): Promise<void>;
  
  /**
   * 업무에 대한 리마인더 자동 설정
   * @param {Task} task - 업무
   */
  scheduleTaskReminders(task: Task): Promise<void>;
  
  /**
   * 알림 목록 조회
   * @param {NotificationFilter} filter - 필터
   * @returns {ScheduledNotification[]} 알림 배열
   */
  getScheduledNotifications(filter?: NotificationFilter): Promise<ScheduledNotification[]>;
}
```

##### Types

```typescript
interface Notification {
  title: string;
  body: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  priority?: 'high' | 'normal' | 'low';
  sound?: string;
  vibrate?: boolean;
  icon?: string;
  badge?: number;
}

interface ScheduledNotification extends Notification {
  id?: string;
  scheduledTime: Date;
  repeatInterval?: RepeatInterval;
  taskId?: string;
}

interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
}

type RepeatInterval =
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly';

interface NotificationFilter {
  taskId?: string;
  scheduledBefore?: Date;
  scheduledAfter?: Date;
}
```

##### Usage Example

```typescript
import { NotificationService } from '@/core/actionExecutor/NotificationService';

const notificationService = new NotificationService();

// 즉시 알림
await notificationService.sendNow({
  title: '새 업무 생성됨',
  body: 'Q4 제안서 초안 작성',
  data: { taskId: task.id },
  actions: [
    { id: 'open', title: '열기' },
    { id: 'dismiss', title: '닫기' },
  ],
});

// 예약 알림
const notificationId = await notificationService.schedule({
  title: '업무 시작 시간입니다',
  body: 'Q4 제안서 작성을 시작하세요',
  scheduledTime: addDays(new Date(), 1),
  taskId: task.id,
  actions: [
    { id: 'start', title: '지금 시작' },
    { id: 'snooze', title: '1시간 후' },
  ],
});

// 업무 리마인더 자동 설정
await notificationService.scheduleTaskReminders(task);
// → 데드라인 3일 전, 1일 전, 당일 아침 알림 자동 생성
```

---

## Feature APIs

### Social Event Management API

경조사 이벤트 관리를 위한 고수준 API입니다.

#### SocialEventService

##### Interface

```typescript
interface ISocialEventService {
  // CRUD operations
  createEvent(input: SocialEventCreateInput): Promise<SocialEvent>;
  updateEvent(id: string, updates: SocialEventUpdateInput): Promise<SocialEvent>;
  deleteEvent(id: string): Promise<void>;
  getEvent(id: string): Promise<SocialEvent | null>;
  listEvents(filter?: SocialEventFilter): Promise<SocialEvent[]>;

  // Event extraction
  extractFromText(text: string): Promise<ExtractionResult>;
  extractFromImage(imagePath: string): Promise<ExtractionResult>;

  // Calendar integration
  addToCalendar(event: SocialEvent): Promise<string | null>;
  updateCalendarEvent(calendarId: string, event: SocialEvent): Promise<string | null>;
  removeFromCalendar(calendarId: string): Promise<boolean>;
  syncWithCalendar(event: SocialEvent): Promise<string | null>;

  // Statistics
  getStatistics(): Promise<SocialEventStatistics>;
}
```

##### Types

```typescript
type SocialEventType =
  | 'wedding'
  | 'funeral'
  | 'first_birthday'
  | 'sixtieth_birthday'
  | 'birthday'
  | 'graduation'
  | 'etc';

type SocialEventStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
type SocialEventPriority = 'low' | 'medium' | 'high' | 'urgent';

interface SocialEvent {
  id: string;
  type: SocialEventType;
  status: SocialEventStatus;
  priority: SocialEventPriority;
  title: string;
  description: string | null;
  eventDate: Date;
  location: SocialEventLocation | null;
  contact: SocialEventContact | null;
  giftAmount: number | null;
  giftSent: boolean;
  giftSentDate: Date | null;
  reminderSet: boolean;
  reminderDate: Date | null;
  calendarEventId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SocialEventLocation {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface SocialEventContact {
  name: string;
  phone: string;
  relationship: RelationshipType;
}

type RelationshipType =
  | 'family'
  | 'relative'
  | 'friend'
  | 'college_friend'
  | 'high_school_friend'
  | 'colleague'
  | 'boss'
  | 'business_client'
  | 'neighbor'
  | 'etc';

interface ExtractionResult {
  type: SocialEventType;
  entities: ExtractedEntities;
  priority: SocialEventPriority;
  confidence: number;
}

interface ExtractedEntities {
  dates: Date[];
  locations: string[];
  phoneNumbers: string[];
  names: string[];
  amounts: number[];
  relationships: string[];
}
```

##### Usage Example

```typescript
import { SocialEventService } from '@/services/socialEvent/SocialEventService';

const service = new SocialEventService();

// Extract from text
const result = await service.extractFromText(
  "다음 달 15일 오후 2시에 결혼식이 있습니다. 그랜드 웨딩홀에서 진행합니다."
);

console.log('Event Type:', result.type); // 'wedding'
console.log('Dates:', result.entities.dates); // [Date object]
console.log('Locations:', result.entities.locations); // ['그랜드 웨딩홀']
console.log('Priority:', result.priority); // 'medium'

// Create event from extraction
const event = await service.createEvent({
  type: result.type,
  title: '결혼식',
  eventDate: result.entities.dates[0],
  priority: result.priority,
});

// Sync with calendar
const calendarId = await service.addToCalendar(event);
console.log('Calendar Event ID:', calendarId);
```

---

### Calendar Service API

캘린더 연동을 위한 API입니다.

#### CalendarService

##### Interface

```typescript
interface ICalendarService {
  // Permissions
  requestPermissions(): Promise<boolean>;

  // Event management
  addEvent(event: SocialEvent): Promise<string | null>;
  updateEvent(calendarId: string, event: SocialEvent): Promise<string | null>;
  removeEvent(calendarId: string): Promise<boolean>;
  findEvents(startDate: Date, endDate: Date): Promise<any[]>;

  // Sync
  syncEvent(event: SocialEvent): Promise<string | null>;
}
```

##### Usage Example

```typescript
import { CalendarService } from '@/services/calendar/CalendarService';

const calendarService = new CalendarService();

// Request permissions
const hasPermission = await calendarService.requestPermissions();
if (!hasPermission) {
  // Show permission request UI
}

// Add event to calendar
const calendarId = await calendarService.addEvent(socialEvent);

// Update event
await calendarService.updateEvent(calendarId, updatedEvent);

// Find events in range
const events = await calendarService.findEvents(
  new Date('2025-01-01'),
  new Date('2025-12-31')
);
```

---

### Payment Deep Link API

송금 앱 딥링크 생성을 위한 API입니다.

#### PaymentDeepLinkService

##### Interface

```typescript
interface IPaymentDeepLinkService {
  // Deep link creation
  createKakaoPayLink(receiver: PaymentReceiver): string;
  createTossLink(receiver: PaymentReceiver): string;
  createNaverPayLink(receiver: PaymentReceiver): string;

  // Payment links
  createPaymentLinks(options: PaymentOptions): PaymentLinks;

  // Recommendations
  getRecommendedAmount(options: RecommendationOptions): number;
}
```

##### Types

```typescript
interface PaymentReceiver {
  receiverName: string;
  amount: number;
  message: string;
}

interface PaymentLinks {
  kakaoPay: string;
  toss: string;
  naverPay: string;
}

interface RecommendationOptions {
  eventType: SocialEventType;
  relationship: RelationshipType;
}

interface PaymentOptions {
  eventType: SocialEventType;
  amount: number;
  message: string;
}
```

##### Usage Example

```typescript
import { PaymentDeepLinkService } from '@/services/payment/PaymentDeepLinkService';

const paymentService = new PaymentDeepLinkService();

// Get recommended amount
const recommended = paymentService.getRecommendedAmount({
  eventType: 'wedding',
  relationship: 'colleague',
});
console.log('Recommended:', recommended); // 100000 (10만원)

// Create payment links
const links = paymentService.createPaymentLinks({
  eventType: 'wedding',
  amount: 100000,
  message: '축하합니다!',
});

console.log('KakaoPay:', links.kakaoPay);
console.log('Toss:', links.toss);
console.log('NaverPay:', links.naverPay);
```

---

## Task Management API

앱의 업무 관리 기능을 위한 고수준 API

##### Interface

```typescript
interface ITaskManagementAPI {
  // Task CRUD
  createTask: ITaskManager['createTask'];
  updateTask: ITaskManager['updateTask'];
  deleteTask: ITaskManager['deleteTask'];
  completeTask: ITaskManager['completeTask'];
  
  // Task 조회
  getTask: ITaskManager['getTask'];
  getTasks: ITaskManager['getTasks'];
  
  // 편의 기능
  getTodayTasks(): Promise<Task[]>;
  getUpcomingTasks(): Promise<Task[]>;
  getOverdueTasks(): Promise<Task[]>;
  
  // 통계
  getTaskStats(): Promise<TaskStats>;
  
  // 검색
  searchTasks(query: string): Promise<Task[]>;
}
```

##### Types

```typescript
interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<Priority, number>;
  completionRate: number; // 0-1
  averageCompletionTime: Duration;
  upcomingDeadlines: Array<{
    date: Date;
    count: number;
  }>;
}
```

##### Usage Example

```typescript
import { useTaskManagementAPI } from '@/features/work/hooks/useTaskManagementAPI';

function TaskDashboard() {
  const api = useTaskManagementAPI();
  
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  
  useEffect(() => {
    loadData();
  }, []);
  
  async function loadData() {
    const [today, statistics] = await Promise.all([
      api.getTodayTasks(),
      api.getTaskStats(),
    ]);
    
    setTodayTasks(today);
    setStats(statistics);
  }
  
  return (
    <View>
      <Text>오늘 할일: {todayTasks.length}개</Text>
      <Text>완료율: {stats?.completionRate * 100}%</Text>
      {todayTasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </View>
  );
}
```

---

## Service APIs

### Storage API

로컬 데이터 저장소를 관리하는 API

##### Interface

```typescript
interface IStorageService {
  /**
   * 키-값 저장
   * @param {string} key - 키
   * @param {any} value - 값 (JSON 직렬화 가능)
   */
  set(key: string, value: any): Promise<void>;
  
  /**
   * 키-값 조회
   * @param {string} key - 키
   * @returns {T | null} 값 또는 null
   */
  get<T>(key: string): Promise<T | null>;
  
  /**
   * 키 삭제
   * @param {string} key - 키
   */
  remove(key: string): Promise<void>;
  
  /**
   * 모든 키 삭제
   */
  clear(): Promise<void>;
  
  /**
   * 모든 키 조회
   * @returns {string[]} 키 배열
   */
  getAllKeys(): Promise<string[]>;
  
  /**
   * 다중 키-값 저장
   * @param {Array<[string, any]>} entries - [키, 값] 배열
   */
  multiSet(entries: Array<[string, any]>): Promise<void>;
  
  /**
   * 다중 키-값 조회
   * @param {string[]} keys - 키 배열
   * @returns {Array<[string, any]>} [키, 값] 배열
   */
  multiGet(keys: string[]): Promise<Array<[string, any]>>;
}
```

##### Usage Example

```typescript
import { StorageService } from '@/services/StorageService';

const storage = new StorageService();

// 설정 저장
await storage.set('userPreferences', {
  language: 'ko',
  theme: 'dark',
  notificationsEnabled: true,
});

// 설정 조회
const prefs = await storage.get<UserPreferences>('userPreferences');

// 최근 검색어 저장
const recentSearches = ['제안서', '미팅', '보고서'];
await storage.set('recentSearches', recentSearches);

// 다중 저장
await storage.multiSet([
  ['lastSync', new Date().toISOString()],
  ['deviceId', generateDeviceId()],
  ['appVersion', '1.0.0'],
]);
```

---

### External Integration APIs

#### Notion API

##### Interface

```typescript
interface INotionService {
  /**
   * Notion 페이지 생성
   * @param {NotionPageData} data - 페이지 데이터
   * @returns {string} 생성된 페이지 URL
   */
  createPage(data: NotionPageData): Promise<string>;
  
  /**
   * 데이터베이스에 항목 추가
   * @param {string} databaseId - 데이터베이스 ID
   * @param {NotionItemData} data - 항목 데이터
   * @returns {string} 생성된 항목 ID
   */
  addToDatabase(databaseId: string, data: NotionItemData): Promise<string>;
  
  /**
   * 페이지 업데이트
   * @param {string} pageId - 페이지 ID
   * @param {Partial<NotionPageData>} updates - 업데이트할 데이터
   */
  updatePage(pageId: string, updates: Partial<NotionPageData>): Promise<void>;
}
```

##### Usage Example

```typescript
import { NotionService } from '@/services/NotionService';

const notion = new NotionService(process.env.NOTION_API_KEY);

// Notion에 업무 등록
const pageUrl = await notion.createPage({
  title: task.title,
  properties: {
    Status: { select: { name: 'In Progress' } },
    Deadline: { date: { start: task.deadline.toISOString() } },
    Priority: { select: { name: task.priority } },
  },
  content: [
    {
      type: 'paragraph',
      paragraph: {
        text: task.description,
      },
    },
  ],
});

console.log(`Notion 페이지 생성됨: ${pageUrl}`);
```

---

## Data Models

### 공통 타입 정의

```typescript
// src/shared/models/common.ts

/**
 * UUID 타입 (문자열이지만 UUID 형식 보장)
 */
type UUID = string & { readonly __brand: 'UUID' };

/**
 * ISO 8601 날짜 문자열
 */
type ISODateString = string & { readonly __brand: 'ISODateString' };

/**
 * 파일 경로
 */
type FilePath = string & { readonly __brand: 'FilePath' };

/**
 * URL
 */
type URL = string & { readonly __brand: 'URL' };

/**
 * 페이지네이션 결과
 */
interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * API 응답 래퍼
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: Date;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

---

## Error Handling

### 에러 계층 구조

```typescript
// src/shared/errors/index.ts

/**
 * 기본 에러 클래스
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 권한 관련 에러
 */
export class PermissionError extends AppError {
  constructor(message: string) {
    super(message, 'PERMISSION_DENIED', 403);
  }
}

/**
 * 녹음 관련 에러
 */
export class RecordingError extends AppError {
  constructor(message: string, code: string = 'RECORDING_ERROR') {
    super(message, code, 400);
  }
}

/**
 * AI 분석 에러
 */
export class AnalysisError extends AppError {
  constructor(message: string) {
    super(message, 'ANALYSIS_FAILED', 500);
  }
}

/**
 * 데이터베이스 에러
 */
export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR', 500);
  }
}

/**
 * 리소스를 찾을 수 없음
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', 404);
  }
}

/**
 * 유효성 검증 에러
 */
export class ValidationError extends AppError {
  constructor(message: string, public errors: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}
```

### 에러 사용 예시

```typescript
import { PermissionError, RecordingError, NotFoundError } from '@/shared/errors';

// 권한 확인
async function startRecording() {
  const hasPermission = await checkMicrophonePermission();
  
  if (!hasPermission) {
    throw new PermissionError('마이크 권한이 필요합니다');
  }
  
  // ...
}

// 상태 확인
async function pauseRecording() {
  if (this.state !== 'recording') {
    throw new RecordingError('녹음 중이 아닙니다', 'NOT_RECORDING');
  }
  
  // ...
}

// 리소스 조회
async function getTask(taskId: string): Promise<Task> {
  const task = await this.db.findById(taskId);
  
  if (!task) {
    throw new NotFoundError('Task', taskId);
  }
  
  return task;
}

// 에러 처리
try {
  await recorder.start();
} catch (error) {
  if (error instanceof PermissionError) {
    // 권한 요청 UI 표시
    showPermissionDialog();
  } else if (error instanceof RecordingError) {
    // 상태 오류 메시지 표시
    showErrorToast(error.message);
  } else {
    // 일반 에러 처리
    console.error('Unexpected error:', error);
  }
}
```

---

## API 호출 가이드라인

### 1. 에러 처리

모든 API 호출은 try-catch로 감싸기:

```typescript
async function createTaskFromTranscript(transcript: Transcript) {
  try {
    // 1. 의도 분류
    const intent = await intentClassifier.classify(transcript.text);
    
    // 2. 엔티티 추출
    const entities = await entityExtractor.extract(transcript.text, intent.type);
    
    // 3. 업무 생성
    const task = await taskManager.createTask({
      id: uuidv4(),
      type: 'audio',
      transcript,
      intent,
      entities,
      createdAt: new Date(),
    });
    
    return task;
  } catch (error) {
    if (error instanceof AnalysisError) {
      // AI 분석 실패 → 수동 입력 제안
      showManualInputDialog();
    } else if (error instanceof DatabaseError) {
      // DB 오류 → 재시도 또는 오프라인 저장
      await saveToOfflineQueue();
    } else {
      // 예상치 못한 에러
      logError(error);
      showGenericError();
    }
    
    throw error; // 상위로 전파 (필요시)
  }
}
```

### 2. 타임아웃

장시간 실행되는 작업에는 타임아웃 설정:

```typescript
async function convertWithTimeout(audioFile: AudioFile, timeout: number = 30000) {
  const promise = stt.convert(audioFile);
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('STT timeout')), timeout)
  );
  
  return Promise.race([promise, timeoutPromise]);
}
```

### 3. 재시도 로직

일시적 오류는 자동 재시도:

```typescript
async function retryableCall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // 지수 백오프
      await sleep(delay * Math.pow(2, i));
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

---

**마지막 업데이트**: 2025-01-16  
**문서 버전**: 1.0.0  
**다음 업데이트**: 코드 구현 완료 후 실제 API 서명 반영
