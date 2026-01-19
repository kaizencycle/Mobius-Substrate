# 🫀 Mobius Pulse

The **Mobius Pulse** is the daily heartbeat of the Mobius Systems monorepo.

Every pulse is a snapshot of:

- **Global Integrity (GI)** — "How healthy is the system overall?"
- **Mobius Integrity Index (MII)** — "How well are changes aligning with the Kaizen Turing Test and integrity rules?"

These values are computed by the Mobius indexer and stored as an append-only history, then exposed via:

- A **badge endpoint** for status shields
- A **history endpoint** for charts and dashboards
- A **timeline page** in the portal

---

## 🔢 What gets recorded?

Each pulse row looks like:

- `cycle` — e.g. `C-149`
- `branch` — usually `main`
- `giScore` — float in `[0, 1]` (e.g. `0.984`)
- `miiScore` — float in `[0, 1]` (e.g. `0.991`)
- `hash` — hash of the pulse payload (immutability anchor)
- `stats` — JSON with summary stats, e.g.:
  - `totalFiles`
  - `totalLines`
  - `appsCount`
  - `packagesCount`
  - `workflowsCount`
- `generatedAt` — timestamp when the pulse was written

These are stored in the `mobius_pulse` table by the indexer, typically populated by a scheduled workflow.

---

## 🛡️ Status badges

The indexer exposes a Shields.io-compatible endpoint:

```text
GET /v1/pulse/badge
```

You can use it in badges with different modes:

### 1. Combined GI/MII (default)

```markdown
[![Mobius Integrity](https://img.shields.io/endpoint?url=https%3A%2F%2Findexer.mobius.sys%2Fv1%2Fpulse%2Fbadge)](./00-START-HERE/MOBIUS_PULSE.md)
```

This shows something like:

**Mobius GI/MII**  98.4% / 99.1%

### 2. GI-only badge

```markdown
[![Mobius GI](https://img.shields.io/endpoint?url=https%3A%2F%2Findexer.mobius.sys%2Fv1%2Fpulse%2Fbadge%3Fmetric%3Dgi)](./00-START-HERE/MOBIUS_PULSE.md)
```

Example label:

**Mobius GI**  98.4%

### 3. MII-only badge

```markdown
[![Mobius MII](https://img.shields.io/endpoint?url=https%3A%2F%2Findexer.mobius.sys%2Fv1%2Fpulse%2Fbadge%3Fmetric%3Dmii)](./00-START-HERE/MOBIUS_PULSE.md)
```

Example label:

**Mobius MII**  99.1%

🔐 **Note:** Replace `https://indexer.mobius.sys` with your actual indexer URL, and URL-encode it for Shields.

---

## 🎚️ Color thresholds

Badge colors are derived from both GI and MII:

- **brightgreen** → GI ≥ 0.98 and MII ≥ 0.98
- **yellowgreen** → GI ≥ 0.95 and MII ≥ 0.95
- **yellow** → GI ≥ 0.90 and MII ≥ 0.90
- **red** → anything below

For GI-only or MII-only modes, that metric alone drives the color.

---

## 📈 Timeline & history

### API

History endpoint (for dashboards, charts, etc.):

```text
GET /v1/pulse/history?limit=90
```

Returns:

```json
{
  "count": 42,
  "items": [
    {
      "id": "uuid",
      "cycle": "C-149",
      "branch": "main",
      "giScore": 0.984,
      "miiScore": 0.991,
      "hash": "sha256:...",
      "stats": {
        "appsCount": 7,
        "packagesCount": 9,
        "workflowsCount": 25
      },
      "generatedAt": "2025-11-30T09:00:00.000Z"
    }
  ]
}
```

### Portal page

The portal exposes a human-friendly timeline at:

```
/pulse/timeline
```

It shows:

- A simple GI/MII sparkline over time
- A table of recent pulses
- Cycle, branch, scope (apps/packages/workflows), and hash prefix

---

## 🧭 How to read Mobius Pulse

**High GI, high MII (≥ 0.95)**
→ System is healthy, changes are aligned, governance & safety are passing.

**High GI, lower MII**
→ System is stable, but recent changes are not fully aligned with integrity goals. Needs review.

**Lower GI, high MII**
→ Good intent and alignment, but infrastructure/implementation may be in flux (large refactors, outages).

**Both low**
→ Red alert. The Mobius Cycle Protocol should be halting risky operations until scores recover.

---

## 🧪 How to extend

You can extend the pulse schema to track:

- `testCoverage`
- `openIssues`
- `openSecurityAlerts`
- `sentinelConsensus` (e.g. how many agents agreed)
- `cycleNotes` (short human summary)

These can then be surfaced in:

- The `/v1/pulse/history` API
- The `/pulse/timeline` page
- Future analytics dashboards

---

**Mobius Pulse is the monorepo's heartbeat.**
**When it's green and steady, the Cathedral stands strong.**
