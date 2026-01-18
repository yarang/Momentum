# Changelog

All notable changes to Momentum will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Work management feature enhancement
- Shopping management feature
- iOS platform support

---

## [0.1.0] - 2026-01-18

### Added - Social Event Management Feature

#### Data Models
- `SocialEvent` type definition with 7 event types (wedding, funeral, birthday, etc.)
- `SocialEventLocation`, `SocialEventContact` interfaces
- `SocialEventCreateInput`, `SocialEventUpdateInput` interfaces
- `SocialEventFilter`, `SocialEventStatistics` interfaces
- Complete TypeScript type definitions in `src/shared/models/SocialEvent.types.ts`

#### Services
- **SocialEventExtractor**: AI-based event information extraction
  - Keyword-based intent classification
  - Entity extraction (dates, locations, contacts, amounts)
  - Priority inference from text context
  - Support for Korean date expressions and relative dates

- **CalendarService**: Device calendar integration
  - iOS EventKit support via `react-native-calendar-events`
  - Android Calendar Provider support
  - Permission management
  - Event creation, update, deletion
  - Automatic reminder scheduling (D-7, D-1, day-of)

- **PaymentDeepLinkService**: Payment app integration
  - KakaoPay deep link generation
  - Toss deep link generation
  - NaverPay deep link generation
  - Relationship-based recommended amounts
  - Support for 9 relationship types

#### Database
- `social_events` table schema with encryption support
- SQLite implementation with `react-native-quick-sqlite`
- `SocialEventDAO` data access object
- Indexed fields for efficient queries (date, type, status)

#### State Management
- Zustand store for social events (`socialEventStore.ts`)
- Reactive state updates with selectors
- Persistent storage integration

#### UI Components
- `SocialEventCard`: Event display with countdown
- `SocialEventList`: Filterable, sortable event list
- Empty states and loading indicators

#### Testing
- Unit tests for SocialEvent types
- Unit tests for database schema
- Unit tests for state management
- Integration tests for SocialEventExtractor
- Test coverage: **85%+** for core services

#### Documentation
- SPEC-SOC-001 specification document (EARS format)
- Implementation plan with 8 phases
- API documentation for all services
- Architecture documentation with Mermaid diagrams
- Feature documentation (`docs/SOCIAL_EVENT_FEATURE.md`)
- Integration guide (`docs/INTEGRATION_GUIDE.md`)
- README.md updates with new feature section

#### Dependencies
- `react-native-calendar-events`: ^2.2.0
- `react-native-contacts`: ^8.0.0 (for future contact integration)
- `@react-native-ml-kit/text-recognition`: ^2.0.0 (for future OCR)

### Changed
- Updated project structure to include `src/features/social/` directory
- Updated technology stack documentation
- Updated roadmap to show Phase 1 completion

### Security
- All social event data encrypted at rest with SQLCipher
- On-device processing only (no network transmission)
- Explicit user consent required for calendar access
- Automatic data deletion after 30 days (configurable)

---

## [0.0.1] - 2025-01-16

### Added
- Initial project setup
- Core AI engine structure
- Basic UI scaffolding
- Development environment configuration

---

## Version Format

- **Major.Minor.Patch** (e.g., 1.0.0)
- **Major**: Incompatible API changes
- **Minor**: New features (backwards compatible)
- **Patch**: Bug fixes (backwards compatible)

## Release Categories

### Added
New features and functionality

### Changed
Changes to existing functionality

### Deprecated
Soon-to-be removed features

### Removed
Removed features

### Fixed
Bug fixes

### Security
Security vulnerability fixes

---

**Last Updated**: 2026-01-18
