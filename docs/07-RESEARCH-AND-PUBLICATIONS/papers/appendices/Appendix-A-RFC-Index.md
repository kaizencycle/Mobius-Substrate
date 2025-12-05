# Appendix A — RFC Index

This appendix enumerates all RFCs included in Mobius v1.0.

---

## Active RFCs

### RFC-0001: Civic Nodes & Custodian Agents

**Status:** Draft  
**Location:** `/specs/civic-ledger/RFC-0001-civic-nodes-and-custodians.md`

**Summary:**  
Defines institutional identity, Vaults, Custodian agents, and invariant rules for how institutions participate in Mobius. Establishes the CivicNode concept and integrity-gated spending.

**Key Concepts:**
- CivicNode structure and properties
- Vault treasury management
- Custodian Agent responsibilities
- Integrity gates (spending constraints)
- Transparency gates (attestation requirements)
- Integration with IDM

---

### RFC-0002: MIC & KS Economy

**Status:** Draft  
**Location:** `/specs/civic-ledger/RFC-0002-mic-ks-economy.md`

**Summary:**  
Dual-token monetary architecture defining MIC (scarce governance) and KS (fluid participation). Includes minting rules, burn mechanics, UBI flows, and Integrity Dividend Mechanism.

**Key Concepts:**
- MIC minting formula (integrity-gated)
- KS UBI and activity rewards
- Burn → reserve loop (2% on all KS transactions)
- Halving schedule for MIC
- IDM (Integrity Dividend Mechanism)
- Spending constraints (GI-gated)

---

### RFC-0003: GI & MII Formal Definitions

**Status:** Draft  
**Location:** `/specs/civic-ledger/RFC-0003-gi-and-mii-formal-spec.md`

**Summary:**  
Defines the global integrity metrics that power minting and governance. Provides mathematical formulations, event types, weights, and emergency procedures.

**Key Concepts:**
- GI (Global Integrity) 0-1 score
- MII (Mobius Integrity Index) 0-100 score
- Event types and weights (positive/negative)
- Recency decay formulas
- MII thresholds (95, 90, 80)
- Emergency procedures for MII crises

---

### RFC-0004: CivicNode Governance Tiers

**Status:** Draft  
**Location:** `/specs/civic-ledger/RFC-0004-civicnode-governance-tiers.md`

**Summary:**  
Defines 4-tier classification system for institutions, with tier-specific privileges, constraints, and promotion/demotion mechanics.

**Key Concepts:**
- Tier 0: Foundational Knowledge (Wikipedia, etc.)
- Tier 1: Research/Science (NASA, arXiv)
- Tier 2: Civic Utilities (libraries, archives)
- Tier 3: Commercial/Hybrid (news, EdTech)
- Promotion/demotion process
- Tier-specific Custodian Agent capabilities

---

### RFC-0005: Elder & Cathedral Economic Model

**Status:** Draft  
**Location:** `/specs/civic-ledger/RFC-0005-elder-cathedral-economic-model.md`

**Summary:**  
Defines Elder compensation, responsibilities, term limits, Elder Trials, and Cathedral economics. Establishes governance layer incentives and constraints.

**Key Concepts:**
- Elder stipend (MIC-based, tied to MII)
- GI maintenance bonus
- Integrity penalty structure
- Elder responsibilities and powers
- Term limits (90 days, renewable)
- Elder Trials (ascension process)
- Cathedral budget allocation

---

### RFC-0006: Integrity Simulation Model (GI-Sim)

**Status:** Draft  
**Location:** `/specs/civic-ledger/RFC-0006-integrity-simulation-model.md`

**Summary:**  
Predictive integrity engine specification. Defines how all proposed actions are evaluated for integrity impact before execution.

**Key Concepts:**
- GI-Sim core equations (node-level and system-level)
- Category coefficients by tier
- Spend evaluation logic
- Elder governance evaluation
- Emergency override conditions
- Simulation determinism and replayability
- Version control (gi-sim-vX.Y)

---

### RFC-0007: Citizen Identity & Reputation

**Status:** Draft  
**Location:** `/specs/civic-ledger/RFC-0007-citizen-identity-and-reputation.md`

**Summary:**  
Human identity specification defining Ledger ID, Wallet, Companion Agent, reputation system, civic progression, and privacy guarantees.

**Key Concepts:**
- Three-ID system (Ledger + Wallet + Companion)
- Non-transferable reputation formula
- Citizen states (Guest → Scout → Citizen → Elder)
- Citizen Ledger Events
- Privacy preservation (ZK proofs)
- Multi-identity prevention (Sybil resistance)
- Reputation decay for inactivity

---

### RFC-0008: Agent Sovereignty Levels

**Status:** Draft  
**Location:** `/specs/civic-ledger/RFC-0008-agent-sovereignty-levels.md`

**Summary:**  
AI agent classification system defining 5 sovereignty levels, autonomy boundaries, promotion/demotion mechanics, and governance participation.

**Key Concepts:**
- Level 0: Tools (no autonomy)
- Level 1: Companion Agents (personal assistants)
- Level 2: Civic Agents (community servants)
- Level 3: Custodian Agents (institutional stewards)
- Level 4: State Agents (city-state governors)
- Level 5: Cathedral Agents (Elder AI)
- Promotion requirements and process
- Economic and governance rights by level

---

### RFC-0009: HIVE City-State Protocol

**Status:** Draft  
**Location:** `/specs/civic-ledger/RFC-0009-hive-citystate-protocol.md`

**Summary:**  
City-state governance layer defining state creation, economic model (burn → treasury → insurance), Elder Trials, inter-state diplomacy, and cultural activities.

**Key Concepts:**
- City-State identity and properties
- State tier system (0-3)
- Burn → Treasury → Insurance loop (2% on KS)
- State GI (GI_state) calculation
- Shard economy (KS distribution)
- Cultural activities (festivals, quests, lore)
- Elder Trials (state-level)
- Inter-state diplomacy and federations

---

## Planned RFCs

### RFC-0010: Emergency Integrity Overrides

**Status:** Planned  
**Expected:** Q1 2026

Detailed protocols for emergency governance when MII drops below critical thresholds.

### RFC-0011: Citizen Reputation Graph

**Status:** Planned  
**Expected:** Q2 2026

Social trust network and reputation endorsement mechanisms.

### RFC-0012: Cathedral Constitution

**Status:** Planned  
**Expected:** Q2 2026

Formal constitutional document defining immutable rules and amendment process.

### RFC-0013: Cross-Chain Integration

**Status:** Planned  
**Expected:** Q3 2026

Bridging protocols for multi-chain GI verification and MIC/KS transfers.

---

## RFC Contribution Process

1. **Proposal:** Submit RFC draft to `/specs/civic-ledger/`
2. **Review:** RFC Editor (Kaizen) + community feedback
3. **GI-Sim:** Run integrity impact assessment
4. **Elder Vote:** Quorum approval (2/3 required for new RFCs)
5. **Finalization:** Assign RFC number, merge to main
6. **Implementation:** Coordinate with development teams

---

## RFC Status Definitions

**Draft:** Under active development, subject to change  
**Proposed:** Ready for Elder review  
**Approved:** Accepted as standard  
**Active:** Currently in use  
**Deprecated:** Superseded by newer RFC  
**Retired:** No longer applicable

---

## Related Documents

- Full RFC specifications: `/specs/civic-ledger/`
- Economic specs: `/specs/civic-ledger/economy/`
- Diagrams: `/specs/civic-ledger/diagrams/`
- Schemas: `/specs/civic-ledger/schemas/`
- Examples: `/specs/civic-ledger/examples/`

---

**Last Updated:** 2025-12-03  
**Total Active RFCs:** 9  
**Total Planned RFCs:** 4+
