# Mobius Integrity Credit (MIC) Specification v0.1

MIC is **reputation capital**, not currency.

---

## Issuance Rules (How MIC Is Earned)

| Action | MIC Awarded | Rationale |
|--------|-------------|-----------|
| **Create EPICON attestation** | +1 | Captures intent; creates audit trail |
| **Pass Sentinel review (no flags)** | +2 | Demonstrates quality and clarity |
| **Merge PR with >=2 human sign-offs** | +5 | Shows collaborative legitimacy |
| **Flag a policy violation** | +3 | Reward protective friction |
| **Contribute to pilot case study** | +10 | Empirical proof is scarce |
| **Propose MIC utility improvement** | +2 | Governance iteration |

**Issuance is ledgered in `apps/indexer-api/` and immutable.**

---

## Burn/Slash Rules (How MIC Is Lost)

| Behavior | MIC Penalty | Trigger |
|----------|-------------|---------|
| **False attestation** | -20 (slash) | Deliberately falsified EPICON metadata |
| **Override without rationale** | -10 | Used emergency override, no EPICON within 24h |
| **Sybil boosting** | -50 + ban | Creating fake identities to inflate MIC |
| **Inactivity decay** | -1/week | After 90 days of zero contributions |

**Slashing requires dual-sentinel flag + human review.**

---

## Sybil Resistance (Identity Model)

**v0.1 (Simple)**: Identity tied to GitHub SSO + attestation history. Sybil resistance is social: meaningful MIC accumulation requires consistent, cross-validated contributions.

**v0.2 (Future)**: Optional stake of work (compute contributions, verified org membership).

---

## MIC Utilities (What You Can Spend MIC On)

### Utility 1: Priority Review Lane
- **Cost**: 10 MIC
- **Benefit**: Sentinel review completes in <1 hour instead of <24 hours
- **Rationale**: Reputation buys throughput, not correctness

### Utility 2: Governance Vote Weight
- **Cost**: None (passive)
- **Benefit**: 1 MIC = 1 vote weight in RFCs for EPICON changes, threshold adjustments
- **Rationale**: Reputation capital = governance influence

### Utility 3: Staging Auto-Deploy
- **Cost**: 50 MIC
- **Benefit**: If change passes Sentinel review, auto-deploy to staging (prod still requires human)
- **Rationale**: Reputation earns autonomy on low-risk environments

### Utility 4: Case Study Co-Authorship
- **Cost**: 100 MIC
- **Benefit**: Co-author published pilot case study; name listed in `docs/pilots/`
- **Rationale**: Reputation earns public recognition

---

## Decay Mechanism

**Linear decay**: -1 MIC/week after 90 days inactivity.

**Purpose**: Prevent reputation hoarding; ensure active participants maintain influence.

---

## External Value (Explicit Statement)

MIC is **non-transferable, non-convertible, non-tradable**. Violating this voids attestation history. MIC's value is **internal legitimacy**, not market price.

**If you want to "cash out," you co-author a case study and add it to your resume.**

---

## Implementation Status

| Component | Status | Location |
|-----------|--------|----------|
| Issuance ledger | Planned | `apps/indexer-api/` |
| Burn/slash logic | Planned | `packages/integrity-core/` |
| Decay cron | Planned | `services/mic-decay/` |
| Utility gates | Planned | `packages/civic-sdk/` |

---

## Related Documents

- [What Mobius Is Not](./WHAT_MOBIUS_IS_NOT.md) - Category constraints
- [MII Calibration](./MII_CALIBRATION.md) - How MIC interacts with integrity scoring
- [Sentinel Evaluation Protocol](./SENTINEL_EVAL_PROTOCOL.md) - How sentinels award/flag MIC
