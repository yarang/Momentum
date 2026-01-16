# Momentum (MoAI-ADK) - Technology Stack

**Version**: 1.2.0
**Last Updated**: 2026-01-16

## Overview

MoAI-ADK is built as a lightweight, configuration-driven framework that extends Claude Code without introducing heavy runtime dependencies. The architecture prioritizes token efficiency, modular design, and seamless integration with existing development workflows.

## Core Technologies

### Platform Foundation

**Claude Code**
- **Version**: Latest (dynamic)
- **Purpose**: AI-powered development environment
- **Role**: Primary execution environment and AI model interface
- **Integration**: Native through `.claude/` directory structure

**Design Philosophy**: MoAI-ADK is designed as a zero-dependency framework that leverages Claude Code's built-in capabilities (agents, commands, skills, hooks) without introducing external runtime dependencies. All "technologies" are implemented as configuration files, Markdown documents, and Python hooks.

### Architecture Pattern

**Plugin-Based Agent Orchestration**
- **Pattern**: Event-driven architecture with sub-agent delegation
- **Paradigm**: Delegation over direct execution
- **Communication**: Claude Code Task() API with context passing
- **Isolation**: Each agent operates in independent 200K token context

**Progressive Disclosure Loading**
- **Level 1**: Skill metadata at startup (~100 tokens per skill)
- **Level 2**: SKILL.md body when triggered (~3K tokens)
- **Level 3**: Module files on-demand (unlimited)

**YAML-Based Configuration**
- **Format**: YAML (modular section-based)
- **Validation**: Schema-based validation for type safety
- **Hierarchy**: 6-level configuration inheritance
- **Token Efficiency**: Selective section loading

## Programming Languages

### Primary Languages

**Markdown (docs/config)**
- **Usage**: Documentation, skill files, agent definitions, command definitions
- **Standards**: CommonMark, GFM (GitHub Flavored Markdown)
- **Extensions**: YAML frontmatter, MDX support
- **Purpose**: Human-readable configuration and documentation

**Python (hooks)**
- **Version**: 3.13+ (recommended)
- **Usage**: Event-driven hooks for automation
- **Package Manager**: `uv` (ultra-fast Python package installer)
- **Purpose**: Runtime automation, validation, and integration

**YAML (config)**
- **Version**: 1.2+
- **Usage**: Configuration files and settings
- **Structure**: Modular section-based organization
- **Purpose**: Hierarchical configuration management

### Supported Language Stack (15 Languages)

MoAI-ADK provides specialized skills for 15 programming languages:

| Language | Version | Primary Use | Skill Name |
|----------|---------|-------------|------------|
| Python | 3.13+ | Backend, Data Science, ML | moai-lang-python |
| TypeScript | 5.9+ | Frontend, Backend, Full-stack | moai-lang-typescript |
| JavaScript | ES2024 | Frontend, Node.js | moai-lang-javascript |
| Java | 21 LTS | Enterprise Backend | moai-lang-java |
| Rust | 1.92+ | Systems, Performance-critical | moai-lang-rust |
| Go | 1.23+ | Backend, Microservices, Cloud | moai-lang-go |
| C# | .NET 8 | Enterprise, Windows | moai-lang-csharp |
| Kotlin | 2.0+ | Android, Backend | moai-lang-kotlin |
| Swift | 6+ | iOS, macOS | moai-lang-swift |
| PHP | 8.3+ | Web Development | moai-lang-php |
| Ruby | 3.3+ | Web Development, DevOps | moai-lang-ruby |
| Scala | 3.4+ | Big Data, Backend | moai-lang-scala |
| C++ | C++23 | Systems, Game Development | moai-lang-cpp |
| Elixir | 1.17+ | Distributed Systems | moai-lang-elixir |
| Flutter | 3.24+ | Mobile, Cross-platform | moai-lang-flutter |

**Language Skill Design**: Each language skill provides:
- Language-specific patterns and idioms
- Testing frameworks and best practices
- Linting and formatting tools
- Build system integration
- Common libraries and frameworks

## Agent System

### Agent Architecture

**Total Agents**: 20 specialized agents across 3 categories

**Agent Technology**:
- **Format**: Markdown files with YAML frontmatter
- **Location**: `.claude/agents/moai/`
- **Execution**: Claude Code Task(subagent_type="...") API
- **Context**: Independent 200K token sessions per agent
- **Communication**: Structured prompts with context passing

### Manager Agents (8)

Orchestration and workflow management:

| Agent | Model | Tools | Expertise |
|-------|-------|-------|-----------|
| manager-spec | sonnet | Task, Read, Write, Edit | EARS format, requirements analysis |
| manager-tdd | sonnet | Task, Bash, Read, Write | TDD cycle, coverage validation |
| manager-docs | sonnet | Task, Read, Write | Nextra, documentation generation |
| manager-quality | sonnet | Task, Bash, Read | TRUST 5 validation, code review |
| manager-project | sonnet | Task, Bash, Write | Project initialization, structure |
| manager-strategy | opus | Task, Read, Write | Architecture design, trade-offs |
| manager-git | sonnet | Task, Bash | Git workflow, branching |
| manager-claude-code | sonnet | Task, Read, Write | Claude Code configuration |

### Expert Agents (8)

Domain-specific implementation:

| Agent | Model | Tools | Expertise |
|-------|-------|-------|-----------|
| expert-backend | sonnet | Task, Read, Write, Edit | API design, server logic, databases |
| expert-frontend | sonnet | Task, Read, Write, Edit | React, UI components, state |
| expert-security | sonnet | Task, Read, Write, Edit | OWASP, vulnerability assessment |
| expert-devops | sonnet | Task, Bash, Read | CI/CD, infrastructure, deployment |
| expert-performance | sonnet | Task, Bash, Read | Profiling, optimization |
| expert-debug | sonnet | Task, Read, Write, Bash | Error analysis, troubleshooting |
| expert-testing | sonnet | Task, Bash, Read, Write | Test generation, strategy |
| expert-refactoring | sonnet | Task, Read, Write, Edit | Code quality, architecture |

### Builder Agents (4)

Meta-development tooling:

| Agent | Model | Tools | Purpose |
|-------|-------|-------|---------|
| builder-agent | sonnet | Task, Write | Create new agent definitions |
| builder-command | sonnet | Task, Write | Create new slash commands |
| builder-skill | sonnet | Task, Write | Create new skills |
| builder-plugin | sonnet | Task, Write, Bash | Create new plugins |

**Agent Selection Heuristics**:
- **Sequential Chaining**: For dependent tasks (spec → design → implement)
- **Parallel Execution**: For independent work (backend + frontend)
- **Conditional Routing**: For analysis-based decisions (debug → security/performance)

## Command System

### Command Architecture

**Total Commands**: 9 commands across 3 categories

**Command Technology**:
- **Format**: Markdown files with YAML frontmatter
- **Location**: `.claude/commands/moai/`
- **Invocation**: Slash syntax (`/moai:{command}`)
- **Parameters**: `$ARGUMENTS`, `$1`, `$2`, etc.
- **References**: `@file` for file context

### Command Categories

**Type A - Workflow Commands** (4 commands):
- Full tool access
- Agent delegation recommended for complex tasks
- User interaction via AskUserQuestion

**Type B - Utility Commands** (4 commands):
- Direct tool access allowed
- Quick, focused operations
- User assumes change responsibility

**Type C - Feedback Command** (1 command):
- Full tool access
- GitHub issue submission
- Quality gates optional

### Command Reference

| Command | Type | Purpose | Key Parameters |
|---------|------|---------|----------------|
| /moai:0-project | A | Project initialization | project_name, stack |
| /moai:1-plan | A | SPEC generation | feature_description |
| /moai:2-run | A | TDD implementation | SPEC-ID |
| /moai:3-sync | A | Documentation sync | SPEC-ID |
| /moai:alfred | A | Autonomous mode | task_description |
| /moai:fix | B | Auto-fix | (none - LSP-based) |
| /moai:loop | B | Ralph loop | max_iterations |
| /moai:cancel-loop | B | Cancel loop | (none) |
| /moai:9-feedback | C | Submit feedback | issue_type |

## Skill System

### Skill Architecture

**Total Skills**: 48 skills across 7 categories

**Skill Technology**:
- **Format**: Markdown files with YAML frontmatter
- **Location**: `.claude/skills/`
- **Invocation**: `Skill("skill-name")`
- **Loading**: Progressive disclosure (3-level)
- **Size Limit**: 500 lines per SKILL.md

### Skill Categories

**Foundation Skills** (5):
- moai-foundation-claude: Claude Code authoring patterns
- moai-foundation-core: SPEC system, TRUST 5, delegation
- moai-foundation-context: Context optimization
- moai-foundation-philosopher: Strategic thinking
- moai-foundation-quality: Quality gate patterns

**Language Skills** (15):
- 15 programming languages from Python to Flutter
- Each provides language-specific patterns and best practices
- Testing frameworks, linting, formatting, build systems

**Domain Skills** (5):
- moai-domain-backend: Backend patterns, API design
- moai-domain-frontend: Frontend patterns, UI frameworks
- moai-domain-uiux: UI/UX design principles
- moai-domain-database: Database design and optimization
- moai-domain-data-formats: Data serialization and validation

**Platform Skills** (9):
- Authentication: Clerk, Auth0, Firebase Auth
- Backend-as-a-Service: Supabase, Neon, Convex
- Deployment: Vercel, Railway
- Integration patterns and best practices

**Library Skills** (3):
- moai-library-shadcn-ui: React component library
- moai-library-nextra: Documentation framework
- moai-library-mermaid: Diagram generation

**Workflow Skills** (12):
- moai-workflow-spec: Specification workflow
- moai-workflow-tdd: TDD implementation
- moai-workflow-docs: Documentation generation
- moai-workflow-quality: Quality validation
- moai-workflow-project: Project management
- moai-workflow-strategy: Strategic planning
- moai-workflow-git: Git workflow
- moai-workloop: Ralph feedback loop
- moai-workflow-jit-docs: Just-in-time documentation
- Additional specialized workflows

**Format Skills** (1):
- moai-formats-data: TOON encoding, JSON/YAML optimization

### Progressive Disclosure

**Level 1 - Metadata** (~100 tokens):
- Loaded at startup
- Name and description from YAML frontmatter
- Enables skill discovery without full content load

**Level 2 - Instructions** (~3K tokens):
- Loaded when skill is triggered
- SKILL.md body with Quick Start and Implementation Guide
- Covers 80% of use cases

**Level 3 - Resources** (unlimited):
- Loaded on-demand from modules/
- Deep technical content, examples, references
- Mastery-level knowledge

## Hook System

### Hook Architecture

**Total Hooks**: 14 hooks across 5 event types

**Hook Technology**:
- **Format**: Python scripts
- **Location**: `.claude/hooks/moai/`
- **Naming**: `{event}__{name}.py`
- **Permissions**: Executable (`chmod +x`)
- **Registration**: settings.json hooks configuration

### Hook Events

**Pre-Tool Hooks** (2):
- `pre_tool__security_guard.py`: Security validation before tool execution
- `pre_tool__tdd_enforcer.py`: TDD compliance enforcement

**Post-Tool Hooks** (5):
- `post_tool__ast_grep_scan.py`: AST-based security scanning
- `post_tool__code_formatter.py`: Code formatting
- `post_tool__coverage_guard.py`: Test coverage validation
- `post_tool__linter.py`: Linting
- `post_tool__lsp_diagnostic.py`: LSP diagnostic integration

**Session Hooks** (3):
- `session_start__show_project_info.py`: Display project information
- `session_end__auto_cleanup.py`: Cleanup old files
- `session_end__rank_submit.py`: Submit session analytics

**Commit Hooks** (1):
- `pre_commit__tag_validator.py`: Validate commit message tags

**Stop Hooks** (1):
- `stop__loop_controller.py`: Ralph loop control on stop

### Hook Dependencies

**Python Packages** (managed via `uv`):
- `ast-grep`: AST pattern matching for security scanning
- `lsp-utils`: LSP diagnostic parsing and integration
- `coverage`: Test coverage measurement
- `ruff`: Fast Python linter
- `black`: Code formatter
- `pyyaml`: YAML configuration parsing

**Hook Libraries**:
- `.claude/hooks/moai/lib/`: Shared hook utilities
- `__init__.py`: Hook initialization and configuration

## Integration Technologies

### MCP (Model Context Protocol)

**Context7 Integration**:
- **Server**: `@upstash/context7-mcp@latest`
- **Purpose**: Official library documentation access
- **Usage**: Latest documentation retrieval for frameworks and libraries
- **Configuration**: `.mcp.json`

**Configuration**:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  },
  "staggeredStartup": {
    "enabled": true,
    "delayMs": 500,
    "connectionTimeout": 15000
  }
}
```

### Documentation Technologies

**Nextra** (Documentation Framework):
- **Version**: 3.x / 4.x
- **Purpose**: Static site generation for documentation
- **Features**: MDX support, file-system routing, built-in search
- **Integration**: moai-library-nextra skill

**Mermaid** (Diagram Generation):
- **Version**: 11.12.2
- **Purpose**: Diagram generation for documentation
- **Features**: 21 diagram types, MCP Playwright rendering
- **Integration**: moai-library-mermaid skill

**Documentation Formats**:
- Markdown: Primary documentation format
- MDX: Enhanced Markdown with React components
- reStructuredText: Python/Sphinx documentation
- JSDoc/TSDoc: JavaScript/TypeScript API docs

### Quality Assurance Technologies

**TRUST 5 Framework**:
- **Test-First**: pytest, unittest, jest, testing-library
- **Readable**: ruff, pylint, eslint
- **Unified**: black, prettier, isort
- **Secured**: ast-grep, bandit, safety
- **Trackable**: commitlint, semantic-release

**Testing Frameworks** (by language):
- Python: pytest, unittest, pytest-cov
- TypeScript/JavaScript: jest, vitest, testing-library
- Java: JUnit 5, Mockito
- Rust: cargo test, tokio-test
- Go: testing, testify
- Others: Language-specific frameworks

**Security Tools**:
- ast-grep: AST pattern matching for security vulnerabilities
- bandit: Python security linter
- safety: Python dependency vulnerability scanner
- OWASP guidelines: Security best practices

## Configuration Technologies

### YAML Configuration System

**Modular Architecture**:
- **Main Config**: `.moai/config/config.yaml`
- **Sections**: `.moai/config/sections/*.yaml`
- **Loading**: Selective section loading for token efficiency

**Section Files**:
- `user.yaml`: User personalization
- `language.yaml`: Language preferences (conversation, code, documentation)
- `project.yaml`: Project metadata
- `git-strategy.yaml`: Git workflow configuration
- `quality.yaml`: TDD and quality settings
- `system.yaml`: System settings (includes document_management)
- `llm.yaml`: Multi-LLM routing
- `pricing.yaml`: Service and pricing
- `ralph.yaml`: Ralph Engine settings

### Settings Hierarchy

**6-Level Configuration Priority**:
1. **File-Managed**: `.claude/settings.json` (managed by Claude Code)
2. **CLI**: Command-line arguments
3. **Local**: `.moai/config/config.yaml`
4. **Shared**: Team/shared configuration
5. **User**: User-specific configuration
6. **Global**: Global Claude Code settings

**Configuration Merging**: Deep merge with override capability

## Token Optimization Technologies

### Context Management

**Phase Separation**:
- **SPEC Phase**: 30K tokens (requirements only)
- **TDD Phase**: 180K tokens (implementation focus)
- **Docs Phase**: 40K tokens (result caching)
- **Total Budget**: 250K tokens across all phases

**Token Saving Strategies**:
- **Selective Loading**: Load only necessary files
- **Context Optimization**: Target 20-30K tokens per interaction
- **Phase Resets**: `/clear` between phases saves 45-50K tokens
- **Progressive Disclosure**: Load skill content on-demand

### Model Selection

**Claude Models**:
- **Sonnet**: Quality-focused tasks (agents, complex workflows)
- **Haiku**: Speed and cost (simple tasks, 70% cheaper)
- **Opus**: Strategic planning (architecture, design)

**Cost Optimization**:
- Use Haiku for 60-70% total cost savings
- Reserve Sonnet for quality-critical tasks
- Use Opus sparingly for complex decisions

## Automation Technologies

### Ralph Engine

**LSP-Based Auto-Fix Loop**:
- **Trigger**: LSP diagnostic detection
- **Analysis**: expert-debug agent analyzes issues
- **Fix**: Automated fix implementation
- **Validation**: Re-check until clean
- **Control**: `/moai:loop` and `/moai:cancel-loop`

**Components**:
- `lsp_diagnostic.py`: LSP parsing and issue detection
- `loop_controller.py`: Loop state management
- `/moai:fix`: Quick fix command
- `/moai:loop`: Continuous improvement loop

### CI/CD Integration

**GitHub Actions Workflow**:
```yaml
name: MoAI Quality Gates
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - Checkout repository
      - Setup Python (uv)
      - Run security_guard hook
      - Run coverage_guard hook
      - Run linter hook
      - Validate TRUST 5 compliance
```

**Quality Gate Pipeline**:
1. Security scanning (ast-grep)
2. Test coverage validation (85%+)
3. Linting (ruff, eslint)
4. Formatting validation (black, prettier)
5. Commit message validation

## Development Tools

### Python Package Management

**uv** (Ultra-Fast Python Package Installer):
- **Purpose**: Fast Python package installation and management
- **Usage**: Hook dependencies and Python tooling
- **Benefits**: 10-100x faster than pip

**Hook Dependencies**:
- `ast-grep`: Security scanning
- `lsp-utils`: LSP integration
- `coverage`: Test coverage
- `ruff`: Fast linting
- `black`: Code formatting

### Git Integration

**Git Strategy**:
- **Branching Model**: Feature branch workflow
- **Commit Messages**: Structured format with tags
- **Tag Validation**: Pre-commit hook enforcement
- **Integration**: manager-git agent for operations

## Platform Integrations

### Authentication Platforms

**Clerk**:
- moai-platform-clerk skill
- Authentication and user management
- Integration patterns and best practices

**Auth0**:
- moai-platform-auth0 skill
- Enterprise authentication
- OAuth and OIDC patterns

**Firebase Auth**:
- moai-platform-firebase-auth skill
- Google authentication platform
- Firestore integration

### Backend-as-a-Service

**Supabase**:
- moai-platform-supabase skill
- Open-source Firebase alternative
- PostgreSQL, Auth, Storage

**Neon**:
- moai-platform-neon skill
- Serverless PostgreSQL
- Branching and scaling

**Convex**:
- moai-platform-convex skill
- Reactive backend platform
- Real-time data synchronization

### Deployment Platforms

**Vercel**:
- moai-platform-vercel skill
- Next.js and React deployment
- Preview deployments and edge functions

**Railway**:
- moai-platform-railway skill
- Infrastructure platform
- Database and service deployment

## Technical Decisions

### Why Zero Runtime Dependencies?

**Decision**: MoAI-ADK has no runtime dependencies beyond Claude Code.

**Rationale**:
- **Simplicity**: No installation or setup required
- **Compatibility**: Works with any Claude Code environment
- **Performance**: No overhead from dependency management
- **Maintenance**: Reduced update burden and security concerns

**Trade-offs**:
- Hook functionality limited to Python standard library + minimal dependencies
- No heavy runtime frameworks (e.g., no webpack, no docker)

### Why YAML Configuration?

**Decision**: Use YAML for configuration with modular sections.

**Rationale**:
- **Human-Readable**: Easy to read and edit
- **Hierarchical**: Supports nested configuration
- **Token Efficient**: Selective loading reduces context
- **Industry Standard**: Widely adopted and supported

**Alternatives Considered**:
- JSON: Less readable, no comments
- TOML: Less widely adopted
- HCL: Too complex for this use case

### Why Progressive Disclosure?

**Decision**: Three-level skill loading (metadata, instructions, resources).

**Rationale**:
- **Token Efficiency**: Load only what's needed
- **Startup Speed**: Fast initialization with minimal content
- **Scalability**: Unlimited content without performance impact
- **User Experience**: Quick discovery without information overload

**Alternatives Considered**:
- Load all content at startup: Token bloat, slow startup
- Single-level loading: All-or-nothing approach

### Why Agent Delegation?

**Decision**: Delegate all work through specialized sub-agents.

**Rationale**:
- **Specialization**: Each agent optimized for specific domain
- **Parallelism**: Independent agents can run concurrently
- **Token Efficiency**: Each agent has 200K context
- **Quality**: Domain experts produce better results

**Alternatives Considered**:
- Direct implementation: Lower quality, no parallelism
- Single generalist agent: Less specialized knowledge

### Why SPEC-First TDD?

**Decision**: EARS format specifications before TDD implementation.

**Rationale**:
- **Clarity**: Clear requirements before implementation
- **Validation**: Spec can be reviewed and validated
- **Token Efficiency**: Phase separation saves 45-50K tokens
- **Quality**: Test-driven development ensures coverage

**Alternatives Considered**:
- Direct implementation: Unclear requirements, rework
- Documentation after code: Incomplete documentation

### Why Multi-Language Support?

**Decision**: Support 15 programming languages with specialized skills.

**Rationale**:
- **Versatility**: Single framework for diverse stacks
- **Adoption**: Support for existing team languages
- **Learning**: Easy cross-language skill transfer
- **Future-Proof**: Extensible for new languages

**Trade-offs**:
- Maintenance overhead for language-specific updates
- Skill content must be kept current

## Performance Considerations

### Token Budget Management

**200K Token Budget Optimization**:
- Phase separation reduces redundancy
- Selective file loading minimizes waste
- Progressive disclosure delays content load
- Context compression for long sessions

**Model Selection Strategy**:
- Use Haiku for simple tasks (70% cost savings)
- Use Sonnet for quality-critical tasks
- Use Opus sparingly for complex decisions

### Hook Performance

**Asynchronous Execution**:
- Pre-tool hooks: Synchronous (block execution)
- Post-tool hooks: Asynchronous (non-blocking)
- Session hooks: One-time execution

**Resource Management**:
- Cleanup hooks: Automatic file retention
- Cache management: 30-day retention with eviction
- Memory limits: Context compaction for long sessions

## Security Considerations

### Security Architecture

**Defense in Depth**:
1. **Pre-Tool Hooks**: Security validation before execution
2. **AST-Grep Scanning**: Pattern-based vulnerability detection
3. **OWASP Compliance**: Security best practices enforcement
4. **Code Review**: manager-quality validation

**Security Hooks**:
- `pre_tool__security_guard.py`: Blocks dangerous operations
- `post_tool__ast_grep_scan.py`: Detects vulnerabilities
- `expert-security`: OWASP compliance validation

### Data Privacy

**Local Execution**:
- All processing happens locally
- No data sent to external services (except Claude API)
- Session data stored locally in `.moai/memory/`

**Retention Policies**:
- Logs: 30 days with automatic cleanup
- Cache: 30 days with eviction
- Temp files: 7 days with auto-deletion

## Future Technology Roadmap

### Version 1.3.0 (Q2 2026)
- Enhanced Context7 integration for more libraries
- Advanced Ralph Engine with learning capabilities
- Plugin marketplace for community contributions

### Version 1.4.0 (Q3 2026)
- Team collaboration features (shared specs, reviews)
- CI/CD pipeline integration templates
- Performance analytics dashboard

### Version 2.0.0 (Q4 2026)
- Distributed agent execution across machines
- Custom model routing and load balancing
- Enterprise governance and compliance suite

## Compatibility Matrix

### Claude Code Versions

| MoAI-ADK | Claude Code | Status |
|----------|-------------|--------|
| 1.2.0 | Latest | Fully Supported |
| 1.1.x | Latest | Fully Supported |
| 1.0.x | Latest | Deprecated |

### Operating Systems

| OS | Support | Notes |
|----|---------|-------|
| Linux | Full | Primary development platform |
| macOS | Full | Full support with minor differences |
| Windows | Partial | WSL2 recommended |

### Python Versions

| Python | Support | Notes |
|--------|---------|-------|
| 3.13+ | Recommended | Latest features and performance |
| 3.12 | Supported | Stable and widely used |
| 3.11 | Supported | Minimum for all features |
| < 3.11 | Not Supported | Missing required features |

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-16
**Maintained By**: MoAI-ADK Framework
