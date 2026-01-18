# SPEC-AI-002: 수용 기준

## 개요

본 문서는 SPEC-AI-002의 수용 기준, 테스트 시나리오, Given-When-Then 형식의 검증 조건을 정의합니다.

## 성공 기준 (Quality Gates)

### GATE-AI-001: 기능적 완성도
- [ ] BERT 모델이 실제로 로딩되고 추론 수행
- [ ] NER 모델이 실제로 로딩되고 추론 수행
- [ ] 폴백 메커니즘이 정상 작동
- [ ] OCR → Intent → Entity → Action 파이프라인 완결

### GATE-AI-002: 성능 목표
- [ ] 의도 분류 추론 속도: P95 <500ms
- [ ] 엔티티 추출 추론 속도: P95 <300ms
- [ ] 배터리 영향: 백그라운드 처리 시 <5%
- [ ] 메모리 사용: 상시 <100MB

### GATE-AI-003: 품질 기준
- [ ] 테스트 커버리지: ≥80% (Lines)
- [ ] ESLint: 0 에러, <10 경고
- [ ] TypeScript: 0 타입 에러
- [ ] CI/CD: 모든 테스트 통과

### GATE-AI-004: 프라이버시
- [ ] 온디바이스 처리 검증 (네트워크 없이 작동)
- [ ] 개인정보 로그 없음 검증
- [ ] 데이터 암호화 작동 확인

## 테스트 시나리오 (Given-When-Then)

### TS-AI-001: BERT 모델 로딩

**Given**: 사용자가 앱을 처음 실행하고 스크린샷을 캡처한다

**When**: OCR이 텍스트 추출을 완료하고 의도 분류를 요청한다

**Then**:
- 시스템은 KcBERT 모델을 로딩한다
- 로딩 시간은 3초 이내여야 한다
- 모델 로딩 실패 시 정규식 폴백을 사용한다

**검증 방법**:
```typescript
expect(classifier.getStatus().loaded).toBe(true);
expect(loadTime).toBeLessThan(3000);
```

### TS-AI-002: 의도 분류 추론

**Given**: BERT 모델이 로딩되어 있고 분류할 텍스트가 있다

**When**: "다음 주 수요일에 결혼식이 있어" 텍스트로 의도 분류를 요청한다

**Then**:
- 시스템은 'social' 의도를 반환한다
- 신뢰도 점수는 0.6 이상이어야 한다
- 추론 시간은 500ms 이내여야 한다

**검증 방법**:
```typescript
const result = await classifier.classifyIntent("다음 주 수요일에 결혼식이 있어");
expect(result.intent).toBe('social');
expect(result.confidence).toBeGreaterThanOrEqual(0.6);
expect(result.processingTime).toBeLessThan(500);
```

### TS-AI-003: 의도 분류 폴백

**Given**: BERT 모델 로딩이 실패한 상태이다

**When**: 텍스트로 의도 분류를 요청한다

**Then**:
- 시스템은 키워드 기반 분류를 사용한다
- 키워드 "결혼식"을 포함한 텍스트는 'social'로 분류된다
- 앱이 충돌하지 않는다

**검증 방법**:
```typescript
// Force model to fail
classifier.reset();
const result = await classifier.classifyIntent("결혼식이 있어");
expect(result.intent).toBe('social');
expect(result.confidence).toBeGreaterThan(0);
```

### TS-AI-004: NER 모델 엔티티 추출

**Given**: NER 모델이 로딩되어 있고 텍스트가 있다

**When**: "서울에 사는 김철수가 5만 원을 송금했다" 텍스트로 엔티티 추출을 요청한다

**Then**:
- 시스템은 엔티티 리스트를 반환한다
- 엔티티에는 '서울' (LOC), '김철수' (PER), '5만 원' (MNY)이 포함된다
- 추론 시간은 300ms 이내여야 한다

**검증 방법**:
```typescript
const result = await extractor.extractEntities(context);
const locations = result.entities.filter(e => e.type === 'location');
const people = result.entities.filter(e => e.type === 'person');
const amounts = result.entities.filter(e => e.type === 'amount');

expect(locations).toContainEqual(expect.objectContaining({ value: '서울' }));
expect(people).toContainEqual(expect.objectContaining({ value: '김철수' }));
expect(amounts).toContainEqual(expect.objectContaining({ value: '50000' }));
expect(result.processingTime).toBeLessThan(300);
```

### TS-AI-005: 한국어 이름 인식

**Given**: 한국어 텍스트가 있다

**When**: "김철수 님과 박영희 씨가 회의를 했다" 텍스트로 엔티티 추출을 요청한다

**Then**:
- 시스템은 '김철수'와 '박영희'를 인식한다
- 각 엔티티의 신뢰도는 0.7 이상이어야 한다

**검증 방법**:
```typescript
const result = await extractor.extractEntities(context);
const people = result.entities.filter(e => e.type === 'person');

expect(people).toHaveLength(2);
expect(people[0].confidence).toBeGreaterThanOrEqual(0.7);
```

### TS-AI-006: 온디바이스 처리 검증

**Given**: 기기가 비행기 모드(네트워크 없음)이다

**When**: 스크린샷을 캡처하고 분석을 요청한다

**Then**:
- 시스템은 온디바이스에서 모든 처리를 완료한다
- 네트워크 요청은 발생하지 않는다
- 결과는 네트워크 연결 상태와 동일하다

**검증 방법**:
```typescript
// Enable airplane mode
await setAirplaneMode(true);

const result = await analyzer.analyze(context);
expect(result.success).toBe(true);

// Verify no network requests
expect(networkRequests).toHaveLength(0);
```

### TS-AI-007: 배터리 소모 측정

**Given**: 배터리가 100% 충전된 상태이다

**When**: 100개의 스크린샷을 백그라운드에서 처리한다

**Then**:
- 배터리 소모는 5% 미만이어야 한다
- 앱은 백그라운드에서 안정적으로 실행된다

**검증 방법**:
```bash
# Android battery profiling
adb shell dumpsys batterystats | grep momentum

# iOS energy logging
idevicediagnostics diagnostics energy
```

### TS-AI-008: 앱 번들 크기 확인

**Given**: TFLite 모델 파일이 앱 번들에 포함된다

**When**: 앱을 빌드한다

**Then**:
- 앱 번들 크기 증가는 150MB 미만이어야 한다
- 모델 파일 크기는 130MB 미만이어야 한다

**검증 방법**:
```bash
# Android
./gradlew assembleRelease
ls -lh app/build/outputs/apk/release/

# iOS
xcodebuild -archivePath Momentum.xcarchive archive
```

### TS-AI-009: 메모리 사용량 측정

**Given**: 앱이 실행 중이고 AI 서비스가 초기화된다

**When**: BERT와 NER 모델이 로딩된다

**Then**:
- 메모리 사용량은 100MB 미만이어야 한다
- 메모리 누수가 발생하지 않는다

**검증 방법**:
```bash
# Android heap profiling
adb shell dumpsys meminfo momentum

# iOS memory graph
Xcode → Debug Navigator → Memory
```

### TS-AI-010: 정규식 폴백 신뢰도

**Given**: ML 모델이 신뢰도 0.5 미만의 결과를 반환한다

**When** 텍스트 분류가 요청된다

**Then**:
- 시스템은 정규식 폴백을 사용한다
- 폴백 결과의 신뢰도는 0.3 이상이어야 한다
- 최종 결과는 ML 또는 폴백 중 더 높은 신뢰도를 갖는다

**검증 방법**:
```typescript
// Set low ML confidence
mockModelReturnsLowConfidence();

const result = await classifier.classifyIntent(text);
expect(result.confidence).toBeGreaterThanOrEqual(0.3);
```

## 성능 벤치마크

### 벤치마크 설정

**테스트 기기**:
- Android: Samsung Galaxy S23 (Snapdragon 8 Gen 2)
- iOS: iPhone 14 (A16 Bionic)

**테스트 데이터셋**: 100개 실제 사용자 스크린샷

### 성능 목표

| 메트릭 | P50 | P95 | P99 |
|--------|-----|-----|-----|
| 의도 분류 (BERT) | <200ms | <500ms | <800ms |
| 엔티티 추출 (NER) | <150ms | <300ms | <500ms |
| 전체 파이프라인 | <400ms | <800ms | <1200ms |

### 벤치마크 실행 방법

```typescript
describe('AI Performance Benchmarks', () => {
  it('IntentClassifier P95 <500ms', async () => {
    const times: number[] = [];

    for (let i = 0; i < 100; i++) {
      const start = Date.now();
      await classifier.classifyIntent(testTexts[i]);
      times.push(Date.now() - start);
    }

    times.sort((a, b) => a - b);
    const p95 = times[Math.floor(times.length * 0.95)];

    expect(p95).toBeLessThan(500);
  });
});
```

## 테스트 커버리지 목표

### Phase별 커버리지

| Phase | Lines | Branches | Functions |
|-------|-------|----------|-----------|
| Phase 1 완료 | ≥60% | ≥50% | ≥60% |
| Phase 2 완료 | ≥70% | ≥60% | ≥70% |
| Phase 3 완료 | ≥80% | ≥70% | ≥80% |

### 커버리지 측정

```bash
# Run tests with coverage
npm test -- --coverage

# Check coverage report
open coverage/lcov-report/index.html
```

## Definition of Done 체크리스트

### 기능적 완성
- [ ] BERT 모델 통합 완료
- [ ] NER 모델 통합 완료
- [ ] 폴백 메커니즘 작동
- [ ] 파이프라인 완결

### 품질 기준
- [ ] 테스트 커버리지 ≥80%
- [ ] 모든 테스트 통과
- [ ] ESLint 0 에러
- [ ] TypeScript 0 타입 에러

### 성능 기준
- [ ] 추론 속도 목표 달성
- [ ] 배터리 소모 <5%
- [ ] 메모리 사용 <100MB
- [ ] 앱 번들 크기 <150MB

### 프라이버시
- [ ] 온디바이스 처리 검증
- [ ] 네트워크 요청 없음 확인
- [ ] 데이터 암호화 작동

---

**버전**: 1.0.0
**마지막 업데이트**: 2026-01-18
**작성자**: Spec Builder Agent
