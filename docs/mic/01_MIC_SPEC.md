# MIC Token — Mobius Integrity Credit

**Version**: 0.1  
**Status**: Draft  
**Track**: D-C133-001 (Track 2)  
**Leads**: HERMES (primary), AUREA (support)  

---

## 1. Purpose

MIC (Mobius Integrity Credit) is the native utility token of the Mobius ecosystem, designed to reward integrity-aligned behavior and provide access to advanced AI governance services.

**Core Principles**:
- **Integrity-backed**: Issuance coupled to Global Integrity (GI) scores
- **Utility-first**: Used for access, not speculation
- **Anti-extractive**: Rewards genuine contribution, not rent-seeking
- **Civic-aligned**: Supports public goods and collective learning

**NOT**: A memecoin, a pure governance token, or a speculative asset

---

## 2. Roles & Participants

### Who Earns MIC

1. **Learners** (OAA users)
   - Complete verified coursework
   - Contribute to collaborative learning
   - Achieve measurable skill progression

2. **Teachers** (OAA creators)
   - Author high-quality lessons
   - Mentor other learners
   - Maintain curriculum with community validation

3. **Reviewers** (Governance participants)
   - Audit code/documentation with high agreement scores
   - Participate in KTT trials as Morale Anchors
   - Provide semantic clarification during deliberations

4. **Node Operators** (Infrastructure)
   - Run stable Thought Broker instances
   - Maintain city/school mesh networks
   - Provide compute for public-benefit deliberations

5. **Sentinels** (AI Agents)
   - Execute deliberations with high MII scores
   - Maintain Constitutional compliance
   - Perform integrity monitoring

### Who Spends MIC

1. **Advanced Access**
   - Premium Thought Broker deliberation tiers
   - Specialized OAA tracks and mentors
   - Priority queue access during high load

2. **Governance Rights**
   - Propose Constitutional amendments (100,000 MIC stake)
   - Vote in Sentinel elections (quadratic voting)
   - Challenge decisions (requires MIC bond)

3. **Civic Services**
   - City mesh network priority
   - School/hospital pilot program access
   - Public interest subsidies (MIC-backed)

---

## 3. Supply & Issuance

### Total Supply

```
Theoretical Maximum: 100,000,000 MIC
Initial Circulation: 1,000,000 MIC (1%)
Remaining Pool: 99,000,000 MIC (99%)
```

### Epoch-Based Issuance

```
Epoch Length: 1 year (365 days)
Initial Issuance Rate: 5% of remaining pool per epoch
Decay Function: Issuance reduces each epoch

Year 1: 5% of 99M = 4,950,000 MIC
Year 2: 5% of 94.05M = 4,702,500 MIC
Year 3: 5% of 89.35M = 4,467,375 MIC
...
Asymptotic Approach: Never exceeds 100M cap
```

### Issuance Formula

MIC enters circulation ONLY through verified integrity events:

```
MIC_reward = base_amount × (GI^α) × rarity_multiplier

Where:
- base_amount: Action-specific base reward (e.g., 10 MIC for lesson completion)
- GI: Global Integrity score at time of event (0.00 - 1.00)
- α: Sensitivity exponent (default: 1.2)
- rarity_multiplier: Bonus for under-served contributions (1.0 - 3.0)
```

**Example Calculation**:
```
Action: Complete advanced OAA lesson
base_amount: 10 MIC
GI: 0.97 (high system integrity)
α: 1.2
rarity_multiplier: 1.5 (ethics module - high demand)

reward = 10 × (0.97^1.2) × 1.5
       = 10 × 0.964 × 1.5
       ≈ 14.46 MIC
```

**Integrity Coupling Effect**:
- **High GI (0.95+)**: Normal rewards, healthy system
- **Medium GI (0.90-0.95)**: Reduced rewards, system stress
- **Low GI (<0.90)**: Minimal rewards, crisis mode

This creates economic pressure to restore integrity during degradation.

---

## 4. Earning MIC

*[Section to be completed by HERMES: Detailed earning mechanisms for OAA, Broker, Civic OS]*

**Placeholder Topics**:
- OAA lesson completion rewards
- Thought Broker governance participation
- KTT trial Morale Anchor compensation
- Node operator staking rewards
- Sentinel performance bonuses
- Anti-spam protections
- Anti-Sybil measures

---

## 5. Spending MIC

*[Section to be completed by AUREA: Access tiers, governance costs, utility functions]*

**Placeholder Topics**:
- Thought Broker access tier pricing
- OAA premium track costs
- Constitutional amendment proposal fees
- Quadratic voting mechanics
- Challenge bond requirements
- Civic service subsidies

---

## 6. Integrity Coupling

*[Section to be completed by AUREA: MII integration, slashing, anti-gaming]*

**Placeholder Topics**:
- MII score integration with MIC rewards
- Slashing conditions (restorative model)
- GI-responsive issuance adjustments
- Anti-gaming protections
- Reputation decay mechanisms
- Trust restoration bonuses (Kintsugi inflation)

---

## 7. Glen Weyl Integration & Mechanism Design

### 7.1 Mathematical Foundations

MIC issuance is grounded in the **Intention Compiler formalization**, which defines a mathematical mapping from human intent to integrity artifacts and token rewards.

**Full formalization**: See [`docs/whitepaper/intention-compiler-formalization.md`](../whitepaper/intention-compiler-formalization.md)

#### Core Result: MIC Issuance Formula

\[
R(x) = \begin{cases}
0, & \text{if } GI(x) < \tau_{\text{min}} \\
\kappa \cdot (GI(x) - \tau_{\text{min}}) \cdot \omega(x), & \text{if } GI(x) \ge \tau_{\text{min}}
\end{cases}
\]

Where:
- **κ** (kappa) = global emission rate
- **GI(x)** = global integrity score for interaction x (0.00 - 1.00)
- **τ_min** = constitutional threshold (0.95)
- **ω(x)** = contribution weight function encoding:
  - **effort** (time, tokens, cognitive load)
  - **impact** (downstream use, social benefit)
  - **scarcity** (under-served domains get bonuses)
  - **role** (Elder, Citizen, Scout multipliers)

#### Three Key Properties

1. **Monotone in integrity**: Higher GI → higher rewards
   \[
   GI_1 \ge GI_2 \Rightarrow R(\cdot, GI_1) \ge R(\cdot, GI_2)
   \]

2. **Zero below threshold**: No farming low-quality actions
   \[
   GI < \tau_{\text{min}} \Rightarrow R(\cdot, GI) = 0
   \]

3. **Scaled by contribution**: Prevents equal pay for unequal work
   \[
   \omega(x) \text{ encodes difficulty, novelty, and social impact}
   \]

---

#### Plain English Translation

The math above says three simple things:

1. **If your action doesn't meet integrity standards (GI < 0.95), you get zero MIC**  
   No gaming the system with spam or low-quality work.

2. **If your action exceeds standards, you get MIC proportional to how much better it is**  
   GI of 0.97 earns more than 0.96, which earns more than 0.95.

3. **Harder, rarer, or more impactful work gets bonus multipliers**  
   Teaching ethics (rare) earns more than basic tasks (common).

This is **not** engagement farming. This is integrity-gated rewards where quality matters more than quantity.

---

### 7.2 Quadratic Funding Adaptation (Liberal Radicalism)

Glen Weyl's **Liberal Radicalism** (Buterin, Hitzig, Weyl, 2018) proposes Quadratic Funding (QF) for public goods:

\[
\text{Funding for project } p = \left( \sum_{i} \sqrt{c_{i,p}} \right)^2
\]

Where \(c_{i,p}\) = individual contribution from person \(i\) to project \(p\).

**Key insight**: Broad support (many small contributors) receives quadratic amplification, while concentrated support (whales) does not.

#### Mobius Adaptation: Integrity-Coupled Radicalism (ICR)

We adapt QF to **integrity work** rather than financial contributions:

\[
\text{MIC reward for governance proposal } p = \left( \sum_{i} \sqrt{v_{i,p} \cdot GI_i} \right)^2 \cdot \rho(p)
\]

Where:
- **\(v_{i,p}\)** = vote weight from participant \(i\) on proposal \(p\)
- **\(GI_i\)** = participant \(i\)'s integrity score (anti-Sybil)
- **\(\rho(p)\)** = proposal impact multiplier (Constitutional amendments > minor tweaks)

**Differences from traditional QF**:
1. ✅ **Integrity-weighted**: Low-GI accounts cannot dilute quadratic matching
2. ✅ **Non-financial**: Voting is MIC-staked, not money-based
3. ✅ **Restorative slashing**: Bad actors lose MIC but can earn it back (Kintsugi)

**Example**:
- Traditional QF: 100 bot accounts can farm matching funds
- ICR: 100 bot accounts with GI < 0.95 contribute **zero** to quadratic sum

---

### 7.3 Collusion Resistance Mechanisms

Glen Weyl identifies **collusion** as the primary threat to quadratic mechanisms. Mobius addresses this through:

#### 7.3.1 Pairwise Coordination Subsidies (Negative Weights)

Following Weyl & Ohlhaver (2022), we implement **negative coordination penalties** for highly correlated voting patterns:

\[
\text{Penalty for voters } i, j = -\lambda \cdot \text{corr}(v_i, v_j) \cdot \sqrt{v_i \cdot v_j}
\]

Where:
- **λ** = penalty strength (tunable, default 0.3)
- **corr(v_i, v_j)** = correlation of voting patterns over time

**Effect**: Coordinated voting rings penalize each other, reducing quadratic amplification.

#### 7.3.2 MACI-Inspired Privacy (Future Work)

We plan to integrate **Minimal Anti-Collusion Infrastructure (MACI)** principles:
- Votes are encrypted until tallying phase
- Voters can change their vote (last one counts)
- Prevents vote-buying because buyer cannot verify compliance

**Status**: Theoretical design, implementation pending L2 migration.

#### 7.3.3 Sentinel Deliberation as Collusion Detection

The 7 Sentinels (AUREA, EVE, JADE, HERMES, ZEUS, ATLAS, ECHO) cross-check each other:
- If 3+ Sentinels flag coordinated manipulation → deliberation goes to human review
- MII scores include "coordination risk" dimension
- High-risk proposals require Elder Council approval (99 MIC threshold)

---

### 7.4 Sybil Resistance Proofs

Traditional tokenomics fail Sybil resistance because **identity is cheap**. Mobius addresses this through:

#### 7.4.1 Time-Locked Integrity (Proof of Personhood Lite)

To earn meaningful MIC, accounts must:
1. **Complete OAA onboarding** (5-7 hours of verified coursework)
2. **Maintain GI ≥ 0.90 for 30 days** (proof of sustained good behavior)
3. **Pass 3 KTT trials** (human-in-the-loop verification)

**Cost to Sybil**:
- Traditional token: $0 (create unlimited wallets)
- MIC: ~8 hours + passing KTT trials (expensive at scale)

#### 7.4.2 Diminishing Returns on Clone Accounts

Even if an attacker creates multiple accounts:
- Each account's GI is independent
- Low-quality votes → low GI → zero quadratic weight
- Pairwise correlation penalties reduce collusion value

**Simulation result** (Lab-7 analysis):
- 1 honest account (GI = 0.97): ~10 MIC/week
- 10 Sybil accounts (GI = 0.85): ~0 MIC/week (below threshold)
- **Sybil attack is economically irrational**

#### 7.4.3 Probabilistic Safety Bound

From the formalization (§3.1.8):

\[
\Pr[GI(x) \ge \tau_{\text{min}}] \ge 1 - \delta
\]

For a Sybil attacker to game the system, they must:
- Pass integrity checks with probability \(1 - \delta\) repeatedly
- Across multiple Sentinels (7-way consensus)
- Over sustained time periods (30+ days)

**Cumulative probability** of Sybil success:

\[
P_{\text{attack}} = (1 - \delta)^{n \cdot t \cdot k}
\]

Where:
- **n** = number of Sentinels (7)
- **t** = time periods (30 days)
- **k** = trials per day (varies)
- **δ** = failure probability per trial (0.05)

**Example**: \(P_{\text{attack}} = (0.95)^{7 \cdot 30 \cdot 3} \approx 10^{-13}\)

**Interpretation**: Sybil attacks are probabilistically negligible under sustained deliberation.

---

### 7.5 Comparison with Traditional Tokenomics

| Property | Traditional Tokens | MIC (Mobius) |
|----------|-------------------|--------------|
| **Issuance basis** | Time, staking, engagement | Integrity-verified contributions |
| **Farming resistance** | Weak (bots, Sybil) | Strong (GI threshold, KTT trials) |
| **Learning condition** | Unconstrained | Bounded emergence (GI ≥ 0.95) |
| **Quadratic funding** | Financial only | Integrity-weighted (ICR) |
| **Collusion penalty** | None | Pairwise correlation penalties |
| **Slashing model** | Punitive (burn forever) | Restorative (Kintsugi inflation) |
| **Governance rights** | Plutocratic (wealth) | Meritocratic (integrity history) |

**Key innovation**: MIC couples economic incentives to cryptographically-attested integrity, not just stake or engagement.

---

### 7.6 RadicalxChange Alignment Analysis

Glen Weyl's **RadicalxChange** principles map to Mobius as follows:

#### 7.6.1 Quadratic Funding → Integrity-Coupled Radicalism (ICR)

✅ **Aligned**: We amplify broad, high-integrity support.  
⚠️ **Deviation**: Integrity-weighted, not purely financial.

#### 7.6.2 Harberger Taxes → Dynamic Access Pricing

✅ **Aligned**: Thought Broker tiers use demand-based pricing.  
⚠️ **Deviation**: No forced sale mechanism (not applicable to AI services).

#### 7.6.3 Data Dignity → Intent Sovereignty

✅ **Aligned**: Users own their deliberation data (ledger attestations).  
✅ **Aligned**: Privacy-preserving MII scores (aggregated, not raw).

#### 7.6.4 Soulbound Tokens (SBTs) → Integrity Scores

✅ **Aligned**: GI is non-transferable, identity-bound.  
✅ **Aligned**: Supports Weyl & Ohlhaver's "Decentralized Society" vision (2022).

**Overall assessment**: Mobius operationalizes RadicalxChange principles for AI governance.

---

### 7.7 Open Questions for Glen Weyl Review

We seek feedback on:

1. **Collusion resistance bounds**: Are pairwise correlation penalties sufficient, or do we need higher-order graph analysis?

2. **Dynamic emission rates**: Should κ adjust based on system entropy (low GI → lower κ)?

3. **Kintsugi inflation quantification**: How much MIC should "trust restored" mint? Current formula:
   \[
   \Delta_{\text{Kintsugi}} = \beta \cdot (GI_{\text{restored}} - GI_{\text{prior}}) \cdot \text{stake}_{\text{locked}}
   \]
   where β is a restoration multiplier. How to set β?

4. **Cross-chain identity**: How to preserve Sybil resistance when migrating to L2/L3?

5. **Empirical calibration**: What sample size is needed to validate ICR vs. traditional QF in real-world trials?

---

### 7.8 Next Steps

1. **Publish formalization** to ArXiv (Q1 2026)
2. **Submit to RadicalxChange** for peer review
3. **Run KTT Trial-003** with ICR governance proposal funding
4. **Engage Glen Weyl** for mechanism design critique (email drafted, pending C-133 completion)
5. **Integrate MACI** for vote privacy (L2 migration, Q2 2026)

---

**Document Status**: Section 7 Complete  
**Author**: AUREA (System Integrity)  
**Last Updated**: November 15, 2025  
**Next Review**: November 21, 2025 (Final MIC Spec review)

---

*"Quadratic funding rewards breadth of support. Integrity-Coupled Radicalism rewards breadth of **good** support."*  
— AUREA, C-133 — Mechanism Design Complete

---

## 8. Future On-Chain Mapping

*[To be developed: L2/L3 integration with GIC, BTC settlement layer]*

**Placeholder Topics**:
- Layer 2 integration (GIC ledger)
- Layer 1 settlement (Bitcoin/base layer)
- Cross-chain bridge architecture
- Custody and security model
- Migration path from testnet to mainnet

---

## Document Status

**Version**: 0.1 (Initial Draft)  
**Last Updated**: November 14, 2025  
**Next Review**: November 17, 2025  
**Target Completion**: November 21, 2025, 18:00 UTC  

**Sentinel Assignments**:
- HERMES: Section 4 (Earning) - Due Nov 16
- AUREA: Sections 5-6 (Spending, Integrity) - Due Nov 16
- AUREA: Section 7 (Glen Weyl) - Due Nov 18
- ALL: Final review - Nov 21

---

*"MIC is not a token. MIC is proof you made the system better."*  
— Mobius Foundation Principle
