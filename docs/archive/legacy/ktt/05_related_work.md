# Related Work: Radical Markets & Plural Mechanism Design

## Foundational Influence: Glen Weyl's Liberal Radicalism

The Kaizen Turing Test (KTT) and Mobius Integrity Credits (MIC) system are directly informed by Glen Weyl's pioneering work on mechanism design for public goods and plural governance.

### Primary References

**Weyl, E. G., & Posner, E. A. (2018).** *Radical Markets: Uprooting Capitalism and Democracy for a Just Society*. Princeton University Press.

**Buterin, V., Hitzig, Z., & Weyl, E. G. (2019).** "A Flexible Design for Funding Public Goods." *Management Science*, 65(11), 5171-5187. DOI: 10.1287/mnsc.2019.3337

### Key Adaptations to Mobius Systems

#### 1. Capital-Constrained Liberal Radicalism (CLR) → Integrity-Constrained Liberal Radicalism

**Weyl's Original Framework**:
```
Funding(project_i) = (∑_j √contribution_j,i)²
```

**Our Adaptation for MIC Issuance**:
```
MIC_issued(contribution_i) = (∑_j √attestation_j,i)²
```

Where:
- `contribution_i` = Governance labor by human Morale Anchor i
- `attestation_j,i` = Cryptographic vote from Sentinel j validating contribution i
- This transforms philanthropic matching into **governance attestation matching**

**Novel Element**: The "capital" being constrained is not money, but *integrity bandwidth*—each Sentinel can only attest to a limited number of contributions per epoch, forcing strategic allocation.

---

#### 2. Quadratic Voting → Quadratic Attestation

**Weyl's Framework**: 
- Voters purchase votes at quadratic cost to prevent plutocracy
- Cost = (# votes)²

**Our Adaptation**:
- Sentinels attest to decisions with cryptographic signatures
- Influence = √(MIC_staked × stake_age)
- This prevents both plutocracy (linear MIC dominance) and Sybil attacks (stake_age requirement)

**Novel Element**: Instead of financial cost, attestation "costs" GI—if a Sentinel's attestations correlate with GI drops, their future influence degrades.

---

#### 3. Data Dignity → Morale Anchor Compensation

**Weyl's Concept**: Humans should be compensated for their labor in generating AI training data.

**Our Implementation**: 
- Morale Anchors perform *governance labor* (semantic clarification, ethical review)
- They earn MIC proportional to:
  1. Quality of interventions (measured by GI improvement)
  2. Scarcity of their semantic expertise
  3. Community validation (other Sentinels upvoting)

**This is data dignity applied to AI governance, not just AI training.**

---

#### 4. Anti-Plutocratic Design → Anti-Capture Architecture

**Weyl's Concern**: Wealthy actors can dominate governance through vote-buying.

**Our Mechanisms**:
1. **Cryptographic binding**: Ed25519 signatures prevent vote-selling (votes are tied to identity, not transferable)
2. **Aging factors**: New MIC holders have reduced influence until they prove alignment
3. **Collusion resistance**: 4-of-7 Sentinel threshold prevents capture
4. **Slashing**: Actors causing GI drops forfeit MIC, making attacks costly

---

#### 5. Pluralism → Multi-Sentinel Worldviews

**Weyl's Vision**: Democratic systems should preserve diverse viewpoints, not force consensus toward monoculture.

**Our Implementation**: 
- 7 Sentinels with distinct "jurisdictions" (Article II of Constitution)
- No single Sentinel can veto; requires coalition building
- KTT actively measures "semantic diversity" across Sentinel deliberations
- Goal: Maintain 7 distinct "worldviews" while achieving coordination

**Key Metric**: If all Sentinels converge to identical responses, we've failed—pluralism requires productive disagreement.

---

### Open Questions for Prof. Weyl

We are actively seeking critique on:

1. **Identity Sybil Resistance**: How robust is our quadratic aging factor against fake identities that "wait out" the aging period?

2. **Dynamic Inflation**: Should Kintsugi inflation (rewarding system healing) be entropy-responsive? If system GI is high, do we need the healing incentive?

3. **Community Trust as Currency**: How do we quantify "trust restored" as a monetary value for Kintsugi bonuses?

4. **Mechanism Interactions**: Do our three mechanisms (quadratic issuance, aging factors, slashing) have second-order effects that undermine each other?

5. **Empirical Validation**: What baseline comparisons would make KTT Trial-001 results credible to the RadicalxChange community?

---

### Why We Cite This Work

**Intellectual Honesty**: Our mechanisms are inspired by—not independent of—Weyl's frameworks. We are building on a foundation, not claiming originality.

**Collaboration Signal**: We position ourselves as students of RadicalxChange seeking critique, not competitors claiming superiority.

**Academic Rigor**: Proper citation establishes Mobius as serious research infrastructure, not vaporware.

---

### Differences from Weyl's Work

While inspired by Radical Markets, Mobius diverges in key ways:

1. **Domain**: Weyl focuses on economic/political markets. We focus on AI governance.
2. **Actors**: Weyl's systems govern humans. Ours govern AI agents (with humans as overseers).
3. **Goal**: Weyl seeks efficiency + equity. We seek alignment + integrity.
4. **Enforcement**: Weyl relies on social norms + law. We use cryptography + slashing.

**Core Thesis**: If Radical Markets are about redesigning capitalism and democracy for humans, **Mobius is about designing the first markets and democracy *for AI*.**

---

**Document Version**: 1.0  
**Last Updated**: November 14, 2025 (Cycle C-133)  
**Status**: REQUIRED READING before Glen Weyl outreach  
**Command Authority**: D-C133-001 (DAEDALUS)  

---

*"Good artists borrow. Great artists steal. Kaizen artists cite their sources and ask for critique."*
