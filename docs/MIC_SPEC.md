# Mobius Integrity Credits (MIC) — Specification v0.1

MIC is **reputation capital**, not currency. It gates capabilities and weights governance within the Mobius ecosystem.

---

## Issuance Rules (How MIC Is Earned)

| Action | MIC Awarded | Rationale |
|--------|------------:|-----------|
| Create EPICON attestation | +1 | Captures intent; creates audit trail |
| Pass Sentinel review (no flags) | +2 | Demonstrates clarity and completeness |
| Merge PR with ≥2 human sign-offs | +5 | Shows collaborative legitimacy |
| Flag a policy violation | +3 | Reward protective friction |
| Contribute to a pilot case study | +10 | Empirical proof is scarce |
| Propose MIC utility improvement | +2 | Governance iteration |

Issuance events are recorded in an **append-only log** (implementation-defined: git log, database, or signed ledger).

---

## Burn / Slash Rules (How MIC Is Lost)

| Behavior | MIC Penalty | Trigger |
|----------|------------:|---------|
| False attestation | -20 (slash) | Deliberately falsified EPICON metadata |
| Override without justification | -10 | Emergency override without EPICON rationale within 24h |
| Sybil attestation | -50 (slash + ban) | Fake identities used to boost MIC |
| Inactivity decay | -1/week | After 90 days of zero contributions |

Slashing requires **dual-sentinel flag + human review**.

---

## Sybil Resistance (Identity Model)

**v0.1:** Identity is tied to GitHub identity + attestation history. Sybil resistance is social: meaningful MIC accumulation requires consistent, cross-validated contributions that are costly to fake.

**v0.2 (optional):** Add verifiable org membership, stake mechanisms, or signed identity attestations.

---

## MIC Utilities (What MIC Unlocks)

MIC is not "spent" like money; it **unlocks privileges** or **weights governance**.

### Utility 1: Priority Review Lane

- **Threshold:** 10 MIC
- **Benefit:** Expedited Sentinel review queue
- **Rationale:** Reputation buys throughput, not correctness

### Utility 2: Governance Vote Weight

- **Benefit:** MIC contributes weight in governance votes for protocol changes (RFCs)
- **Rationale:** Active contributors shape the system

### Utility 3: Sentinel-Sponsored Staging Deployment

- **Threshold:** 50 MIC
- **Benefit:** Auto-deploy to **staging** if Sentinel review passes (production still requires human sign-off)

### Utility 4: Case Study Co-Authorship

- **Threshold:** 100 MIC
- **Benefit:** Co-author a published pilot case study in `pilots/`

---

## Decay Mechanism (Recommended)

Linear decay: **-1 MIC/week** after 90 days of inactivity.

Purpose: prevent reputation hoarding and keep governance weight tied to active participation.

---

## External Value (Explicit Statement)

MIC is **not** transferable, exchangeable, or convertible to external assets.

MIC's value is internal legitimacy, not market price.

---

## Ledger Implementation (v0.1)

MIC issuance and burn events are recorded as:

1. **Git-based log:** Append-only entries in `ledger/mic/` directory
2. **Tamper-evident:** Git history provides audit trail
3. **Machine-readable:** JSON format for tooling

Example ledger entry:

```json
{
  "event_id": "MIC-2026-01-24-001",
  "type": "issuance",
  "recipient": "github:username",
  "amount": 5,
  "reason": "PR merge with ≥2 sign-offs",
  "pr_ref": "PR-1234",
  "timestamp": "2026-01-24T12:00:00Z",
  "attested_by": ["sentinel:aurea", "human:reviewer1", "human:reviewer2"]
}
```

---

## Governance of MIC Rules

Changes to MIC issuance, burn, or utility rules require:

- RFC filed in `docs/11-SUPPLEMENTARY/rfcs/`
- 72-hour minimum review window
- ≥2 maintainer approvals
- EPICON documenting intent and rationale

See `docs/RFC_PROCESS.md` for details.

---

## Falsifiability

MIC is useful if:

- Contributors with high MIC are more likely to produce legitimate decisions
- MIC-weighted governance produces better outcomes than unweighted voting
- Decay prevents gaming and keeps governance current

MIC is broken if:

- High-MIC contributors produce worse outcomes
- MIC accumulation becomes an end in itself
- Gaming strategies dominate legitimate contributions

---

*"We heal as we walk." — Mobius Substrate*
