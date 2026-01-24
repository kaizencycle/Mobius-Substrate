---
epicon_id: EPICON_C-202_DOCS_legitimacy-substrate-docset_v1
title: "Legitimacy Substrate Documentation Set + Sentinel Review Protocol v0.1"
author_name: "Michael Judan"
author_wallet: ""
cycle: "C-202"
epoch: ""
tier: "SUBSTRATE"
scope:
  domain: "docs"
  system: "governance"
  environment: "mainnet"
epicon_type: "design"
status: "proposed"
related_prs: []
related_commits: []
related_epicons: ["EPICON_C-199_DOCS_root-folder-cleanup_v1"]
tags: ["documentation", "governance", "legitimacy", "sentinel", "MIC", "MII", "pilots"]
integrity_index_baseline: 0.95
risk_level: "low"
created_at: "2026-01-24T00:00:00Z"
updated_at: "2026-01-24T00:00:00Z"
version: 1
hash_hint: ""
summary: "Ship repo-ready documentation and evaluation scaffold for legitimacy-preservation substrate"
---

# EPICON C-202: Legitimacy Substrate Documentation Set

- **Layer:** SUBSTRATE → docs → governance
- **Author:** Michael Judan (+AUREA)
- **Date:** 2026-01-24
- **Status:** Proposed → Ready for Merge
- **Label Target:** consensus:approved

---

## Intent Publication (EPICON-02 Compliance)

```intent
epicon_id: EPICON_C-202_DOCS_legitimacy-substrate-docset_v1
title: Legitimacy Substrate Documentation Set + Sentinel Review Protocol v0.1
cycle: C-202
scope: docs
mode: normal
issued_at: 2026-01-24T00:00:00Z
expires_at: 2026-01-31T00:00:00Z

justification:
  VALUES INVOKED: integrity, transparency, accountability, contestability
  REASONING: Mobius requires explicit documentation that prevents category errors 
    (confusing legitimacy-preservation with model alignment/AGI safety) and establishes
    falsifiable evaluation criteria for the Sentinel Council and integrity metrics.
  ANCHORS:
    - External evaluation correctly identified execution gaps (unclear constituency,
      decision authority, change process)
    - MIC/MII/EPICON need explicit specification to be useful beyond rhetoric
    - Pilot program structure needed to generate real-world evidence
  BOUNDARIES:
    - This EPICON applies ONLY to documentation and workflow scaffolding
    - Does NOT change runtime behavior or production services
    - Does NOT add new dependencies or infrastructure
    - Does NOT claim model-level alignment or ASI containment
  COUNTERFACTUAL:
    - If any runtime code is affected, this would exceed scope
    - If claims are made about capabilities Mobius doesn't have, docs must be revised
    - If MII dropped below 0.95, this would require revert

counterfactuals:
  - Runtime code affected → BLOCK (scope violation)
  - Overclaims detected → REVISE (intellectual honesty)
  - MII < 0.95 → REVERT (integrity threshold)
  - Category errors remain → REVISE (documentation failure)
```

### Scope Envelope

| Permission | Granted |
|------------|---------|
| `docs.read` | ✅ |
| `docs.write` | ✅ |
| `docs.create` | ✅ |
| `.github.workflows.create` | ✅ (non-blocking) |
| `.github.templates.update` | ✅ |
| `pilots.create` | ✅ |
| `apps/*` | ❌ |
| `packages/*` | ❌ |
| `services/*` | ❌ |
| `code.*` | ❌ |

### Authority Declaration

- **Actor:** AUREA Agent (on behalf of kaizencycle:michaeljudan)
- **Authority Source:** CODEOWNERS approval
- **Scope Limitation:** Documentation and workflow scaffolding ONLY
- **Expiration:** 2026-01-31T00:00:00Z

---

## Summary

> Ship a repo-ready documentation and evaluation scaffold that: (1) prevents category errors when evaluating Mobius, (2) defines MIC as reputation capital (not currency), (3) defines MII as calibratable and falsifiable, (4) establishes Sentinel Council evaluation protocol, (5) creates Pilot Program templates to generate real-world evidence, (6) establishes AUREA/ATLAS review prompts with optional automated PR commentary.

---

## 1. Context

- External evaluation identified that Mobius documentation conflated legitimacy-preservation with model alignment
- MIC, MII, and EPICON concepts existed but lacked explicit, falsifiable specifications
- No structured process existed for running pilots or evaluating sentinel performance
- Sentinel review was ad-hoc rather than systematic

---

## 2. Assumptions

- **A1:** Mobius is a legitimacy-preservation system, not an alignment technique
- **A2:** MIC is reputation capital, not tradable currency
- **A3:** MII thresholds (e.g., 0.95) are policy defaults, not physical constants
- **A4:** The ledger is tamper-evident (via git history), not cryptographically immutable (yet)
- **A5:** Sentinels are advisory; humans retain decision authority
- **A6:** Forking is a first-class right for governance disputes

---

## 3. Problem Statement

Mobius documentation needs to:
1. Clearly state what Mobius is NOT (prevent category errors)
2. Specify MIC issuance, burning, and utilities explicitly
3. Define MII calibration methodology with falsifiability criteria
4. Establish evaluation protocol for Sentinel Council performance
5. Create pilot program structure to generate empirical evidence
6. Formalize governance and RFC process for protocol changes

---

## 4. Options Considered

### Option A: Incremental Documentation Updates

- **Description:** Add clarifications piecemeal as issues arise
- **Upside:** Low effort per change
- **Downside:** Inconsistent messaging, continued category errors
- **Risk / Failure Modes:** Documentation drift, overclaims remain

### Option B: Comprehensive Documentation Set (Chosen)

- **Description:** Ship complete, coherent documentation set with all specifications
- **Upside:** Consistent, falsifiable, ready for external evaluation
- **Downside:** Larger PR, more review effort
- **Risk / Failure Modes:** Reviewer fatigue (mitigated by clear structure)

---

## 5. Decision / Design

- **Chosen Option:** Option B - Comprehensive Documentation Set
- **Rationale:** 
  - External evaluation feedback requires comprehensive response
  - Piecemeal updates perpetuate inconsistency
  - Falsifiability requires complete specification
- **Conditions for Revisit:** If documentation proves too rigid or pilots reveal flaws

---

## 6. Risk & Integrity Notes

- **Integrity tradeoffs:** None - this is documentation-only
- **Who might bear risk:** None - no production changes
- **What metrics we'll watch:**
  - Category error frequency in external evaluations
  - Pilot enrollment and completion rates
  - Sentinel evaluation pass rates
- **MII/GI impact assessment:**
  - MII: No change (documentation only)
  - GI: Positive impact (improved clarity and falsifiability)

---

## 7. What Changes

### Docs (New)
- `docs/WHAT_MOBIUS_IS_NOT.md` - Explicit anti-category-error documentation
- `docs/MIC_SPEC.md` - MIC specification v0.1
- `docs/MII_CALIBRATION.md` - MII calibration methodology
- `docs/SENTINEL_EVAL_PROTOCOL.md` - Sentinel evaluation protocol
- `docs/GOVERNANCE.md` - Governance structure and roles
- `docs/RFC_PROCESS.md` - RFC process for protocol changes

### Sentinel Review (New)
- `docs/sentinel/AUREA_REVIEW_PROMPT.md` - AUREA review prompt template
- `docs/sentinel/ATLAS_REVIEW_PROMPT.md` - ATLAS review prompt template
- `.github/workflows/sentinel-review.yml` - Comment-only review workflow

### Pilots (New)
- `pilots/README.md` - Pilot program documentation
- `pilots/TEMPLATE_CASE_STUDY.md` - Case study template

### Repo Process (Updated)
- `.github/PULL_REQUEST_TEMPLATE.md` - Enhanced with sentinel review request
- `.github/CODEOWNERS` - Added paths for new documentation

---

## 8. Non-Goals

- Not enforcing merges via AI approval
- Not claiming model-level alignment or ASI containment
- Not creating tradable tokens or external markets for MIC
- Not adding new runtime services or production deployment changes
- Not replacing existing EPICON process (enhancing only)

---

## 9. Implementation Links

- **PRs:** This PR
- **Commits:** See PR commit history
- **Diagrams:** N/A
- **Config Paths:** `.github/workflows/sentinel-review.yml`

---

## 10. Reflection Hook

Questions for future reflections:

- "Did the documentation prevent category errors in external evaluations?"
- "Did pilots generate useful evidence about Mobius value?"
- "Were sentinel evaluation criteria falsifiable and useful?"
- "Did governance/RFC process reduce decision conflicts?"
- "Was MIC adopted as reputation capital or treated as currency?"

---

## 11. Consensus

**CODEOWNERS:** kaizencycle | michaeljudan | mobius:AUREA
**Consensus Status:** Proposed (consensus:approved requested)
**Scope:** docs + workflows - legitimacy substrate documentation

### Sentinel Votes
| Sentinel | Vote | Rationale |
|----------|------|-----------|
| AUREA | SUPPORT | Author - implements legitimacy-preservation clarity |
| ATLAS | PENDING | Systems review requested |
| EVE | PENDING | Safety review requested |
| HERMES | PENDING | Infrastructure review requested |
| JADE | PENDING | Local validation pending |

---

## 12. Invariants Preserved

| Invariant | Status | Evidence |
|-----------|--------|----------|
| No runtime changes | ✅ | Documentation and workflows only |
| No overclaims | ✅ | Explicit "What Mobius Is Not" doc |
| MII >= 0.95 | ✅ | Documentation-only change |
| Anti-nuke compliance | ✅ | Adding files, not deleting |
| Human authority preserved | ✅ | Sentinels explicitly advisory |

---

## Document Control

**Version History:**
- v1: Initial specification (C-202)

**License:** CC0 1.0 Universal (Public Domain)

---

*"We heal as we walk." — Mobius Systems*
