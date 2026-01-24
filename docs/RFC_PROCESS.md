# Mobius RFC Process (v0.1)

RFCs are used for governance changes that affect how Mobius defines or allocates legitimacy.

This process exists to:
- Prevent accidental protocol drift
- Make changes reviewable and reversible
- Preserve dissent and decision trails

---

## 1) When an RFC is Required

Required for changes to:
- MIC issuance/burn/slash rules
- MIC utilities / permission gates
- MII formula, weights, or default thresholds
- Circuit breaker semantics
- Sentinel evaluation protocol pass/fail criteria
- EPICON schema required fields

Optional (but recommended) for:
- New docs that materially redefine scope
- New workflow categories

---

## 2) RFC Template

Create: `docs/11-SUPPLEMENTARY/rfcs/RFC-YYYYMMDD-<slug>.md`

Minimum sections:

### Summary
One paragraph describing the proposed change.

### Motivation
What failure mode does this address?

### Proposed Change
Precise diff or specification change.

### Alternatives Considered
What else was evaluated and why rejected?

### Backward Compatibility
Does this break existing workflows?

### Risk Analysis
What could go wrong?

### Rollback Plan
How to revert if this fails?

### Success Metrics
How we know it worked.

### Open Questions
What remains unresolved?

---

## 3) RFC Template (Copy-Paste)

```markdown
# RFC-YYYYMMDD-<slug>

**Status:** Draft | Under Review | Accepted | Rejected | Deferred

## Summary

<!-- One paragraph -->

## Motivation

<!-- What failure mode does this address? -->

## Proposed Change

<!-- Precise specification -->

## Alternatives Considered

<!-- What else was evaluated? -->

## Backward Compatibility

<!-- Does this break existing workflows? -->

## Risk Analysis

<!-- What could go wrong? -->

## Rollback Plan

<!-- How to revert if this fails? -->

## Success Metrics

<!-- How we know it worked -->

## Open Questions

<!-- What remains unresolved? -->

---

*RFC Author: [name]*
*Date: YYYY-MM-DD*
```

---

## 4) Review Requirements

To merge an RFC-backed change:
- ✅ 2 maintainer approvals
- ✅ Sentinel review output recorded (even if advisory)
- ✅ EPICON created and referenced in PR

**Minimum review window:**
- 72 hours for non-urgent changes
- Urgent/security changes may bypass window but must include post-merge review note

---

## 5) Outcome Types

RFC outcome must be labeled:
- **Accepted:** Change approved and implemented
- **Rejected:** Change declined with rationale
- **Deferred:** Change postponed pending more data
- **Accepted with Modifications:** Change approved with specified alterations

Once resolved, RFC status should be updated at top of file.

---

## 6) Fork and Exit

If consensus cannot be reached:
- Fork is permitted
- Competing RFCs may be implemented in separate branches/forks
- Pilots and evidence decide which path wins adoption

---

## 7) RFC Lifecycle

```
Draft → Under Review → [Accepted | Rejected | Deferred]
                              ↓
                        Implementation
                              ↓
                         Monitoring
                              ↓
                     [Success | Revision]
```

---

## 8) Recording RFCs

All RFCs are stored in `docs/11-SUPPLEMENTARY/rfcs/` directory with format:

```
docs/11-SUPPLEMENTARY/rfcs/
├── RFC-20260124-mic-decay-rate.md
├── RFC-20260201-mii-weights.md
└── README.md
```

---

## 9) RFC Index

Maintain an index at `docs/11-SUPPLEMENTARY/rfcs/README.md`:

```markdown
# RFC Index

| RFC ID | Title | Status | Date |
|--------|-------|--------|------|
| RFC-20260124-mic-decay | MIC Decay Rate Change | Accepted | 2026-01-24 |
| RFC-20260201-mii | MII Weight Adjustment | Under Review | 2026-02-01 |
```

---

## 10) Governance of RFC Process

Changes to the RFC process itself require:
- An RFC (meta-RFC) filed in `docs/11-SUPPLEMENTARY/rfcs/`
- 72-hour review window
- ≥2 maintainer approvals

---

*"We heal as we walk." — Mobius Substrate*
