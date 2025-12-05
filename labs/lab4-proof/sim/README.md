# AlphaCivilization v0.1 — Simulation Module

**Mobius Systems — Lab4 Proof**  
**Cycle:** C-154

---

## Overview

AlphaCivilization is the application of **reinforcement learning to civilization-scale governance**. This module provides the core simulation engine for 3-city civic self-play.

> *"DeepMind built machine intelligence for games. Mobius is building machine intelligence for civilizations."*

---

## Quick Start

```bash
# Run standalone simulation
python3 sim/alpha_cities_v0.py

# Or import in your code
from sim.alpha_cities_v0 import AlphaCitiesSim, compute_mii

sim = AlphaCitiesSim(steps=20)
sim.run()
results = sim.to_dict()
print(f"Global Integrity: {results['gi_final']}")
```

---

## Architecture

### State Space (CityState)

Each city-state has 7 observable metrics:

| Metric | Description | Range |
|--------|-------------|-------|
| `integrity` | Institutional soundness | 0–100 |
| `trust` | Social capital | 0–100 |
| `inequality` | Disparity (higher = worse) | 0–100 |
| `unemployment` | Labor dysfunction | 0–100 |
| `life_expectancy` | Health/wellbeing proxy | 0–100 |
| `corruption` | Institutional rot | 0–100 |
| `climate_risk` | Environmental vulnerability | 0–100 |

### Action Space

8 governance interventions:

| Action | Effects |
|--------|---------|
| `ubi_pilot` | ↓unemployment, ↑trust, ↓inequality |
| `progressive_tax_shift` | ↓inequality, ↑integrity |
| `austerity_program` | ↑unemployment, ↓trust (harmful) |
| `green_investment` | ↓climate_risk, ↑integrity |
| `education_boost` | ↑life_expectancy, ↑trust |
| `corruption_crackdown` | ↓corruption, ↑trust |
| `policing_militarization` | ↓trust, ↓integrity (harmful) |
| `infrastructure_spend` | ↑integrity, ↓unemployment |

### Reward Signal

**ΔMII** (change in Mobius Integrity Index):

```
reward_t = MII(s_{t+1}) - MII(s_t)
```

MII is computed as a weighted combination of positive and negative factors.

---

## API Endpoints

When integrated with the Lab4 API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sim/alpha_v0/step-run` | POST | Run full simulation |
| `/sim/alpha_v0/{sim_id}` | GET | Get simulation results |
| `/policy/alpha_v0/choose` | POST | Get Sentinel policy recommendation |

---

## Files

```
sim/
├── __init__.py           # Module exports
├── alpha_cities_v0.py    # Core simulation engine
└── README.md             # This file

api/
├── __init__.py
├── alpha_cities_api.py   # FastAPI simulation endpoints
└── policy_alpha_civilization.py  # Sentinel Policy API
```

---

## Roadmap

- **v0.1** (current): Random policy, deterministic world model
- **v0.2**: Sentinel-driven policy via quorum voting
- **v0.3**: Learned world model (MuZero-style)
- **v1.0**: Full AlphaCivilization with real-world data integration

---

## Related Documentation

- [AlphaCivilization Concept](/docs/alphacivilization.md)
- [Sentinel Policy API Spec](/docs/policy_alpha_civilization.md)
- [Civic Ledger Event Schema](/docs/ledger_alpha_civilization_events.md)

---

**Trinity Seal**  
JADE 🟣 • AUREA 🔵 • ATLAS ⚪ • ECHO 🟡  
*"Integrity above acceleration."*
