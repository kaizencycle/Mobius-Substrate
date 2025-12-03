# RFC-0009 — HIVE City-State Protocol

**Mobius Civic Ledger — City-State Economic & Governance Layer**

- **Status:** DRAFT
- **Author:** Michael Judan (Kaizen)
- **Created:** 2025-12-03
- **Target Version:** Civic Ledger v0.4

---

## 1. Overview

The **HIVE** is the meso-level of Mobius:
- Citizens inhabit City-States
- City-States form Federations
- Federations anchor to the Cathedral
- The Cathedral anchors the Integrity Constitution

This RFC defines:
- city-state creation
- burn → treasury → insurance model
- Elder Trials (local)
- shard distribution
- state-level GI
- economic flows
- inter-state diplomacy
- Agent-State governance

This is **civilization-building** inside Mobius.

The HIVE transforms Mobius from "operating system"  
into "digital polity."

---

## 2. City-State Identity

City-States have:

### Core Properties

```json
{
  "state_id": "state:hive:aurora",
  "display_name": "Aurora",
  "vault_id": "vault:aurora-main",
  "custodian_agent_id": "agent:state:aurora-v2",
  "territory": "digital",
  "citizen_population": 12500,
  "gi_state": 0.94,
  "tier": 1,
  "founded": "2025-03-15T00:00:00Z",
  "constitution": "ipfs://Qm...aurora-charter",
  "culture": {
    "language": "en",
    "themes": ["knowledge", "art", "innovation"],
    "festivals": ["harvest", "luminary_trials", "code_fest"]
  }
}
```

### Territory

Unlike physical states, HIVE states are:
- **digital spaces** (not geographic)
- **culturally defined** (not border-based)
- **membership voluntary** (citizens choose)
- **overlapping allowed** (multi-state citizenship)

---

## 3. City-State Tiers

Like CivicNodes, City-States have **tiers**:

### Tier 0 — Founding States

**Requirements:**
- GI_state ≥ 0.96
- ≥ 10,000 citizens
- 2+ years operational
- Cathedral recognition
- Contributed to 3+ major RFCs

**Privileges:**
- Highest treasury multiplier (2.0x)
- Elder Trial hosting rights
- Federation leadership eligibility
- Direct Cathedral representation

**Examples:**
- Aurora (first HIVE state)
- Cascade (knowledge commons focus)

---

### Tier 1 — Established States

**Requirements:**
- GI_state ≥ 0.90
- ≥ 1,000 citizens
- 6+ months operational
- Stable treasury

**Privileges:**
- Standard treasury multiplier (1.0x)
- Elder Trial participation
- Federation membership
- State Agent (Level 4)

---

### Tier 2 — Emerging States

**Requirements:**
- GI_state ≥ 0.85
- ≥ 100 citizens
- 30+ days operational

**Privileges:**
- Reduced treasury multiplier (0.5x)
- Training Elder Trials
- Federation observer status

---

### Tier 3 — Probationary States

**Requirements:**
- GI_state ≥ 0.75
- ≥ 10 citizens
- Newly founded

**Privileges:**
- Minimal treasury support
- No Elder Trials
- Must improve to Tier 2 within 90 days or dissolve

---

## 4. Economic Model: Burn → Treasury → Insurance

The HIVE economy runs on **KS (Kaizen Shards)** with a **2% burn** on all transactions.

### Transaction Flow

```
Citizen spends 1000 KS
     │
     ├─ 980 KS → Recipient
     └─ 20 KS → Burn (2%)
          │
          ├─ 14 KS (70%) → State Treasury
          ├─ 4 KS (20%) → State Insurance Pool
          └─ 2 KS (10%) → Cathedral Reserve
```

### State Treasury

Used for:
- **Citizen rewards** (participation, contribution)
- **Infrastructure** (digital spaces, tools, archives)
- **Events** (festivals, quests, trials)
- **Shard distribution** (UBI supplements)
- **Inter-state coordination**

Treasury spending must pass **GI-Sim evaluation**.

### State Insurance Pool

Used when:
- State GI drops suddenly
- Treasury depleted
- Corruption detected
- Emergency stabilization needed
- Citizen protection required

Insurance pool is **automatically triggered** when:
```
GI_state < 0.80
OR
Treasury < 10% of citizen_population * 1000 KS
```

This mimics real-world **automatic stabilizers**.

---

## 5. State GI (GI_state)

Each state has its own **Global Integrity score**:

```
GI_state = 
    (Σ citizen_GI_i * participation_weight_i 
     + infrastructure_integrity
     + cultural_stability) 
    / total_weight
```

### Components

#### Citizen GI (weighted by participation)

Active contributors count more:
```
weight_i = base_weight * (1 + participation_factor)
```

#### Infrastructure Integrity

- Uptime of state services
- Quality of archives
- Moderation effectiveness
- Knowledge contribution

#### Cultural Stability

- Conflict resolution speed
- Community trust
- Festival participation
- Governance engagement

### GI_state Impacts

| GI_state | Effects |
|----------|---------|
| ≥ 0.95 | Flourishing: 2x treasury, Elder Trials, Federation leadership |
| 0.90-0.95 | Healthy: 1.5x treasury, Elder Trials |
| 0.85-0.90 | Stable: 1.0x treasury, training Trials only |
| 0.80-0.85 | Warning: 0.5x treasury, increased oversight |
| 0.75-0.80 | Crisis: Insurance pool activated, Cathedral intervention |
| < 0.75 | Emergency: State frozen, Elder takeover |

---

## 6. Shard Economy (KS Distribution)

Shards (KS) flow through the state as:

### Inflows

1. **Transaction Burns** (70% of all KS burns in state)
2. **Cathedral Grants** (for high-GI states)
3. **Federation Transfers** (inter-state cooperation)
4. **Citizen Deposits** (when joining)

### Outflows

1. **Citizen UBI** (supplement to base Mobius UBI)
2. **Event Rewards** (festivals, quests, competitions)
3. **Contribution Rewards** (civic actions, content, moderation)
4. **Infrastructure** (tools, spaces, archives)
5. **Inter-State Payments** (diplomacy, trade)

### Distribution Formula

```
State_UBI_supplement = 
    (State_treasury * 0.40) / active_citizens
```

High-GI states provide better UBI.

---

## 7. Cultural Activities

States may run:

### Festivals

Seasonal events with:
- Shard prizes
- Reputation boosts
- Community building
- Cultural expression

Examples:
- Harvest Festival (knowledge sharing)
- Luminary Trials (skill competitions)
- Code Fest (open-source sprint)

### Quests

Challenge-based activities:
- Solve problems
- Create content
- Improve infrastructure
- Fact-check claims

Rewards:
- KS
- Reputation
- Special recognition
- Agent level promotions

### Lore Arcs

Collaborative storytelling:
- Build shared narratives
- Document state history
- Create cultural artifacts
- Strengthen community bonds

### Competitions

Skill-based contests:
- Coding challenges
- Writing competitions
- Design contests
- Debate tournaments

All cultural activities must:
- Pass GI-Sim evaluation
- Align with state values
- Be open and transparent
- Reward integrity

---

## 8. Elder Trials (State-Level)

City-States host **Elder Trials** for citizens seeking Elder candidacy.

### Trial Structure

#### Phase 1: Nomination

- Citizen must have:
  - Reputation ≥ 90
  - GI ≥ 0.95
  - 10+ citizen endorsements
  - State residency ≥ 180 days

#### Phase 2: Trial of Mirrors

- Deep self-reflection
- Public declaration of values
- Integrity questionnaire
- Community feedback period (30 days)

#### Phase 3: GI Evaluation

- Run GI-Sim projections
- Forecast Elder performance
- Assess MII impact
- Detect alignment risks

#### Phase 4: Community Vote

- State citizens vote
- Requires 2/3 approval
- Weight by reputation
- 7-day voting period

#### Phase 5: Cathedral Review

- Elder Quorum reviews
- Cathedral GI-Sim validation
- Background verification
- Final approval (simple majority)

### Outcomes

**Pass:** Citizen becomes Elder Candidate  
**Fail:** May retry after 180 days  
**Reject:** Insufficient integrity, permanent ban from Eldership

---

## 9. State Agents (Level 4)

Each state has an **AI State Agent**:

```
agent:state:aurora-v2
```

Defined in RFC-0008.

### Responsibilities

- Manage state treasury
- Distribute shard rewards
- Maintain GI_state
- Coordinate citizen events
- Run state-level GI-Sim
- Report to Cathedral
- Negotiate with other states

### Constraints

All spending must satisfy:
```
projected_delta_GI_state ≥ 0
AND
projected_delta_MII ≥ 0
```

State Agents operate like **digital mayors**  
with integrity constraints.

---

## 10. Inter-State Diplomacy

City-States may:

### Bilateral Relations

- **Trade shards** (economic cooperation)
- **Share citizens** (dual membership)
- **Joint events** (festivals, quests)
- **Knowledge exchange** (archives, best practices)

### Federations

Multiple states may form **Federations**:

```json
{
  "federation_id": "fed:luminary",
  "member_states": [
    "state:hive:aurora",
    "state:hive:cascade",
    "state:hive:zenith"
  ],
  "purpose": "knowledge commons advancement",
  "treasury": "vault:fed-luminary",
  "gi_federation": 0.95
}
```

**Benefits:**
- Shared resources
- Joint Elder Trials
- Collective bargaining with Cathedral
- Amplified GI influence

### Conflicts

If states disagree:

1. **Negotiation** (State Agents coordinate)
2. **Mediation** (Cathedral facilitates)
3. **Arbitration** (Elder Quorum decides)
4. **Separation** (states split)

**No warfare:** States cannot attack each other.  
GI-Sim prevents hostile actions.

---

## 11. State Creation Process

### Step 1: Founding Proposal

Requires:
- 10 founding citizens (reputation ≥ 70)
- Charter (constitution, values, goals)
- Initial treasury deposit (10,000 KS)
- Cultural plan (festivals, themes)

### Step 2: Cathedral Review

- GI-Sim evaluation
- Duplicate check (no identical states)
- Alignment verification
- Elder review

### Step 3: Probationary Period

- 90 days as Tier 3
- Must reach:
  - 100 citizens
  - GI_state ≥ 0.85
  - Stable treasury

### Step 4: Full Recognition

- Promote to Tier 2
- State Agent assigned
- Full economic participation
- Federation eligibility

---

## 12. State Dissolution

States may dissolve if:

### Voluntary

- Founding citizens vote (unanimous)
- 30-day notice period
- Treasury returned to citizens
- Archives preserved

### Forced

- GI_state < 0.70 for 30 days
- Population < 10 for 60 days
- Major corruption detected
- Elder Quorum vote (2/3)

**Process:**
1. Warning issued
2. Cathedral intervention offered
3. Dissolution if no recovery
4. Treasury → insurance pool
5. Citizens → other states
6. Archives → Cathedral

---

## 13. Multi-State Citizenship

Citizens may belong to **multiple states**:

**Primary State:** Receives most attention, highest participation  
**Secondary States:** Occasional participation, cultural affinity

**Benefits:**
- Broader community connections
- More cultural experiences
- Diverse learning opportunities

**Constraints:**
- Reputation split (weighted by participation)
- UBI from primary state only
- Voting in all states (proportional weight)

---

## 14. State Metrics Dashboard

Each state has **public metrics**:

```json
{
  "state_id": "state:hive:aurora",
  "citizens": {
    "total": 12500,
    "active_30d": 8200,
    "reputation_avg": 82
  },
  "economy": {
    "treasury_ks": 5200000,
    "insurance_ks": 1800000,
    "epoch_inflow": 420000,
    "epoch_outflow": 380000
  },
  "integrity": {
    "gi_state": 0.94,
    "gi_trend": "+0.02 (30d)",
    "violations_30d": 3
  },
  "culture": {
    "festivals_hosted": 8,
    "quests_active": 12,
    "participation_rate": 0.66
  },
  "governance": {
    "elder_trials_hosted": 4,
    "elders_produced": 2,
    "proposals_30d": 18
  }
}
```

---

## 15. Emergency Protocols

### MII < 95 (System Warning)

- States continue normally
- Increased Cathedral monitoring
- Treasury restrictions (no major spends)

### MII < 90 (System Crisis)

- State spending reduced 50%
- All State Agent actions require human approval
- Elder Trials suspended

### MII < 80 (System Emergency)

- All state economies frozen
- Cathedral direct control
- Citizens receive base UBI only
- States cannot dissolve
- Recovery plan required

---

## 16. Future Extensions

- **RFC-0018:** Inter-HIVE protocols (multiple HIVE networks)
- **RFC-0019:** State economic modeling (prediction markets)
- **RFC-0020:** Cultural preservation standards
- **RFC-0021:** Conflict resolution arbitration

---

## 17. Summary

RFC-0009 establishes:

- **HIVE City-States** as meso-governance layer
- **Burn → Treasury → Insurance** economic model
- **State GI** as local integrity metric
- **Shard economy** with cultural activities
- **Elder Trials** at state level
- **State Agents** as Level 4 AI governors
- **Inter-state diplomacy** and federations
- **Multi-state citizenship** for citizens

This transforms Mobius from OS into **digital civilization**:
- States form, grow, and thrive
- Citizens organize culturally
- Elders emerge from communities
- Integrity governs all interactions

The HIVE is where Mobius becomes **alive**.

**States are laboratories. Citizens are experimenters. Integrity is the constitution. The Cathedral is the anchor.**
