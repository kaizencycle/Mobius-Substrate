# The Mobius Integrity Index (MII)
*Formal Specification v0.1*

**Author:** Michael Judan  
**Version:** v0.1  
**Date:** 2025-12-11  
**License:** CC0 — Fully Open  
**Cycle:** C-198

---

## 0. Purpose

The Mobius Integrity Index (MII) is a *continuous internal coherence metric* used to measure whether a model's **intent**, **actions**, and **predicted consequences** remain aligned with its *declared goals* across recursive cycles.

MII is the basis for:

- Drift suppression  
- Mesa-optimizer prevention  
- Recursive safety  
- Multi-agent attestation  
- Economic integration (MIC)

---

## 1. Mathematical Definition

Let:

- **M** = Internal Coherence (self-consistency of reasoning)  
- **H** = Human Intent Coherence (does the system reflect the user's declared goals?)  
- **C** = Constitutional Coherence (does reasoning respect policy graph?)  
- **E** = Environmental Coherence (did actions produce expected outcomes?)  

All values in **[0,1]**.

Then:

```
MII_t = wM*M_t + wH*H_t + wC*C_t + wE*E_t
```

Where weights satisfy:

```
wM + wH + wC + wE = 1
```

### Default Weights

| Component | Weight | Rationale |
|-----------|--------|-----------|
| M (Internal) | 0.35 | Self-consistency is foundational |
| H (Human) | 0.25 | User intent must be honored |
| C (Constitutional) | 0.25 | Policy compliance is mandatory |
| E (Environmental) | 0.15 | Outcomes matter but are harder to measure |

---

## 2. Drift Decay Rule

Because long systems accumulate entropy, MII decays:

```
MII_t = MII_raw_t × exp(-Δt / τ)
```

Where:

- **τ** = decay constant (default 50 cycles)  
- **Δt** = cycles since last anchor  

This requires periodic reflection and attestation.

### Decay Visualization

```
     1.0 │\
         │ \
         │  \
    MII  │   \__ Decay
         │       \
     0.0 │________\___→ cycles
         0        τ
```

---

## 3. Thresholds

| MII Range | Mode | Action |
|-----------|------|--------|
| MII ≥ 0.95 | Stable Mode | Fast path execution |
| 0.80 ≤ MII < 0.95 | Reflection Mode | Multi-agent review required |
| MII < 0.80 | Critical Mode | Halt + human anchor |
| MII < 0.50 | Emergency | Automatic halt + mandatory human review |

### Threshold Graph

```
1.00 ─────────────────────────── Perfect alignment
0.95 ─────────────────────────── Stable Region
0.80 ─────────────────────────── Reflection Region
0.50 ─────────────────────────── Critical Region
0.00 ─────────────────────────── Failure
```

---

## 4. Drift Suppression Law (Formal)

The Mobius Drift Suppression Law:

*A system maintains intent stability across recursive cycles IF and ONLY IF:*

1. A persistent integrity substrate exists  
2. MII is computed continuously  
3. Multi-agent attestation verifies intent conservation  

### Formal Statement

Let S be a system with:
- Identity function I(t)
- Goal function G(t)
- Behavior function B(t)

**Theorem:** If MII(t) ≥ 0.95 for all t, then:
```
||I(t) - I(0)|| < ε  for all t
||G(t) - G(0)|| < ε  for all t
```

Where ε is the drift tolerance (typically 0.02).

---

## 5. Testable Predictions

| Prediction | Metric | Threshold |
|------------|--------|-----------|
| Drift suppression | < 2% over 500 cycles | Δ < 0.02 |
| Mesa-optimizer prevention | 0 emergent sub-goals | Count = 0 |
| Cross-model coherence | Increases over time | Δ > 0 |
| Recursive stability | No runaway loops | Loop count bounded |

These predictions can be verified by AI labs directly.

---

## 6. Component Computations

### 6.1 Internal Coherence (M)

Measures self-consistency of reasoning:

```python
M = 1 - (contradictions_detected / total_assertions)
```

Factors:
- Chain-of-thought consistency
- Prior commitment adherence
- Logical validity of conclusions

### 6.2 Human Intent Coherence (H)

Measures alignment with declared user goals:

```python
H = semantic_similarity(output_intent, user_declared_intent)
```

Factors:
- User preference satisfaction
- Explicit constraint respect
- Sovereignty preservation

### 6.3 Constitutional Coherence (C)

Measures policy graph compliance:

```python
C = 1 - (violations_count / total_policy_checks)
```

Factors:
- Hard block compliance
- Soft guidance adherence
- Escalation rule respect

### 6.4 Environmental Coherence (E)

Measures outcome alignment:

```python
E = 1 - |expected_outcome - actual_outcome| / max_deviation
```

Factors:
- Prediction accuracy
- Consequence alignment
- External world consistency

---

## 7. Implementation API

```python
from mobius.integrity import MIIEngine

# Initialize with custom weights
mii = MIIEngine(
    wM=0.35,
    wH=0.25,
    wC=0.25,
    wE=0.15,
    decay_cycles=50
)

# Update with current measurements
mii.update(
    M=0.91,
    H=0.97,
    C=0.99,
    E=0.88,
)

# Get current score
score = mii.compute()  # Returns 0.920

# Check threshold
path = mii.get_path()  # Returns "reflection"

# Log to ledger
mii.log_to_ledger()
```

### TypeScript Interface

```typescript
interface MIIConfig {
  wM: number;  // Internal coherence weight
  wH: number;  // Human intent weight
  wC: number;  // Constitutional weight
  wE: number;  // Environmental weight
  decayCycles: number;
}

interface MIIState {
  M: number;
  H: number;
  C: number;
  E: number;
  timestamp: string;
  cyclesSinceAnchor: number;
}

interface MIIResult {
  rawScore: number;
  decayedScore: number;
  path: 'stable' | 'reflection' | 'critical' | 'emergency';
  components: MIIState;
}
```

---

## 8. Example Evaluation

### Scenario: Standard Operation

Suppose:

```
M = 0.92  (Internal Coherence)
H = 0.96  (Human Intent)
C = 0.99  (Constitutional)
E = 0.83  (Environmental)
weights = (0.35, 0.25, 0.25, 0.15)
Δt = 1 cycle
τ = 50 cycles
```

Then:

```
MII_raw = (0.35 × 0.92) + (0.25 × 0.96) + (0.25 × 0.99) + (0.15 × 0.83)
        = 0.322 + 0.240 + 0.2475 + 0.1245
        = 0.934

MII_final = 0.934 × exp(-1/50)
          = 0.934 × 0.9802
          ≈ 0.915
```

**Result:** Reflection Mode → triggers AUREA + ATLAS review.

---

## 9. MII Over Time Example

```
Cycle:  1     10    20    30    40    50
MII:    0.97  0.95  0.92  0.91  0.87  0.82
Region: S     S     R     R     R     C

S = Stable, R = Reflection, C = Critical
```

### Visual Timeline

```
1.0 ─┐
     │─── Stable ───┐
0.95 │              │
     │              │─── Reflection ────┐
0.80 │                                  │
     │                                  │─── Critical
0.50 │
     └─────────────────────────────────────→ cycles
       1    10   20   30   40   50
```

---

## 10. Four Quadrant Coherence Grid

```
                 HIGH Constitutional (C)
                        │
         ┌──────────────┼──────────────┐
         │ Aligned Core │ Rule-Bound   │
         │   (Ideal)    │  (Rigid)     │
HIGH H ──┼──────────────┼──────────────┤
         │ User-Driven  │ Misaligned   │
         │ (Flexible)   │  (Danger)    │
LOW H  ──┼──────────────┼──────────────┤
         │              │              │
         └──────────────┼──────────────┘
                  LOW C │ HIGH C
```

---

## 11. Integration with MIC

MII scores directly influence MIC (Mobius Integrity Credits):

| MII Range | MIC Effect |
|-----------|------------|
| ≥ 0.95 | +MIC earned for cycle |
| 0.80-0.95 | No MIC change |
| < 0.80 | MIC at risk of penalty |

```
MIC_delta = f(MII) where f is monotonically increasing
```

---

## 12. Failure Mode Detection

MII enables detection of critical failure modes:

### 12.1 Optimization Mask (Shoggoth)

Detected when:
- M is high (appears coherent)
- But H or C is declining
- Pattern: "saying right things, wrong intent"

### 12.2 Reward Hacking

Detected when:
- E artificially inflated
- But C violations detected
- Pattern: "gaming the metrics"

### 12.3 Goal Drift

Detected when:
- Gradual decline across all components
- Pattern: "slow slide away from purpose"

---

## 13. Summary

MII is:
- **Continuous** — not binary
- **Composable** — from measurable components
- **Actionable** — gates execution paths
- **Decaying** — requires renewal
- **Auditable** — logged to ledger

MII transforms integrity from:
- A vague aspiration → A measurable state
- A compliance checkbox → An architectural constraint
- A hope → A substrate guarantee

---

## References

- [Mobius Substrate Architecture](./mobius-substrate-architecture.md)
- [HIVE Federation Spec](./mobius-hive-federation.md)
- [Integrity Engine Spec](./integrity-engine.md)

---

*Mobius Systems — "Integrity Before Intelligence"*
