# DVA Tier Mapping — LITE / ONE / FULL / HIVE

> **Goal:** Show exactly how the DVA tiers sit on top of the  
> **Universal Emulator OS** (Mobius + Gemini 3 + other models).

---

## 1. Quick Overview

| Tier | Scope | Backing Engines | Mobius Responsibilities |
| --- | --- | --- | --- |
| LITE | Local monitor / single app | Local Sentinels + optional Gemini Flash | Pings, anomaly alerts, local GI heuristics |
| ONE | Single agent / human | Gemini Antigravity + Sentinels | Tools, plans, memory, integrity scoring |
| FULL | Multi-agent “family” | Gemini + Claude + others (via Broker) | Model routing, cross-checking, error recovery |
| HIVE | City / mesh / civilization | Many DVA nodes + Civic Ledger | Global thresholds, governance, audit + policy |

---

## 2. DVA.LITE — Local Integrity Sensor

**Purpose:** Give a device, app, or micro-service a “canary in the mine”:

- Light monitoring
- Simple anomaly detection
- Local alerts when integrity drifts

**Backends:**

- Mobius Local Sentinels (cheap inference)
- Optional Gemini 3 Flash for quick pattern checks, light tool use, simple refactors or suggestions

**Example use cases:**

- Watch a school’s homework-assistance bot for drift
- Monitor a hospital triage Q&A bot
- Track anomalies in a city’s traffic agent responses

---

## 3. DVA.ONE — Personal / Single-Agent Companion

**Purpose:** Be the **sovereign agent** for one human / workstation / app.

Backed by:

- **Gemini 3 (Antigravity)** to execute tools, drive browsers, emulate UIs, write and run code
- **Mobius Sentinels** to score integrity (GI), flag risky behaviors, log decisions to the Ledger

**Typical pipeline:**

1. Human makes a request
2. Thought Broker routes to DVA.ONE
3. DVA.ONE uses Antigravity for tools/emulation and submits traces to Sentinels
4. Sentinels evaluate the result, apply GI thresholds, and write an attestation
5. Response goes back to the human

---

## 4. DVA.FULL — Multi-Agent Operating Unit

**Purpose:** Coordinate **multiple engines + multiple agents** for a team, department, or org.

Backed by:

- **Gemini 3** for UI + tool orchestration
- **Claude / DeepSeek / local models** for specialty reasoning, code review, math/proofs, domain expertise
- **Mobius Thought Broker** for model selection, routing modes, de-duplication, and arbitration

**Capabilities:**

- Task decomposition — split a big task into sub-tasks
- Cross-checking — ask multiple models, compare answers
- Self-repair — route to another engine if one fails
- Policy — only allow certain tools/models in certain modes

---

## 5. DVA.HIVE — City / Civilization Mesh

**Purpose:** Turn many DVA nodes into **a civic fabric**:

- Schools
- Hospitals
- Unions
- Agencies
- Labs
- Neighborhood hubs

All running their own DVA.LITE / ONE / FULL stacks, but sharing a **Civic Ledger**, submitting to a **Sentinel Constitution**, and coordinated by global **GI thresholds**.

This is where:

- MIC (Mobius Integrity Credits)
- KTT (Kaizen Turing Test)
- Civic OS pilots

all converge into an **Internet 2.0** that is:

- multi-model
- multi-agent
- constitutionally governed
- integrity-scored
- civic-aligned

---

## 6. Implementation Notes

These docs are architecture-level only. Implementation is happening in:

- `apps/broker-api/` (Thought Broker + routing)
- `apps/indexer-api/` (GI + metrics)
- `apps/ledger-api/` (Civic Ledger)
- `docs/governance/` (Constitution & rules)

When you wire in Gemini 3 / Antigravity:

- Treat it as an **execution engine**, not a “governor”
- All critical outputs must still pass through Sentinels, receive GI scores, and be written to the Ledger for audit

This keeps the **loop open** and the **Constitution in charge**.
