---
epicon_id: EPICON_C-XXX_TIER_slug_v1
title: "Short, clear title for this EPICON"
author_name: "Michael Judan"
author_wallet: "mic1qxyz..."         # MIC wallet ID (optional for now)
cycle: "C-XXX"
epoch: "E-XXX"                       # optional but recommended
tier: "DVA.LITE"                     # DVA.LITE | DVA.ONE | DVA.FULL | DVA.HIVE | SUBSTRATE
scope:
  domain: "general"
  system: "mobius-substrate"
  environment: "testnet"             # testnet | mainnet | sim
epicon_type: "design"                # design | decision | reflection | incident | spec
status: "draft"                      # draft | active | deprecated | superseded
related_prs: []
related_commits: []
related_epicons: []
tags:
  - "mobius"
  - "epicon"
integrity_index_baseline: 0.00       # set when you write it, or leave 0.00 as placeholder
risk_level: "medium"                 # low | medium | high | critical
created_at: "2025-12-30T11:45:00-05:00"
updated_at: "2025-12-30T11:45:00-05:00"
version: 1
hash_hint: ""                        # optional: content hash for extra safety
summary: "One or two sentence summary for fast agent routing."
---

# Summary

One tight paragraph: what problem this EPICON addresses, at which tier, and the outcome you're aiming for.

---

## 1. Context

- What system are we operating in?
- What constraints are already known?
- What previous EPICONs / decisions does this build on?

## 2. Assumptions

- A1: ...
- A2: ...
- A3: ...

## 3. Problem Statement

What exactly is the problem / decision / design you're addressing?

## 4. Options Considered

### Option A
- Description
- Upside
- Downside
- Risks / failure modes

### Option B
- Description
- Upside
- Downside
- Risks / failure modes

## 5. Decision / Design

- Chosen option:
- Why we chose it now:
- Under what conditions we'd revisit / roll back:

## 6. Risk & Integrity Notes

- Integrity tradeoffs:
- Who bears risk if this fails:
- What metrics / signals we'll watch:
- How we'll know this needs a follow-up EPICON:

## 7. Implementation Links

- PRs:
- Commits:
- Config paths:
- Diagrams / docs:

## 8. Reflection Hook

Questions for future reflections:

- Did this actually solve the original problem?
- Did it create new failure modes?
- Did incentives or behavior drift in unexpected ways?
