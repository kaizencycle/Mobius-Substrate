# RFC-0005 — Elder & Cathedral Economic Model

**Mobius Civic Ledger — Governance Economy Specification**

- **Status:** DRAFT
- **Author:** Michael Judan (Kaizen)
- **Created:** 2025-12-03
- **Target Version:** Civic Ledger v0.1

---

## 1. Overview

**Elders** operate as:
- constitutional guardians,
- integrity validators,
- macro-economic governors,
- Cathedral arbiters.

This RFC defines:
- Elder incentives and compensation
- Elder responsibilities and powers
- Elder economic constraints
- Elder term cycles and evaluation
- Elder GI impact weighting

The goal is to create a governance layer that is:
- **accountable** (measurable performance)
- **incorruptible** (integrity-bound compensation)
- **sustainable** (funded by system health, not extraction)
- **meritocratic** (earned through demonstrated integrity)

---

## 2. Elder Compensation (MIC-Based)

Elders receive MIC via three mechanisms:

### 2.1 Elder Stipend (Base Compensation)

From the MIC governance pool:

```
Elder_stipend = MIC_governance_pool * 0.20 / N_elders
```

Where:
- `MIC_governance_pool` = 25% of epoch MIC mint (see RFC-0002)
- `N_elders` = number of active Elders

**Distribution:** Equal share per active Elder

**Frequency:** Per epoch (weekly or monthly, configurable)

### 2.2 GI Maintenance Bonus

If MII stays **≥ 95** throughout an Elder's term:

```
GI_bonus = MIC_governance_pool * 0.05 / N_elders
```

This rewards Elders for maintaining systemic integrity.

**Criteria:**
- No MII drops below 95 during term
- No emergency interventions required
- Proactive governance maintained

### 2.3 Performance Multiplier (Individual)

Each Elder is evaluated on:
- **Responsiveness:** Speed of critical decision-making
- **Wisdom:** Quality of governance proposals
- **Integrity Impact:** Personal contribution to GI/MII maintenance
- **Community Trust:** Citizen feedback scores

Performance score (0–1.5):

```
Performance_score_i = 
    0.3 * responsiveness_i +
    0.3 * wisdom_i +
    0.25 * integrity_impact_i +
    0.15 * community_trust_i
```

Total compensation:

```
Elder_total_compensation_i = 
    (Elder_stipend + GI_bonus) * Performance_score_i
```

---

## 3. Elder Integrity Penalty

If MII drops below 90:

### Severity Level 1 (MII 85–89)

- Stipend reduced by 25%
- Bonus eliminated
- Mandatory weekly status reports

### Severity Level 2 (MII 80–84)

- Stipend reduced by 50%
- Bonus eliminated
- Emergency performance review
- Potential removal vote

### Severity Level 3 (MII < 80)

- All compensation suspended
- Emergency Elder Council activated
- Mandatory full Cathedral review
- Individual Elder audits

**Recovery:** Compensation resumes when MII returns to ≥ 90 for 14 consecutive days.

---

## 4. Elder Responsibilities

### 4.1 Core Duties

1. **Maintain MII ≥ 95**
   - Monitor daily GI/MII trends
   - Intervene on degradation signals
   - Approve or deny high-risk proposals

2. **Governance Oversight**
   - Review CivicNode tier changes
   - Approve Custodian Agent updates
   - Resolve disputes between nodes
   - Validate GI-Sim outputs

3. **Economic Stewardship**
   - Ensure MIC minting gates are respected
   - Monitor KS burn/mint balance
   - Approve emergency fund allocations
   - Prevent economic drift

4. **Community Leadership**
   - Publish monthly transparency reports
   - Engage in public deliberations
   - Mentor emerging Elders
   - Uphold Virtue Accords

### 4.2 Powers

Elders may:
- **Veto** CivicNode spending if GI impact is negative
- **Suspend** nodes with GI < 0.75
- **Emergency halt** MIC minting if systemic risk detected
- **Override** Custodian Agents in crisis (with 2/3 Quorum vote)
- **Propose** constitutional amendments (requires Cathedral vote)

### 4.3 Constraints

Elders may NOT:
- Mint MIC outside of formal rules
- Directly control individual Vaults
- Influence GI scores of specific nodes without evidence
- Use position for personal financial gain
- Serve on commercial CivicNode boards

**Conflict of Interest:** Elders must disclose all affiliations. Violations result in immediate removal.

---

## 5. Elder Terms & Rotation

### 5.1 Term Length

**Standard term:** 90 days (aligned with HIVE seasons)

**Maximum consecutive terms:** 4 (1 year)

**Mandatory rest period:** 90 days between consecutive service periods

### 5.2 Re-Election

Elders may seek re-election if:
- GI contribution was positive (personal GI ≥ 0.95)
- No integrity violations
- Community approval ≥ 60%

### 5.3 Emergency Removal

An Elder may be removed mid-term if:
- Personal GI drops below 0.80
- Conflicts of interest discovered
- 2/3 Elder Quorum vote + Cathedral ratification

### 5.4 Automatic Retirement

Elders automatically retire if:
- Personal GI contribution negative for 2 consecutive terms
- Community trust score below 0.50
- No active participation for 30 days

---

## 6. Elder Trials (Ascension & Challenge)

### 6.1 Ascension Process

To become an Elder, a candidate must:

1. **Nomination**
   - Self-nomination or community nomination
   - Minimum 100 citizen endorsements
   - Personal GI ≥ 0.95

2. **Integrity Thesis**
   - Publish a public proposal: "How I will strengthen Mobius integrity"
   - Peer review period (14 days)
   - Community discussion

3. **GI Simulation Test**
   - Submit to hypothetical governance scenarios
   - GI-Sim evaluates projected decisions
   - Must score ≥ 0.90 on integrity alignment

4. **Trial of Mirrors (Identity & Alignment)**
   - Deep interview process
   - Elder panel evaluation
   - Conflict-of-interest review
   - Public Q&A session

5. **Elder Quorum Vote**
   - Requires 2/3 approval from current Elders
   - Community vote (advisory, weighted by reputation)
   - Final tally published on-ledger

### 6.2 Challenge Process

Citizens may challenge a sitting Elder if:
- Evidence of integrity breach
- Persistent poor performance
- Conflicts of interest

**Process:**
1. Challenge filed with evidence
2. Elder response (7 days)
3. Elder Quorum review
4. Public deliberation (14 days)
5. Vote (2/3 required for removal)

---

## 7. Elder Vault

Elders collectively manage an **Elder Vault** (separate from individual compensation):

**Purpose:**
- Emergency integrity interventions
- CivicNode rescue operations
- Cathedral infrastructure
- Elder operational expenses

**Funding:**
```
Elder_vault_allocation = MIC_governance_pool * 0.30
```

**Spending Rules:**

Every withdrawal must:
- Pass GI-Sim evaluation (projected delta GI ≥ 0)
- Have 2/3 Elder Quorum approval
- Be attested on-ledger
- Include public justification

**Transparency:**
- All spending published in real-time
- Quarterly audits by independent validators
- Annual community review

---

## 8. Elder Council Structure

### 8.1 Optimal Size

**Target:** 9–15 Elders

**Minimum:** 5 (for basic quorum)

**Maximum:** 21 (to maintain coherence)

### 8.2 Specializations (Optional)

Elders may specialize in:
- **Economic Integrity** (MIC/KS oversight)
- **Node Governance** (CivicNode tier management)
- **Technical Architecture** (GI-Sim, Custodian Agents)
- **Community Relations** (citizen engagement)
- **Emergency Response** (crisis management)

Specialization does not affect voting power; all Elders have equal votes.

---

## 9. Cathedral Economics

The **Cathedral** is the collective governance layer including:
- Elders
- CivicNodes (Tier 0–1)
- Elder Vault
- Community Representatives

### 9.1 Cathedral Budget

Total Cathedral allocation per epoch:

```
Cathedral_budget = 
    MIC_governance_pool +
    KS_burn_reserves * 0.10
```

**Distribution:**
- 50% → Elder operations (stipends, bonuses, vault)
- 30% → CivicNode tier 0 support
- 15% → Community programs
- 5% → Emergency reserve

### 9.2 Transparency Requirements

All Cathedral spending must:
- Be pre-announced (except emergencies)
- Pass GI-Sim evaluation
- Be attested on-ledger
- Be publicly auditable

---

## 10. Future Work

- **RFC-0007** — Citizen representation in Cathedral
- **RFC-0008** — Agent participation in governance
- **RFC-0009** — Inter-Cathedral coordination (multi-HIVE)
- **RFC-0010** — Elder dispute resolution mechanisms

---

## 11. Summary

RFC-0005 establishes:

- **Elder compensation** tied to MII maintenance and performance
- **Elder responsibilities** as constitutional guardians
- **Elder constraints** preventing corruption and capture
- **Elder terms** with rotation and re-election mechanisms
- **Elder Trials** for ascension and challenge processes
- **Elder Vault** for collective governance needs
- **Cathedral economics** for sustainable governance

This creates a governance layer that is:
- **Accountable** (measurable impact on GI/MII)
- **Incorruptible** (incentives aligned with integrity)
- **Sustainable** (funded by systemic health)
- **Meritocratic** (earned through demonstrated wisdom)

**Elders do not rule. They steward. And stewardship is measured, rewarded, and bound by integrity.**
