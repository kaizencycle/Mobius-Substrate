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

### Intent Publication Object

```json
{
  "intent_id": "c202-legitimacy-docset-2026-01-24",
  "ledger_id": "kaizencycle:michaeljudan",
  "justification_hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "scope_envelope": [
    "docs.read",
    "docs.write",
    "docs.create",
    "pilots.create",
    ".github.workflows.create",
    ".github.templates.update"
  ],
  "counterfactuals": [
    "If runtime code is affected, authority must halt",
    "If claims exceed documented capabilities, scope collapses",
    "If MII drops below 0.95, changes must be reverted"
  ],
  "issued_at": "2026-01-24T00:00:00Z",
  "expires_at": "2026-01-31T00:00:00Z",
  "signature": "pending-human-approval"
}
```

### Intent Block (PR Template Format)

```intent
epicon_id: EPICON_C-202_DOCS_legitimacy-substrate-docset_v1
ledger_id: kaizencycle:michaeljudan
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
    This PR does NOT modify runtime code or claim capabilities beyond documentation.
  ANCHORS:
    - External evaluation correctly identified execution gaps (unclear constituency,
      decision authority, change process) - independent review feedback
    - MIC/MII/EPICON need explicit specification to be useful beyond rhetoric - 
      internal consistency requirement
    - Pilot program structure needed to generate real-world evidence - 
      falsifiability principle
  BOUNDARIES:
    - This EPICON applies ONLY to documentation and workflow scaffolding
    - Does NOT change runtime behavior or production services
    - Does NOT add new dependencies or infrastructure
    - Does NOT claim model-level alignment or ASI containment
    - Does NOT modify apps/, packages/, services/, or sentinels/ code
  COUNTERFACTUAL:
    - If any runtime code is affected → BLOCK (scope violation)
    - If claims exceed documented capabilities → REVISE (intellectual honesty)
    - If MII drops below 0.95 → REVERT (integrity threshold)
    - If category errors remain after merge → REVISE (documentation failure)

counterfactuals:
  - Runtime code affected → BLOCK (scope violation)
  - Overclaims detected → REVISE (intellectual honesty)
  - MII < 0.95 → REVERT (integrity threshold)
  - Category errors remain → REVISE (documentation failure)
```

### Scope Envelope

| Permission | Granted | Justification |
|------------|---------|---------------|
| `docs.read` | ✅ | Required to review existing docs |
| `docs.write` | ✅ | Update authority README |
| `docs.create` | ✅ | Create new specification docs |
| `pilots.create` | ✅ | Create pilot program scaffold |
| `.github.workflows.create` | ✅ | Add sentinel-review workflow (non-blocking) |
| `.github.templates.update` | ✅ | Update PR template |
| `apps/*` | ❌ | Not in scope |
| `packages/*` | ❌ | Not in scope |
| `services/*` | ❌ | Not in scope |
| `sentinels/*` | ❌ | Not in scope |
| `code.*` | ❌ | No runtime code changes |

### Authority Declaration

- **Actor:** AUREA Agent (on behalf of kaizencycle:michaeljudan)
- **Authority Source:** CODEOWNERS approval + EPICON-02 intent publication
- **Scope Limitation:** Documentation and workflow scaffolding ONLY
- **Expiration:** 2026-01-31T00:00:00Z
- **Override Path:** Emergency EPICON with transparency debt

---

## Authority Change Justification (Required)

### What is changing

This EPICON changes authority for: **GitHub CODEOWNERS / merge authority** on the Mobius documentation + governance surface area.

**Files modified:**
- `.github/CODEOWNERS` - Adds ownership entries for new documentation paths
- `.github/workflows/sentinel-review.yml` - Adds new CI workflow for advisory PR reviews
- `.github/PULL_REQUEST_TEMPLATE.md` - Adds optional sentinel review request section

**New authority being granted:**
- Adds/recognizes the following reviewers as CODEOWNERS for governance/docs:
  - `kaizencycle` (human maintainer)
  - `michaeljudan` (human maintainer)
  - `mobius:AUREA` (bot reviewer identity - advisory only)

**Authority boundaries (what this does NOT grant):**
- Does **not** grant production deploy authority
- Does **not** grant permission to change secrets, billing, or infrastructure
- Does **not** override human CODEOWNERS for merges
- Does **not** allow an AI reviewer to merge code by itself
- Does **not** modify runtime code in apps/, packages/, services/, sentinels/

### Why we need this change now

Mobius is entering an "evidence + execution" phase (post-philosophical grounding). That requires:
- Faster iteration on governance/docs PRs
- Consistent, reviewable intent records (EPICON discipline)
- A predictable reviewer assignment system so accountability is not diffused

Without this authority update:
- Governance PRs stall (no clear ownership)
- Review responsibility remains ambiguous
- We regress into legitimacy drift ("no one owned the decision")

### Risk and mitigation

**Primary risk:** Authority creep (AI reviewer implicitly treated as a human approver).

**Mitigation:**
- Human sign-off remains mandatory (CODEOWNERS includes humans)
- Sentinel reviewers are advisory unless explicitly requested
- Any authority expansion beyond docs/governance requires a new EPICON with explicit scope boundaries
- Workflow cannot block merges (Phase 1: comment-only)

### Reversibility

Rollback is a single revert:
1. Revert CODEOWNERS changes
2. Remove workflow file
3. Re-run EPICON consensus check

No data migration, no production impact, no external dependencies.

---

## Scope Boundary (Non-Goals)

This authority change is limited to:
- **Repo:** `kaizencycle/Mobius-Substrate`
- **Branch scope:** Feature branch → main (standard PR flow)
- **Environment scope:** Documentation and CI/CD workflows only
- **No production deploy:** Zero runtime impact

---

## Guardrails

**Circuit Breaker:**
- If MII < 0.95: Changes must be reverted
- If workflow blocks legitimate merges: Remove workflow immediately
- If any dissent bundle persists unresolved: Merge blocked until addressed

**Auditability:** All authority changes in this PR require:
- EPICON entry (this document)
- Docs update in `docs/` (6 new specification documents)
- 2 human sign-offs via CODEOWNERS

---

## Contestation Mechanism

If any agent opposes:
1. Opposer's blocking claims enumerated in this EPICON (Section 11)
2. Maintainer responds point-by-point (see "Addressing Agent Concerns")
3. Re-run consensus after patch
4. If opposition persists after 2 iterations, escalate to manual maintainer review

---

## Critical Fields Checklist (Completion)

- [x] Justification written (see "Authority Change Justification")
- [x] Non-goals listed (see "Scope Boundary")
- [x] Rollback plan written (see "Reversibility")
- [x] Explicit scope boundary (see "Scope Envelope" table)
- [x] "Who can approve" clearly defined: kaizencycle, michaeljudan (human CODEOWNERS)
- [x] "Who cannot approve" clearly defined: Sentinels are advisory only, no merge authority
- [x] Authority provenance declared (see below)

---

## Authority Provenance & Standing

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

This EPICON invokes **founder–custodian standing** under Mobius governance norms at pre-charter phase (v0).

**At the time of this action:**
- Mobius has no elected governance council
- No external stakeholders have delegated authority
- No ratified charter supersedes founder custodianship

As project originator and current custodian, the proposer is authorized to perform transitional governance actions necessary to:
- Establish initial accountability infrastructure
- Assign narrowly scoped review authority
- Define consensus and audit mechanisms
- Enable empirical validation of governance systems

**This authority is not permanent** and is exercised under the following constraints.

### Scope Constraints

The authority exercised in this EPICON is:
- **Narrowly scoped** to the change explicitly described (docs + workflows + CODEOWNERS for documentation paths)
- **Non-transferable** (cannot be delegated further without new EPICON)
- **Non-expansive** (does not create new implicit powers)
- **Fully auditable** via EPICON records and ledger history

No authority beyond what is written here is implied.

### Temporality & Revocation

This authority is **transitional**.

It is expected to be:
- Re-reviewed upon formation of a governance council
- Ratified, modified, or revoked by successor processes
- Superseded by a formal charter once adopted

This EPICON explicitly records authority so that it may later be contested, amended, or invalidated with full historical context.

### Legitimacy Rationale

This authority action is justified because:
- The absence of explicit authority creates implicit power
- Implicit power is less accountable than declared power
- Declared authority allows audit, dissent, and redesign

This EPICON does not assert moral superiority, permanence, or exemption.
It asserts **responsibility with traceability**.

### Acknowledgement of Risk

The proposer acknowledges that:
- Founder authority is inherently asymmetric
- Asymmetry must be constrained, not normalized
- Future governance may judge this action incorrect

This EPICON exists so that such judgment is possible.

### Sunset Condition

This authority expires automatically upon:
- Formation of a ratified governance council
- Adoption of a formal Mobius charter
- Explicit revocation via successor EPICON

Until then, the authority remains contestable at all times.

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
- `docs/sentinel/README.md` - Sentinel prompts documentation
- `.github/workflows/sentinel-review.yml` - Sentinel review workflow (Phase 2)

### Pilots (New)
- `pilots/README.md` - Pilot program documentation
- `pilots/TEMPLATE_CASE_STUDY.md` - Case study template

### Repo Process (Updated)
- `.github/PULL_REQUEST_TEMPLATE.md` - Enhanced with sentinel review request
- `.github/CODEOWNERS` - Added paths for new documentation
- `docs/authority/README.md` - Expanded with tiered authority model

---

## 8. Non-Goals

- Not enforcing merges via AI approval (sentinels are advisory)
- Not claiming model-level alignment or ASI containment
- Not creating tradable tokens or external markets for MIC
- Not adding new runtime services or production deployment changes
- Not replacing existing EPICON process (enhancing only)
- Not modifying any code in apps/, packages/, services/, or sentinels/

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

### Addressing Agent Concerns

**Concern 1: "Scope exceeds declared authority"**

**Response:** This EPICON explicitly limits scope to documentation and workflow scaffolding:
- ✅ Markdown files (.md) in docs/ - ALLOWED
- ✅ Sentinel prompt templates - ALLOWED
- ✅ Pilot templates - ALLOWED
- ✅ PR template update - ALLOWED
- ✅ CODEOWNERS update for doc paths - ALLOWED
- ✅ Workflow file (non-blocking, advisory only) - ALLOWED
- ❌ Runtime code - NOT TOUCHED
- ❌ Apps, packages, services - NOT TOUCHED
- ❌ Production configuration - NOT TOUCHED

**Evidence:** All changes are documentation. No `.ts`, `.tsx`, `.py`, `.js` files modified.

**Concern 2: "Intent publication missing critical fields"**

**Response:** Intent Publication Object above now includes all EPICON-02 required fields:
- ✅ `intent_id` - provided
- ✅ `ledger_id` - provided (kaizencycle:michaeljudan)
- ✅ `justification_hash` - provided (sha256)
- ✅ `scope_envelope` - provided (array of permissions)
- ✅ `counterfactuals` - provided (array of conditions)
- ✅ `issued_at` - provided (ISO-8601)
- ✅ `expires_at` - provided (ISO-8601)

**Concern 3: "Clarify justification for authority change" (ATLAS, EVE, HERMES)**

**Response - Authority Change Justification:**

This PR modifies `.github/workflows/sentinel-review.yml` and `.github/CODEOWNERS`. Here is the explicit justification:

**Why modify `.github/workflows/sentinel-review.yml`?**
1. **Purpose:** Create an advisory sentinel review system for PRs
2. **Authority Level:** The workflow is **non-blocking** (Phase 1) - it posts comments only, does not block merges
3. **Safety:** The workflow explicitly `exit 0` on all paths - it cannot prevent legitimate merges
4. **Scope:** Only triggers when labels are explicitly added (`review:aurea`, `review:atlas`)
5. **Reversibility:** Workflow can be disabled or removed with a single commit
6. **No Production Impact:** This is a CI/CD enhancement, not a production service change

**Why modify `.github/CODEOWNERS`?**
1. **Purpose:** Route documentation reviews to appropriate maintainers
2. **Changes:** Only adds ownership entries for new documentation paths:
   - `/docs/WHAT_MOBIUS_IS_NOT.md`
   - `/docs/MIC_SPEC.md`
   - `/docs/MII_CALIBRATION.md`
   - `/docs/SENTINEL_EVAL_PROTOCOL.md`
   - `/docs/GOVERNANCE.md`
   - `/docs/RFC_PROCESS.md`
   - `/docs/sentinel/`
   - `/pilots/`
3. **No Removal:** Does not remove or weaken any existing ownership rules
4. **Additive Only:** All changes are additive (new paths get owners)

**Why modify `.github/PULL_REQUEST_TEMPLATE.md`?**
1. **Purpose:** Add sentinel review request section to PR template
2. **Optional:** The new section is informational - no fields are required
3. **Reversibility:** Can be removed with a single edit

**Authority Source:**
- Primary maintainers (`kaizencycle`, `michaeljudan`) have commit access
- Changes are within CODEOWNERS-declared scope for `.github/` paths
- EPICON-02 intent publication provides transparency

**Counterfactuals for Authority Changes:**
- If workflow blocks legitimate merges → Remove workflow immediately
- If CODEOWNERS causes review bottlenecks → Adjust ownership rules
- If PR template causes friction → Simplify or remove section

### Sentinel Votes (Latest Run: ECS 0.45)
| Sentinel | Vote | Confidence | Condition Addressed |
|----------|------|------------|---------------------|
| AUREA | SUPPORT | 82% | N/A - supports |
| JADE | SUPPORT | 63% | N/A - supports |
| ATLAS | CONDITIONAL | 60% | Authority justification for workflow changes (NOW PROVIDED above) |
| EVE | CONDITIONAL | 56% | Intent fields + scope clarification (NOW PROVIDED above) |
| HERMES | CONDITIONAL | 84% | Infrastructure review - workflow is advisory-only, non-blocking (CONFIRMED) |

### Conditions Addressed

**For ATLAS (60% confidence):**
- ✅ Explicit justification for `.github/workflows/sentinel-review.yml` modification
- ✅ Workflow is Phase 1 (comment-only, non-blocking)
- ✅ Counterfactuals defined for workflow failures

**For EVE (56% confidence):**
- ✅ EPICON-02 compliant Intent Publication Object with all required fields
- ✅ Scope envelope explicitly defined
- ✅ No runtime code changes confirmed

**For HERMES (84% confidence):**
- ✅ Workflow does not affect production infrastructure
- ✅ CODEOWNERS changes are additive only
- ✅ All changes are reversible with single commits

---

## 12. Invariants Preserved

| Invariant | Status | Evidence |
|-----------|--------|----------|
| No runtime changes | ✅ | Documentation and workflows only |
| No overclaims | ✅ | Explicit "What Mobius Is Not" doc |
| MII >= 0.95 | ✅ | Documentation-only change |
| Anti-nuke compliance | ✅ | Adding files, not deleting |
| Human authority preserved | ✅ | Sentinels explicitly advisory |
| EPICON-02 compliant | ✅ | All required fields present |
| Scope envelope respected | ✅ | Only docs/* and .github/* touched |

---

## Document Control

**Version History:**
- v1: Initial specification (C-202)
- v1.1: Added EPICON-02 compliant Intent Publication Object, addressed EVE concerns

**License:** CC0 1.0 Universal (Public Domain)

---

*"We heal as we walk." — Mobius Systems*
