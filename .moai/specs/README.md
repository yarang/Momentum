# Momentum SPEC Documentation Index

This directory contains all project specifications (SPEC) following the EARS format.

## SPEC Index

| SPEC ID | Title | Domain | Status | Priority |
|---------|-------|--------|--------|----------|
| [SPEC-SOC-001](./SPEC-SOC-001/spec.md) | Social Event Management | Social | Completed | High |
| SPEC-AI-002 | AI/ML Engine | AI | Planned | High |
| SPEC-SHP-003 | Shopping Management | Shopping | Planned | Medium |
| SPEC-WRK-004 | Work Management | Work | Planned | High |

## SPEC Directory Structure

Each SPEC follows the standardized structure:

```
SPEC-XXX/
├── spec.md              # Main specification document (EARS format)
├── plan.md              # Implementation plan with phases
├── requirements.md      # Detailed requirements breakdown (optional)
└── tests/               # Test specifications (optional)
```

## SPEC Status Values

- **Planned**: Initial specification created, awaiting implementation
- **In Progress**: Currently under development
- **Completed**: Implementation finished and tested
- **On Hold**: Temporarily paused
- **Cancelled**: No longer pursued

## EARS Format Categories

Momentum specifications use the **Easy Approach to Requirements Syntax (EARS)**:

- **Ubiquitous**: System-wide always-active requirements
- **Event-Driven**: Triggered by specific events (WHEN X do Y)
- **State-Driven**: Conditional based on system state (IF X do Y)
- **Unwanted**: Prohibited actions (shall not do X)
- **Optional**: Nice-to-have features (where possible do X)

## Related Documentation

- [../CLAUDE.md](../CLAUDE.md) - Project context and overview
- [../README.md](../README.md) - Project README
- [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
- [../docs/API.md](../docs/API.md) - API documentation

## Quick Reference

### Creating a New SPEC

1. Create directory: `.moai/specs/SPEC-XXX/`
2. Initialize using `/moai:1-plan` command
3. Follow EARS format template
4. Link dependent SPECs
5. Document implementation phases in plan.md

### Updating SPEC Status

When implementation completes:
1. Update status in `spec.md` metadata table
2. Mark completed phases in `plan.md`
3. Run `/moai:3-sync` to synchronize documentation
4. Update this README index

---

**Last Updated**: 2026-01-18
**Maintained By**: MoAI-ADK Foundation
