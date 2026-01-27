# EPICON Intent System

**No intent → No action.**

The EPICON Intent System ensures all significant actions have documented justification before execution.

---

## Purpose

Intent declarations serve multiple functions:

1. **Transparency**: Others understand why actions are taken
2. **Accountability**: Reasoning is recorded for future reference
3. **Review**: Enables meaningful evaluation of proposals
4. **Memory**: Preserves decision context across time
5. **Prevention**: Catches poorly-justified actions before harm

---

## Required Fields

Every EPICON intent must include:

### Core Fields

| Field | Description | Required |
|-------|-------------|----------|
| `epicon_id` | Unique identifier for the intent | Yes |
| `action` | What is being done | Yes |
| `scope` | Area affected (docs, ci, core, infra, sentinels, labs, specs) | Yes |
| `mode` | normal or emergency | Yes |
| `issued_at` | ISO 8601 timestamp | Yes |
| `expires_at` | ISO 8601 timestamp | Yes |

### Justification Block

| Field | Description | Required |
|-------|-------------|----------|
| `values_invoked` | Principles supporting the action | Yes |
| `reasoning` | Why this change makes sense | Yes |
| `anchors` | ≥2 independent supports (policy, practice, empirical) | Yes |
| `boundaries` | When this does NOT apply | Yes |
| `counterfactual` | What would change the conclusion | Yes |

### Optional Fields

| Field | Description | When Required |
|-------|-------------|---------------|
| `emergency_scope` | Narrowed scope for emergency mode | If mode=emergency |
| `intent_evolution` | Whether intent changed mid-PR | If modifying intent |
| `supersedes_hash` | Prior intent hash | If intent_evolution=true |
| `evolution_reason` | Why intent changed | If intent_evolution=true |

---

## Intent Template

```intent
epicon_id: EPICON_C-<cycle>_<SCOPE>_<description>_v1
title: <Short descriptive title>
cycle: C-<number>
scope: <docs | ci | core | infra | sentinels | labs | specs>
mode: <normal | emergency>

issued_at: <ISO 8601 timestamp>
expires_at: <ISO 8601 timestamp>

justification:
  VALUES INVOKED: <integrity, transparency, safety, etc.>
  REASONING: <Why this change makes sense in context>
  ANCHORS:
    - <First independent support>
    - <Second independent support>
  BOUNDARIES: <When this does NOT apply>
  COUNTERFACTUAL: <What would change the conclusion>

counterfactuals:
  - <Condition that would block merge>
  - <Condition that would require revert>
```

---

## Examples

### Tier 0: Documentation Update

```intent
epicon_id: EPICON_C-200_DOCS_readme-update_v1
title: Update README installation instructions
cycle: C-200
scope: docs
mode: normal

issued_at: 2026-01-27T10:00:00Z
expires_at: 2026-04-27T10:00:00Z

justification:
  VALUES INVOKED: transparency, accessibility
  REASONING: Current instructions reference deprecated commands
  ANCHORS:
    - User reports of installation failures
    - npm deprecation notices in CI logs
  BOUNDARIES: Does not affect code behavior
  COUNTERFACTUAL: If instructions work correctly, no change needed

counterfactuals:
  - If new instructions introduce errors, revert
```

### Tier 2: Integrity Math Change

```intent
epicon_id: EPICON_C-200_CORE_mii-threshold-adjustment_v1
title: Adjust MII warning threshold from 0.92 to 0.90
cycle: C-200
scope: core
mode: normal

issued_at: 2026-01-27T10:00:00Z
expires_at: 2026-04-27T10:00:00Z

justification:
  VALUES INVOKED: integrity, calibration, operational stability
  REASONING: Current threshold triggers too many false warnings
  ANCHORS:
    - Analysis of 90-day warning frequency (23% false positive rate)
    - Council review recommendation from C-198 report
  BOUNDARIES: Does not affect breach threshold (0.90)
  COUNTERFACTUAL: If false positive rate increases, revert

counterfactuals:
  - If real issues are missed due to relaxed threshold, revert
  - If council objects during comment period, pause
```

### Tier 3: Production Deployment

```intent
epicon_id: EPICON_C-200_INFRA_production-deploy-ledger_v1
title: Deploy ledger-api v2.1.0 to production
cycle: C-200
scope: infra
mode: normal

issued_at: 2026-01-27T10:00:00Z
expires_at: 2026-01-28T10:00:00Z

justification:
  VALUES INVOKED: integrity, reliability, security
  REASONING: Patch addresses critical vulnerability CVE-2026-1234
  ANCHORS:
    - Security advisory from upstream dependency
    - Successful staging deployment with 48-hour soak test
    - Eve safety review approval
  BOUNDARIES: Only affects ledger-api, no schema changes
  COUNTERFACTUAL: If staging reveals issues, delay deployment

counterfactuals:
  - If error rate increases >0.1%, immediate rollback
  - If latency increases >20%, immediate rollback
  - If any data integrity issue detected, immediate rollback

rollback_plan:
  - Revert to v2.0.3 (known good)
  - Notify on-call team
  - Post-incident review within 24 hours
```

---

## Intent Lifecycle

### Creation
1. Author drafts intent with all required fields
2. Intent attached to PR or issue
3. Automated validation checks completeness

### Review
1. Reviewers evaluate justification quality
2. Anchors are verified
3. Counterfactuals are assessed
4. Approval recorded

### Execution
1. Action proceeds only after approval
2. Intent hash recorded in ledger
3. Outcome linked to intent

### Expiration
1. Intents have explicit expiration
2. Expired intents require renewal
3. Long-running actions need periodic re-justification

---

## Intent Evolution

When intent changes mid-PR:

1. Set `intent_evolution: true`
2. Include `supersedes_hash` referencing prior intent
3. Document `evolution_reason`
4. Re-seek approvals if scope expanded

### Evolution Triggers
- New information changes reasoning
- Scope expanded beyond original intent
- Counterfactual condition materialized
- Reviewer feedback requires re-framing

---

## Validation Rules

### Auto-Rejection
- Missing required fields
- Expired intent
- Scope mismatch with actual changes
- Insufficient anchors (< 2)
- Empty counterfactuals

### Warning (Manual Review Required)
- Intent approaching expiration
- Large scope declaration
- Emergency mode without emergency_scope
- Intent evolution without supersedes_hash

---

## Related Documents

- [GOVERNANCE.md](./GOVERNANCE.md) - Governance framework
- [ZEUS_POLICY.md](./ZEUS_POLICY.md) - Policy rules
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [../epicon/TEMPLATE_EPICON.md](../epicon/TEMPLATE_EPICON.md) - Full EPICON template

---

*"No intent → No action." — Mobius Substrate*
