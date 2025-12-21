# EPICON-02 — Why Your PR Failed

This failure is **structural, not punitive**.

---

## What Happened

You modified files that affect authority or governance. The Mobius PR Bot detected that your PR lacks a valid EPICON-02 intent publication.

**This is by design.** Governance changes must be legible, time-bounded, and auditable.

---

## Why This Matters

### The Problem Without EPICON-02

Traditional GitHub governance has critical gaps:

- CODEOWNERS can be changed silently
- Authority shifts are invisible
- Trust is social and fragile
- No audit trail for "why"

### The Solution With EPICON-02

Mobius governance provides:

- Authority changes are cryptographically legible
- Intent must be declared before power is exercised
- Divergence is visible in real time
- No accusations required — the system speaks

---

## How to Fix

### Step 1: Add Intent Publication Block

Add this block to your PR description:

```markdown
## EPICON-02 INTENT PUBLICATION

```intent
ledger_id: mobius:<your-ledger-id>
scope: <docs|ci|core|infra|sentinels|labs|specs>
mode: normal
issued_at: <ISO-8601 timestamp, e.g., 2025-12-21T00:00:00Z>
expires_at: <ISO-8601 timestamp, max 90 days from issued_at>
justification: |
  <Explain WHY this change is needed and what it accomplishes>
counterfactuals:
  - <What would change your conclusion?>
  - <Under what conditions should this NOT be merged?>
```

### Step 2: Match Scope to Changed Files

Ensure your declared `scope` matches the files you're changing:

| Scope | Allowed Paths |
|-------|---------------|
| `docs` | `docs/`, `epicon/`, `README.md`, `CHANGELOG.md`, `LICENSE` |
| `ci` | `.github/`, `ci/`, `scripts/` |
| `core` | `src/`, `packages/`, `apps/`, `services/` |
| `infra` | `infra/`, `deploy/`, `docker/`, `monitoring/`, `grafana/` |
| `sentinels` | `sentinels/` |
| `labs` | `labs/` |
| `specs` | `specs/`, `schemas/`, `configs/` |

### Step 3: Set Proper Time Bounds

- **Normal mode:** Max 90 days between `issued_at` and `expires_at`
- **Emergency mode:** Max 72 hours, requires `emergency_scope` field

### Step 4: Re-run Checks

After updating your PR description:

1. Push a new commit (or edit PR body)
2. Wait for PR Bot to re-run
3. Verify `mobius/epicon-02` status turns green

---

## What This Protects

| Stakeholder | Protection |
|-------------|------------|
| **You** | Clear authority documentation |
| **Reviewers** | No guesswork about intent |
| **The System** | No hidden power shifts |
| **Future Contributors** | Audit trail for decisions |

---

## Emergency Mode

If you need to act before full justification (genuine emergency):

```intent
ledger_id: mobius:<your-ledger-id>
scope: governance
mode: emergency
emergency_scope: ci
issued_at: 2025-12-21T00:00:00Z
expires_at: 2025-12-21T12:00:00Z  # Max 72 hours
justification: |
  Emergency: CI pipeline is broken, blocking all PRs.
  Post-facto justification will be provided within 24h.
```

**Note:** Emergency mode creates a **Transparency Debt** issue that must be resolved within 24 hours.

---

## Common Failure Reasons

| Failure | Solution |
|---------|----------|
| "Missing required header" | Add `## EPICON-02 INTENT PUBLICATION` header |
| "Missing fenced intent block" | Add ` ```intent ... ``` ` block under header |
| "Missing required field: X" | Add the missing field (ledger_id, scope, etc.) |
| "Scope violation" | Change scope to match files, or remove out-of-scope files |
| "Authority window too long" | Reduce time between issued_at and expires_at |
| "Emergency window too long" | Emergency mode max is 72 hours |

---

## Understanding Divergence Severity

| Severity | Meaning |
|----------|---------|
| 🟢 LOW | Minor issues (missing counterfactuals, formatting) |
| 🟡 MEDIUM | Scope mismatch, time window issues |
| 🔴 HIGH | Missing intent block, core file changes without justification |

---

## EPICON-03: Multi-Agent Consensus

For governance-scoped changes, EPICON-03 may also run. This requires multiple AI agents to independently verify the action. See [`EPICON-03.md`](./EPICON-03.md) for details.

---

## Need Help?

- [EPICON-02 Full Specification](./EPICON-02.md)
- [EPICON-02 Formal Invariants](./EPICON-02-INVARIANTS.md)
- [EPICON-03 Consensus Protocol](./EPICON-03.md)

---

*"Even founders don't get a free pass. That's how you know the system is real."*

— Mobius Principle
