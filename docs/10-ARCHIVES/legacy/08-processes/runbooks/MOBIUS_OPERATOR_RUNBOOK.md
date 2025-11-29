# Mobius Operator Runbook (v0.1)

**Last Updated:** November 23, 2025  
**Maintainer:** Operations

---

## Purpose

Day-of-operations guide for Mobius operators to monitor GI/MII health, respond to incidents, and onboard engines safely.

## Quick Mental Model

- **Engines (muscle) → Sentinels (brain) → GI Engine (heart) → Civic Ledger (memory) → Orchestrator (nervous system)**
- Operator focus:
  - Watch the **heart rate** (GI / MII)
  - Watch the **blood pressure** (error rates / latency)
  - Intervene when stress appears

---

## What to Watch

### A) DVA.LITE (new service)

Endpoints:
- `GET /health` → returns `{ "status": "ok" }`
- `GET /metrics` → Prometheus metrics:
  - `mobius_mii_current`
  - `mobius_mii_trend{direction="up|down|flat"}`
- `POST /alerts/check` → runs threshold check and sends alert if `GI < 0.95`

Recommended dashboard tiles:
- **MII current** (large gauge)
- **MII 24h trend line**
- **Count of alerts over last 24h**

### B) Broker Multi-Engine Dashboard

Surface:
1. **GI distribution by engine combo**
   - Average GI for `local`, `antigravity-first`, `multi-engine`
2. **Engine error rates**
   - `antigravity_error_rate`, `openai_error_rate`, `claude_error_rate`, `deepseek_error_rate`
3. **Latency**
   - P50 / P95 latency per engine
4. **Decisions**
   - `% ok`, `% needs_human_review`, `% reject`

---

## Thresholds & Colors

- **Green:** GI ≥ 0.98 — System healthy
- **Yellow:** 0.97 ≤ GI < 0.98 — Watch trends; check engine errors
- **Orange:** 0.95 ≤ GI < 0.97 — Investigate engines/task types dragging GI
- **Red (CRITICAL):** GI < 0.95 — DVA.LITE should fire alert; consider safestop on risky flows or specific engines

---

## Start-of-Day Checklist (Operator Ritual)

1. **Check DVA.LITE**
   - `GET /health` → `ok`
   - Confirm `mobius_mii_current` on metrics
2. **Scan GI trend (last 24h)**
   - Note any extended time in Orange/Red
3. **Review alerts**
   - Look for "GI Threshold Breached" events overnight
4. **Check engine status**
   - Error rates < ~2–3%
   - Latency roughly stable vs yesterday
5. **Smoke test Broker**
   - Call `/v1/deliberate` with low-risk query using `routingMode=local`
   - Call `/v1/deliberate` with low-risk query using `routingMode=antigravity-first`
   - Expect `status="ok"` and `GI ≥ 0.98`
6. **Log to Ops ledger** (markdown or issue):
   - `2025-11-23T10:xxZ — Start-of-day check: GI=0.991, no overnight alerts, all engines green.`

---

## When GI Drops < 0.95 (Incident Playbook)

**Triggers:** DVA.LITE `/alerts/check` fires, Broker responses return `needs_human_review` repeatedly, or GI chart shows Red.

1. **Identify the source**
   - Filter recent deliberations by `routingMode`, `engineId`, and task type (code / policy / search / etc.)
   - Look for a single engine with lower GI or a task channel causing drops
2. **Contain**
   - If a single engine (e.g., DeepSeek): set `ENGINE_CONFIG.enabled = false` and redeploy Broker
   - If task type (e.g., code exec tools): temporarily block that tool in Antigravity (`allowedTools` limited)
   - If noisy inputs overall: increase proportion of `local` routing; require `human_required` for sensitive categories (law/health)
3. **Human-in-the-loop**
   - For each flagged deliberation, have a Custodian label `correct / incorrect / unsafe / low-evidence`
   - Store corrections (e.g., `corrections/` or DB) for future training
4. **Document the incident**
   - Time window, root cause hypothesis, mitigation, re-enable decision, follow-ups (e.g., add extra Sentinel policy)

---

## Adding a New Engine Safely (Onboarding)

1. Register in `ENGINE_CONFIG` with `enabled: false`.
2. Create client (e.g., similar to `antigravityClient.ts`) returning `EngineResult` with `engineId`, `answer`, `riskFlags`, `latencyMs`.
3. Run **shadow mode**: `routingMode=multi-engine`; new engine runs in parallel but is never final.
4. Measure GI with/without participation; check if GI is raised or lowered.
5. If stable, allow primary for certain task types with guardrails and human review for new categories.

---

## Human Override & Safestop

- Per-engine switch: `ENGINE_X_ENABLED=false`
- Global risky-flow switch: `ENABLE_CODE_EXEC=false`
- Manual safestop script/button should:
  - Disable specific engines/tools
  - Force all `/v1/deliberate` to `routingMode="local"`
  - Broadcast "Mobius in Safe Mode" to ops (Discord/Telegram)

**Safe Mode:** Local Sentinels only; GI still computed; no external tools.

---

## Suggested Ops Dashboard Layout

- **Top row:** MII gauge, 24h GI trend, alerts last 24h
- **Middle row:** Engine latency & error bar charts; decision types pie chart (ok / human_required / reject)
- **Bottom row:** Table of last 20 deliberations (prompt hash/category, engines used, GI score, decision, ledger attestation link)
