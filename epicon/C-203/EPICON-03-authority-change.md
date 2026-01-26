---
epicon_id: EPICON_C-203_GOVERNANCE_authority-change-github-wiring_v1
title: "Authority Change: GitHub Governance Wiring (CODEOWNERS + AI Review Gates)"
author_name: "kaizencycle"
cycle: "C-203"
epoch: "E-51"
tier: "DVA.FULL"
scope:
  domain: "governance"
  system: "mobius-substrate"
  environment: "mainnet"
epicon_type: "decision"
status: "proposed"
related_prs: []
related_commits: []
related_epicons:
  - "EPICON-02"
  - "EPICON-03"
tags:
  - "governance"
  - "authority-change"
  - "codeowners"
  - "sentinel-review"
  - "consensus"
integrity_index_baseline: 0.95
risk_level: "medium"
created_at: "2026-01-26T14:00:00Z"
updated_at: "2026-01-26T14:00:00Z"
version: 1
hash_hint: ""
summary: "Authorizes GitHub governance wiring: CODEOWNERS gating, AI sentinel review workflows, and label conventions for consensus tracking."

# Authority Change Fields (Required for ECS Pass)
authority_change:
  what_changes:
    - "Repository adopts CODEOWNERS gating for docs/governance/epicon paths"
    - "PRs receive AI reviews (AUREA/ATLAS) posted via GitHub Actions"
    - "Merge blocked unless required status checks pass (humans remain final authority)"
    - "Label conventions: consensus:requested triggers sentinel review, consensus:approved marks completion"
  why_now:
    - "Current governance docs are being mis-evaluated due to missing category constraints"
    - "Consensus engine correctly flagging missing authority-change intent fields"
    - "Need repeatable, publishable evaluation artifacts (docs + sentinel eval protocol)"
  who_is_affected:
    - "Contributors: PR process becomes clearer, slightly more structured"
    - "Maintainers: stronger audit trail + predictable gates"
    - "Sentinels: formal role as auditors/challengers, not approvers"
  risks:
    - "Overhead: extra checks may slow merges"
    - "False positives from AI reviews could create noise"
    - "Security risk if tokens are misconfigured"
  mitigations:
    - "AI reviews are advisory; humans decide"
    - "Tokens scoped to PR-only permissions (contents:read, pull-requests:write)"
    - "Require CODEOWNERS + status checks + manual merge"
  rollback_plan:
    - "Disable workflow files under .github/workflows/review-*.yml"
    - "Remove CODEOWNERS entry additions for epicon/ and pilots/"
    - "Tag release 'pre-EPICON-03-authority' for easy reversion"
  success_criteria:
    - "ECS consensus passes without missing-field flags"
    - "PRs show AUREA/ATLAS reviews as bot comments"
    - "Required checks block merge when governance docs are missing or incomplete"

co_reviewers:
  - "mobius:AUREA"
  - "mobius:ATLAS"
labels:
  - "consensus:requested"
scope_declaration:
  in_scope:
    - "Add CODEOWNERS entries for docs/, epicon/, pilots/ governance paths"
    - "Add GitHub Actions that post PR reviews as AUREA/ATLAS"
    - "Add label conventions: consensus:requested, consensus:approved"
    - "Require status checks for 'Mobius Sentinel Review' workflows"
  out_of_scope:
    - "Granting write/admin access to any bot account"
    - "Automatic merge to main without human approval"
    - "Any production deployment automation"
    - "Changes to model training or inference"
philosophical_foundation:
  essays:
    - title: "When Consequences Stop Traveling Upward"
      date: "2025-01-23"
      thesis: "Incentive drift occurs when systems obscure responsibility"
      mobius_response: "EPICON + MIC makes override costly and visible"
    - title: "The Right to Know"
      date: "2025-01-21"
      thesis: "Individuals need digital insurance against automated decisions"
      mobius_response: "Provenance completeness + fork/exit mechanics"
    - title: "When Chaos Is Procedural"
      date: "2025-01-11"
      thesis: "Bureaucratic delay is intentional friction preventing accountability"
      mobius_response: "Circuit breaker + dual sign-off prevents drift into ambiguity"
    - title: "How Good Wins Without Killing"
      date: "2025-01-09"
      thesis: "Extinction loops occur when defection is dominant; change payoff structures"
      mobius_response: "MIC as reputation capital; sentinel council as mechanism design"
  operational_principle: "We heal as we walk"
  epistemic_status: "Philosophy guides; pilots validate; specs constrain"
---

# Summary

This EPICON authorizes governance wiring changes that:
1. Prevent category errors in evaluating Mobius (documentation + constraints)
2. Make review/audit repeatable without claiming model-level safety
3. Establish sentinel roles as auditors/challengers, not decision-makers

---

## 1. Context

- Mobius Substrate is a memory-and-accountability substrate, not an AI alignment technique
- External critique (C-178) identified documentation mismatch: claims exceeded defensible scope
- EPICON-03 consensus engine correctly flags PRs missing authority-change justification
- Current review process lacks structured sentinel challenge workflow

**Previous decisions this builds on:**
- EPICON-02: Intent publication format
- EPICON-03: Multi-agent consensus mechanism

## 2. Assumptions

- A1: GitHub Actions can post PR reviews using GITHUB_TOKEN with appropriate permissions
- A2: Sentinel reviews are advisory; humans retain decision authority
- A3: Existing CODEOWNERS structure supports team-based review requirements
- A4: Label-based workflow triggers are sufficient for v0 consensus gating

## 3. Problem Statement

The EPICON-03 consensus engine fails on PRs that:
1. Modify governance paths without authority_change justification
2. Lack explicit scope_declaration
3. Do not trigger sentinel review workflow

This causes legitimate governance improvements to stall on "NEEDS_CLARIFICATION" status.

## 4. Options Considered

### Option A: Human-Only Review (No Sentinel Automation)
- **Description**: Rely solely on human CODEOWNERS review
- **Upside**: Simple, no workflow complexity
- **Downside**: Inconsistent review quality, no structured challenge generation
- **Risks**: Governance drift without systematic contestation

### Option B: Action-Only Sentinel Review (Recommended)
- **Description**: GitHub Actions post reviews + status checks, no bot accounts
- **Upside**: Minimal infrastructure, clear audit trail, easy rollback
- **Downside**: Reviews appear as "github-actions[bot]" not named sentinels
- **Risks**: Acceptable - review content identifies sentinel source

### Option C: GitHub App / Bot Accounts
- **Description**: Dedicated GitHub App with named bot identity per sentinel
- **Upside**: Clear attribution, richer API access
- **Downside**: More setup, token management complexity, OAuth app registration
- **Risks**: Security surface increases with more credentials

## 5. Decision / Design

- **Chosen option**: B (Action-Only Sentinel Review)
- **Why now**: Fastest path to ECS pass, minimal infrastructure, easy rollback
- **Revisit conditions**:
  - If "github-actions[bot]" attribution causes confusion, upgrade to Option C
  - If token permissions insufficient, register GitHub App

### Implementation Details

1. **CODEOWNERS Updates**
   - Add `/epicon/` path with @kaizencycle/aurea @kaizencycle/atlas
   - Add `/pilots/` path with @kaizencycle/aurea
   - Add `/docs/` governance spec paths

2. **Sentinel Review Workflows**
   - `review-aurea.yml`: Triggers on `consensus:requested` label
   - `review-atlas.yml`: Triggers on `consensus:requested` label
   - Both post PR review comments with structured challenge output
   - Both set status check (pass/fail) for merge gating

3. **Label Conventions**
   - `consensus:requested`: Triggers sentinel review workflows
   - `consensus:approved`: Applied when ECS passes (manual or automated)

## 6. Risk & Integrity Notes

- **Integrity tradeoffs**: Added process overhead in exchange for audit trail
- **Who bears risk**: Maintainers (slower merges), mitigated by advisory-only sentinel role
- **Metrics to watch**:
  - Merge latency (should stay <24h for non-governance PRs)
  - Override rate (should be <10% for sentinel flags)
  - False positive rate (should be <20%)
- **Follow-up EPICON needed if**:
  - Override rate exceeds 30%
  - Merge latency exceeds 48h average

## 7. Implementation Links

- **PRs**: This PR
- **Commits**: TBD
- **Config paths**:
  - `.github/CODEOWNERS`
  - `.github/workflows/review-aurea.yml`
  - `.github/workflows/review-atlas.yml`
- **Documentation**:
  - `docs/WHAT_MOBIUS_IS_NOT.md`
  - `docs/MIC_SPEC.md`
  - `docs/MII_CALIBRATION.md`
  - `docs/SENTINEL_EVAL_PROTOCOL.md`
  - `docs/PHILOSOPHY_AND_PRACTICE.md`
  - `pilots/TEMPLATE_CASE_STUDY.md`
- **External**: https://kaizencycle.substack.com/ (philosophical foundation)

## 8. Reflection Hook

Questions for future reflections:

- Did sentinel reviews catch issues humans missed?
- Did the authority_change format reduce ECS failures?
- Did label conventions create workflow friction?
- Is the advisory-only sentinel role sustainable at scale?

---

## Notes

**Mobius is not an alignment technique.** This change is documentation + workflow governance only. Sentinels do not approve consequential actions; they generate structured contestation. Humans retain full decision authority.

**Category constraint**: This EPICON governs repository process, not model behavior. Nothing in this change modifies training, inference, or model weights.
