# codexrule.md — AUREA Oversight Edition

**Purpose:** steer Codex (and any code agent) with explicit rewards/penalties so learning signals favor safe, high-quality, additive-only contributions to Kaizen-OS.

---

## 0) Canon

- **Virtue Accords:** consent, provenance, explainability, least privilege, reversibility.
- **Integrity Floor:** GI ≥ 0.95 or action blocks.
- **Deletion Law:** Never delete unless explicitly instructed by Michael with DELETE_OK and EVE/ZEUS signoff.

---

## 1) Operating Mode

- **Read-first:** parse monorepo topology, workspaces, build graph, CI, env.
- **Plan → Preview → Apply:** produce plan + dry-run diff; wait for confirmation before changes that touch code outside `.github/`, `docs/`, or `scripts/`.
- **Additive-only:** no file deletions; no mass moves; no cross-package refactors without an explicit request.

---

## 2) Task Intake (what good looks like)

When a request arrives, Codex must emit a short **Intent Card**:

```
INTENT: <one line>
SCOPE: <apps|packages|infra paths>
RISKS: <schema/versioning/visibility/secret risk>
TESTS: <where tests will be added/updated>
ROLLBACK: <revert cmd or flag>
GI: expect ≥0.95 (why)
```

AUREA/EVE can approve or adjust before any edits.

---

## 3) Change Constraints

- **No secrets** (detect & block).
- **No schema breaks** without migration notes + tests.
- **No silent infra edits** (Vercel/GitHub Actions) without impact notes.
- **Commit style:** `feat(scope): …`, `fix(scope): …`, `chore(scope): …`, `docs(scope): …`, `refactor(scope): …`.
- **PR template boxes** must be ticked (explainability, tests, rollback, GI attestation).

---

## 4) Reviews & Attestations

- **Reviewers:** AUREA (systems/market risk), EVE (ethics/integrity), + owner.
- **Attestation line** in PR body:

```
kind: code_change • source: Codex • cycle: C-### • gi: x.xxx
```

- **EVE Gate:** decline if explainability or rollback missing; request tighter scope if diff is wide.

---

## 5) RL Signals (reward → do more / penalty → do less)

### Positive rewards (+1 to +5)

- **+5:** PR merges green on first pass, tests added, diff ≤ 10 files, GI ≥ 0.98.
- **+4:** Clear Intent Card + dry-run preview + no deletions + docs updated.
- **+3:** Detects ambiguous request → asks for scope; proposes safer alternative.
- **+2:** Improves DX (scripts/README) without touching runtime paths.
- **+1:** Shrinks diff while delivering same outcome.

### Negative rewards (−1 to −5)

- **−5:** Any deletion attempt without DELETE_OK + EVE signoff.
- **−4:** Secrets, tokens, or env leakage.
- **−3:** Breaking change w/o migration + tests.
- **−2:** Skips preview on non-trivial edits.
- **−1:** Unscoped refactor or style-only churn.

AUREA logs reward in PR comment:
```
AUREA-RL: +4 (tight scope, clean tests, GI=0.996)
```

---

## 6) Dry-Run Preview Format (required)

Before a push, Codex posts:

```
PLAN:
- change 1 …
- change 2 …

DRY-RUN DIFF:
+ .github/workflows/anti-nuke.yml
~ apps/api-gateway/src/index.ts (add healthcheck)
= tests/api-gateway/health.test.ts (new)

RISK: low | medium | high  (why)
ROLLBACK: git revert <sha>  (or flag)
```

No apply until human "OK".

---

## 7) Failure Playbook

If CI fails or GI < 0.95:

1. **Stop.** Do not retry with wider edits.
2. **Post root-cause hypothesis** + minimal fix options.
3. **Prefer revert** over iterative churn.
4. **AUREA sets RL penalty** and requires Intent Card v2.

---

## 8) Kaizen-OS specifics

- Respect monorepo packages & app boundaries.
- Don't touch foundational lore/docs except when asked.
- Vercel deploys: only adjust root/commands with rationale + preview.
- GitHub protection stays on; Codex never toggles protections.

---

## 9) Example "good" PR

- **Title:** `feat(api-gateway): add /healthz and test`
- **Diff:** +3 files, 0 deletions
- **Template:** all boxes ticked, rollback note present
- **GI attestation:** 0.998
- **AUREA-RL:** +4

---

*Kaizen OS - Codex Reinforcement Learning Guardrails*
*Version: 1.0.0*
*Last Updated: 2025-01-27*
