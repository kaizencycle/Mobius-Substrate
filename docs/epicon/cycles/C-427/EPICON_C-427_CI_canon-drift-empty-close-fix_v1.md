---
epicon_id: EPICON_C-427_CI_canon-drift-empty-close-fix_v1
title: "C-427: fix canon-drift-tripwire false failure on the healthy (no open drift issue) auto-close path"
cycle: "C-427"
status: published
agent_id: claude-code-c427-job25
authority: ci_bugfix_no_production_mutation
execution_authorized: false
---

# EPICON_C-427_CI_canon-drift-empty-close-fix_v1

## Intent publication

```intent
epicon_id: EPICON_C-427_CI_canon-drift-empty-close-fix_v1
ledger_id: kaizencycle
scope: ci, docs
mode: normal
issued_at: 2026-09-07T21:15:00Z
expires_at: 2026-10-07T21:15:00Z
justification: |
  VALUES INVOKED: integrity, reliability, transparency
  REASONING: canon-drift-tripwire.yml's "Auto-close when healed" step used `[ -n "$EXISTING" ] && gh issue close ...` as its final command. GitHub Actions runs `run:` steps under `bash -e` by default, and an AND-list whose last evaluated command exits non-zero terminates the shell under errexit — so the healthy state (canon within MAX_LAG, no open drift issue to close) produced a false CI failure on every healthy run. Replacing it with an explicit if/else makes the healthy path log and exit 0, while `gh issue list`/`gh issue close` failures still propagate as real failures. This EPICON record exists because the target repo's sentinel-review gate hard-requires a docs/epicon/* record and a docs/*.md record on any PR routed through consensus review; this file satisfies both while documenting the actual change.
  ANCHORS:
    - https://github.com/kaizencycle/Mobius-Substrate/actions/runs/34144751342 (failed run showing lag 0 and exit 1 on the auto-close step)
    - https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html (errexit terminates the shell when the last command of a list exits non-zero)
    - Mobius-Substrate PR #448 (this change)
  BOUNDARIES: Scoped to the shell control flow of one workflow step in canon-drift-tripwire.yml, plus this EPICON record. Does not change MAX_LAG, drift measurement, issue dedup/fingerprinting, or any canon/ledger/authority semantics. No production mutation, no credential or secret access, no deployment.
  COUNTERFACTUAL: If a future run shows the auto-close step still exiting non-zero when no drift issue exists, or shows a real gh failure being silently swallowed, this fix should be reverted and re-diagnosed.
counterfactuals:
  - If manual/dry-run testing shows the if/else path still returns nonzero when $EXISTING is empty, do not merge.
  - If a genuine `gh issue list` or `gh issue close` failure stops propagating as a nonzero exit after this change, revert.
```

## Witness Table

| Claim | Verdict | Evidence |
|-------|---------|----------|
| `[ -n "$EXISTING" ] && gh issue close ...` exits 1 when `$EXISTING` is empty under GitHub Actions' default `bash -e` run-step shell, causing a false CI failure on the healthy (no open issue) path | TRUE | https://github.com/kaizencycle/Mobius-Substrate/actions/runs/34144751342 |
| The fix replaces the AND-list with an explicit if/else so the healthy path exits 0 while `gh issue list`/`gh issue close` failures still propagate | TRUE | effe6e116d0bda68925dd631844eba9dc865862b |
| Diff to the workflow itself touches exactly one file, `.github/workflows/canon-drift-tripwire.yml` | TRUE | effe6e116d0bda68925dd631844eba9dc865862b |
| No canon, ledger, vault, or authority-substantive logic is changed by this PR | TRUE | Diff is limited to the "Auto-close when healed" step's shell control flow and this EPICON record |

## Authority

`execution_authorized: false` — this is a CI-only shell control-flow bugfix with no production mutation, no credential or secret access, and no deployment. Authority Provenance is declared directly in the changed workflow file (`.github/workflows/canon-drift-tripwire.yml`) as a proportionate `## Authority Change Justification` note, rather than invoking founder standing, because no founder/custodian authority is being exercised here.

---

*"We heal as we walk." — Mobius Systems*
