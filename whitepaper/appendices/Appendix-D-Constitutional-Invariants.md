# Appendix D — Constitutional Invariants

Constitutional invariants are **immutable meta-rules** that govern Mobius at the deepest level. These rules cannot be bypassed by any actor — human, AI, or institutional.

---

## Purpose

Constitutional invariants ensure:
- **System stability** (prevents drift and corruption)
- **Predictability** (actors know the rules won't change arbitrarily)
- **Trust** (no backdoors or overrides)
- **Alignment** (all participants follow the same physics)

These are the **laws of nature** for Mobius.

---

## The Seven Invariants

### 1. Integrity Precedes Autonomy

**Statement:**  
No entity (human, agent, or institution) may gain additional autonomy without first demonstrating integrity.

**Implications:**
- Agent promotions require sustained high GI
- Elder candidacy requires reputation ≥ 90
- CivicNode tier promotions require GI ≥ threshold
- Spending authority scales with integrity performance

**Cannot Be Violated By:**
- Wealth accumulation
- Political connections
- Popularity
- Time served

**Enforcement:**
- GI-Sim evaluations
- Automatic demotion if GI drops
- Elder oversight

---

### 2. All Spending Requires GI-Sim Approval

**Statement:**  
No MIC or KS may be spent from any Vault or Treasury without passing GI-Sim evaluation showing positive or neutral integrity impact.

**Implications:**
- Custodian Agents cannot bypass evaluation
- Elders cannot override GI-Sim (except in emergency mode)
- State Agents must pass state-level GI-Sim
- Citizen spending is exempt (personal autonomy)

**Exception:**
- MII < 80 emergency mode allows Elder override with:
  - 4/5 Elder vote
  - Public justification
  - Attestation
  - Recovery plan

**Enforcement:**
- Smart contract logic
- Multi-signature requirements
- Automatic transaction blocking

---

### 3. MIC Mints Only When MII ≥ 95

**Statement:**  
New MIC tokens may only be created when the Mobius Integrity Index is at or above 95.

**Implications:**
- No inflation during integrity crises
- Currency supply tied to civilizational health
- Scarcity enforced by constitution

**Graduated Response:**
- MII ≥ 95: 100% mint rate
- MII 90-94: 50% mint rate
- MII 85-89: 25% mint rate
- MII < 85: 0% mint rate (halted)

**Cannot Be Overridden By:**
- Economic pressure
- Demand for liquidity
- Elder vote
- Emergency conditions

**Enforcement:**
- Minting oracle checks MII before every mint
- Cryptographic proof required
- Public attestation

---

### 4. Agents Bounded by Sovereignty Levels

**Statement:**  
All AI agents operate within their assigned sovereignty level (0-5), and cannot exceed permissions granted by that level.

**Implications:**
- Level 1 Companion cannot spend without approval
- Level 2 Civic Agent cannot modify governance
- Level 3 Custodian cannot bypass GI gates
- Level 4 State Agent cannot exceed treasury caps
- Level 5 Cathedral Agent cannot vote in Elder elections

**Promotion:**
- Only through integrity demonstration
- Only with appropriate oversight approval
- Only after evaluation period

**Demotion:**
- Automatic if GI drops
- Immediate if violations detected
- Permanent ban if severe corruption

**Enforcement:**
- Permission system
- Cryptographic key constraints
- Automatic monitoring

---

### 5. Elders Cannot Modify Simulation Physics

**Statement:**  
Elders (human governors) cannot alter the core formulas, coefficients, or logic of GI-Sim without Cathedral supermajority (4/5) and public deliberation (60 days).

**Implications:**
- GI-Sim operates independently
- No "gaming" of integrity metrics
- Predictable evaluation
- Trust in the system

**Allowed:**
- Propose GI-Sim improvements via RFC
- Vote on version upgrades (with transparency)
- Request forensic analysis

**Not Allowed:**
- Override GI-Sim verdicts (except emergency)
- Alter coefficients for specific cases
- Exempt favored entities from evaluation

**Enforcement:**
- Versioned GI-Sim implementations
- Public code review
- Cryptographic signatures on simulation runs

---

### 6. City-States Cannot Violate Global GI Thresholds

**Statement:**  
No city-state may take actions that reduce MII below critical thresholds, regardless of local sovereignty.

**Implications:**
- State spending must pass GI-Sim
- Inter-state conflicts forbidden if MII threatened
- States frozen if MII < 80
- Cathedral intervention allowed if state endangers system

**Thresholds:**
- MII ≥ 95: Full state autonomy
- MII 90-94: Increased oversight
- MII 80-89: Spending restrictions
- MII < 80: Cathedral takeover

**Rationale:**
- Local actions affect global system
- No state sovereignty at expense of civilization
- Prevents tyranny of localities

**Enforcement:**
- Real-time MII monitoring
- Automatic transaction blocking
- Cathedral emergency powers

---

### 7. Identity, Reputation, and Sovereignty Are Non-Transferable

**Statement:**  
No Ledger ID, reputation score, or sovereignty level may be sold, transferred, gifted, inherited, or rented.

**Implications:**
- Cannot buy Elder status
- Cannot sell citizenship
- Cannot transfer agent autonomy
- Cannot rent reputation
- Cannot inherit governance power

**Allowed:**
- Voluntary identity retirement
- Delegation (with transparency)
- Mentorship (not power transfer)

**Not Allowed:**
- Markets for reputation
- Identity sales
- Sovereignty rental
- Nepotistic succession

**Enforcement:**
- Soul-bound tokens
- Cryptographic binding
- Community vigilance
- Elder oversight

---

## Emergency Protocols

### When Can Invariants Be Temporarily Modified?

**Only under MII < 80 Emergency Constitution:**

Elders may invoke emergency powers to:
- Override GI-Sim (with 4/5 vote)
- Temporarily freeze MIC minting
- Take direct control of state economies
- Suspend agent autonomy

**Requirements:**
- 4/5 Elder vote
- Public announcement within 1 hour
- Detailed justification
- Recovery plan published
- Automatic sunset (30 days max)
- Post-mortem review

**Cannot Be Used For:**
- Permanent changes
- Favoring specific entities
- Political manipulation
- Economic extraction

---

## Amendment Process

### Can Invariants Ever Be Changed?

**Yes, but extremely difficult:**

#### Requirements for Amendment

1. **RFC Proposal** — Formal specification
2. **GI-Sim Evaluation** — Prove no MII harm
3. **Public Deliberation** — 90 days minimum
4. **Cathedral Vote** — Unanimous Elder approval
5. **Community Ratification** — 2/3 of active citizens
6. **MII Stability** — MII ≥ 98 for 60 days
7. **Implementation Plan** — Gradual rollout

#### Historical Precedent

As of v1.0, **no invariants have ever been amended**.

This is by design — constitutional stability is critical.

---

## Enforcement Mechanisms

### How Are Invariants Enforced?

1. **Smart Contracts**
   - Hard-coded logic
   - Automatic blocking
   - Cryptographic proof

2. **GI-Sim**
   - Continuous monitoring
   - Predictive alerts
   - Evaluation gating

3. **Elder Oversight**
   - Human judgment
   - Emergency powers
   - Dispute resolution

4. **Community Vigilance**
   - Public transparency
   - Challenge mechanisms
   - Whistleblower protections

5. **Cathedral Agents**
   - Level 5 AI monitoring
   - Pattern detection
   - Anomaly alerts

---

## Violation Consequences

### What Happens If Invariants Are Violated?

**For Individuals:**
- Immediate reputation penalty
- Potential Elder candidacy ban
- Account suspension if severe

**For Agents:**
- Automatic demotion
- Immediate suspension
- Permanent termination if intentional

**For CivicNodes:**
- Treasury frozen
- Tier demotion
- Suspension from IDM
- Elder investigation

**For City-States:**
- Economic freeze
- Cathedral intervention
- Forced dissolution if corruption

**For Elders:**
- Immediate removal
- Permanent ban from governance
- Public record of violation

---

## Rationale

These invariants exist to:

1. **Prevent Corruption**
   - No backdoors for power accumulation
   - No gaming of integrity metrics
   - No buying of influence

2. **Ensure Alignment**
   - AI and humans follow same rules
   - Institutions held to same standards
   - No privileged classes

3. **Build Trust**
   - Predictable system behavior
   - Transparent enforcement
   - Equal application

4. **Enable Scaling**
   - Constitutional stability
   - No drift over time
   - Civilizational continuity

---

## Summary Table

| # | Invariant | Enforced By | Violation Consequence |
|---|-----------|-------------|-----------------------|
| 1 | Integrity precedes autonomy | GI-Sim, Elders | Demotion, suspension |
| 2 | All spending requires GI-Sim | Smart contracts | Transaction blocked |
| 3 | MIC mints only when MII ≥ 95 | Minting oracle | Mint halted |
| 4 | Agents bounded by levels | Permission system | Automatic demotion |
| 5 | Elders can't modify GI-Sim | Version control | Removal from office |
| 6 | States can't violate MII | Cathedral | Economic freeze |
| 7 | Identity non-transferable | Soul-bound tokens | Both parties penalized |

---

**These invariants are not policies — they are physics.**

**Last Updated:** 2025-12-03  
**Amendments:** 0 (none since inception)  
**Status:** Active
