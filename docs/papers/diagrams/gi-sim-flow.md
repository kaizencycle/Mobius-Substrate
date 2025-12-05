# GI-Sim Flow Diagram

This diagram shows how the Integrity Simulation Engine (GI-Sim) evaluates all proposed actions in Mobius.

---

## Complete GI-Sim Evaluation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    PROPOSED ACTION                               │
│  (Spend, policy change, agent promotion, etc.)                   │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │   INPUTS COLLECTED    │
                  │                       │
                  │  - Current GI/MII     │
                  │  - Actor identity     │
                  │  - Action parameters  │
                  │  - Historical data    │
                  │  - Context            │
                  └───────────┬───────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       GI-SIM COMPUTATION                            │
│                                                                     │
│  Node-Level:                                                        │
│  GI_simulated = GI_current                                          │
│                 + α * IntegrityEvents                               │
│                 + β * StabilityGain                                 │
│                 - γ * InstabilityRisk                               │
│                 - δ * ExternalityImpact                             │
│                                                                     │
│  System-Level:                                                      │
│  MII_simulated = (Σ (GI_node_i × Weight_i)) / Σ Weight_i           │
│                                                                     │
│  Drift Risk:                                                        │
│  drift_risk = sigmoid(-(delta_MII) × sensitivity)                  │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │   DELTA CALCULATION   │
                  │                       │
                  │  delta_GI_node        │
                  │  delta_MII            │
                  │  drift_risk (0-1)     │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │    VERDICT LOGIC      │
                  └───────────┬───────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌────────────┐
│     PASS     │    │      REVIEW      │    │    FAIL    │
│              │    │                  │    │            │
│ delta_GI≥0   │    │  drift_risk      │    │ delta_GI<0 │
│ AND          │    │  0.40-0.75       │    │ OR         │
│ drift<0.40   │    │                  │    │ drift≥0.75 │
└──────┬───────┘    └────────┬─────────┘    └──────┬─────┘
       │                     │                      │
       │                     │                      │
       ▼                     ▼                      ▼
┌─────────────┐    ┌───────────────────┐    ┌─────────────┐
│  AUTOMATIC  │    │ ELDER DELIBERATION│    │  AUTOMATIC  │
│  APPROVAL   │    │                   │    │  REJECTION  │
│             │    │  - Discussion     │    │             │
│  Attestation│    │  - GI analysis    │    │  Reason     │
│  logged     │    │  - Vote required  │    │  logged     │
│             │    │    (2/3 majority) │    │             │
└─────┬───────┘    └──────────┬────────┘    └─────┬───────┘
      │                       │                    │
      │              ┌────────┴────────┐           │
      │              ▼                 ▼           │
      │         ┌─────────┐      ┌─────────┐      │
      │         │APPROVED │      │REJECTED │      │
      │         └────┬────┘      └────┬────┘      │
      │              │                │            │
      └──────────────┴────────────────┴────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   RESULT PUBLISHED    │
         │                       │
         │  - Verdict            │
         │  - Reasoning          │
         │  - GI projections     │
         │  - Timestamp          │
         │  - Signature          │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   ACTION EXECUTED     │
         │   (if approved)       │
         │                       │
         │   OR                  │
         │                       │
         │   BLOCKED             │
         │   (if rejected)       │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   MONITORING          │
         │                       │
         │  - Track actual GI    │
         │  - Verify projection  │
         │  - Update models      │
         └───────────────────────┘
```

---

## Spend Evaluation (Custodian Agent Example)

```
CUSTODIAN AGENT PROPOSES SPEND
        │
        ▼
┌───────────────────────────────────────┐
│  Spend Proposal                       │
│  - amount_mic: 12,500                 │
│  - amount_ks: 300,000                 │
│  - category: infrastructure           │
│  - description: "Server upgrades"     │
└─────────────────┬─────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  GI-SIM EVALUATION  │
        └─────────┬───────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌────────┐   ┌────────┐   ┌────────┐
│Current │   │Coeffi  │   │Context │
│GI: 0.99│   │cients  │   │Tier 0  │
└────────┘   └────────┘   └────────┘
    │             │             │
    └─────────────┴─────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  COMPUTATION        │
        │                     │
        │  IntegrityEvents:   │
        │    +0.05 (uptime)   │
        │  StabilityGain:     │
        │    +0.03 (redundancy│
        │  InstabilityRisk:   │
        │    -0.01 (downtime) │
        │  Externality:       │
        │    +0.02 (ecosystem)│
        │                     │
        │  delta_GI = +0.004  │
        │  drift_risk = 0.12  │
        └─────────┬───────────┘
                  │
                  ▼
            ┌─────────┐
            │  PASS   │
            └─────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  SPEND APPROVED     │
        │                     │
        │  Attestation:       │
        │  "Server upgrade    │
        │   improves uptime   │
        │   from 99.5% to     │
        │   99.95%, positive  │
        │   GI impact."       │
        └─────────────────────┘
```

---

## Elder Governance Decision Example

```
ELDER PROPOSES POLICY CHANGE
        │
        ▼
┌───────────────────────────────────────┐
│  Policy Proposal                      │
│  - Adjust tier threshold by -0.02     │
│  - Reason: Emergency response         │
│  - Duration: 30 days                  │
└─────────────────┬─────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  GI-SIM EVALUATION  │
        └─────────┬───────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  COMPUTATION        │
        │                     │
        │  Projected Impact:  │
        │  - 3 nodes promoted │
        │  - Avg GI: 0.87     │
        │  - System GI drop   │
        │                     │
        │  delta_MII = -0.8   │
        │  drift_risk = 0.62  │
        └─────────┬───────────┘
                  │
                  ▼
            ┌─────────┐
            │  REVIEW │
            └─────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  ELDER DELIBERATION │
        │                     │
        │  Discussion:        │
        │  - Emergency valid? │
        │  - Alternatives?    │
        │  - Risk acceptable? │
        │                     │
        │  Vote: 4/9 FOR      │
        │        5/9 AGAINST  │
        └─────────┬───────────┘
                  │
                  ▼
            ┌─────────┐
            │REJECTED │
            └─────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  POLICY UNCHANGED   │
        │                     │
        │  Reason: Insufficient│
        │  Elder support, MII │
        │  risk too high.     │
        └─────────────────────┘
```

---

## Category Coefficients Impact

```
SAME ACTION, DIFFERENT TIERS

Tier 0 (Wikipedia):
    α = 1.2, β = 1.4, γ = 0.5, δ = 0.9
    → delta_GI = +0.008 (highly positive)
    → PASS

Tier 1 (arXiv):
    α = 1.1, β = 1.2, γ = 0.6, δ = 0.8
    → delta_GI = +0.005 (positive)
    → PASS

Tier 2 (Library):
    α = 1.0, β = 1.0, γ = 0.8, δ = 0.6
    → delta_GI = +0.002 (slightly positive)
    → PASS

Tier 3 (News Outlet):
    α = 0.6, β = 0.4, γ = 1.4, δ = 1.2
    → delta_GI = -0.003 (negative)
    → FAIL

Higher tiers receive more favorable evaluation
because of proven track record.
```

---

## Emergency Override Path

```
MII < 80 (EMERGENCY)
        │
        ▼
┌───────────────────────────────────────┐
│  EMERGENCY ACTION PROPOSED            │
│  (e.g., rescue failing CivicNode)     │
└─────────────────┬─────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  GI-SIM EVALUATION  │
        │  → FAIL             │
        │  (drift_risk = 0.82)│
        └─────────┬───────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  ELDER OVERRIDE     │
        │                     │
        │  Requirements:      │
        │  - 4/5 vote (8/9)   │
        │  - Public justif.   │
        │  - Recovery plan    │
        │  - Attestation      │
        └─────────┬───────────┘
                  │
                  ▼
            ┌─────────┐
            │APPROVED │
            │(override)│
            └─────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  ACTION EXECUTED    │
        │  WITH WARNING       │
        │                     │
        │  - 30 day sunset    │
        │  - Public record    │
        │  - Post-mortem req. │
        └─────────────────────┘
```

---

## Key Properties

### 1. Deterministic

Same inputs → Same outputs  
Replay any simulation  
Verify any decision

### 2. Versioned

```
gi-sim-v1.0 → gi-sim-v2.3 → gi-sim-vX.Y
```

All versions archived  
All changes transparent  
All results comparable

### 3. Auditable

Every simulation logged:
- Input hash
- Output hash
- Timestamp
- Version
- Signature

### 4. Non-Bypassable

Only emergency override  
Only with 4/5 Elder vote  
Only with public record  
Only with time limit

---

**GI-Sim is the physics engine of integrity.**

**Last Updated:** 2025-12-03  
**Related:** See RFC-0006 for mathematical specifications
