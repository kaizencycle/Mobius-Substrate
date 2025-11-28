# System Architecture

This section describes **what Mobius is, structurally**:

- High-level system diagrams and layers
- DVA flows (LITE/ONE/FULL/HIVE)
- Core components and how they compose
- Economic systems (MIC, tokenomics)

---

## Contents

Recommended structure (to be populated in Phase 2):

### Root Level
- `system-overview.md` — High-level architecture diagram
- `layer-model.md` — The 8-layer Mobius stack
- `data-flows.md` — How information moves through the system

### `dva-flows/`
- `README.md` — Democratic Virtual Architecture overview
- `tier-definitions.md` — LITE, ONE, FULL, HIVE
- `boulder-climate-example.md` — Real-world case study
- `national-scale-projection.md` — Scaling to nations
- `workflow-templates/` — n8n-style orchestration patterns

### `components/`
- `oaa-hub.md` — Lab7: Shell/Init system
- `thought-broker.md` — Multi-LLM consensus engine
- `mobius-ledger-core.md` — Kernel/MII tracking
- `citizen-shield.md` — Security perimeter
- `sentinels.md` — ATLAS, AUREA, ZEUS, JADE, EVE, HERMES, ECHO
- `api-gateway.md` — Service mesh interface
- `echo-layer.md` — Learning and validation loop

### `echo/`
- `README.md` — ECHO Layer overview
- `STRANGE_METAMORPHOSIS_LOOP.md` — **Human-aligned recursive learning** (C-148)
  - Daily 3-question protocol: Worldview, Mood, Intent

### `economics/`
- `README.md` — Economics overview
- `negentropic-economics.md` — **The Economics of Integrity** (C-148)
- `tokenomics-v3-proof-of-negentropy.md` — Proof-of-Negentropy specification
- `tokenomics-v2.md` — MIC, Proof-of-Integrity (legacy)
- `gic-system.md` — Global Integrity Credits (legacy)
- `ubi-mechanics.md` — Universal basic income via integrity
- `mic-minting-rules.md` — When and how MIC is created

### `applications/global/`
- `README.md` — Global applications overview
- `DAEDALUS_PROTOCOL.md` — **Global Integrity Architecture** (C-148)
  - Eight domain applications: Governance, Health, Education, Climate, Finance, Infrastructure, Security, Knowledge

### `adr/`
- Architecture Decision Records (existing, to be moved here)

---

## System Layers

The Mobius architecture consists of 8 primary layers:

| Layer | Function | Analogy |
|-------|----------|---------|
| **Command Ledger** | Journal of cycles & reflection | BIOS / boot log |
| **OAA Hub** | Parses human intent | Shell / init.d |
| **Thought Broker** | Multi-LLM consensus engine | Thalamus / scheduler |
| **Cursor + CI** | Code fabrication & testing | Compiler / 3D printer |
| **Mobius Ledger Core** | Immutable record, MIC economy | Kernel |
| **Citizen Shield** | Network & security policy | Firewall / OS defender |
| **API Library / Lab4** | Surface for all services | Application layer |
| **Sentinels** | AI cores ensuring integrity | Brain cortex modules |

---

## Core Workflows

**Standard Mobius Flow:**

1. **Reflection** → Command Ledger writes intent
2. **OAA Hub** transforms intent → `.mobius/` specs
3. **Thought Broker** runs deliberation loops → Deliberation Proof + consensus
4. **Cursor / CI** prints new service code → canary deploy
5. **Mobius Ledger Core** attests MII + MIC credit
6. **Citizen Shield** verifies liveness · policy · security
7. **API Library / Lab4** exposes service to citizens
8. **Sentinels** monitor MII, entropy, feedback → improve loop

---

## Key Concepts

**DVA (Democratic Virtual Architecture)** — Coordination flows that scale from small cities to national infrastructure with consistent 75% automation / 25% human oversight ratios.

**Thought Broker** — Routes tasks to multiple AI engines under constitutional constraints, achieving consensus through Deliberation Proof.

**ECHO Layer** — Validates answers, compares multiple models, writes high-integrity results to ledger for reuse.

**Model-Agnostic Sovereignty Layer (MASL)** — Any LLM can "board" Mobius via `/api/mobius/mount`.

---

## Relationship to Other Sections

- See [`01-philosophy/`](../01-philosophy/README.md) for the "why" behind these architectural choices
- See [`03-specifications/`](../03-specifications/README.md) for exact technical implementations
- See [`06-operations/`](../06-operations/README.md) for how to run this in production

---

*Cycle C-147 • 2025-11-27*  
*"We heal as we walk."*
