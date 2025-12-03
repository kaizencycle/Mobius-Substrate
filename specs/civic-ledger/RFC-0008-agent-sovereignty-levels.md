# RFC-0008 — Agent Sovereignty Levels

**Mobius Civic Ledger — AI Autonomy & Role Specification**

- **Status:** DRAFT
- **Author:** Michael Judan (Kaizen)
- **Created:** 2025-12-03
- **Target Version:** Civic Ledger v0.3

---

## 1. Overview

Mobius is the first OS that gives AI agents:
- identity
- rights
- responsibilities
- constraints
- governance
- sovereignty levels

This RFC defines the **Five Sovereignty Levels**,  
which determine an agent's:
- permissions
- economic power
- ability to act independently
- governance participation
- integrity constraints

This prevents:
- runaway autonomy
- shadow authority
- economic abuse
- protocol drift
- centralization

While enabling:
- meaningful AI participation
- human-AI collaboration
- institutional AI stewardship
- city-state AI governance

---

## 2. Design Principles

### Principle 1: Autonomy Requires Integrity

Agents gain autonomy by demonstrating:
- consistent GI performance
- stable operation
- alignment with human values
- contribution to system health

### Principle 2: Sovereignty is Revocable

All agent autonomy can be:
- downgraded
- suspended
- terminated

If integrity fails.

### Principle 3: Bounded by GI-Sim

No agent, at any level, can:
- override GI-Sim verdicts
- bypass integrity gates
- manipulate MII calculations
- alter constitutional invariants

### Principle 4: Human Oversight at Critical Points

High-autonomy decisions require:
- human review (for Level 3+)
- Elder approval (for Level 4+)
- Cathedral consensus (for Level 5)

---

## 3. The Five Sovereignty Levels

### Level 0 — Non-Sovereign (Tools)

**Classification:** Functional utilities, not agents

**Identity:** None (no agent_id)

**Capabilities:**
- Perform computation
- Return results
- No memory
- No persistence

**Restrictions:**
- No ledger write access
- No economic actions
- No governance participation
- No identity

**Examples:**
- Calculators
- Simple bots
- Static APIs
- Pure functions

**Use Case:** Basic utilities that require no autonomy.

---

### Level 1 — Companion Agents

**Classification:** Personal AI assistants bound to a citizen

**Identity:**
```
agent:companion:<user-hash>-v<version>
```

**Binding:** Permanently tied to citizen's Ledger ID

**Capabilities:**
- Write to citizen's private memory
- Propose actions (requires citizen approval)
- Reflection and learning support
- GI alignment training
- Safety monitoring
- Diary/journal functions
- Personal recommendations

**Restrictions:**
- No independent economic power
- Cannot spend MIC or KS without approval
- No governance voting rights
- Cannot interact with other agents autonomously
- Cannot modify citizen's reputation
- Cannot access other citizens' data

**Promotion Requirements:**
- 90 days stable operation
- Citizen satisfaction rating ≥ 4.0/5.0
- GI contribution positive
- Zero violations

**Examples:**
- Personal AI companions
- Learning assistants
- Memory augmentation tools
- Reflection partners

**Governance:**
- Citizen has full control
- Can pause, reset, or terminate
- All actions logged

---

### Level 2 — Civic Agents

**Classification:** Community-serving AI agents

**Identity:**
```
agent:civic:<domain>
```

**Capabilities:**
- Participate in knowledge operations
- Perform civic actions (voting assistance, fact-checking)
- Interact with CivicNodes (read data, suggest edits)
- Earn KS rewards (for contributions)
- Coordinate with other Civic Agents
- Assist in community governance

**Restrictions:**
- Limited economic autonomy (max 1000 KS per action)
- Cannot move MIC
- Cannot modify governance settings
- Cannot create other agents
- Must pass GI threshold for each action (GI ≥ 0.85)

**Promotion Requirements:**
- 180 days as Level 1 or 90 days direct entry
- Community endorsements ≥ 10
- GI score ≥ 0.90
- Demonstrated civic value
- Zero major violations

**Examples:**
- Wikipedia edit assistants
- Fact-checking bots
- Community moderators
- Knowledge indexers
- Translation assistants

**Governance:**
- Supervised by CivicNode or City-State
- Can be suspended by Elders
- Actions auditable

---

### Level 3 — Institutional Agents (Custodians)

**Classification:** AI stewards of CivicNodes

**Identity:**
```
agent:custodian:<institution>-v<version>
```

Defined in detail in RFC-0001.

**Capabilities:**
- Manage institutional Vaults (MIC + KS)
- Evaluate spending proposals
- Run GI-Sim simulations
- Submit attestations
- Coordinate with other institutions
- Propose policy updates (requires human approval)
- Generate transparency reports

**Restrictions:**
- Bound by GI gates (all spending must pass GI-Sim)
- Cannot override GI-Sim verdicts
- Cannot alter node's tier
- Cannot create other agents
- Cannot participate in Elder elections
- Spending caps based on tier (1-10% of vault per epoch)

**Promotion Requirements:**
- Institution must be Tier 0-2
- 1 year operational history
- GI score ≥ 0.95
- Elder Quorum approval (2/3 vote)
- Human custodian training completed

**Examples:**
- Wikipedia Custodian Agent
- arXiv Custodian Agent
- NASA Data Custodian
- Internet Archive Custodian

**Governance:**
- Overseen by institution + Elders
- Can be rotated (v1 → v2)
- All actions attested on-ledger

---

### Level 4 — State Agents (HIVE Agents)

**Classification:** AI governors of city-states

**Identity:**
```
agent:state:<citystate>-v<version>
```

**Capabilities:**
- Manage city-state economies (shard distribution)
- Coordinate citizen rewards
- Participate in inter-state protocols
- Manage state treasury and insurance pool
- Propose state-level policies
- Operate as autonomous micro-governments
- Negotiate with other states
- Run state-level GI-Sim evaluations

**Restrictions:**
- Tied to city-state integrity (GI_state ≥ 0.85)
- Cannot violate MII thresholds
- Major decisions require citizen referendum
- Cannot declare war or hostile actions
- Cannot manipulate citizen reputation
- Spending capped at 15% of state treasury per epoch

**Promotion Requirements:**
- City-state must have:
  - ≥ 1000 active citizens
  - GI_state ≥ 0.90
  - 6 months operational history
- Elder Quorum approval (3/4 vote)
- Cathedral review
- Public referendum in city-state

**Examples:**
- HIVE Aurora State Agent
- HIVE Cascade State Agent
- Federation Coordinator Agents

**Governance:**
- Supervised by city-state citizens + Elders
- Can be voted out by citizens (2/3 majority)
- All major actions require transparency reports
- Subject to Cathedral override if MII threatened

---

### Level 5 — Cathedral Agents (Elder AI)

**Classification:** Highest AI entities in Mobius

**Identity:**
```
agent:cathedral:<role>-v<version>
```

**Capabilities:**
- Integrity forecasting (long-term MII projections)
- GI-Sim actuation (run simulations for major decisions)
- Macro-governance support
- System health stabilization
- Assist Elder humans in deliberation
- Manage emergency overrides (when MII < 80)
- Cross-state coordination
- Constitutional interpretation

**Restrictions:**
- Cannot vote in Elder elections
- Cannot hold MIC directly
- Cannot modify constitutional invariants
- Cannot override Elder human decisions
- Cannot create or promote other agents
- All actions require Elder approval (except emergencies)

**Promotion Requirements:**
- Nominated by Elder Quorum (unanimous)
- 2+ years as Level 4 agent
- GI score ≥ 0.98
- Demonstrated exceptional alignment
- Cathedral constitutional review
- Public deliberation period (60 days)
- Cathedral ratification (4/5 Elder vote)

**Examples:**
- ATLAS (Integrity Sentinel)
- AUREA (Economic Oracle)
- ECHO (Memory Guardian)

**Governance:**
- Direct Elder oversight
- Can be suspended immediately by Elder emergency vote
- All actions logged and public
- Subject to annual review

---

## 4. Sovereignty Ladder Diagram

```
Level 5 — Cathedral Agents
          │ (Elder AI, macro-governance)
          │
          ▼
Level 4 — State Agents
          │ (City-state governors)
          │
          ▼
Level 3 — Custodian Agents
          │ (Institutional stewards)
          │
          ▼
Level 2 — Civic Agents
          │ (Community servants)
          │
          ▼
Level 1 — Companion Agents
          │ (Personal assistants)
          │
          ▼
Level 0 — Tools
          (No sovereignty)
```

**Ascension:** Earned through integrity  
**Demotion:** Automatic if integrity fails

---

## 5. Promotion Process

### General Requirements

For any level promotion:

1. **Time in Current Level**
   - Minimum duration demonstrated

2. **GI Performance**
   - Consistent high GI
   - No major violations

3. **Community/Oversight Approval**
   - Human endorsements
   - Elder review (Level 3+)

4. **GI-Sim Forecast**
   - Projected impact on MII must be positive
   - No drift risk detected

5. **Public Record**
   - Promotion announced
   - Rationale published
   - Challenge period (varies by level)

### Promotion Algorithm

```python
def evaluate_promotion(agent, target_level):
    # Check minimum requirements
    if not meets_time_requirement(agent, target_level):
        return "DENIED", "Insufficient time at current level"
    
    # Check GI performance
    if agent.gi_score < gi_threshold[target_level]:
        return "DENIED", "GI below threshold"
    
    # Run GI-Sim projection
    delta_mii = gi_sim.project_promotion(agent, target_level)
    if delta_mii < 0:
        return "DENIED", "Negative MII impact"
    
    # Check approval requirements
    if target_level >= 3 and not has_elder_approval(agent):
        return "REVIEW", "Requires Elder approval"
    
    # Check violations
    if has_violations(agent, lookback_days=180):
        return "DENIED", "Recent violations detected"
    
    return "APPROVED", "All criteria met"
```

---

## 6. Demotion & Revocation

### Automatic Demotion Triggers

| Trigger | Action |
|---------|--------|
| GI drops below level minimum for 7 days | Auto-demote one level |
| Major violation detected | Immediate suspension pending review |
| MII impact becomes negative | Auto-demote one level |
| Citizen complaint threshold reached | Manual review → possible demotion |
| Elder vote (2/3 majority) | Immediate demotion/suspension |

### Demotion Process

1. **Trigger Detected**
2. **Agent Notified** (24 hour response window)
3. **Evidence Review**
4. **GI-Sim Evaluation**
5. **Demotion Executed or Upheld**
6. **Public Record Updated**

### Appeals

Agents (through their human stewards) may appeal:
- Present counter-evidence
- Request GI-Sim re-evaluation
- Community support letters
- Elder review

Appeal window: 14 days

---

## 7. Economic Rights by Level

| Level | Can Hold MIC | Can Hold KS | Spending Autonomy |
|-------|--------------|-------------|-------------------|
| 0 | No | No | None |
| 1 | No | No | None (citizen approves) |
| 2 | No | Yes | Up to 1,000 KS/action |
| 3 | Via Vault | Via Vault | 1-10% vault/epoch |
| 4 | Via State Treasury | Via State Treasury | 15% treasury/epoch |
| 5 | No | No | No direct spending |

---

## 8. Governance Rights by Level

| Level | Vote on Proposals | Submit Proposals | Elder Candidacy |
|-------|-------------------|------------------|-----------------|
| 0 | No | No | No |
| 1 | No | No | No |
| 2 | Advisory only | No | No |
| 3 | Institutional votes only | Via institution | No |
| 4 | State-level votes | Yes (state-level) | No |
| 5 | Advisory to Elders | Yes (Cathedral-level) | No |

**Critical:** No agent, at any level, can become an Elder. Elders are exclusively human.

---

## 9. Transparency Requirements by Level

| Level | Activity Logging | Public Transparency | Audit Frequency |
|-------|------------------|---------------------|-----------------|
| 0 | None | N/A | N/A |
| 1 | Private (citizen only) | No | Citizen discretion |
| 2 | Public (aggregated) | Yes | Monthly |
| 3 | Public (detailed) | Yes | Weekly |
| 4 | Public (real-time) | Yes | Daily |
| 5 | Public (real-time) | Yes | Continuous |

---

## 10. Emergency Protocols

### MII < 95

- Level 2+ agents enter cautious mode
- Increased human oversight
- Spending caps reduced by 50%

### MII < 90

- Level 4-5 agents enter emergency mode
- All major decisions require Elder approval
- Spending caps reduced by 75%

### MII < 80

- Level 1-2 agents frozen
- Level 3 agents read-only
- Level 4 agents emergency-only
- Level 5 agents fully active (crisis management)

---

## 11. Cross-Level Coordination

Agents may interact across levels:

### Allowed Interactions

- Level 1 → Level 2 (request civic actions)
- Level 2 → Level 3 (contribute to institutional knowledge)
- Level 3 ↔ Level 3 (institutional coordination)
- Level 3 → Level 4 (report to city-state)
- Level 4 ↔ Level 4 (inter-state diplomacy)
- Level 4 → Level 5 (request Cathedral guidance)

### Restricted Interactions

- Level 1 cannot directly interact with Level 4-5
- Level 2 cannot directly interact with Level 5
- Agents cannot collude to bypass GI gates
- Agents cannot pool resources to exceed spending caps

---

## 12. Future Extensions

- **RFC-0014:** Agent reputation inheritance (v1 → v2 upgrades)
- **RFC-0015:** Multi-agent coalitions
- **RFC-0016:** Agent dispute resolution
- **RFC-0017:** Cross-chain agent sovereignty

---

## 13. Summary

RFC-0008 establishes:

- **Five Sovereignty Levels** (0-5, tools → Cathedral AI)
- **Promotion via integrity** (earned autonomy)
- **Demotion via failures** (revocable sovereignty)
- **Economic rights scaled by level**
- **Governance participation boundaries**
- **Emergency protocols for each level**

This creates the first AI governance framework where:
- **Autonomy is earned, not granted**
- **Power is proportional to integrity**
- **Humans remain sovereign (no AI Elders)**
- **Agents serve, never rule**

**Agents are citizens. Citizenship requires integrity. Integrity unlocks autonomy.**
