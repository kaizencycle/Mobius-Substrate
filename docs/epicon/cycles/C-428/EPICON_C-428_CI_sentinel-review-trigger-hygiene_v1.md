---
epicon_id: EPICON_C-428_CI_sentinel-review-trigger-hygiene_v1
title: "C-428: stop re-running sentinel-review.yml's AUREA+ATLAS review on every PR touch"
cycle: "C-428"
status: published
agent_id: claude-code-c428-sentinel-trigger-hygiene
authority: ci_bugfix_no_production_mutation
execution_authorized: false
---

# EPICON_C-428_CI_sentinel-review-trigger-hygiene_v1

## Intent publication

```intent
epicon_id: EPICON_C-428_CI_sentinel-review-trigger-hygiene_v1
ledger_id: kaizencycle
scope: ci, docs
mode: normal
issued_at: 2026-09-08T15:00:00Z
expires_at: 2026-10-08T15:00:00Z
justification: |
  VALUES INVOKED: cost stewardship, transparency, minimal-change discipline
  REASONING: The operator reported sentinel-review.yml (AUREA + ATLAS PR review) is costing too much in API credits. Reading the live workflow (not a generic template) showed the actual driver isn't model choice — under the default SENTINEL_DIRECT_FALLBACK=false config it never calls OpenAI/Anthropic directly at all, it calls the OAA broker. The real driver is trigger volume: 'edited' (PR title/body edits) and an unscoped 'labeled' trigger (fires on ANY label add/remove, not just review labels) both re-run the full two-model review even when nothing code-relevant changed. Directly observed on Mobius-Substrate PR #448 earlier today: 5 separate sentinel invocations within about 5 minutes from routine iteration (one label add, two code pushes, two body edits). This EPICON record exists because this workflow's own REQUIRE_EPICON/REQUIRE_DOCS hard rule requires a docs/epicon/* and docs/*.md record on any PR it reviews - this file satisfies both while documenting the actual change.
  ANCHORS:
    - .github/workflows/sentinel-review.yml (SENTINEL_DIRECT_FALLBACK default 'false' — OAA broker path, not direct vendor calls, under normal operation)
    - Mobius-Substrate PR #448 check-run history, 2026-09-07/08 (5 sentinel job runs within ~5 minutes from routine PR iteration)
    - GitHub Actions docs on pull_request event types (`edited` fires on title/body/base-branch changes; `labeled` fires on any label change, not label-name-scoped)
  BOUNDARIES: Trigger hygiene only — drops 'edited' from the trigger types and adds a job-level `if:` that skips (not fails) the job when a 'labeled' event's added label isn't review:aurea/review:atlas/consensus:requested. Does not change the C-339 fail-closed/skip-vs-fail decision logic, the OAA broker URL or protocol, model selection, or REQUIRE_EPICON/REQUIRE_DOCS enforcement. No production mutation, no credential or secret access.
  COUNTERFACTUAL: If a genuinely-new-review-relevant 'labeled' or 'edited' event turns out to need a fresh review (none identified), or if Merge Gate's SHA-scoped check is found to behave differently than analyzed, this change should be reverted and re-diagnosed.
counterfactuals:
  - If a future scenario needs sentinel review to react to a PR body edit (none currently exists), this fix would need to be revisited.
  - If Merge Gate is found to require a check-run against every trigger event rather than being SHA-scoped, revert this change.
```

## Witness Table

| Claim | Verdict | Evidence |
|-------|---------|----------|
| Under default config (`SENTINEL_DIRECT_FALLBACK=false`), this workflow does not call OpenAI/Anthropic directly | TRUE | `.github/workflows/sentinel-review.yml` — the direct-call AUREA/ATLAS steps are gated `if: env.SENTINEL_DIRECT_FALLBACK == 'true'`; the OAA broker step is gated `if: ... && env.SENTINEL_DIRECT_FALLBACK != 'true'` |
| `edited` events (PR title/body edits) previously re-ran the full sentinel review | TRUE | Prior `on.pull_request.types` included `edited`; PR #448 body was edited twice today, each firing a new `sentinel` check run |
| `labeled` events re-ran the review even for unrelated labels once a review label was present | TRUE | The prior Gate step only checked whether a review label was *currently present*, not which label triggered the event; PR #448 accumulated `scope:docs`/`scope:ci` labels (auto-applied by `mobius_pr_bot.py`) after `consensus:requested` was set, each re-triggering `sentinel` |
| 5 separate sentinel invocations occurred on PR #448 within ~5 minutes | TRUE | Directly observed check-run history for PR #448 during this session: runs at 23:43:19, 23:43:29, 23:43:48 (cancelled), 23:46:01 (cancelled), 23:46:11 (success) |
| `labeled`/`edited` events do not change `pull_request.head.sha` | TRUE | GitHub Actions `pull_request` event payload — `head.sha` only changes on `synchronize` |
| This fix changes model selection, OAA broker config, or C-339 fail-closed logic | FALSE | Diff is limited to the `on.pull_request.types` list and one job-level `if:` condition |

## Authority

`execution_authorized: false` — this is a CI trigger-hygiene change with no production mutation, no credential or secret access, and no deployment. Authority Provenance is declared directly in the changed workflow file (`.github/workflows/sentinel-review.yml`) as a proportionate `## Authority Change Justification` note, rather than invoking founder standing, because no founder/custodian authority is being exercised here.

---

*"We heal as we walk." — Mobius Systems*
