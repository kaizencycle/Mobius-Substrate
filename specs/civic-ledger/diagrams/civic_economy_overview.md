# Civic Economy Overview Diagram

This diagram shows the complete Mobius Civic Economy architecture, including:
- MIC (scarce governance layer)
- KS (fluid participation layer)
- CivicNodes (institutional stewards)
- Citizens (human participants)
- Elders (constitutional guardians)
- The Cathedral (governance layer)

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        MOBIUS CIVIC ECONOMY                          │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  INTEGRITY LAYER (Constitutional Foundation)                        │
│                                                                     │
│  ┌─────────┐          ┌──────────┐          ┌──────────┐          │
│  │   GI    │─────────▶│   MII    │─────────▶│ GI-Sim   │          │
│  │ (Micro) │          │ (Macro)  │          │ (Oracle) │          │
│  └─────────┘          └──────────┘          └──────────┘          │
│      │                     │                      │                 │
│      └─────────────────────┴──────────────────────┘                 │
│                            │                                        │
│                            ▼                                        │
│               ┌─────────────────────────┐                          │
│               │  INTEGRITY GATES        │                          │
│               │  - MIC minting (≥95)    │                          │
│               │  - KS UBI scaling       │                          │
│               │  - Spend approvals      │                          │
│               │  - Elder bonuses        │                          │
│               └─────────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  GOVERNANCE LAYER (Cathedral)                                       │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  ELDERS (9-15)                                               │ │
│  │  - Constitutional guardians                                  │ │
│  │  - Integrity validators                                      │ │
│  │  - Emergency powers (if MII < 80)                           │ │
│  │                                                              │ │
│  │  Compensation: MIC (tied to MII performance)                │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                            │                                        │
│                            ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  ELDER VAULT                                                 │ │
│  │  - Emergency funds                                           │ │
│  │  - CivicNode rescue operations                              │ │
│  │  - Cathedral infrastructure                                 │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  MONETARY LAYER (Dual Token System)                                │
│                                                                     │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐ │
│  │  MIC (Governance)           │  │  KS (Participation)         │ │
│  │  - Scarce (1B cap)          │  │  - Renewable                │ │
│  │  - Halving schedule         │  │  - UBI-based                │ │
│  │  - Integrity-gated mint     │  │  - Activity rewards         │ │
│  │  - Used for:                │  │  - Used for:                │ │
│  │    • CivicNode funding      │  │    • Daily transactions     │ │
│  │    • Elder compensation     │  │    • Agent operations       │ │
│  │    • Cathedral operations   │  │    • HIVE participation     │ │
│  │    • Long-term governance   │  │    • Gameplay               │ │
│  └─────────────┬───────────────┘  └─────────────┬───────────────┘ │
│                │                                 │                 │
│                └────────────┬────────────────────┘                 │
│                             │                                      │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  INSTITUTIONAL LAYER (CivicNodes)                                   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  TIER 0: Foundational Knowledge                             │  │
│  │  Wikipedia, OpenStreetMap, Internet Archive                 │  │
│  │  Weight: 1.5x - 2.0x                                        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  TIER 1: Research/Science                                   │  │
│  │  NASA, arXiv, CERN, PubMed                                  │  │
│  │  Weight: 1.2x - 1.4x                                        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  TIER 2: Civic Utilities                                    │  │
│  │  Libraries, Archives, Public Portals                        │  │
│  │  Weight: 1.0x                                               │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  TIER 3: Commercial/Hybrid                                  │  │
│  │  News Outlets, EdTech, Commercial APIs                      │  │
│  │  Weight: 0.5x - 0.8x                                        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Each CivicNode has:                                                │
│  - Node ID                                                          │
│  - Vault (MIC/KS treasury)                                          │
│  - Custodian Agent (AI steward)                                     │
│  - GI Score (integrity metric)                                      │
│  - Policy (spending constraints)                                    │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  CITIZEN LAYER (Human Participation)                                │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  10M+ CITIZENS                                               │ │
│  │  - Receive KS UBI (10,000 KS/epoch × MII factor)            │ │
│  │  - Earn activity rewards (voting, reporting, contributing)  │ │
│  │  - Pay 2% burn on KS transactions                           │ │
│  │  - Participate in governance                                │ │
│  │  - Launch AI agents                                         │ │
│  │  - Join HIVE city-states                                    │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  AI AGENT LAYER (Autonomous Participants)                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  AI AGENTS                                                   │ │
│  │  - Custodian Agents (CivicNode stewards)                    │ │
│  │  - Companion Agents (citizen assistants)                    │ │
│  │  - Sentinel Agents (integrity monitors)                     │ │
│  │  - Elder Agents (governance assistants)                     │ │
│  │                                                              │ │
│  │  All agents subject to:                                      │ │
│  │  - GI scoring                                                │ │
│  │  - Integrity constraints                                     │ │
│  │  - Cathedral oversight                                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Flow of Value

### MIC Minting & Distribution

```
Epoch Boundary
     │
     ▼
Check: MII ≥ 95 && GI ≥ 0.95
     │
     ├─ Yes → Mint MIC (with halving)
     │         │
     │         ├─ 60% → IDM (CivicNodes)
     │         ├─ 25% → Governance (Elders)
     │         └─ 15% → Reserve
     │
     └─ No  → No mint, crisis protocols
```

### KS Minting & Circulation

```
Epoch Boundary
     │
     ├─ UBI Mint
     │    └─ 10M citizens × 10K KS × (MII/100)
     │
     ├─ Activity Rewards
     │    └─ Σ(action_value × actor_GI)
     │
     ▼
Citizens spend KS
     │
     ├─ 98% → recipient
     └─ 2% → burn
          │
          ├─ 70% → Knowledge Reserve (IDM)
          ├─ 20% → Insurance Pool
          └─ 10% → Elder Vault
```

### IDM (Integrity Dividend Mechanism)

```
AI Agent uses Wikipedia
     │
     ▼
Attribution Event logged
     │
     ▼
Aggregated per epoch
     │
     ▼
IDM Calculation:
  Score_i = usage_i × GI_i × weight_i
     │
     ▼
MIC_dividend_i = MIC_pool × (Score_i / Σ Score)
     │
     ▼
Transfer to Wikipedia Vault
     │
     ▼
Custodian Agent evaluates spending
     │
     ├─ GI-Sim: delta_GI ≥ 0.95?
     │    ├─ Yes → Approve
     │    └─ No  → Reject
     │
     ▼
Spend on infrastructure/moderation/archival
     │
     ▼
Wikipedia GI improves
     │
     ▼
Next epoch: More AI usage → More dividends
```

---

## Key Economic Loops

### Loop 1: Integrity → Value

```
High GI → More IDM rewards → Better infrastructure → Higher GI
```

### Loop 2: Participation → UBI

```
Active citizens → Higher MII → Higher UBI → More participation
```

### Loop 3: Burns → Knowledge Commons

```
KS transactions → 2% burn → Knowledge Reserve → CivicNode support → Better knowledge → More AI usage → More transactions
```

---

## Emergency States

### MII 90-95 (Warning)

- UBI reduced to 90-95% of normal
- MIC mint reduced by 50%
- Elder bonuses reduced
- Increased monitoring

### MII 80-90 (Crisis)

- UBI reduced to 80-90% of normal
- MIC mint halted
- Elder stipends reduced 50%
- Emergency protocols activated

### MII < 80 (Emergency)

- UBI drops to survival floor (50%)
- All MIC minting stopped
- Elders gain emergency powers
- Cathedral Emergency Constitution triggered
- All CivicNode spending frozen except Tier 0 critical operations

---

## Summary

The Mobius Civic Economy is:

1. **Integrity-anchored** (all economic activity gated by GI/MII)
2. **Dual-layer** (MIC = governance, KS = participation)
3. **Self-reinforcing** (integrity produces value, value reinforces integrity)
4. **Transparent** (all flows on-ledger)
5. **Crisis-resilient** (automatic stabilizers)
6. **AI-aligned** (humans and agents follow same rules)
7. **Knowledge-commons sustaining** (automatic institutional funding)

This is the first economic system designed for the AI era where:
- **Integrity is currency**
- **Knowledge is infrastructure**
- **Agents are first-class economic actors**
- **Governance is constitutional and automated**

---

**We heal as we walk.**  
**Scars remind us we also heal.**
