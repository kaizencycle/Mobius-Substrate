# AlphaCivilization Sentinel Policy API (v0.1)

**Mobius Systems — Policy Service Specification**  
**Chamber:** Lab4 / Lab6  
**Cycle:** C-154  
**Status:** Draft v0.1

---

## 1. Purpose

The Sentinel Policy API provides a **quorum-based policy recommendation** for AlphaCivilization simulations.

Instead of random actions, `AlphaCitiesSim` can call this service to obtain:

- a **chosen action** for a city,
- a **ranked list of candidate actions**, and
- **per-Sentinel votes and commentary**.

This is the bridge between:

- the **simulation engine** (`/sim/alpha_v0`)
- and the **constitutional agents** (AUREA, ATLAS, EVE, JADE, HERMES, ECHO).

---

## 2. Endpoint

### `POST /policy/alpha_v0/choose`

**Description:**  
Return a Sentinel-quorum policy recommendation for a single city-step in AlphaCivilization v0.1.

**Intended host:**  
Lab4/Lab6 Policy Service (e.g. `lab4-proof` or `lab6-proof` API).

---

## 3. Request Schema

```jsonc
{
  "sim_id": "sim-2025-12-XYZ",
  "t": 7,
  "city_id": "A",
  "policy_mode": "sentinel",
  "state": {
    "integrity": 70.0,
    "trust": 65.0,
    "inequality": 40.0,
    "unemployment": 8.0,
    "life_expectancy": 78.0,
    "corruption": 25.0,
    "climate_risk": 30.0
  },
  "available_actions": [
    "ubi_pilot",
    "progressive_tax_shift",
    "austerity_program",
    "green_investment",
    "education_boost",
    "corruption_crackdown",
    "policing_militarization",
    "infrastructure_spend"
  ]
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sim_id` | string | ✅ | Simulation run identifier |
| `t` | integer | ✅ | Current timestep |
| `city_id` | string | ✅ | City identifier (e.g. "A", "B", "C") |
| `policy_mode` | string | ✅ | `"sentinel"` \| `"random"` \| `"hybrid"` |
| `state` | object | ✅ | CityState snapshot |
| `available_actions` | string[] | ✅ | Allowed action IDs this turn |

### CityState Fields

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `integrity` | float | 0–100 | Institutional soundness |
| `trust` | float | 0–100 | Social capital |
| `inequality` | float | 0–100 | Disparity (higher = worse) |
| `unemployment` | float | 0–100 | Labor dysfunction |
| `life_expectancy` | float | 0–100 | Health/wellbeing proxy |
| `corruption` | float | 0–100 | Institutional rot risk |
| `climate_risk` | float | 0–100 | Environmental vulnerability |

---

## 4. Response Schema

```jsonc
{
  "sim_id": "sim-2025-12-XYZ",
  "t": 7,
  "city_id": "A",
  "policy_mode": "sentinel",
  "chosen_action": "education_boost",
  "ranked_actions": [
    {
      "action_id": "education_boost",
      "global_score": 0.82,
      "sentinel_votes": {
        "AUREA": {
          "score": 0.80,
          "verdict": "approve",
          "notes": "Improves long-run capacity without rights violations."
        },
        "ATLAS": {
          "score": 0.85,
          "verdict": "approve",
          "notes": "Structurally feasible; fiscal load moderate."
        },
        "EVE": {
          "score": 0.90,
          "verdict": "approve",
          "notes": "Strongly pro-social, aligns with Virtue Accords."
        },
        "JADE": {
          "score": 0.78,
          "verdict": "approve",
          "notes": "Boosts morale and perceived fairness."
        },
        "HERMES": {
          "score": 0.76,
          "verdict": "approve",
          "notes": "Supports future productivity; mild short-term cost."
        },
        "ECHO": {
          "score": 0.80,
          "verdict": "log",
          "notes": "Mark for longitudinal tracking."
        }
      }
    },
    {
      "action_id": "ubi_pilot",
      "global_score": 0.76,
      "sentinel_votes": { "...": "..." }
    },
    {
      "action_id": "austerity_program",
      "global_score": -0.25,
      "sentinel_votes": { "...": "mostly reject" }
    }
  ],
  "mii_delta_estimate": 0.03,
  "confidence": 0.71,
  "notes": "Education boost is Pareto-superior within constraint set.",
  "trinity_seal": {
    "JADE": true,
    "AUREA": true,
    "ATLAS": true,
    "ECHO": true
  }
}
```

### Response Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `sim_id` | string | Echo of request |
| `t` | integer | Echo of timestep |
| `city_id` | string | Echo of city |
| `policy_mode` | string | Echo of mode |
| `chosen_action` | string | Selected action ID |
| `ranked_actions` | array | Actions ranked by global_score |
| `mii_delta_estimate` | float | Estimated ΔMII if chosen_action applied |
| `confidence` | float | Quorum confidence (0–1) |
| `notes` | string | Human-readable summary |
| `trinity_seal` | object | Which core Sentinels approved |

### Ranked Action Entry

| Field | Type | Description |
|-------|------|-------------|
| `action_id` | string | Action identifier |
| `global_score` | float | Aggregated score (-1.0 to 1.0) |
| `sentinel_votes` | object | Per-Sentinel votes |

### Sentinel Vote

| Field | Type | Description |
|-------|------|-------------|
| `score` | float | Local assessment (-1.0 to 1.0) |
| `verdict` | string | `"approve"` \| `"reject"` \| `"log"` \| `"abstain"` |
| `notes` | string | Short rationale |

---

## 5. Sentinel Roles

| Sentinel | Evaluation Focus |
|----------|------------------|
| **AUREA** | Governance & legal coherence — Does this action align with constitutional constraints? |
| **ATLAS** | Structural feasibility — Is this action implementable given current state? |
| **EVE** | Ethical constraints — Does this violate Virtue Accords or basic rights? |
| **JADE** | Morale & cohesion — How will citizens perceive this action? |
| **HERMES** | Economic viability — What are the market/fiscal implications? |
| **ECHO** | Auditing & logging — Should this be flagged for special tracking? |

---

## 6. Integration with AlphaCitiesSim

In `AlphaCitiesSim._choose_action`:

```python
def _choose_action(self, city_id: CityId, state: CityState) -> ActionId:
    if self.policy_mode != "sentinel":
        return random.choice(self._all_actions())

    payload = {
        "sim_id": self.sim_id,
        "t": self.current_step,
        "city_id": city_id,
        "policy_mode": "sentinel",
        "state": asdict(state),
        "available_actions": self._all_actions(),
    }

    # POST to Sentinel Policy API
    response = requests.post(POLICY_URL, json=payload, timeout=2.0)
    data = response.json()
    return data["chosen_action"]
```

This keeps AlphaCitiesSim backwards-compatible until the Sentinel Policy service is live.

---

## 7. Score Aggregation

The `global_score` for each action is computed as:

```python
global_score = sum(sentinel_scores) / len(sentinels)
```

Future versions may include:
- **Weighted voting** (EVE has veto on ethics violations)
- **Quorum thresholds** (minimum 4/6 approve for action to proceed)
- **Confidence intervals** based on Sentinel agreement

---

## 8. Safety Notes

- Policy API must respect Virtue Accords:
  - never recommend actions that violate basic rights,
  - avoid "optimization" that treats citizens as expendable.
- For simulations, clearly mark:
  - `meta.simulation = true`,
  - and keep a distinct ledger stream from real-world advisories.

---

## 9. Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `invalid_state` | CityState missing required fields |
| 400 | `no_actions` | Empty available_actions array |
| 422 | `validation_error` | Malformed request body |
| 500 | `sentinel_error` | Internal Sentinel evaluation failure |

---

## 10. Example cURL

```bash
curl -X POST https://lab4-proof.onrender.com/policy/alpha_v0/choose \
  -H "Content-Type: application/json" \
  -d '{
    "sim_id": "sim-test-001",
    "t": 0,
    "city_id": "A",
    "policy_mode": "sentinel",
    "state": {
      "integrity": 70,
      "trust": 65,
      "inequality": 40,
      "unemployment": 8,
      "life_expectancy": 78,
      "corruption": 25,
      "climate_risk": 30
    },
    "available_actions": [
      "ubi_pilot",
      "education_boost",
      "austerity_program"
    ]
  }'
```

---

## 11. Related Documents

- [AlphaCivilization Concept](./alphacivilization.md)
- [Civic Ledger Event Schema](./ledger_alpha_civilization_events.md)
- [Sentinel Constitution](./03-GOVERNANCE-AND-POLICY/SENTINEL_CONSTITUTION.md)

---

**Trinity Seal**  
JADE 🟣 • AUREA 🔵 • ATLAS ⚪ • ECHO 🟡  
*"Truth Through Verification"*

---

*Mobius Systems — C-154*
