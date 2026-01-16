# Momentum (MoAI-ADK) - Project Structure

**Version**: 1.2.0
**Last Updated**: 2026-01-16

## Overview

MoAI-ADK follows a modular, plugin-based architecture with clear separation of concerns. The project is organized around three primary directories: `.claude/` for Claude Code configuration, `.moai/` for MoAI system data, and the project root for user code.

## Directory Structure

```
Momentum/
├── .claude/                          # Claude Code configuration root
│   ├── agents/                       # Sub-agent definitions (20 agents)
│   │   └── moai/                     # MoAI-specific agents
│   │       ├── manager-*.md          # Manager agents (8)
│   │       ├── expert-*.md           # Expert agents (8)
│   │       └── builder-*.md          # Builder agents (4)
│   ├── commands/                     # Slash command definitions (9 commands)
│   │   └── moai/                     # MoAI-specific commands
│   │       ├── 0-project.md          # Project initialization
│   │       ├── 1-plan.md             # SPEC generation
│   │       ├── 2-run.md              # TDD implementation
│   │       ├── 3-sync.md             # Documentation sync
│   │       ├── 9-feedback.md         # Feedback submission
│   │       ├── alfred.md             # Autonomous mode
│   │       ├── fix.md                # Auto-fix
│   │       ├── loop.md               # Ralph loop control
│   │       └── cancel-loop.md        # Loop cancellation
│   ├── skills/                       # Skill definitions (48 skills)
│   │   ├── moai-foundation-*/        # Foundation skills (5)
│   │   ├── moai-lang-*/              # Language skills (15)
│   │   ├── moai-domain-*/            # Domain skills (5)
│   │   ├── moai-platform-*/          # Platform skills (9)
│   │   ├── moai-library-*/           # Library skills (3)
│   │   ├── moai-workflow-*/          # Workflow skills (12)
│   │   └── moai-formats-*/           # Format skills (1)
│   ├── hooks/                        # Event-driven hooks (14 hooks)
│   │   └── moai/                     # MoAI-specific hooks
│   │       ├── pre_tool__*.py        # Pre-tool execution hooks
│   │       ├── post_tool__*.py       # Post-tool execution hooks
│   │       ├── session_start__*.py   # Session start hooks
│   │       ├── session_end__*.py     # Session end hooks
│   │       ├── pre_commit__*.py      # Pre-commit hooks
│   │       └── stop__*.py            # Stop hooks
│   ├── output-styles/                # Output style templates
│   └── settings.json                 # Claude Code settings (managed)
│
├── .moai/                            # MoAI system data
│   ├── config/                       # Configuration files
│   │   ├── config.yaml               # Main configuration
│   │   └── sections/                 # Modular configuration sections
│   │       ├── user.yaml             # User personalization
│   │       ├── language.yaml         # Language preferences
│   │       ├── project.yaml          # Project metadata
│   │       ├── git-strategy.yaml     # Git workflow config
│   │       ├── quality.yaml          # TDD and quality settings
│   │       ├── system.yaml           # System settings
│   │       ├── llm.yaml              # Multi-LLM routing
│   │       ├── pricing.yaml          # Service pricing
│   │       └── ralph.yaml            # Ralph Engine settings
│   ├── specs/                        # SPEC document repository
│   │   └── SPEC-XXX/                 # Individual specs
│   │       ├── spec.md               # EARS format specification
│   │       ├── design.md             # Architecture design
│   │       └── validation.md         # Validation report
│   ├── logs/                         # Runtime logs (30-day retention)
│   │   ├── sessions/                 # Session logs
│   │   ├── agents/                   # Agent execution logs
│   │   └── errors/                   # Error logs
│   ├── memory/                       # Context memory
│   │   ├── session-*.jsonl           # Session transcripts
│   │   └── agent-*.jsonl             # Agent execution logs
│   ├── reports/                      # Analysis reports
│   │   ├── quality/                  # Quality gate reports
│   │   ├── security/                 # Security scan reports
│   │   └── performance/              # Performance reports
│   ├── docs/                         # Documentation content
│   │   ├── api/                      # API documentation
│   │   ├── architecture/             # Architecture docs
│   │   └── guides/                   # User guides
│   ├── project/                      # Project documentation
│   │   ├── product.md                # Product overview
│   │   ├── structure.md              # This file
│   │   └── tech.md                   # Technology stack
│   ├── cache/                        # Cache files (30-day retention)
│   │   ├── docs/                     # Documentation cache
│   │   └── context/                  # Context cache
│   ├── temp/                         # Temporary files (7-day retention)
│   ├── llm-configs/                  # LLM configuration profiles
│   └── announcements/                # System announcements
│
├── .mcp.json                         # MCP server configuration
├── CLAUDE.md                         # Alfred orchestrator instructions
├── .gitignore                        # Git ignore patterns
└── README.md                         # Project README

```

## Component Architecture

### 1. Configuration Layer

#### `.claude/` - Claude Code Configuration
This directory contains all Claude Code-specific configurations and is managed by Claude Code itself.

**Purpose**: Store Claude Code agents, commands, skills, and hooks.

**Key Subdirectories**:
- `agents/`: Sub-agent definitions for delegation
- `commands/`: Slash command definitions for user interaction
- `skills/`: Skill definitions for domain expertise
- `hooks/`: Event-driven automation scripts

**Management**: Partially managed by Claude Code, with custom MoAI additions in `moai/` subdirectories.

#### `.moai/config/` - MoAI Configuration
This directory contains all MoAI-ADK-specific configuration.

**Purpose**: Centralized configuration management with modular sections.

**Key Files**:
- `config.yaml`: Main configuration file
- `sections/`: Modular configuration for different aspects

**Design Principles**:
- **Modular**: Each aspect has its own section file
- **Hierarchical**: Sections can reference and override each other
- **Token Efficient**: Only load required sections

### 2. Execution Layer

#### `.moai/specs/` - SPEC Repository
This directory stores all project specifications in EARS format.

**Purpose**: Maintain structured requirements and specifications.

**Directory Pattern**:
```
.moai/specs/
├── SPEC-001/
│   ├── spec.md              # EARS format specification
│   ├── design.md            # Architecture design (optional)
│   └── validation.md        # Validation report (optional)
├── SPEC-002/
│   └── spec.md
└── ...
```

**Lifecycle**:
1. Created by `/moai:1-plan` command
2. Used by `/moai:2-run SPEC-XXX` for implementation
3. Updated by `/moai:3-sync SPEC-XXX` with documentation

#### `.moai/logs/` - Runtime Logs
This directory stores runtime logs with 30-day automatic retention.

**Purpose**: Track execution history for debugging and analysis.

**Subdirectories**:
- `sessions/`: Session-level logs
- `agents/`: Agent execution logs
- `errors/`: Error-specific logs

**Retention**: 30 days with automatic cleanup via `auto_cleanup` hook.

#### `.moai/memory/` - Context Memory
This directory stores session and agent transcripts.

**Purpose**: Maintain context across sessions for agent resumption.

**File Patterns**:
- `session-*.jsonl`: Session transcripts
- `agent-*.jsonl`: Agent execution logs

**Usage**: Enables agent resumption with `Resume agent {agentId}`.

### 3. Output Layer

#### `.moai/reports/` - Analysis Reports
This directory stores automated analysis reports.

**Purpose**: Provide insights into code quality, security, and performance.

**Subdirectories**:
- `quality/`: TRUST 5 quality gate reports
- `security/`: Security scan results
- `performance/`: Performance analysis reports

**Generation**: Automated by `manager-quality` agent and various hooks.

#### `.moai/docs/` - Documentation Content
This directory stores project documentation separate from code.

**Purpose**: Maintain comprehensive project documentation.

**Subdirectories**:
- `api/`: API documentation
- `architecture/`: Architecture diagrams and descriptions
- `guides/`: User guides and tutorials

**Integration**: Works with Nextra for documentation site generation.

#### `.moai/project/` - Project Documentation
This directory contains meta-documentation about the project.

**Purpose**: Document the project itself, not the code.

**Files**:
- `product.md`: Product overview and features
- `structure.md`: This file - project structure
- `tech.md`: Technology stack and decisions

**Audience**: Developers, maintainers, and stakeholders.

### 4. Support Layer

#### `.moai/cache/` - Cache Files
This directory stores cached data with 30-day retention.

**Purpose**: Improve performance through caching.

**Subdirectories**:
- `docs/`: Cached documentation
- `context/`: Cached context data

**Cleanup**: Automatic via `auto_cleanup` hook.

#### `.moai/temp/` - Temporary Files
This directory stores temporary files with 7-day retention.

**Purpose**: Short-term storage for intermediate results.

**Cleanup**: Automatic via `auto_cleanup` hook.

#### `.moai/llm-configs/` - LLM Configurations
This directory stores LLM routing and configuration profiles.

**Purpose**: Enable multi-LLM routing strategies.

**Usage**: Referenced by `sections/llm.yaml`.

#### `.moai/announcements/` - System Announcements
This directory stores system-wide announcements.

**Purpose**: Communicate important updates to users.

**Display**: Shown at session start via `show_project_info` hook.

## Agent Organization

### Manager Agents (8)
Located in `.claude/agents/moai/manager-*.md`:

| Agent | Purpose | Trigger |
|-------|---------|---------|
| manager-spec | SPEC generation and EARS format | `/moai:1-plan` |
| manager-tdd | TDD implementation and coverage | `/moai:2-run SPEC-XXX` |
| manager-docs | Documentation generation | `/moai:3-sync SPEC-XXX` |
| manager-quality | Quality gate validation | Delegated by Alfred |
| manager-project | Project initialization | `/moai:0-project` |
| manager-strategy | System design and architecture | Delegated by Alfred |
| manager-git | Git operations and branching | Delegated by Alfred |
| manager-claude-code | Claude Code configuration | Delegated by Alfred |

### Expert Agents (8)
Located in `.claude/agents/moai/expert-*.md`:

| Agent | Purpose | Domain |
|-------|---------|--------|
| expert-backend | API development, server logic | Backend |
| expert-frontend | React components, UI | Frontend |
| expert-security | Security analysis, OWASP | Security |
| expert-devops | CI/CD, infrastructure | DevOps |
| expert-performance | Optimization, profiling | Performance |
| expert-debug | Error analysis, debugging | Debugging |
| expert-testing | Test generation, strategy | Testing |
| expert-refactoring | Code quality improvement | Refactoring |

### Builder Agents (4)
Located in `.claude/agents/moai/builder-*.md`:

| Agent | Purpose | Output |
|-------|---------|--------|
| builder-agent | Create new agent definitions | `.md` agent files |
| builder-command | Create new slash commands | `.md` command files |
| builder-skill | Create new skills | `SKILL.md` files |
| builder-plugin | Create new plugins | `.claude-plugin/` bundles |

## Command Organization

### Workflow Commands (4)
Located in `.claude/commands/moai/`:

| Command | Purpose | Phase |
|---------|---------|-------|
| 0-project.md | Initialize new project | Setup |
| 1-plan.md | Generate SPEC from description | Plan |
| 2-run.md | Implement SPEC with TDD | Execute |
| 3-sync.md | Generate documentation | Sync |

### Utility Commands (4)
Located in `.claude/commands/moai/`:

| Command | Purpose | Type |
|---------|---------|------|
| alfred.md | Autonomous development mode | Type A |
| fix.md | Auto-fix based on LSP diagnostics | Type B |
| loop.md | Ralph feedback loop control | Type B |
| cancel-loop.md | Cancel active loop | Type B |

### Feedback Command (1)
Located in `.claude/commands/moai/`:

| Command | Purpose | Type |
|---------|---------|------|
| 9-feedback.md | Submit GitHub issues | Type C |

## Skill Organization

### Foundation Skills (5)
Core patterns and principles:

| Skill | Purpose |
|-------|---------|
| moai-foundation-claude | Claude Code authoring patterns |
| moai-foundation-core | SPEC system, TRUST 5, delegation |
| moai-foundation-context | Context optimization |
| moai-foundation-philosopher | Strategic thinking |
| moai-foundation-quality | Quality gate patterns |

### Language Skills (15)
Programming language expertise:

| Skill | Language | Version |
|-------|----------|---------|
| moai-lang-python | Python | 3.13+ |
| moai-lang-typescript | TypeScript | 5.9+ |
| moai-lang-javascript | JavaScript | ES2024 |
| moai-lang-java | Java | 21 LTS |
| moai-lang-rust | Rust | 1.92+ |
| moai-lang-go | Go | 1.23+ |
| moai-lang-csharp | C# | .NET 8 |
| moai-lang-kotlin | Kotlin | 2.0+ |
| moai-lang-swift | Swift | 6+ |
| moai-lang-php | PHP | 8.3+ |
| moai-lang-ruby | Ruby | 3.3+ |
| moai-lang-scala | Scala | 3.4+ |
| moai-lang-cpp | C++ | C++23 |
| moai-lang-elixir | Elixir | 1.17+ |
| moai-lang-flutter | Flutter | 3.24+ |

### Domain Skills (5)
Domain-specific expertise:

| Skill | Domain |
|-------|--------|
| moai-domain-backend | Backend patterns |
| moai-domain-frontend | Frontend patterns |
| moai-domain-uiux | UI/UX design |
| moai-domain-database | Database design |
| moai-domain-data-formats | Data serialization |

### Platform Skills (9)
Platform integrations:

| Skill | Platform | Purpose |
|-------|----------|---------|
| moai-platform-clerk | Clerk | Authentication |
| moai-platform-auth0 | Auth0 | Authentication |
| moai-platform-firebase-auth | Firebase | Auth & Firestore |
| moai-platform-supabase | Supabase | Backend |
| moai-platform-neon | Neon | Database |
| moai-platform-vercel | Vercel | Deployment |
| moai-platform-railway | Railway | Deployment |
| moai-platform-convex | Convex | Backend |

### Library Skills (3)
Library integrations:

| Skill | Library | Purpose |
|-------|---------|---------|
| moai-library-shadcn-ui | Shadcn UI | Component library |
| moai-library-nextra | Nextra | Documentation sites |
| moai-library-mermaid | Mermaid | Diagrams |

### Workflow Skills (12)
Development workflows:

| Skill | Workflow |
|-------|----------|
| moai-workflow-spec | Specification workflow |
| moai-workflow-tdd | TDD workflow |
| moai-workflow-docs | Documentation workflow |
| moai-workflow-quality | Quality validation |
| moai-workflow-project | Project management |
| moai-workflow-strategy | Strategic planning |
| moai-workflow-git | Git workflow |
| moai-workloop | Ralph feedback loop |
| moai-workflow-jit-docs | Just-in-time documentation |

### Format Skills (1)
Data format handling:

| Skill | Format |
|-------|--------|
| moai-formats-data | TOON, JSON, YAML |

## Hook Organization

### Pre-Tool Hooks (2)
Executed before tool use:

| Hook | Purpose | File |
|------|---------|------|
| security_guard | Security validation | `pre_tool__security_guard.py` |
| tdd_enforcer | TDD compliance | `pre_tool__tdd_enforcer.py` |

### Post-Tool Hooks (5)
Executed after tool use:

| Hook | Purpose | File |
|------|---------|------|
| ast_grep_scan | Security scanning | `post_tool__ast_grep_scan.py` |
| code_formatter | Code formatting | `post_tool__code_formatter.py` |
| coverage_guard | Coverage validation | `post_tool__coverage_guard.py` |
| linter | Linting | `post_tool__linter.py` |
| lsp_diagnostic | LSP diagnostics | `post_tool__lsp_diagnostic.py` |

### Session Hooks (3)
Executed on session events:

| Hook | Purpose | File |
|------|---------|------|
| show_project_info | Display project info | `session_start__show_project_info.py` |
| auto_cleanup | Cleanup old files | `session_end__auto_cleanup.py` |
| rank_submit | Submit session data | `session_end__rank_submit.py` |

### Commit Hooks (1)
Executed before commit:

| Hook | Purpose | File |
|------|---------|------|
| tag_validator | Validate commit tags | `pre_commit__tag_validator.py` |

### Stop Hooks (1)
Executed on stop:

| Hook | Purpose | File |
|------|---------|------|
| loop_controller | Control Ralph loop | `stop__loop_controller.py` |

## File Naming Conventions

### Agents
- Pattern: `{category}-{name}.md`
- Example: `manager-spec.md`, `expert-backend.md`
- Location: `.claude/agents/moai/`

### Commands
- Pattern: `{number}-{name}.md` or `{name}.md`
- Example: `1-plan.md`, `alfred.md`
- Location: `.claude/commands/moai/`

### Skills
- Pattern: `moai-{category}-{name}/SKILL.md`
- Example: `moai-lang-python/SKILL.md`
- Location: `.claude/skills/`

### Hooks
- Pattern: `{event}__{name}.py`
- Example: `pre_tool__security_guard.py`
- Location: `.claude/hooks/moai/`

### Specs
- Pattern: `SPEC-{XXX}/spec.md`
- Example: `SPEC-001/spec.md`
- Location: `.moai/specs/`

## Configuration Loading Priority

1. **Global Settings**: User's global Claude Code settings
2. **Project Config**: `.claude/settings.json` (managed)
3. **MoAI Config**: `.moai/config/config.yaml`
4. **Section Files**: `.moai/config/sections/*.yaml`
5. **Environment Variables**: Override settings
6. **Command Line Args**: Highest priority

## Data Flow

### Specification Flow
```
User Request
    ↓
/moai:1-plan
    ↓
manager-spec agent
    ↓
.moai/specs/SPEC-XXX/spec.md
    ↓
/moai:2-run SPEC-XXX
    ↓
manager-tdd agent
    ↓
Implementation with tests
    ↓
/moai:3-sync SPEC-XXX
    ↓
manager-docs agent
    ↓
.moai/docs/ documentation
```

### Quality Gate Flow
```
Code Change
    ↓
Pre-tool hooks (security_guard, tdd_enforcer)
    ↓
Tool Execution
    ↓
Post-tool hooks (ast_grep_scan, coverage_guard, linter)
    ↓
.moai/reports/quality/
    ↓
manager-quality validation
    ↓
Pass/Fail decision
```

### Ralph Loop Flow
```
/moai:loop
    ↓
lsp_diagnostic hook
    ↓
Issues detected?
    ↓ Yes
/moai:fix
    ↓
expert-debug agent
    ↓
Fix implemented
    ↓
Re-validate
    ↓
Repeat until clean
```

## Maintenance Guidelines

### Adding New Agents
1. Create agent file in `.claude/agents/moai/{category}-{name}.md`
2. Follow agent template format
3. Add to CLAUDE.md agent catalog
4. Test with `Use the {category}-{name} subagent`

### Adding New Commands
1. Create command file in `.claude/commands/moai/{name}.md`
2. Follow command template format
3. Add to CLAUDE.md command reference
4. Test with `/moai:{name}`

### Adding New Skills
1. Create skill directory in `.claude/skills/moai-{category}-{name}/`
2. Create SKILL.md with progressive disclosure
3. Add modules/ for extended content
4. Test with `Skill("moai-{category}-{name}")`

### Adding New Hooks
1. Create hook file in `.claude/hooks/moai/{event}__{name}.py`
2. Follow hook template format
3. Make executable with `chmod +x`
4. Register in settings.json

### Configuration Updates
1. Edit section files in `.moai/config/sections/`
2. Validate YAML syntax
3. Test with relevant commands
4. Document breaking changes

## Best Practices

### Directory Organization
- Keep related files together
- Use descriptive names
- Follow naming conventions
- Document custom directories

### File Management
- Use `.moai/` for MoAI-specific data
- Use `.claude/` for Claude Code config
- Respect retention policies
- Clean up temp files regularly

### Documentation
- Document custom components
- Update CLAUDE.md for changes
- Generate docs with `/moai:3-sync`
- Maintain CHANGELOG

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-16
**Maintained By**: MoAI-ADK Framework
