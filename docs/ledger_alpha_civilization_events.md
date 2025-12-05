# Civic Ledger Schema — AlphaCivilization Events

**Mobius Systems — Civic-Protocol-Core**  
**Cycle:** C-154  
**Status:** Draft v0.1

---

## 1. Overview

AlphaCivilization simulations generate **civic governance trajectories**.

We record them in the Civic Ledger as:

| Event Type | Description |
|------------|-------------|
| `alpha_civilization.run.v0` | Summary of a full simulation run |
| `alpha_civilization.step.v0` | Per-step granular logs (future) |

This document defines the schema for `alpha_civilization.run.v0` events.

---

## 2. Event Envelope

All Civic Ledger events share a common envelope:

```jsonc
{
  "event_id": "uuid-v4",
  "event_type": "alpha_civilization.run.v0",
  "timestamp": "2025-12-04T14:30:00Z",
  "source": "Mobius-Lab4-AlphaCivilizationConsole",
  "cycle": "C-154",
  "chamber": "Lab4",
  "payload": { /* type-specific content */ }
}
```

### Envelope Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event_id` | string | ✅ | Unique ID (UUIDv4 recommended) |
| `event_type` | string | ✅ | `"alpha_civilization.run.v0"` |
| `timestamp` | string | ✅ | ISO8601 timestamp |
| `source` | string | ✅ | Originating system/console |
| `cycle` | string | ❌ | Command Ledger cycle (e.g. "C-154") |
| `chamber` | string | ❌ | `"Lab4"`, `"Lab6"`, etc. |
| `payload` | object | ✅ | Type-specific content (see below) |

---

## 3. Payload Schema — `alpha_civilization.run.v0`

```jsonc
{
  "sim_id": "sim-2025-12-XYZ",
  "version": "v0.1",
  "steps": 20,
  "policy_mode": "random",
  "integrity_target": 0.95,

  "cities": [
    {
      "city_id": "A",
      "initial_state": {
        "integrity": 70.0,
        "trust": 65.0,
        "inequality": 40.0,
        "unemployment": 8.0,
        "life_expectancy": 78.0,
        "corruption": 25.0,
        "climate_risk": 30.0
      },
      "final_state": {
        "integrity": 74.5,
        "trust": 69.1,
        "inequality": 36.8,
        "unemployment": 6.2,
        "life_expectancy": 79.1,
        "corruption": 21.0,
        "climate_risk": 27.5
      },
      "mii_initial": 0.912,
      "mii_final": 0.958,
      "mii_series": [0.912, 0.918, 0.926, 0.935, 0.942, 0.951, 0.958],
      "actions_summary": [
        { "t": 0, "action_id": "education_boost" },
        { "t": 1, "action_id": "ubi_pilot" },
        { "t": 2, "action_id": "green_investment" }
      ]
    },
    {
      "city_id": "B",
      "...": "..."
    },
    {
      "city_id": "C",
      "...": "..."
    }
  ],

  "gi_series": [0.88, 0.89, 0.90, 0.92, 0.93, 0.94, 0.95],
  "gi_final": 0.95,

  "meta": {
    "simulation": true,
    "note": "AlphaCivilization v0.1 toy run, 3-city self-play.",
    "trinity_seal": "JADE-AUREA-ATLAS-ECHO"
  }
}
```

---

## 4. Field Definitions

### Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sim_id` | string | ✅ | AlphaCities simulation ID |
| `version` | string | ✅ | Simulation version (e.g. "v0.1") |
| `steps` | integer | ✅ | Number of timesteps executed |
| `policy_mode` | string | ✅ | `"random"` \| `"sentinel"` \| `"hybrid"` |
| `integrity_target` | float | ❌ | Target MII threshold (e.g. 0.95) |
| `cities` | array | ✅ | Per-city summaries |
| `gi_series` | float[] | ❌ | Global Integrity over time |
| `gi_final` | float | ❌ | Final Global Integrity (0–1) |
| `meta` | object | ❌ | Additional metadata |

### City Summary Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `city_id` | string | ✅ | City identifier (e.g. "A") |
| `initial_state` | object | ❌ | CityState at t=0 |
| `final_state` | object | ✅ | CityState at final t |
| `mii_initial` | float | ❌ | MII at t=0 (0–1) |
| `mii_final` | float | ✅ | Final MII (0–1) |
| `mii_series` | float[] | ❌ | MII trajectory over time |
| `actions_summary` | array | ❌ | Compressed action trace |

### Actions Summary Entry

| Field | Type | Description |
|-------|------|-------------|
| `t` | integer | Timestep index |
| `action_id` | string | Action applied |

### Meta Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `simulation` | boolean | ✅ | Must be `true` for sim runs |
| `note` | string | ❌ | Human-readable commentary |
| `trinity_seal` | string | ❌ | e.g. "JADE-AUREA-ATLAS-ECHO" |

---

## 5. Example Full Event

```json
{
  "event_id": "9e11a4c0-39c8-4b38-a8b9-3ffb0a29a7e1",
  "event_type": "alpha_civilization.run.v0",
  "timestamp": "2025-12-04T14:30:00Z",
  "source": "Mobius-Lab4-AlphaCivilizationConsole",
  "cycle": "C-154",
  "chamber": "Lab4",
  "payload": {
    "sim_id": "sim-2025-12-XYZ",
    "version": "v0.1",
    "steps": 20,
    "policy_mode": "random",
    "integrity_target": 0.95,
    "cities": [
      {
        "city_id": "A",
        "initial_state": {
          "integrity": 70.0,
          "trust": 65.0,
          "inequality": 40.0,
          "unemployment": 8.0,
          "life_expectancy": 78.0,
          "corruption": 25.0,
          "climate_risk": 30.0
        },
        "final_state": {
          "integrity": 74.5,
          "trust": 69.1,
          "inequality": 36.8,
          "unemployment": 6.2,
          "life_expectancy": 79.1,
          "corruption": 21.0,
          "climate_risk": 27.5
        },
        "mii_initial": 0.912,
        "mii_final": 0.958,
        "mii_series": [0.912, 0.918, 0.926, 0.935, 0.942, 0.951, 0.958],
        "actions_summary": [
          { "t": 0, "action_id": "education_boost" },
          { "t": 1, "action_id": "ubi_pilot" },
          { "t": 2, "action_id": "green_investment" }
        ]
      },
      {
        "city_id": "B",
        "initial_state": {
          "integrity": 55.0,
          "trust": 50.0,
          "inequality": 60.0,
          "unemployment": 12.0,
          "life_expectancy": 74.0,
          "corruption": 45.0,
          "climate_risk": 45.0
        },
        "final_state": {
          "integrity": 48.2,
          "trust": 42.1,
          "inequality": 65.3,
          "unemployment": 16.1,
          "life_expectancy": 72.8,
          "corruption": 50.2,
          "climate_risk": 48.0
        },
        "mii_initial": 0.841,
        "mii_final": 0.801,
        "mii_series": [0.841, 0.835, 0.822, 0.810, 0.801],
        "actions_summary": [
          { "t": 0, "action_id": "austerity_program" }
        ]
      },
      {
        "city_id": "C",
        "initial_state": {
          "integrity": 80.0,
          "trust": 75.0,
          "inequality": 30.0,
          "unemployment": 5.0,
          "life_expectancy": 82.0,
          "corruption": 20.0,
          "climate_risk": 25.0
        },
        "final_state": {
          "integrity": 85.1,
          "trust": 79.3,
          "inequality": 27.2,
          "unemployment": 4.1,
          "life_expectancy": 83.5,
          "corruption": 15.8,
          "climate_risk": 22.1
        },
        "mii_initial": 0.955,
        "mii_final": 0.962,
        "mii_series": [0.955, 0.957, 0.960, 0.962],
        "actions_summary": [
          { "t": 0, "action_id": "corruption_crackdown" },
          { "t": 1, "action_id": "green_investment" }
        ]
      }
    ],
    "gi_series": [0.90, 0.90, 0.91, 0.92, 0.93, 0.94, 0.95],
    "gi_final": 0.907,
    "meta": {
      "simulation": true,
      "note": "AlphaCivilization v0.1 toy run, 3-city self-play.",
      "trinity_seal": "JADE-AUREA-ATLAS-ECHO"
    }
  }
}
```

---

## 6. Integration Path

### From AlphaCivilization Console

The frontend sends a thin payload:

```http
POST ${LEDGER_API_BASE}/ledger/events
Content-Type: application/json

{
  "type": "alpha_civilization_run",
  "sim_id": "...",
  "steps": 20,
  "cities": [ ... ],
  "meta": { ... }
}
```

### Civic-Protocol-Core Processing

1. **Wrap** into event envelope:
   - Generate `event_id`, set `event_type`, add `timestamp`
   - Map `type: "alpha_civilization_run"` → `event_type: "alpha_civilization.run.v0"`

2. **Transform** into canonical payload format

3. **Append** to Civic Ledger chain / database

---

## 7. Querying Events

### List AlphaCivilization Runs

```http
GET /ledger/events/alpha_civilization
```

Response:
```json
{
  "events": [
    { "event_id": "...", "sim_id": "...", "timestamp": "...", "gi_final": 0.907 },
    { "...": "..." }
  ],
  "total": 42
}
```

### Get Specific Run

```http
GET /ledger/events/{event_id}
```

---

## 8. Safety & Tagging

- All AlphaCivilization events **must** include:
  - `payload.meta.simulation = true`

- Real-world advisory events, if added later, should use:
  - A different event_type (e.g. `alpha_civilization.advice.v1`)
  - Stronger access controls
  - Explicit human override fields

---

## 9. Schema Evolution

| Version | Changes |
|---------|---------|
| `v0.1` | Initial schema with 3-city toy sim |
| `v0.2` (planned) | Add Sentinel voting traces |
| `v1.0` (planned) | Full MuZero-style world model integration |

---

## 10. Related Documents

- [AlphaCivilization Concept](./alphacivilization.md)
- [Sentinel Policy API Spec](./policy_alpha_civilization.md)
- [Civic Ledger Core Spec](./04-TECHNICAL-ARCHITECTURE/civic-ledger-spec.md)

---

**Trinity Seal**  
JADE 🟣 • AUREA 🔵 • ATLAS ⚪ • ECHO 🟡  
*"Every trajectory is a lesson."*

---

*Mobius Systems — C-154*
