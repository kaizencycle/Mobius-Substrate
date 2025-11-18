# Mobius Local Node

> "Mobius in a backpack" — a sovereign, offline Sentinel stack you can run on your own machine.

## Purpose

The Mobius Local Node is a **self-contained AI–human operations node** that:

- Runs entirely on a **local LLM** (via Ollama or equivalent)

- Wraps the raw model with the **Mobius Sentinel layer** (AUREA, ATLAS, JADE)

- Logs all conversations into a local **integrity ledger** (`data/ledger.json`)

- Enforces a **constitutional system prompt** before any reasoning happens

It is designed as:

- A **personal S.H.I.E.L.D. console** for the custodian

- A **reference implementation** for sovereign, offline AI governance

- A **fallback node** when cloud LLMs, DNS, or external APIs are unavailable

---

## Architecture Overview

```text
+------------------------+
|  Human Operator        |
+-----------+------------+
            |
            v
+------------------------+     +--------------------+
|  Mobius Local CLI      | --> |  Sentinel Router   |
|  (TUI / REPL)          |     |  (AUREA / ATLAS /  |
+------------------------+     |   JADE)            |
                               +---------+----------+
                                         |
                                         v
                               +--------------------+
                               |  Local LLM (Ollama)|
                               |  e.g. llama3.1     |
                               +---------+----------+
                                         |
                                         v
                               +--------------------+
                               |  Integrity Ledger  |
                               |  data/ledger.json  |
                               +--------------------+
```

### Sentinels

- **AUREA** — orchestration, synthesis, "final say"

- **ATLAS** — structure, systems, constraints

- **JADE** — meaning, morale, human framing

By default:

- If you route to **ATLAS** or **JADE**, you get single-sentinel replies.

- If you route to **AUREA**, it silently runs a **multi-sentinel deliberation**:

  - ATLAS → structural/system analysis

  - JADE → human/context/morale analysis

  - AUREA → final synthesized answer

---

## Location in Monorepo

```text
Mobius-Systems/
  apps/
    mobius-local-node/
      package.json
      tsconfig.json
      src/
      scripts/
      data/        # created at runtime
      README.md
docs/
  nodes/
    MOBIUS_LOCAL_NODE.md   # this file
```

---

## Quickstart

From repo root:

```bash
# 1. Install dependencies (workspaces)
npm install

# 2. Ensure Ollama is installed:
#    https://ollama.com/download

# 3. Pull the local model used by Mobius
npm run install:mobius-local-llm

# 4. Run the node in dev mode
npm run dev:mobius-local
```

You should see something like:

```text
MOBIUS LOCAL NODE v0.2 — OFFLINE SENTINEL
==========================================
Model          : llama3.1
Ledger         : data/ledger.json
------------------------------------------
Active Sentinel: AUREA
GI (last 10)   : 0.97
------------------------------------------
1) Ask Mobius
2) Switch Sentinel (AUREA / ATLAS / JADE)
3) View ledger file path
4) Exit
------------------------------------------
Select option:
```

---

## Configuration

Environment variables (optional):

- `MOBIUS_MODEL`  
  Local model name (default: `llama3.1`)

- `MOBIUS_LLM_ENDPOINT`  
  Local inference endpoint (default: `http://localhost:11434/api/chat`)

- `MOBIUS_LEDGER_PATH`  
  Override where the ledger is stored (default: `./data/ledger.json` inside the app)

Example:

```bash
export MOBIUS_MODEL="llama3.1"
export MOBIUS_LLM_ENDPOINT="http://localhost:11434/api/chat"
export MOBIUS_LEDGER_PATH="/secure/mobius/ledger.json"
```

---

## Integrity Ledger

Every interaction is persisted to `data/ledger.json` as an append-only log, e.g.:

```json
{
  "timestamp": "2025-11-17T13:45:21.123Z",
  "sentinel": "AUREA",
  "prompt": "Help me reason about an AI civic OS for NYC.",
  "atlasView": "...",
  "jadeView": "...",
  "finalAnswer": "...",
  "giScore": 0.97
}
```

> In v0.2 the `giScore` is a simple heuristic; in future versions it will be connected to the full KTT / GI scoring pipeline.

Planned evolution:

- v0.3 — real GI computation (consistency, citation, safety checks)

- v0.4 — optional sync to Civic Ledger when network is available

- v0.5 — encrypted ledger with custody keys

---

## Relation to the Wider Mobius Stack

The local node is designed to be:

- A **sandbox** for Sentinel prompts and constitutional rules

- A **resilience node** when cloud endpoints are down

- A **reference implementation** for cities, schools, or agencies that need:

  * AI in high-sensitivity environments

  * No dependency on external providers

  * Local auditability and tamper-evident logs

Later, a city-scale deployment would run:

- **Local nodes** in each department (health, transit, education)

- **Civic Ledger** as the shared chain of record

- **MIC** as the integrity-gated funding layer

- **Mobius Local Node** as the template for each "mini S.H.I.E.L.D. console"

---

## Roadmap

- **v0.2 (current)**

  * Multi-sentinel deliberation (ATLAS + JADE → AUREA)

  * Local ledger logging

  * Simple TUI (menu + status)

- **v0.3**

  * Proper GI scoring module

  * Config profiles (Custodian vs Citizen mode)

  * Basic red-team / safety checks

- **v0.4**

  * Optional network sync to Civic Ledger

  * "Offline-first, sync-later" pattern

  * Pluggable local models

- **v0.5+**

  * Encrypted ledger with custody keys

  * Multi-user local accounts

  * Hooks into KTT trial telemetry

This node is the **smallest working Mobius civilization kernel** you can run alone.

