# Mobius Pulse Protocol

**Status:** Draft • Cycle C-151  
**Owner:** @kaizencycle  
**Scope:** Repo-wide telemetry, integrity sensing, Sentinel sync

---

## 1. Overview

The **Mobius Pulse Protocol** is a lightweight, metadata-only snapshot of the Mobius monorepo.

- **Purpose:** Let Sentinels (ATLAS, AUREA, ECHO, etc.) understand the current shape and health of the repository without direct GitHub/API access.
- **Format:** JSON
- **Size Target:** Small enough to email, archive, or sync over low-bandwidth links.
- **Generation:** `scripts/mobius_pulse_json.sh`
- **Ingest:** `POST /v1/pulse/ingest`
- **Consumption:** `GET /v1/pulse/latest`, `GET /v1/pulse/:id`

The pulse acts as the **heartbeat** for Mobius Systems.

---

## 2. Pulse JSON Schema (Conceptual)

```jsonc
{
  "version": "1.0",
  "generatedAt": "2025-11-30T13:05:00Z",
  "cycle": "C-151",
  "branch": "main",
  "commit": {
    "sha": "abc123...",
    "author": "kaizencycle",
    "message": "C-151: add mobius pulse ingest endpoint"
  },
  "tree": {
    "apps": ["ledger-api", "indexer-api", "shield-api", "reflections-api"],
    "packages": ["integrity-core", "civic-protocol-core", "ui-kit"],
    "workflows": [
      "ci-core.yml",
      "mcp-enforcer.yml",
      "mii-gate.yml",
      "mobius-pulse-nightly.yml"
    ]
  },
  "integrity": {
    "giScore": 0.997,
    "miiScore": 0.992,
    "micTestnet": {
      "totalMinted": 0,
      "totalBurned": 0
    }
  },
  "stats": {
    "totalFiles": 1234,
    "totalLines": 98765,
    "languages": {
      "typescript": 0.78,
      "markdown": 0.14,
      "yaml": 0.06,
      "other": 0.02
    }
  },
  "sentinels": {
    "atlas": { "status": "online", "lastReview": "2025-11-29T18:40:00Z" },
    "aurea": { "status": "online" },
    "echo": { "status": "online" }
  },
  "notes": "Optional free-text / annotations"
}
```

The actual schema should live in `packages/integrity-core/src/pulse/` (Zod or TypeScript types).

---

## 3. Generation

```bash
# From repo root
./scripts/mobius_pulse_json.sh \
  --out .mobius/pulses/mobius_pulse_$(date +%Y%m%d-%H%M).json
```

**Recommended uses:**
- Nightly cron via GitHub Actions.
- Pre-merge pulse for major PRs.
- Local "checkpoint" pulse before big refactors.

---

## 4. API Endpoints

### 4.1 POST /v1/pulse/ingest
- **Body:** Pulse JSON (validated)
- **Auth:** internal/API key (configurable)
- **Side Effects:**
  - Stores pulse in DB (e.g., `mobius_pulses` table/collection).
  - Indexes key metrics for queries (cycle, giScore, miiScore, domain spreads).

### 4.2 GET /v1/pulse/latest
- **Returns:** Most recent valid pulse.
- **Filters:** `?cycle=C-151` optional.

### 4.3 GET /v1/pulse/:id
- Fetch pulse by ID/hash for audit & diffing.

---

## 5. Security & Privacy

- **No secrets, tokens, or env vars** are ever included in a pulse.
- Only structural + integrity metadata, not raw data payloads.
- Pulses are safe to:
  - Share with Sentinels.
  - Archive in Citizen nodes.
  - Embed in MIC testnet simulations.

---

## 6. Usage Patterns

- **Sentinels:** Score repo health before giving guidance.
- **MIC/MII:** Use pulse history to compute integrity trends.
- **Governance:** Use pulses as objective anchors in consensus.
- **Local Nodes:** Keep a private log of their own Mobius state.

---

## 7. Future Work

- Pulse diffing (`/v1/pulse/diff/:oldId/:newId`)
- Per-folder or per-domain mini-pulses (e.g., `labs/` only)
- Compression & signing (Ed25519) for distributed sharing

---

## References

- [Cycle C-151 Ledger Entry](../../../ledger/cycles/C-151.md)
- [Pulse Schema Source](../../../../packages/integrity-core/src/pulse/mobiusPulse.ts)
- [Indexer API Routes](../../../../apps/indexer-/api/src/routes/pulse.ts)
