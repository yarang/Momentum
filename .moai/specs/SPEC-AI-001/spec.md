# SPEC-AI-001: AI/ML Features Implementation

**TAG**: SPEC-AI-001
**Created**: 2026-01-18
**Status**: Planned
**Priority**: High
**Assigned**: AI/ML Team

## Environment

### Project Context
Momentum is an AI Context-Action Agent React Native application that converts user's digital traces into actions. The app captures context from screenshots, chat, location, and voice, then analyzes it to suggest actionable tasks.

### Current State
- **Database**: SQLite with encryption implemented
- **Core Architecture**: Feature-based structure with clear separation
- **Test Coverage**: 1.89% (far below 85% TRUST target)
- **ESLint Errors**: 29 errors in AI services
- **AI/ML Implementation**: Keyword-based only (OCR TODO, intent classification via keywords)

### Technical Constraints
- React Native 0.73.6
- TypeScript 5.3.3
- Node.js >= 18
- On-device processing required (privacy-first)
- Battery optimization critical (< 5% additional consumption)
- Memory budget: < 100MB for ML operations

### Integration Points
- ContextCaptureService: Screenshot OCR integration
- ContextAnalyzerService: Intent classification and entity extraction
- SQLite: Local storage for extracted data
- Push Notifications: Action reminders

## Assumptions

### Technical Assumptions
- **High Confidence**: TensorFlow Lite compatible with React Native 0.73.6
- **Medium Confidence**: Korean language models (KoBERT/KcBERT) available in TFLite format
- **Low Confidence**: On-device BERT inference performance on mid-range devices
- **Risk if Wrong**: Poor model performance may require hybrid cloud approach

### Business Assumptions
- **High Confidence**: Korean and English text extraction sufficient for MVP
- **Medium Confidence**: Users will tolerate 500ms-1s inference time
- **Risk if Wrong**: Slow inference will result in poor user experience

### Team Assumptions
- **High Confidence**: Team has TensorFlow/ML experience
- **Low Confidence**: Familiarity with React Native native modules
- **Risk if Wrong**: Native module integration issues may delay implementation

## Requirements (EARS Format)

### 1. OCR Implementation (High Priority)

#### 1.1 Ubiquitous Requirements
- **OCR-001**: The system **shall** extract text from screenshots with minimum 24x24 pixel character height for Korean text and 12x12 pixel for English text.
- **OCR-002**: The system **shall** support Korean Hangul, Hanja, and English text extraction.
- **OCR-003**: The system **shall** process images within 500ms on mid-range devices.
- **OCR-004**: The system **shall** consume less than 5% additional battery during background processing.

#### 1.2 Event-Driven Requirements
- **OCR-101**: **WHEN** a user captures a screenshot, **THEN** the system **shall** automatically extract text using ML Kit OCR.
- **OCR-102**: **WHEN** OCR processing fails, **THEN** the system **shall** fallback to storing image metadata without extracted text.
- **OCR-103**: **WHEN** text extraction completes, **THEN** the system **shall** populate the `extractedText` field in Context data structure.

#### 1.3 State-Driven Requirements
- **OCR-201**: **IF** the image contains low-quality text (< 20px height), **THEN** the system **shall** apply image preprocessing (contrast enhancement, noise reduction).
- **OCR-202**: **IF** device battery level is below 20%, **THEN** the system **shall** defer OCR processing until charging.
- **OCR-203**: **IF** OCR confidence is below 0.6, **THEN** the system **shall** flag the context for manual review.

#### 1.4 Unwanted Behavior Requirements
- **OCR-301**: The system **shall not** block the UI thread during OCR processing.
- **OCR-302**: The system **shall not** consume more than 50MB memory for single image processing.
- **OCR-303**: The system **shall not** upload images to external servers for OCR processing.

#### 1.5 Optional Requirements
- **OCR-401**: **WHERE POSSIBLE**, the system **should** provide handwriting recognition for Korean and English.
- **OCR-402**: **WHERE POSSIBLE**, the system **should** extract text from rotated images (automatic orientation detection).

### 2. Intent Classification (High Priority)

#### 2.1 Ubiquitous Requirements
- **INTENT-001**: The system **shall** classify user intent into categories: calendar, shopping, work, social, payment.
- **INTENT-002**: The system **shall** provide confidence scores (0-1) for all classifications.
- **INTENT-003**: The system **shall** maintain at least 80% classification accuracy on validation dataset.
- **INTENT-004**: The system **shall** support both Korean and English text input.

#### 2.2 Event-Driven Requirements
- **INTENT-101**: **WHEN** new context is captured, **THEN** the system **shall** classify intent using BERT-based model.
- **INTENT-102**: **WHEN** BERT model inference fails, **THEN** the system **shall** fallback to keyword-based classification.
- **INTENT-103**: **WHEN** primary intent confidence is below 0.6, **THEN** the system **shall** provide top 3 alternative intents.

#### 2.3 State-Driven Requirements
- **INTENT-201**: **IF** text contains mixed Korean and English, **THEN** the system **shall** use multilingual BERT model.
- **INTENT-202**: **IF** text length exceeds 512 tokens, **THEN** the system **shall** truncate or segment while preserving intent-bearing content.
- **INTENT-203**: **IF** device is low on memory (< 150MB available), **THEN** the system **shall** use lightweight keyword approach instead of BERT.

#### 2.4 Unwanted Behavior Requirements
- **INTENT-301**: The system **shall not** classify intent with confidence below 0.3 without user confirmation.
- **INTENT-302**: The system **shall not** load BERT model into memory until first classification request.
- **INTENT-303**: The system **shall not** use cloud-based classification APIs (privacy-first).

#### 2.5 Optional Requirements
- **INTENT-401**: **WHERE POSSIBLE**, the system **should** learn from user corrections to improve classification.
- **INTENT-402**: **WHERE POSSIBLE**, the system **should** detect compound intents (e.g., "shopping + payment").

### 3. Entity Extraction Enhancement (Medium Priority)

#### 3.1 Ubiquitous Requirements
- **ENTITY-001**: The system **shall** extract entities with types: date, time, amount, person, location, organization.
- **ENTITY-002**: The system **shall** provide raw text, normalized value, and confidence score for each entity.
- **ENTITY-003**: The system **shall** achieve at least 75% entity extraction F1 score on Korean text.
- **ENTITY-004**: The system **shall** support Korean person names (2-3 characters) and organization names.

#### 3.2 Event-Driven Requirements
- **ENTITY-101**: **WHEN** context text is analyzed, **THEN** the system **shall** extract all entities above 0.7 confidence threshold.
- **ENTITY-102**: **WHEN** date entity is extracted, **THEN** the system **shall** normalize to ISO 8601 format.
- **ENTITY-103**: **WHEN** amount entity is extracted, **THEN** the system **shall** include currency information (KRW, USD).

#### 3.3 State-Driven Requirements
- **ENTITY-201**: **IF** entity context is ambiguous, **THEN** the system **shall** use surrounding words to disambiguate (e.g., "Samsung" as company vs. location).
- **ENTITY-202**: **IF** no entities are found, **THEN** the system **shall** fallback to regex-based extraction for dates, amounts, phone numbers.

#### 3.4 Unwanted Behavior Requirements
- **ENTITY-301**: The system **shall not** extract PII (credit card numbers, SSN) without explicit user consent.
- **ENTITY-302**: The system **shall not** store raw entity text beyond 30 days (privacy policy).

#### 3.5 Optional Requirements
- **ENTITY-401**: **WHERE POSSIBLE**, the system **should** recognize entity aliases (e.g., "Samsung" = "Samsung Electronics").
- **ENTITY-402**: **WHERE POSSIBLE**, the system **should** link related entities (e.g., person + phone number).

### 4. Quality Improvements (Blocking)

#### 4.1 Ubiquitous Requirements
- **QUAL-001**: The system **shall** achieve minimum 60% test coverage for AI/ML services.
- **QUAL-002**: The system **shall** have zero ESLint errors in AI service files.
- **QUAL-003**: The system **shall** have zero TypeScript `any` types in AI service implementations.
- **QUAL-004**: The system **shall** include unit tests for all OCR, intent, and entity extraction functions.

#### 4.2 Event-Driven Requirements
- **QUAL-101**: **WHEN** new code is committed, **THEN** the system **shall** run ESLint and block commit on errors.
- **QUAL-102**: **WHEN** tests are executed, **THEN** the system **shall** fail if coverage drops below 60%.

#### 4.3 Unwanted Behavior Requirements
- **QUAL-301**: The system **shall not** merge code with failing tests.
- **QUAL-302**: The system **shall not** use `any` type without inline TODO comment explaining limitation.

## Traceability

| Requirement ID | Feature | Test Case | Implementation File |
|----------------|---------|-----------|---------------------|
| OCR-001 to OCR-004 | Screenshot Text Extraction | TC-OCR-001 to TC-OCR-004 | ContextCaptureService.ts |
| INTENT-001 to INTENT-004 | BERT Intent Classification | TC-INTENT-001 to TC-INTENT-004 | ContextAnalyzerService.ts |
| ENTITY-001 to ENTITY-004 | Named Entity Recognition | TC-ENTITY-001 to TC-ENTITY-004 | ContextAnalyzerService.ts |
| QUAL-001 to QUAL-004 | Code Quality Standards | TC-QUAL-001 to TC-QUAL-004 | All AI Services |

## Dependencies

### External Dependencies
- `@react-native-ml-kit/text-recognition`: ML Kit OCR for React Native
- `@tensorflow/tfjs-react-native`: TensorFlow.js for React Native
- TensorFlow Lite models: MobileBERT/KoBERT for intent classification

### Internal Dependencies
- ContextCaptureService: Screenshot capture workflow
- ContextAnalyzerService: Intent and entity extraction
- Database Service: Persistent storage of extracted data
- Permission Service: Photo library access

### Risks
- **High Risk**: On-device BERT inference performance on low-end devices
- **Medium Risk**: Korean language model availability in TFLite format
- **Low Risk**: ML Kit OCR integration with React Native 0.73.6

### Mitigation Strategies
- Implement hybrid approach: BERT primary, keyword fallback
- Profile inference time and optimize model size if needed
- Create comprehensive test suite for model validation
