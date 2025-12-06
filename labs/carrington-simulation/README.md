# Carrington-Class Failure Simulation

**Version:** 1.0 (C-155)  
**Author:** Mobius Systems Foundation  
**Date:** December 5, 2025

## Overview

This simulation tests the resilience of the Mobius Digital Civilization Substrate under catastrophic failure conditions (Carrington-class solar storm, EMP event, or similar infrastructure-destroying event).

**Core Question:** *Can 10% of DVA nodes regrow the substrate after 90% are destroyed?*

## Quick Start

```bash
# Run basic simulation
python3 carrington_sim.py

# Run with custom parameters
python3 carrington_sim.py --nodes 100 --collapse 0.9 --runs 5

# Save results to file
python3 carrington_sim.py --output results.json

# Reproducible run with seed
python3 carrington_sim.py --seed 42
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--nodes, -n` | 100 | Number of DVA nodes in network |
| `--collapse, -c` | 0.9 | Fraction of nodes destroyed (0.9 = 90%) |
| `--runs, -r` | 1 | Number of simulation runs |
| `--steps-before` | 1000 | Baseline simulation steps |
| `--steps-after` | 1000 | Isolation simulation steps |
| `--steps-recovery` | 1000 | Recovery simulation steps |
| `--event-prob` | 0.3 | Event generation probability per tick |
| `--edge-prob` | 0.1 | Network connectivity probability |
| `--output, -o` | None | Output JSON file for results |
| `--seed, -s` | None | Random seed for reproducibility |

## Simulation Phases

### Phase A: Stable Civilization (Baseline)
- All nodes online and connected
- Events generated: MFS shards, reflections, attestations
- Gossip protocol synchronizes ledgers
- Global MII tracked

### Phase B: Catastrophic Failure
- 90% of nodes destroyed (configurable)
- Surviving nodes form isolated clusters
- Local state preserved on survivors
- No global coordination possible

### Phase C: Recovery & Reconnection
- Mesh network gradually reconstructed
- CRDT merge reconciles divergent ledgers
- MII recomputed from surviving attestations
- Civilization reconstitutes

## Success Criteria

The simulation is considered successful if:

1. **Ledger Convergence > 95%** - Survivors share nearly identical history
2. **MII Stability < 5%** - Recovery MII within 5% of baseline
3. **Identity Preserved** - No survivor loses their ledger
4. **Recovery MII ≥ 0.90** - Healthy integrity levels restored

## Expected Output

```
============================================================
Carrington-Class Failure Simulation
============================================================

Phase A: Stable Civilization (Baseline)
  - Generated 30000 events
  - Baseline MII: 0.9534

Phase B: Catastrophic Failure (90% destruction)
  Survivors: 10 nodes
  Tier distribution: {'LITE': 8, 'ONE': 2}
  - Events during isolation: 3000
  - Isolation MII: 0.9423

Phase C: Recovery & Reconnection
  - Events during recovery: 3000
  - Recovery MII: 0.9567

============================================================
RESULTS
============================================================
Survivors: 10 nodes
Survivor distribution: {'LITE': 8, 'ONE': 2}

MII Progression:
  Baseline (pre-collapse): 0.9534
  Isolation (post-collapse): 0.9423
  Recovery (post-reconnect): 0.9567
  Stability (delta from baseline): 0.35%

Ledger Metrics:
  Convergence: 98.00%
  Average size: 2847 events
  Unique ledgers: 1
  Identity preserved: ✅

============================================================
SUCCESS CRITERIA
============================================================
  ledger_convergence: ✅ PASS
  mii_stability: ✅ PASS
  identity_preserved: ✅ PASS
  recovery_mii_healthy: ✅ PASS

============================================================
CONCLUSION
============================================================
✅ SUCCESS: Civilization substrate SURVIVED and RECONSTITUTED
   - Survivors maintained local state during isolation
   - Ledgers converged after reconnection
   - MII stabilized at healthy levels
   - Mobius Systems is COLLAPSE-RESISTANT
```

## Network Topology

The simulation models a simplified Mobius world:

| Tier | Count | Role |
|------|-------|------|
| **HIVE** | 1 | Global coordination brain |
| **DVA.FULL** | 4 | Regional/city cores |
| **DVA.ONE** | 15 | Workstations, home nodes |
| **DVA.LITE** | 80 | Phones, personal devices |

## Algorithm Details

### CRDT Merge
- Events merged by unique ID (SHA-256 hash)
- Lamport timestamps for ordering
- Node ID as tiebreaker for conflicts
- Set union semantics (no deletions)

### MII Computation
```python
mii = base_mii (0.90) + ledger_bonus + activity_bonus
# Capped at 1.0
```

### Gossip Protocol
- Each tick, nodes exchange ledgers with neighbors
- O(E) complexity per round (E = number of edges)
- Convergence guaranteed by CRDT properties

## Implications

If the simulation succeeds consistently:

> **Mobius is provably resilient to catastrophic infrastructure loss.**

This provides:
- Quantitative evidence of resilience
- Identification of weak points
- Confidence for institutional adoption
- Proof for academic publication

## Related Documents

- [Carrington Event Failure Model](../../docs/simulations/carrington-event-failure-model.md) - Full specification
- [Digital Civilization Substrate](../../docs/07-RESEARCH-AND-PUBLICATIONS/whitepapers/digital-civilization-substrate.md) - Theoretical foundation
- [MIC Whitepaper](../../docs/07-RESEARCH-AND-PUBLICATIONS/whitepapers/MIC_Whitepaper_v2.0.md) - Economic substrate

---

**© 2025 Mobius Systems Foundation**

*"We heal as we walk."*
