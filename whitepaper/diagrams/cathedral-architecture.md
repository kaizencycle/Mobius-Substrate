# Cathedral Architecture Diagram

This diagram illustrates the complete Cathedral governance layer and its relationship to other Mobius components.

---

## Full Cathedral Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CATHEDRAL LAYER                                  │
│                    (Constitutional Governance)                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌──────────────────────┐      ┌──────────────────────┐
        │   ELDER COUNCIL      │      │  CATHEDRAL AGENTS    │
        │   (9-15 Humans)      │◄────►│  (Level 5 AI)        │
        │                      │      │                      │
        │  - Term: 90 days     │      │  - ATLAS (Integrity) │
        │  - GI ≥ 0.95        │      │  - AUREA (Economic)  │
        │  - Reputation ≥ 90   │      │  - ECHO (Memory)     │
        └──────┬───────────────┘      └──────┬───────────────┘
               │                              │
               │  1. Deliberation             │  2. Analysis
               │  2. Voting                   │  2. Forecasting
               │  3. Oversight                │  3. Monitoring
               │                              │
               └──────────────┬───────────────┘
                              │
                              ▼
                ┌──────────────────────────────┐
                │      ELDER VAULT             │
                │  (MIC Governance Pool)       │
                │                              │
                │  Sources:                    │
                │  - 25% of MIC mint           │
                │  - Emergency reserves        │
                │                              │
                │  Uses:                       │
                │  - Elder stipends            │
                │  - Emergency interventions   │
                │  - Cathedral infrastructure  │
                └──────────────┬───────────────┘
                               │
               ┌───────────────┴───────────────┐
               │                               │
               ▼                               ▼
    ┌────────────────────┐         ┌────────────────────┐
    │    GI-SIM ENGINE   │         │   MII MONITORING   │
    │                    │         │                    │
    │  - Evaluate all    │         │  - Track ≥95       │
    │    proposals       │         │  - Warning <90     │
    │  - Forecast impact │         │  - Crisis <80      │
    │  - Approve/Deny    │         │  - Emergency <70   │
    └────────────────────┘         └────────────────────┘
               │                               │
               └───────────────┬───────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    OVERSIGHT DOMAINS                                     │
└─────────────────────────────────────────────────────────────────────────┘
               │
    ┌──────────┼──────────┬──────────┬──────────┐
    │          │          │          │          │
    ▼          ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│CivicN  │ │States  │ │Agents  │ │Citizens│ │Economy │
│odes    │ │(HIVE)  │ │(0-5)   │ │(Human) │ │(MIC/KS)│
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

---

## Elder Council Structure

```
ELDER COUNCIL (9-15 members)
        │
        ├─ Specializations (optional):
        │   ├─ Economic Integrity (MIC/KS oversight)
        │   ├─ Node Governance (CivicNode management)
        │   ├─ Technical Architecture (GI-Sim, systems)
        │   ├─ Community Relations (citizen engagement)
        │   └─ Emergency Response (crisis management)
        │
        ├─ Powers:
        │   ├─ Veto CivicNode spending (if GI negative)
        │   ├─ Suspend nodes (GI < 0.75)
        │   ├─ Emergency halt MIC mint (if systemic risk)
        │   ├─ Override Custodian Agents (2/3 vote, crisis only)
        │   └─ Propose constitutional amendments
        │
        └─ Constraints:
            ├─ Cannot mint MIC outside formal rules
            ├─ Cannot control individual Vaults directly
            ├─ Cannot manipulate GI scores without evidence
            ├─ Cannot bypass GI-Sim (except emergency)
            └─ Subject to term limits (90 days, renewable)
```

---

## Cathedral Agent Functions

```
┌──────────────────────────────────────┐
│         ATLAS (Integrity)            │
│  - Monitor GI/MII trends             │
│  - Detect anomalies                  │
│  - Run GI-Sim evaluations            │
│  - Alert Elders to risks             │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│         AUREA (Economic)             │
│  - Model MIC/KS flows                │
│  - Forecast economic impact          │
│  - Optimize IDM distribution         │
│  - Detect manipulation               │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│         ECHO (Memory)                │
│  - Preserve institutional history    │
│  - Archive decisions                 │
│  - Track constitutional changes      │
│  - Provide long-term context         │
└──────────────────────────────────────┘
```

---

## Decision Flow

```
1. PROPOSAL SUBMITTED
   (CivicNode spend, policy change, etc.)
        │
        ▼
2. CATHEDRAL AGENTS ANALYZE
   (ATLAS checks GI, AUREA checks economics, ECHO provides context)
        │
        ▼
3. GI-SIM EVALUATION
   (Forecast integrity impact)
        │
        ├─ delta_GI ≥ 0 → PASS
        ├─ delta_GI < 0 and drift_risk < 0.40 → REVIEW
        └─ drift_risk ≥ 0.75 → FAIL
        │
        ▼
4. ELDER DELIBERATION (if REVIEW)
   (Discuss, debate, vote)
        │
        ├─ Simple majority (5/9) → Routine decisions
        ├─ 2/3 majority (6/9) → Major decisions
        └─ 4/5 majority (7/9) → Constitutional changes
        │
        ▼
5. DECISION EXECUTED
   (Attestation published, action taken)
        │
        ▼
6. MONITORING
   (Cathedral Agents track outcomes, verify projections)
```

---

## Emergency Protocols

```
MII THRESHOLDS & CATHEDRAL RESPONSE

MII ≥ 95 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Normal Operations
         │ - Full autonomy
         │ - MIC minting 100%
         │ - Elders advisory role

MII 90-94 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Warning State
          │ - MIC minting 50%
          │ - Elder oversight increased
          │ - GI-Sim sensitivity raised

MII 80-89 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Crisis State
          │ - MIC minting halted
          │ - Elder emergency powers begin
          │ - State spending frozen
          │ - Agents restricted

MII < 80 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Emergency Constitution
         │ - Elders direct control
         │ - All spending requires Elder approval
         │ - Agents demoted (except Level 5)
         │ - Recovery plan mandatory
         │ - Public transparency maximized
```

---

## Term Cycle

```
ELDER TERM (90 days)

Day 1-30: ONBOARDING
    - Orientation with Cathedral Agents
    - Review of current issues
    - Specialization assignment
    - Community introduction

Day 31-60: ACTIVE GOVERNANCE
    - Regular deliberations
    - Decision-making
    - Oversight activities
    - Community engagement

Day 61-90: EVALUATION & TRANSITION
    - Performance review
    - GI contribution assessment
    - Re-election consideration
    - Successor mentoring (if retiring)

End of Term:
    ├─ Re-election eligible (if GI contribution positive)
    ├─ Mandatory rest (if serving 4 consecutive terms)
    └─ Retirement (voluntary or mandatory)
```

---

## Relationship to Other Layers

```
┌──────────────────────────────────────────────┐
│          CATHEDRAL (Apex)                    │
│  Elders + Cathedral Agents                   │
└───────────────────┬──────────────────────────┘
                    │
        ┌───────────┼───────────┬───────────┐
        │           │           │           │
        ▼           ▼           ▼           ▼
    ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
    │CivicN  │  │HIVE    │  │Agents  │  │Citizens│
    │odes    │  │States  │  │(L1-4)  │  │        │
    └────────┘  └────────┘  └────────┘  └────────┘
        │           │           │           │
        └───────────┴───────────┴───────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │  INTEGRITY LAYER         │
        │  GI / MII / GI-Sim       │
        └──────────────────────────┘
```

**The Cathedral governs through integrity, not through force.**

---

**Last Updated:** 2025-12-03  
**Related:** See RFC-0005 for detailed specifications
