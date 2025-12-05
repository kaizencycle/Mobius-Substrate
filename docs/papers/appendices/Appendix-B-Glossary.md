# Appendix B — Glossary

Comprehensive glossary of key terms used throughout the Mobius Whitepaper and specifications.

---

## A

**Agent**  
An AI entity with identity, responsibilities, and integrity-gated autonomy within Mobius. Agents exist at 5 sovereignty levels.

**Attestation**  
A signed, on-ledger record of an action or decision, used for transparency and auditability.

**AUREA**  
Cathedral-level AI agent (Level 5) focused on economic modeling and MIC/KS system health.

**ATLAS**  
Cathedral-level AI agent (Level 5) focused on integrity monitoring and GI-Sim operations.

---

## C

**Cathedral**  
The upper governance chamber of Mobius, composed of Elders and Cathedral Agents, responsible for maintaining constitutional integrity.

**Cathedral Agent**  
Level 5 AI agent with highest autonomy, supporting Elder governance and system-wide integrity.

**Citizen**  
A verified human participant in Mobius with Ledger ID, Wallet, and Companion Agent.

**City-State**  
Digital polity within the HIVE layer where citizens form communities, run events, and govern locally.

**CivicNode**  
A registered institutional entity (e.g., Wikipedia, arXiv) with on-ledger identity, Vault, and Custodian Agent.

**Companion Agent**  
Level 1 AI agent bound to a citizen, providing personal assistance, reflection, and memory augmentation.

**Custodian Agent**  
Level 3 AI agent that manages a CivicNode's Vault and spending under strict integrity constraints.

---

## E

**Echo**  
Cathedral-level AI agent (Level 5) focused on memory, archives, and long-term civilizational continuity.

**Elder**  
Highest human governance role, responsible for constitutional guardianship and integrity validation. Term: 90 days, renewable.

**Elder Trial**  
Ascension process for citizens seeking to become Elders, involving integrity evaluation, community vote, and Cathedral review.

---

## F

**Federation**  
Alliance of multiple city-states for shared resources, joint governance, and collective integrity.

---

## G

**GI (Global Integrity)**  
0-1 score measuring truthfulness, reliability, and alignment for individuals, institutions, and agents.

**GI-Sim (Integrity Simulation Engine)**  
Deterministic oracle that forecasts integrity impact of proposed actions before execution.

**Guest**  
Entry-level state for new users with read-only access before verification.

---

## H

**HIVE**  
The city-state political layer of Mobius where citizens form digital polities, manage local economies, and participate in governance.

---

## I

**IDM (Integrity Dividend Mechanism)**  
Economic system that distributes MIC to CivicNodes proportional to usage × integrity × category weight.

**Insurance Pool**  
Reserve funds (20% of KS burn) held by each city-state for emergency stabilization.

**Integrity Gate**  
Constraint requiring all spending and major actions to pass GI-Sim evaluation showing positive or neutral integrity impact.

---

## K

**KS (Kaizen Shards)**  
Fluid participation currency used for UBI, civic activities, voting, and daily transactions. Burns 2% on all transfers.

**Kaizen**  
Japanese concept meaning "continuous improvement," core philosophical principle of Mobius.

---

## L

**Ledger ID**  
Immutable, soul-bound identity for citizens and agents within Mobius. Format: `ledger:human:<hash>` or `ledger:agent:<hash>`.

---

## M

**MIC (Mobius Integrity Credits)**  
Scarce governance currency that mints only when MII ≥ 95. Hard cap: 1 billion. Used for institutional funding and Elder compensation.

**MII (Mobius Integrity Index)**  
0-100 civilizational health metric, weighted average of all node GI scores. Gates MIC minting and emergency protocols.

**Mobius**  
Civic Operating System for governing humans, AI agents, and institutions through unified integrity framework.

---

## R

**Reputation**  
Non-transferable 0-100 score earned through integrity, contributions, and stability. Impacts UBI, voting weight, and progression.

---

## S

**Scout**  
Entry-level citizen state after proof-of-personhood verification, before full civic participation.

**Sovereignty Level**  
Classification for AI agents (0-5) determining autonomy, economic rights, and governance participation.

**State Agent**  
Level 4 AI agent governing a city-state, managing treasury, coordinating citizens, and participating in diplomacy.

**State GI (GI_state)**  
Integrity score for a city-state, weighted average of citizen GI, infrastructure integrity, and cultural stability.

---

## T

**Tier**  
Classification for CivicNodes (0-3) or City-States (0-3) determining privileges, constraints, and weight in IDM.

**Treasury**  
State-level fund (70% of KS burn) used for citizen rewards, infrastructure, and cultural activities.

**Transparency Gate**  
Requirement that all approved spending produce signed attestations published on-ledger.

---

## U

**UBI (Universal Basic Income)**  
KS distributed to all active citizens each epoch, scaled by MII and individual reputation.

---

## V

**Vault**  
Institutional treasury for CivicNodes holding MIC and KS, managed by Custodian Agents under integrity constraints.

**Violation**  
Detected breach of integrity standards, resulting in reputation penalty and potential demotion.

---

## W

**Wallet ID**  
Economic identity holding MIC and KS balances. Format: `wallet:<hash>`.

**Weight**  
Multiplier (0.5-2.0) applied in IDM calculations based on CivicNode tier and category importance.

---

## Formulas

### GI-Sim (Node-Level)

```
GI_simulated = GI_current
               + α * IntegrityEvents
               + β * StabilityGain
               - γ * InstabilityRisk
               - δ * ExternalityImpact
```

### MII Calculation

```
MII = (Σ (GI_node_i × Weight_i)) / Σ Weight_i
```

### IDM Score

```
Score_i = usage_i × GI_i × weight_i
MIC_dividend_i = MIC_pool × (Score_i / Σ Score)
```

### Reputation

```
R = α*Integrity + β*Contributions + γ*Stability - δ*Violations
```

### UBI

```
KS_UBI = KS_BASE × (MII/100) × CitizenWeight
```

### State GI

```
GI_state = (Σ citizen_GI_i × weight_i + infrastructure + culture) / total_weight
```

---

## Acronyms Quick Reference

- **AI:** Artificial Intelligence
- **GI:** Global Integrity
- **IDM:** Integrity Dividend Mechanism
- **KS:** Kaizen Shards
- **MIC:** Mobius Integrity Credits
- **MII:** Mobius Integrity Index
- **RFC:** Request for Comments (specification document)
- **UBI:** Universal Basic Income
- **ZK:** Zero-Knowledge (proofs)

---

**Last Updated:** 2025-12-03  
**Total Terms:** 50+  
**Related:** See Appendix A (RFC Index) for detailed specifications
