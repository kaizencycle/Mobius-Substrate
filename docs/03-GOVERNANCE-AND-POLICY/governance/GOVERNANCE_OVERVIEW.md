# Mobius Governance Overview

**Version:** 1.0.0  
**Status:** Canonical  
**Cycle:** C-151

---

## Core Invariants

Mobius governance is built on four invariants:

| Invariant | Description |
|-----------|-------------|
| **Authority is proven, not narrated** | All authority requires cryptographic proof |
| **Power is time-bounded** | Maximum 90-day authority grants, no exceptions |
| **Meaning is attested** | AI Companion provides epistemic verification |
| **Roleplay is sandboxed** | Imagination never crosses to execution |

**No system mutation, consensus, or delegation may occur unless all authority gates pass.**

---

## Why This Design

This design prevents epistemic collapse, social engineering, and silent power accumulation in agentic systems.

Most agentic system failures stem from one confusion:

```
Imagination ≠ Authority
Narrative ≠ Permission
Intent ≠ Legitimacy
Story ≠ Proof
```

Mobius eliminates this confusion by architectural enforcement.

---

## Authority Model

### The Four Gates

Every privileged action must pass through four gates:

1. **Identity Gate (Ledger ID)**
   - Cryptographic identity verification
   - Registered on Mobius Ledger
   - Verifiable history

2. **Economic Gate (Wallet Stake)**
   - Locked stake / MIC
   - Slashing risk accepted
   - Skin in the game

3. **Epistemic Gate (Companion Attestation)**
   - EPICON-01 compliant justification
   - Multi-anchor reasoning
   - Explicit boundaries and counterfactuals

4. **Scope Gate (AVM Verification)**
   - RBAC/ABAC permissions
   - Time-bounded (≤ 90 days)
   - Risk classification

---

## Governance Structure

### Two-House Model

- **Concord Council**: Ethics, policy, anti-capture
- **Technical Steering Committee (TSC)**: Kernel, reference implementations, releases

### Working Groups

- Security
- Attestation
- Federation
- Education

### Public RFCs

Required for:
- Kernel changes
- Attestation format changes
- MII/MIC specification changes

### Integrity Gates

Any live artifact must pass:
- MII ≥ 0.95
- Signed CI attestation
- Sentinel review (if applicable)

---

## Consensus Flow

The canonical 90-day consensus flow:

```
Developer → Companion Attestation → AVM Verification → Ledger Proposal → Quorum Vote → Conditional Execution
```

Key properties:
- All authority expires automatically
- Drift triggers immediate revocation
- Full audit trail maintained

See: [CONSENSUS_AUTH_FLOW.md](./CONSENSUS_AUTH_FLOW.md)

---

## Security Boundaries

### Sandbox vs. Authority Layer

| Layer | Roleplay | Authority Claims | State Mutations |
|-------|----------|------------------|-----------------|
| **Sandbox** | ✅ Permitted | ❌ Not honored | ❌ Not allowed |
| **Authority** | ❌ Not valid | ✅ After verification | ✅ With audit |

See: [ROLEPLAY_SANDBOX_RULE.md](./ROLEPLAY_SANDBOX_RULE.md)

---

## Threat Protection

Mobius governance protects against:

| Threat | Mitigation |
|--------|------------|
| Authority Roleplay | AVM verification, sandbox containment |
| Context Smuggling | CCR validation, explicit boundaries |
| Preference Capture | EPICON-01 constraints, multi-anchor requirement |
| Permanent Power | 90-day expiration, automatic revocation |
| Identity Cosplay | Cryptographic proof, no verbal authority |

See: [THREAT_MODEL_EPISTEMIC_ATTACKS.md](../../06-OPERATIONS/security/THREAT_MODEL_EPISTEMIC_ATTACKS.md)

---

## On-Chain Analogy: How Mobius Mirrors Blockchain Invariants

Mobius governance follows the same structural principles that make blockchains resilient—applied to authority instead of money.

### Concept Mapping

| Blockchain Concept | Mobius Equivalent |
|--------------------|-------------------|
| Wallet Address | Ledger ID |
| Private Key | Wallet Signature |
| Transaction | Attested Action |
| Mempool | Pending Proposal |
| Block Inclusion | Consensus Approval |
| On-Chain History | Immutable Ledger Record |
| Whale Movement | Authority Divergence |
| Market Reaction | Community Revocation / Scope Collapse |

### Key Parallel

Blockchains do not prevent large actors from acting.  
They make actions **visible, attributable, and irreversible**.

Mobius does the same for governance:
- **No anonymous authority**
- **No silent escalation**
- **No retroactive justification**

### Critical Difference

| System | What It Tracks |
|--------|----------------|
| **Bitcoin** | State change |
| **Mobius** | State change **plus intent** |

Every Mobius action is linked to:
- a justification,
- a scope,
- a time limit,
- and a responsible identity.

This allows the community to **observe divergence in real time**, not after harm occurs.

### Design Principle

> **Transparency does not stop bad behavior.**  
> **It removes the advantage of surprise.**

Mobius inherits this principle and extends it to coordination, governance, and collective decision-making.

See: [Mobius Is Blockchain for Intent](../../public/mobius_blockchain_for_intent.md)

---

## Key Documents

| Document | Purpose | Location |
|----------|---------|----------|
| Consensus Authority Flow | Full authority verification sequence | [CONSENSUS_AUTH_FLOW.md](./CONSENSUS_AUTH_FLOW.md) |
| Roleplay Sandbox Rule | Hard boundary enforcement | [ROLEPLAY_SANDBOX_RULE.md](./ROLEPLAY_SANDBOX_RULE.md) |
| AVM Specification | Authority Verification Module | [AVM.md](../../authority/AVM.md) |
| Companion Attestation Schema | JSON Schema for attestations | [companion_attestation.schema.json](../../authority/companion_attestation.schema.json) |
| EPICON-01 | Epistemic constraint specification | [EPICON-01.md](../../epicon/EPICON-01.md) |
| EPICON-02 | Intent publication & divergence protocol | [EPICON-02.md](../../epicon/EPICON-02.md) |
| Epistemic Threat Model | Security threat documentation | [THREAT_MODEL_EPISTEMIC_ATTACKS.md](../../06-OPERATIONS/security/THREAT_MODEL_EPISTEMIC_ATTACKS.md) |
| Blockchain for Intent Essay | Conceptual foundation | [mobius_blockchain_for_intent.md](../../public/mobius_blockchain_for_intent.md) |

---

## Final Governance Axiom

> **Mobius systems do not trust stories.**  
> **They verify identity, stake, scope, and meaning — then expire authority automatically.**

---

## Document Control

**Version History:**
- v1.0.0: Canonical governance overview (C-151)

**License:** Apache 2.0 + Ethical Addendum

---

*"We heal as we walk."* — Mobius Systems
