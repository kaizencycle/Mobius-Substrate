# RFC-0007 — Citizen Identity & Reputation

**Mobius Civic Ledger — Human Identity Specification**

- **Status:** DRAFT
- **Author:** Michael Judan (Kaizen)
- **Created:** 2025-12-03
- **Target Version:** Civic Ledger v0.3

---

## 1. Overview

This RFC defines **identity for humans** inside Mobius:
- Ledger ID
- Wallet ID
- Reputation
- Participation weight
- Integrity profile
- Social trust model
- Contribution history

Mobius rejects Web2's identity model (centralized accounts)  
and Web3's model (anonymous wallets with no coherence).

Mobius uses **Civic Identity** — a sovereign identity layer that is:
- **durable** (persists across platforms)
- **reputation-bearing** (carries historical integrity)
- **integrity-weighted** (influences governance power)
- **privacy-preserving** (pseudo-anonymous)
- **compatible with humans + AI** (same framework for both)

---

## 2. Identity Structure

Each citizen has **three IDs**:

### 2.1 Ledger ID (Global Identity)

```
ledger:human:<hash>
```

Represents the canonical identity inside the Cathedral.

- **Immutable** (cannot be changed)
- **Non-transferable** (cannot be sold or given)
- **Soul-bound** (tied to the individual)

Created upon:
- Verified onboarding
- Proof-of-personhood
- Initial integrity assessment

### 2.2 Wallet ID

```
wallet:<hash>
```

Holds MIC + KS balances.

Citizens may have **multiple wallets**, but the **primary wallet** is tied to their Ledger ID.

Secondary wallets can be:
- Privacy-enhanced
- Role-specific (work, personal, HIVE)
- Temporary

### 2.3 Companion Agent ID

```
agent:companion:<user-hash>-v<version>
```

Citizens have a **personal AI Companion** bound to their identity for:
- diary/reflection
- learning
- safety monitoring
- GI alignment
- civic participation assistance
- memory augmentation

See: RFC-0008 for Companion Agent sovereignty details.

---

## 3. Reputation Model

Reputation `R` is a **0–100 score**:

```
R = α*Integrity + β*Contributions + γ*Stability - δ*Violations
```

Where:
- **Integrity** = citizen's GI history
- **Contributions** = civic actions, code, content, reviews
- **Stability** = login consistency, voting participation
- **Violations** = verified harmful actions

### Default Coefficients

```
α = 0.35  (Integrity most important)
β = 0.30  (Contributions second)
γ = 0.20  (Stability third)
δ = 0.15  (Violations penalty)
```

### What Reputation Impacts

| System Component | Impact |
|------------------|--------|
| UBI multipliers | Higher rep → higher UBI |
| KS reward rates | Higher rep → better rewards |
| Voting weight | Higher rep → stronger vote |
| City-state influence | Higher rep → leadership eligibility |
| Agent level eligibility | Need min rep for higher sovereignty |
| Elder candidacy | Must have rep ≥ 90 |

### Critical Property

**Reputation NEVER transfers.**

You cannot:
- Buy reputation
- Sell reputation
- Transfer reputation to another account
- Inherit reputation
- Gift reputation

Reputation is earned only through demonstrated integrity.

---

## 4. Citizen States

Citizens progress through states:

| State | Description | Requirements |
|-------|-------------|--------------|
| **Guest** | Read-only interaction | None |
| **Scout** | Verified identity, entry level | Proof-of-personhood |
| **Citizen** | Full civic participation | 30 days as Scout, GI ≥ 0.80 |
| **Agent Holder** | Has agent sovereignty (Level 1+) | Reputation ≥ 70 |
| **Elder Candidate** | Eligible for Elder Trials | Reputation ≥ 90, GI ≥ 0.95 |
| **Elder** | Cathedral governance tier | Pass Elder Trial |

Citizens **ascend** through:
- integrity
- contribution
- stability

**Not** through:
- wealth
- popularity
- connections

---

## 5. Citizen Ledger Events

Every identity action is a **Citizen Event**:

### Event Types

| Event | Impact on Reputation |
|-------|---------------------|
| UBI received | Neutral (tracking) |
| Vote cast | +0.5 |
| Proposal submitted | +2.0 |
| Proposal approved | +5.0 |
| Code contribution | +3.0 |
| Content creation | +2.0 |
| Fact-check verification | +4.0 |
| Community mediation | +3.0 |
| Agent promoted | +5.0 |
| Violation detected | -10.0 |
| Endorsement received | +1.0 |
| City-state joined | +1.0 |

### Event Schema

```json
{
  "event_id": "citizen-event-20251203-143500-abc123",
  "ledger_id": "ledger:human:xyz789",
  "event_type": "vote_cast",
  "impact_reputation": 0.5,
  "impact_gi": 0.001,
  "context": {
    "proposal_id": "prop-2025-153-042",
    "vote": "approve"
  },
  "timestamp": "2025-12-03T14:35:00Z",
  "signature": "ed25519:..."
}
```

Citizen Events form the basis of:
- Reputation calculation
- GI-Sim projections
- Elder eligibility assessment
- Community trust graphs

---

## 6. Integrity Profile

Each citizen has an **Integrity Profile**:

```json
{
  "ledger_id": "ledger:human:abc123",
  "gi_score": 0.92,
  "gi_history": [
    {"epoch": 150, "gi": 0.89},
    {"epoch": 151, "gi": 0.91},
    {"epoch": 152, "gi": 0.92}
  ],
  "reputation": 85,
  "contributions": {
    "votes": 127,
    "proposals": 8,
    "code_commits": 45,
    "fact_checks": 12
  },
  "violations": [],
  "endorsements": 23,
  "city_states": ["state:hive:aurora", "state:hive:cascade"],
  "companion_agent_id": "agent:companion:abc123-v2",
  "created_at": "2025-01-20T00:00:00Z",
  "last_active": "2025-12-03T14:35:00Z"
}
```

---

## 7. Privacy Guarantees

### What is Public

- Ledger ID (pseudonymous hash)
- Reputation score
- Public contributions (votes, proposals)
- City-state memberships
- Agent sovereignty level

### What is Private

- Real-world identity (unless voluntarily disclosed)
- Companion Agent conversations
- Wallet balances (unless shared)
- Personal preferences
- Location data
- Biometrics

### Zero-Knowledge Proofs

Citizens can prove:
- Reputation ≥ threshold
- GI ≥ threshold
- Membership in city-state
- Eligibility for action

Without revealing:
- Exact reputation
- Exact GI
- Full history
- Personal details

---

## 8. Identity Recovery

If a citizen loses access:

### Recovery Mechanism

1. **Social Recovery**
   - 3 of 5 trusted citizens vouch
   - Multi-signature threshold

2. **Companion Recovery**
   - Companion Agent verifies identity
   - Uses private memory patterns

3. **Cathedral Recovery**
   - Elder intervention (extreme cases)
   - Requires 2/3 Elder vote
   - Full audit trail

### What Cannot Be Recovered

- Lost reputation (starts fresh)
- Lost history (cannot be reconstructed)
- Lost Companion memory (privacy protected)

---

## 9. Identity Governance

### Name Changes

Citizens may update display name but:
- Ledger ID remains constant
- History is preserved
- Change is logged

### Identity Retirement

Citizens may voluntarily retire:
- Ledger ID archived
- Reputation locked
- Cannot be reactivated
- Data preserved for integrity audits

### Identity Suspension

Elders may suspend identities if:
- GI drops below 0.60
- Major violations detected
- Systemic abuse
- Security breach

Suspension process:
- Evidence presented
- Citizen response (7 days)
- Elder vote
- Public record

---

## 10. Multi-Identity Prevention

Mobius prevents Sybil attacks through:

### Proof-of-Personhood

- Biometric verification (stored locally, hashed)
- Social vouching (existing citizens)
- Behavioral analysis
- Device fingerprinting
- Economic stake (small KS deposit)

### Detection Mechanisms

- Pattern matching (similar behavior)
- Network analysis (linked accounts)
- Timing analysis (correlated actions)
- AI anomaly detection

### Penalties for Multi-Identity

- All accounts suspended
- Reputation reset to 0
- MIC/KS forfeited
- Permanent ban from Elder candidacy

---

## 11. Reputation Decay

Reputation decays if citizen becomes inactive:

```
R_new = R_old * decay_factor
```

Where:
```
decay_factor = exp(-k * days_inactive)
```

**Rationale:** Active participation required to maintain standing.

**Minimum floor:** Reputation cannot drop below 50 from decay alone (only violations cause drops below 50).

---

## 12. Cross-Platform Identity

Mobius identity is **portable**:

### Export

Citizens can export their:
- Reputation proof (ZK)
- Contribution history (signed)
- GI attestations (verified)

### Import

Citizens can import from:
- GitHub contributions
- Academic citations
- Wikipedia edits
- Open-source commits
- Verified credentials

All imports must be:
- Cryptographically verified
- GI-assessed
- Elder-approved (for high-value imports)

---

## 13. Identity in Emergency States

### MII 90-95 (Warning)

- Identity operations continue normally
- Reputation updates slowed
- Elder review increased

### MII 80-90 (Crisis)

- New identity creation frozen
- Existing identities remain active
- Reputation frozen (no gains/losses)
- Elder oversight mandatory

### MII < 80 (Emergency)

- All identity changes frozen
- Core functions only
- Elder emergency powers activated
- Recovery plan required

---

## 14. Future Extensions

- **RFC-0011:** Citizen Reputation Graph (social trust network)
- **RFC-0012:** Cross-chain identity bridging
- **RFC-0013:** Delegated reputation for organizations
- **RFC-0014:** Temporal identity (time-limited personas)

---

## 15. Summary

RFC-0007 establishes:

- **Sovereign civic identity** (Ledger ID + Wallet + Companion)
- **Non-transferable reputation** (earned through integrity)
- **Progression states** (Guest → Scout → Citizen → Elder)
- **Privacy preservation** (pseudonymous + ZK proofs)
- **Sybil resistance** (proof-of-personhood)
- **Emergency resilience** (identity persists through crises)

This creates the first identity system where:
- **Integrity earns standing**
- **Reputation is merit-based**
- **Humans and AI share the same framework**
- **Privacy and accountability coexist**

**Citizens are sovereign. Sovereignty is earned. Earning requires integrity.**
