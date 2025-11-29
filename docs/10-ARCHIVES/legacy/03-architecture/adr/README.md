# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for Mobius Systems.

## What is an ADR?

An ADR is a document that captures an important architectural decision made along with its context and consequences.

## ADR Format

Each ADR follows this structure:

- **Status**: Proposed | Accepted | Rejected | Deprecated
- **Date**: Decision date
- **Deciders**: Who made the decision
- **Tags**: Keywords for categorization
- **Context**: What situation led to this decision
- **Decision**: What was decided
- **Consequences**: Positive, negative, and risks
- **Alternatives**: Other options considered

## ADR Index

| Number | Title | Status | Date |
|--------|-------|--------|------|
| [ADR-001](001-integrity-first-architecture.md) | Integrity-First Architecture | Accepted | 2025-11-09 |
| ADR-002 | Model-Agnostic Sovereignty Layer | Proposed | TBD |
| ADR-003 | Four-Cortex Sentinel Design | Proposed | TBD |
| ADR-004 | Deliberation Proof Protocol | Proposed | TBD |
| ADR-005 | Anti-Nuke Guardrails | Proposed | TBD |

## Contributing

When proposing a new ADR:

1. Create `docs/03-architecture/adr/XXX-title.md` (XXX is next number)
2. Use the template below
3. Submit PR for TSC review
4. Update this index when accepted

## Template

```markdown
# ADR-XXX: Title

**Status**: Proposed  
**Date**: YYYY-MM-DD  
**Deciders**: Names  
**Tags**: tag1, tag2

## Context

[Describe the situation]

## Decision

[Describe the decision]

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Drawback 1]
- [Drawback 2]

### Risks
- [Risk 1]
- [Risk 2]

## Alternatives Considered

### Alternative 1: [Name]
**Rejected**: [Reason]

## Implementation Notes

[Any implementation details]

**Related ADRs**: [Links to related ADRs]
```

