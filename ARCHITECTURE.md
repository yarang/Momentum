# Momentum - 시스템 아키텍처

## 문서 개요

이 문서는 Momentum 앱의 전체 시스템 아키텍처를 설명합니다. 업무 관리 유스케이스를 중심으로 설계되었으며, Android 플랫폼에 최적화되어 있습니다.

**작성일**: 2025-01-16  
**버전**: 1.0.0  
**대상 독자**: 개발자, 아키텍트, 기술 리뷰어

---

## 목차

1. [시스템 개요](#시스템-개요)
2. [아키텍처 원칙](#아키텍처-원칙)
3. [계층별 아키텍처](#계층별-아키텍처)
4. [핵심 모듈 설계](#핵심-모듈-설계)
5. [데이터 흐름](#데이터-흐름)
6. [AI/ML 파이프라인](#aiml-파이프라인)
7. [상태 관리](#상태-관리)
8. [보안 아키텍처](#보안-아키텍처)
9. [성능 최적화](#성능-최적화)
10. [확장성 고려사항](#확장성-고려사항)

---

## 시스템 개요

### 고수준 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                         UI Layer                             │
│  (React Native Components - Android Optimized)              │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Context   │  │  Context   │  │   Action   │            │
│  │  Capture   │→ │  Analysis  │→ │  Executor  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   SQLite    │  │  TF Lite     │  │  External    │       │
│  │  (Encrypted)│  │  (ML Models) │  │  APIs        │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                  Android Platform Layer                      │
│  (Accessibility Service, Background Service, etc)           │
└─────────────────────────────────────────────────────────────┘
```

### 핵심 컴포넌트

#### 1. Context Capture (맥락 수집)
사용자의 디지털 행동에서 업무 관련 정보를 자동으로 추출하는 계층

#### 2. Context Analysis (맥락 분석)
수집된 데이터를 AI로 분석하여 의미있는 업무 객체로 변환하는 계층

#### 3. Action Executor (액션 실행)
분석된 업무를 기반으로 적시에 알림과 실행 환경을 제공하는 계층

---

## 아키텍처 원칙

### 1. **온디바이스 우선 (Device-First)**
- 모든 AI 분석은 기기 내부에서 수행
- 개인정보는 서버로 전송하지 않음
- 네트워크 없이도 핵심 기능 작동

**근거**: 개인정보 보호, 응답 속도, 오프라인 작동

### 2. **모듈화 (Modularity)**
- 각 기능은 독립적인 모듈로 분리
- 느슨한 결합 (Loose Coupling)
- 높은 응집도 (High Cohesion)

**근거**: 유지보수성, 테스트 용이성, 확장성

### 3. **배터리 효율 (Battery Efficiency)**
- 백그라운드 작업 최소화
- 배치 처리 (Batch Processing)
- 적응형 스케줄링

**근거**: 사용자 경험, 앱 수명 연장

### 4. **점진적 개선 (Progressive Enhancement)**
- MVP 기능부터 구현
- 사용자 피드백 기반 개선
- 기능 플래그로 점진적 배포

**근거**: 빠른 출시, 리스크 관리

---

## 계층별 아키텍처

### Presentation Layer (UI)

```typescript
// 컴포넌트 구조
src/features/work/
├── screens/
│   ├── TaskListScreen.tsx          // 업무 목록 화면
│   ├── TaskDetailScreen.tsx        // 업무 상세 화면
│   └── MeetingRecordScreen.tsx     // 미팅 녹음 화면
│
├── components/
│   ├── TaskCard.tsx                // 업무 카드 컴포넌트
│   ├── RecordButton.tsx            // 녹음 버튼
│   ├── TranscriptView.tsx          // 대화 내용 표시
│   └── ActionButton.tsx            // 액션 실행 버튼
│
└── hooks/
    ├── useTaskList.ts              // 업무 목록 관리
    ├── useRecording.ts             // 녹음 상태 관리
    └── useTaskActions.ts           // 업무 액션 관리
```

**설계 패턴**: Container-Presenter Pattern

```typescript
// Container (비즈니스 로직)
const TaskListContainer: React.FC = () => {
  const { tasks, loading, error } = useTaskList();
  const { completeTask, deleteTask } = useTaskActions();
  
  return (
    <TaskListPresenter 
      tasks={tasks}
      loading={loading}
      onComplete={completeTask}
      onDelete={deleteTask}
    />
  );
};

// Presenter (UI만 담당)
const TaskListPresenter: React.FC<Props> = ({
  tasks, loading, onComplete, onDelete
}) => {
  return (
    <View>
      {tasks.map(task => (
        <TaskCard 
          key={task.id}
          task={task}
          onComplete={() => onComplete(task.id)}
        />
      ))}
    </View>
  );
};
```

---

### Business Logic Layer

#### Context Capture Module

```typescript
// src/core/contextCapture/AudioRecorder.ts
interface AudioRecorder {
  start(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<AudioFile>;
  getStatus(): RecordingStatus;
}

// 구현 흐름
┌──────────────┐
│  사용자 입력  │ (녹음 시작 버튼)
└──────┬───────┘
       ↓
┌──────────────────────┐
│ AudioRecorder.start() │
└──────┬───────────────┘
       ↓
┌────────────────────────────┐
│ Android MediaRecorder API  │ (네이티브 모듈)
└──────┬─────────────────────┘
       ↓
┌──────────────────────┐
│ 오디오 파일 저장      │ (임시 스토리지)
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ SpeechToText.convert()│ (Whisper 모델)
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│ 텍스트 반환          │
└──────────────────────┘
```

**주요 기술**:
- **Android**: `MediaRecorder` API
- **파일 형식**: AAC (압축률 우수, 품질 유지)
- **샘플레이트**: 16kHz (음성 인식 최적)

#### Context Analysis Module

```typescript
// src/core/contextAnalysis/IntentClassifier.ts
interface IntentClassifier {
  classify(text: string): Promise<Intent>;
}

// AI 파이프라인
입력 텍스트
    ↓
┌────────────────┐
│  전처리         │ (토큰화, 정규화)
└────┬───────────┘
    ↓
┌────────────────┐
│  BERT 모델      │ (의도 분류)
└────┬───────────┘
    ↓
┌────────────────┐
│  후처리         │ (신뢰도 계산)
└────┬───────────┘
    ↓
Intent 객체
{
  type: 'task_creation',
  confidence: 0.92,
  entities: {
    deadline: Date,
    assignee: string,
    taskType: string
  }
}
```

**지원하는 Intent 유형**:
- `task_creation`: 업무 생성 요청
- `task_update`: 업무 변경 요청
- `meeting_schedule`: 미팅 일정 조율
- `information_sharing`: 정보 공유
- `status_inquiry`: 진행 상황 문의

#### Action Executor Module

```typescript
// src/core/actionExecutor/TaskManager.ts
interface TaskManager {
  createTask(context: TaskContext): Promise<Task>;
  scheduleReminder(task: Task): Promise<void>;
  prepareWorkspace(task: Task): Promise<Workspace>;
}

// 실행 흐름
TaskContext 생성
    ↓
┌──────────────────┐
│  createTask()     │ (DB 저장)
└────┬─────────────┘
    ↓
┌──────────────────┐
│ scheduleReminder()│ (알림 스케줄링)
└────┬─────────────┘
    ↓
┌──────────────────────┐
│ prepareWorkspace()    │ (관련 파일 검색)
└────┬─────────────────┘
    ↓
Workspace 객체
{
  task: Task,
  relatedFiles: File[],
  referenceDocs: Document[],
  tools: AppLink[]
}
```

---

## 핵심 모듈 설계

### 1. Audio Recording Module

#### 클래스 다이어그램
```
┌─────────────────────────────┐
│     AudioRecorder           │
├─────────────────────────────┤
│ - recordingState: State     │
│ - audioFile: File?          │
│ - duration: number          │
├─────────────────────────────┤
│ + start(): Promise<void>    │
│ + pause(): Promise<void>    │
│ + stop(): Promise<File>     │
│ + getWaveform(): number[]   │
└─────────────────────────────┘
         │
         │ uses
         ↓
┌─────────────────────────────┐
│   AndroidMediaRecorder      │
│   (Native Module)           │
├─────────────────────────────┤
│ + startRecording()          │
│ + stopRecording()           │
│ + getAmplitude()            │
└─────────────────────────────┘
```

#### 상태 머신
```
     [Idle]
       │
       │ start()
       ↓
   [Recording]
       │
       ├─ pause() → [Paused] → resume() ─┐
       │                                  │
       │←─────────────────────────────────┘
       │
       │ stop()
       ↓
   [Processing]
       │
       │ complete
       ↓
     [Done]
```

#### 구현 예시
```typescript
// src/core/contextCapture/AudioRecorder.ts
export class AudioRecorder {
  private state: RecordingState = 'idle';
  private nativeModule: NativeModules.MediaRecorder;
  
  async start(): Promise<void> {
    if (this.state !== 'idle') {
      throw new Error('Already recording');
    }
    
    // 권한 확인
    const hasPermission = await this.checkMicrophonePermission();
    if (!hasPermission) {
      throw new Error('Microphone permission denied');
    }
    
    // 네이티브 모듈 호출
    await this.nativeModule.startRecording({
      sampleRate: 16000,
      channels: 1,
      encoding: 'aac',
    });
    
    this.state = 'recording';
    this.emit('recordingStarted');
  }
  
  async stop(): Promise<AudioFile> {
    if (this.state !== 'recording' && this.state !== 'paused') {
      throw new Error('Not recording');
    }
    
    const filePath = await this.nativeModule.stopRecording();
    this.state = 'idle';
    
    return {
      path: filePath,
      duration: this.duration,
      size: await this.getFileSize(filePath),
    };
  }
}
```

---

### 2. Speech-to-Text Module

#### 처리 파이프라인
```
Audio File (AAC)
    ↓
┌─────────────────────┐
│  Audio Preprocessing │
│  - Resampling       │
│  - Noise Reduction  │
└────┬────────────────┘
    ↓
┌─────────────────────┐
│  Whisper Model      │
│  (TensorFlow Lite)  │
└────┬────────────────┘
    ↓
┌─────────────────────┐
│  Post-processing    │
│  - Punctuation      │
│  - Diarization      │
└────┬────────────────┘
    ↓
Transcript
{
  text: string,
  segments: Segment[],
  confidence: number
}
```

#### 최적화 전략
```typescript
// src/core/contextCapture/SpeechToText.ts
export class SpeechToText {
  private model: TFLiteModel;
  private processingQueue: Queue<AudioFile>;
  
  async convert(audioFile: AudioFile): Promise<Transcript> {
    // 1. 오디오 전처리 (백그라운드 스레드)
    const preprocessed = await this.preprocessAudio(audioFile);
    
    // 2. 배치 처리 (여러 오디오 동시 처리)
    const batch = await this.processingQueue.addToBatch(preprocessed);
    
    // 3. 모델 추론 (GPU 가속 사용)
    const result = await this.model.predict(batch, {
      useGPU: true,
      batchSize: 4,
    });
    
    // 4. 후처리
    return this.postProcess(result);
  }
  
  private async preprocessAudio(file: AudioFile): Promise<Float32Array> {
    // 리샘플링: 원본 샘플레이트 → 16kHz
    const resampled = await this.resample(file, 16000);
    
    // 노이즈 제거 (Wiener filter)
    const denoised = this.removeNoise(resampled);
    
    // 정규화
    return this.normalize(denoised);
  }
}
```

**성능 지표**:
- 처리 속도: 실시간의 0.5배 (30초 녹음 → 15초 처리)
- 정확도: 한국어 90% 이상 (조용한 환경)
- 메모리: 최대 200MB

---

### 3. Intent Classification Module

#### AI 모델 구조
```
Input: "다음 주 금요일까지 제안서 초안 보내드리겠습니다"
    ↓
┌───────────────────────────────┐
│  Tokenization                 │
│  ["다음", "주", "금요일", ... ]│
└────┬──────────────────────────┘
    ↓
┌───────────────────────────────┐
│  BERT Embedding               │
│  768-dim vectors              │
└────┬──────────────────────────┘
    ↓
┌───────────────────────────────┐
│  Intent Classification Head   │
│  (Softmax over 5 classes)     │
└────┬──────────────────────────┘
    ↓
Intent: task_creation (0.92)
    ↓
┌───────────────────────────────┐
│  Entity Extraction            │
│  - deadline: "다음 주 금요일"  │
│  - deliverable: "제안서 초안"  │
└────┬──────────────────────────┘
    ↓
TaskContext 객체
```

#### 모델 상세
```typescript
// src/core/contextAnalysis/IntentClassifier.ts
export class IntentClassifier {
  private bertModel: BERTModel;
  private classificationHead: ClassificationHead;
  
  async classify(text: string): Promise<Intent> {
    // 1. 토큰화
    const tokens = await this.tokenize(text);
    
    // 2. BERT 임베딩 (캐싱으로 속도 향상)
    const embeddings = await this.bertModel.encode(tokens, {
      useCache: true,
      maxLength: 128, // 긴 텍스트 자르기
    });
    
    // 3. 분류
    const logits = await this.classificationHead.predict(embeddings);
    const probabilities = this.softmax(logits);
    
    // 4. 결과 생성
    const topIntent = this.getTopIntent(probabilities);
    
    if (topIntent.confidence < 0.7) {
      // 신뢰도 낮으면 사용자에게 확인 요청
      return { ...topIntent, needsConfirmation: true };
    }
    
    return topIntent;
  }
  
  private tokenize(text: string): Token[] {
    // 한국어 형태소 분석 (Mecab)
    return this.tokenizer.tokenize(text, {
      lang: 'ko',
      includePos: true, // 품사 태깅 포함
    });
  }
}
```

**학습 데이터**:
- 총 10,000개 문장 (균형 잡힌 클래스 분포)
- 업무 관련 대화 8,000개
- 일반 대화 2,000개 (False Positive 방지)

---

### 4. Entity Extraction Module

#### 추출 대상
```typescript
interface ExtractedEntities {
  // 시간 정보
  deadline?: Date;
  startDate?: Date;
  duration?: Duration;
  
  // 업무 정보
  taskTitle: string;
  taskType: TaskType;
  deliverables: string[];
  
  // 사람 정보
  assignee?: string;
  collaborators?: string[];
  stakeholders?: string[];
  
  // 위치 정보
  location?: string;
  meetingRoom?: string;
}
```

#### 추출 전략
```typescript
// src/core/contextAnalysis/EntityExtractor.ts
export class EntityExtractor {
  async extract(text: string): Promise<ExtractedEntities> {
    const entities: Partial<ExtractedEntities> = {};
    
    // 1. 날짜/시간 추출 (정규식 + NLP)
    entities.deadline = await this.extractDeadline(text);
    
    // 2. 업무 제목 추출 (핵심 명사구)
    entities.taskTitle = await this.extractTaskTitle(text);
    
    // 3. 업무 유형 분류
    entities.taskType = await this.classifyTaskType(text);
    
    // 4. 인물 추출 (NER - Named Entity Recognition)
    const people = await this.extractPeople(text);
    entities.assignee = people.primary;
    entities.collaborators = people.secondary;
    
    return entities as ExtractedEntities;
  }
  
  private async extractDeadline(text: string): Promise<Date | undefined> {
    // 패턴 매칭
    const patterns = [
      /다음\s*주\s*(월|화|수|목|금|토|일)요일/,
      /(\d{1,2})월\s*(\d{1,2})일/,
      /오늘\s*까지|내일\s*까지/,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return this.parseRelativeDate(match[0]);
      }
    }
    
    // NLP 기반 날짜 추출 (복잡한 표현)
    return await this.nlpDateExtractor.extract(text);
  }
  
  private parseRelativeDate(dateStr: string): Date {
    const now = new Date();
    
    if (dateStr.includes('다음 주')) {
      const dayOfWeek = this.parseDayOfWeek(dateStr);
      return this.getNextWeekDate(now, dayOfWeek);
    }
    
    if (dateStr.includes('내일')) {
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
    
    // ... 다른 패턴들
  }
}
```

---

### 5. Task Management Module

#### 데이터 모델
```typescript
// src/shared/models/Task.ts
interface Task {
  id: string;
  title: string;
  description?: string;
  
  // 시간 정보
  createdAt: Date;
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
  
  // 메타데이터
  tags: string[];
  estimatedDuration?: Duration;
  actualDuration?: Duration;
}

type TaskType = 
  | 'document_creation'
  | 'presentation'
  | 'code_review'
  | 'meeting_preparation'
  | 'report_submission';

type Priority = 'urgent' | 'high' | 'medium' | 'low';
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
```

#### CRUD 작업
```typescript
// src/services/TaskService.ts
export class TaskService {
  private db: SQLiteDatabase;
  private store: TaskStore;
  
  async createTask(context: TaskContext): Promise<Task> {
    // 1. 엔티티에서 Task 객체 생성
    const task: Task = {
      id: uuidv4(),
      title: context.entities.taskTitle,
      deadline: context.entities.deadline,
      type: context.entities.taskType,
      priority: this.calculatePriority(context),
      status: 'pending',
      sourceContext: context,
      createdAt: new Date(),
      // ...
    };
    
    // 2. DB 저장 (트랜잭션)
    await this.db.transaction(async (tx) => {
      await tx.insert('tasks', task);
      
      // 관련 파일 참조 저장
      if (context.relatedFiles.length > 0) {
        await tx.insertMany('task_files', 
          context.relatedFiles.map(file => ({
            taskId: task.id,
            fileId: file.id,
          }))
        );
      }
    });
    
    // 3. 상태 업데이트
    this.store.addTask(task);
    
    // 4. 알림 스케줄링
    await this.scheduleReminders(task);
    
    return task;
  }
  
  private calculatePriority(context: TaskContext): Priority {
    const now = new Date();
    const deadline = context.entities.deadline;
    
    if (!deadline) return 'medium';
    
    const daysUntilDeadline = differenceInDays(deadline, now);
    
    if (daysUntilDeadline <= 1) return 'urgent';
    if (daysUntilDeadline <= 3) return 'high';
    if (daysUntilDeadline <= 7) return 'medium';
    return 'low';
  }
}
```

---

## 데이터 흐름

### End-to-End 시나리오: "미팅 녹음 → 업무 생성"

```
[사용자 액션]
    미팅 녹음 시작
        ↓
┌──────────────────────────┐
│ 1. Context Capture       │
│   - AudioRecorder.start()│
│   - 실시간 음성 저장      │
└────┬─────────────────────┘
    │ 녹음 완료
    ↓
┌──────────────────────────┐
│ 2. Speech Recognition    │
│   - SpeechToText.convert()│
│   - Whisper 모델 실행     │
└────┬─────────────────────┘
    │ 대화 내용 텍스트
    ↓
┌──────────────────────────┐
│ 3. Intent Classification │
│   - IntentClassifier     │
│   - "업무 요청" 감지      │
└────┬─────────────────────┘
    │ Intent: task_creation
    ↓
┌──────────────────────────┐
│ 4. Entity Extraction     │
│   - EntityExtractor      │
│   - 제목, 데드라인 추출   │
└────┬─────────────────────┘
    │ TaskContext 생성
    ↓
┌──────────────────────────┐
│ 5. Task Creation         │
│   - TaskService.create() │
│   - DB 저장              │
└────┬─────────────────────┘
    │ Task 객체
    ↓
┌──────────────────────────┐
│ 6. Reminder Scheduling   │
│   - NotificationService  │
│   - 알림 스케줄 등록      │
└────┬─────────────────────┘
    │
    ↓
┌──────────────────────────┐
│ 7. UI Update             │
│   - 업무 목록에 표시      │
│   - 사용자에게 확인 요청  │
└──────────────────────────┘
```

### 데이터베이스 스키마

```sql
-- tasks 테이블
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  deadline DATETIME,
  type TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  source_context TEXT, -- JSON
  created_at DATETIME NOT NULL,
  completed_at DATETIME,
  INDEX idx_deadline (deadline),
  INDEX idx_status (status),
  INDEX idx_priority (priority)
);

-- contexts 테이블 (원본 맥락 저장)
CREATE TABLE contexts (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  type TEXT NOT NULL, -- 'audio', 'text', 'screenshot'
  raw_data TEXT,
  transcript TEXT,
  entities TEXT, -- JSON
  created_at DATETIME NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- task_files 테이블 (관련 파일 참조)
CREATE TABLE task_files (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  relevance_score REAL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- reminders 테이블
CREATE TABLE reminders (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  scheduled_time DATETIME NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'sent', 'dismissed'
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  INDEX idx_scheduled_time (scheduled_time)
);
```

---

## AI/ML 파이프라인

### 모델 배포 전략

#### 1. 모델 경량화
```
원본 BERT 모델 (110M 파라미터)
    ↓ Distillation
Distilled BERT (66M 파라미터, -40%)
    ↓ Quantization
Quantized INT8 (16MB, -75%)
    ↓ Pruning
Pruned Model (8MB, -50%)
    ↓
최종 TFLite 모델 (8MB)
```

#### 2. 모델 업데이트 전략
```typescript
// src/services/ModelUpdateService.ts
export class ModelUpdateService {
  private currentVersion: string;
  
  async checkForUpdates(): Promise<boolean> {
    // 서버에서 최신 버전 확인 (메타데이터만)
    const latestVersion = await this.fetchLatestVersion();
    
    return latestVersion > this.currentVersion;
  }
  
  async downloadModel(version: string): Promise<void> {
    // 백그라운드에서 다운로드
    const modelBlob = await this.downloadInBackground(
      `https://models.momentum.com/${version}/intent-classifier.tflite`
    );
    
    // 기존 모델 백업
    await this.backupCurrentModel();
    
    // 새 모델 저장
    await this.saveModel(modelBlob, version);
    
    // 검증
    const isValid = await this.validateModel(version);
    if (!isValid) {
      // 롤백
      await this.rollbackModel();
      throw new Error('Model validation failed');
    }
    
    this.currentVersion = version;
  }
}
```

### 추론 최적화

#### 배치 처리
```typescript
// 여러 요청을 모아서 한 번에 처리
class InferenceBatcher {
  private queue: InferenceRequest[] = [];
  private batchSize = 4;
  private timeout = 100; // ms
  
  async addRequest(request: InferenceRequest): Promise<Result> {
    return new Promise((resolve) => {
      this.queue.push({ request, resolve });
      
      if (this.queue.length >= this.batchSize) {
        this.processBatch();
      } else {
        setTimeout(() => this.processBatch(), this.timeout);
      }
    });
  }
  
  private async processBatch() {
    if (this.queue.length === 0) return;
    
    const batch = this.queue.splice(0, this.batchSize);
    const inputs = batch.map(item => item.request.input);
    
    // 배치 추론 (GPU 활용)
    const results = await this.model.predictBatch(inputs);
    
    // 결과 반환
    batch.forEach((item, idx) => {
      item.resolve(results[idx]);
    });
  }
}
```

#### 캐싱
```typescript
// 동일한 입력에 대한 결과 캐싱
class InferenceCache {
  private cache = new LRUCache<string, Result>({
    max: 1000,
    ttl: 1000 * 60 * 60, // 1시간
  });
  
  async predict(input: string): Promise<Result> {
    const key = this.hashInput(input);
    
    // 캐시 확인
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    
    // 추론 실행
    const result = await this.model.predict(input);
    
    // 캐시 저장
    this.cache.set(key, result);
    
    return result;
  }
}
```

---

## 상태 관리

### Zustand Store 구조

```typescript
// src/store/taskStore.ts
interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  
  // Actions
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  
  // Selectors (computed values)
  getTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getOverdueTasks: () => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task].sort((a, b) => 
      a.deadline - b.deadline
    ),
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ),
  })),
  
  completeTask: (id) => set((state) => ({
    tasks: state.tasks.map(task =>
      task.id === id 
        ? { ...task, status: 'completed', completedAt: new Date() }
        : task
    ),
  })),
  
  getTodayTasks: () => {
    const today = startOfDay(new Date());
    return get().tasks.filter(task =>
      task.deadline && isSameDay(task.deadline, today)
    );
  },
}));
```

### 상태 동기화

```typescript
// src/store/middleware/persistMiddleware.ts
export const persistMiddleware = (config) => (set, get, api) =>
  config(
    (args) => {
      set(args);
      
      // 상태 변경 시 DB에 저장
      const state = get();
      AsyncStorage.setItem('taskStore', JSON.stringify(state));
    },
    get,
    api
  );

// 사용
export const useTaskStore = create(
  persistMiddleware(
    (set, get) => ({
      // store 정의
    })
  )
);
```

---

## 보안 아키텍처

### 데이터 암호화

```typescript
// src/services/StorageService.ts
import SQLCipher from 'react-native-sqlcipher';

export class SecureStorageService {
  private db: SQLCipher.Database;
  
  async initialize() {
    const encryptionKey = await this.getOrCreateKey();
    
    this.db = SQLCipher.openDatabase(
      'momentum.db',
      encryptionKey,
      {
        cipher: 'aes-256-cbc',
      }
    );
  }
  
  private async getOrCreateKey(): Promise<string> {
    // Android Keystore에서 키 가져오기
    const keystore = await NativeModules.KeyStore;
    
    let key = await keystore.getKey('db_encryption_key');
    
    if (!key) {
      // 키 생성 및 저장
      key = await keystore.generateKey('db_encryption_key', {
        algorithm: 'AES',
        keySize: 256,
        requireAuth: true, // 생체 인증 필요
      });
    }
    
    return key;
  }
}
```

### 권한 관리

```typescript
// src/services/PermissionService.ts
export class PermissionService {
  async requestMicrophonePermission(): Promise<boolean> {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: "마이크 권한",
        message: "미팅 녹음을 위해 마이크 접근 권한이 필요합니다.",
        buttonPositive: "허용",
        buttonNegative: "거부",
      }
    );
    
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  
  async requestAccessibilityService(): Promise<boolean> {
    // Android Accessibility 서비스 활성화 유도
    const isEnabled = await NativeModules.Accessibility.isEnabled();
    
    if (!isEnabled) {
      // 설정 화면으로 이동
      NativeModules.Accessibility.openSettings();
      return false;
    }
    
    return true;
  }
}
```

---

## 성능 최적화

### 메모리 관리

```typescript
// 큰 파일 처리 시 스트리밍 사용
class AudioProcessor {
  async processLargeFile(filePath: string): Promise<void> {
    const stream = fs.createReadStream(filePath, {
      highWaterMark: 64 * 1024, // 64KB 청크
    });
    
    for await (const chunk of stream) {
      await this.processChunk(chunk);
      
      // 메모리 해제
      if (global.gc) global.gc();
    }
  }
}
```

### 배터리 최적화

```typescript
// src/services/BackgroundService.ts
export class BackgroundService {
  private scheduler: BackgroundScheduler;
  
  async scheduleProcessing() {
    // Android WorkManager 사용
    await this.scheduler.schedule({
      taskId: 'context-analysis',
      interval: 15 * 60 * 1000, // 15분
      constraints: {
        requiresCharging: false,
        requiresDeviceIdle: false,
        requiresBatteryNotLow: true, // 배터리 부족 시 실행 안 함
        requiresNetworkType: 'UNMETERED', // Wi-Fi에서만
      },
      task: async () => {
        // 배치 처리
        await this.processPendingContexts();
      },
    });
  }
}
```

---

## 확장성 고려사항

### 기능 추가 시 고려사항

```typescript
// 플러그인 아키텍처로 기능 확장
interface ContextCapturePlugin {
  name: string;
  version: string;
  capture(): Promise<RawContext>;
  supports(type: ContextType): boolean;
}

// 예: 이메일 분석 플러그인 추가
class EmailCapturePlugin implements ContextCapturePlugin {
  name = 'email-capture';
  version = '1.0.0';
  
  supports(type: ContextType): boolean {
    return type === 'email';
  }
  
  async capture(): Promise<RawContext> {
    // Gmail API 연동
    const emails = await GmailAPI.fetchUnread();
    return this.parseEmails(emails);
  }
}

// 플러그인 등록
ContextCaptureManager.registerPlugin(new EmailCapturePlugin());
```

### 다중 플랫폼 지원

```typescript
// 플랫폼별 구현 분리
interface PlatformAdapter {
  requestPermissions(): Promise<boolean>;
  startBackgroundService(): Promise<void>;
  scheduleNotification(task: Task): Promise<void>;
}

// Android 구현
class AndroidAdapter implements PlatformAdapter {
  async requestPermissions(): Promise<boolean> {
    // Android 특화 권한 요청
    return await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);
  }
}

// iOS 구현 (향후)
class IOSAdapter implements PlatformAdapter {
  async requestPermissions(): Promise<boolean> {
    // iOS 특화 권한 요청
    return await request(PERMISSIONS.IOS.MICROPHONE);
  }
}

// 팩토리 패턴
export const PlatformAdapterFactory = {
  create(): PlatformAdapter {
    return Platform.OS === 'android' 
      ? new AndroidAdapter() 
      : new IOSAdapter();
  },
};
```

---

## 다이어그램 요약

### 시퀀스 다이어그램: 업무 생성 플로우

```
User          UI           Capture      Analysis     Executor      DB
 │            │             │            │            │            │
 │ [녹음시작]  │             │            │            │            │
 │───────────>│             │            │            │            │
 │            │ start()     │            │            │            │
 │            │────────────>│            │            │            │
 │            │             │ record     │            │            │
 │            │             │ .......... │            │            │
 │ [녹음종료]  │             │            │            │            │
 │───────────>│             │            │            │            │
 │            │ stop()      │            │            │            │
 │            │────────────>│            │            │            │
 │            │             │ audioFile  │            │            │
 │            │             │───────────>│            │            │
 │            │             │            │ classify() │            │
 │            │             │            │────┐       │            │
 │            │             │            │<───┘       │            │
 │            │             │            │ extract()  │            │
 │            │             │            │────┐       │            │
 │            │             │            │<───┘       │            │
 │            │             │            │ TaskContext│            │
 │            │             │            │───────────>│            │
 │            │             │            │            │ create()   │
 │            │             │            │            │───────────>│
 │            │             │            │            │            │ [DB저장]
 │            │             │            │            │<───────────│
 │            │             │            │            │ schedule() │
 │            │<────────────────────────────────────────────┘      │
 │ [확인요청]  │             │            │            │            │
 │<───────────│             │            │            │            │
```

---

**마지막 업데이트**: 2025-01-16  
**문서 버전**: 1.0.0  
**다음 업데이트**: 코드 구현 완료 후 실제 성능 지표 반영
