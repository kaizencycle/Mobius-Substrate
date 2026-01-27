# MIC Incentives for Contributors (v0)

**Sustainable civic participation through integrity economics.**

This document defines how MIC (Governance Integrity Credits) rewards verified integrity work in the Mobius ecosystem.

---

## Core Philosophy

> MIC is minted for verified integrity work.
> Not popularity. Not hype. Not volume.

MIC incentivizes:
- Quality over quantity
- Accuracy over speed
- Documentation over promotion
- Patience over reaction

---

## MIC Categories

### Build MIC

**Awarded for**: Code contributions that improve the system.

| Action | MIC Award | Requirements |
|--------|-----------|--------------|
| Bug fix with tests | +10 | Merged PR, tests pass |
| Feature implementation | +25 | Merged PR, documented |
| Performance improvement | +15 | Benchmarks required |
| Test coverage increase | +10 | Verified coverage gain |
| Security fix | +30 | Verified vulnerability addressed |

### Guard MIC

**Awarded for**: Security, testing, and quality assurance work.

| Action | MIC Award | Requirements |
|--------|-----------|--------------|
| Security review completed | +20 | Documented findings |
| Threat model documentation | +25 | Council-approved |
| Penetration test (authorized) | +30 | Report submitted |
| CI/CD improvement | +15 | Verified build improvement |
| Code review (thorough) | +5 | Quality feedback provided |

### Memory MIC

**Awarded for**: Documentation, knowledge preservation, and onboarding.

| Action | MIC Award | Requirements |
|--------|-----------|--------------|
| Documentation improvement | +10 | Merged, verified accurate |
| Architecture diagram | +15 | Peer-reviewed |
| Onboarding guide | +20 | Tested by new contributor |
| Historical annotation | +5 | Adopted by memory system |
| Tutorial or example | +15 | Functional, documented |

### Civic MIC

**Awarded for**: Governance participation and community stewardship.

| Action | MIC Award | Requirements |
|--------|-----------|--------------|
| Validated oversight report | +10 | Confirmed by review |
| Pattern analysis (cited) | +25 | Referenced in council decision |
| Dispute mediation | +20 | Successful resolution |
| Governance participation | +5 | Active, constructive engagement |
| RFC authorship | +30 | Adopted proposal |

---

## MIC Burns

MIC is burned (removed) for actions that harm integrity.

### Burn Events

| Action | MIC Burn | Notes |
|--------|----------|-------|
| PR breaks build (avoidable) | -5 | If tests were available but not run |
| Policy bypass attempt | -25 | Detected by ZEUS |
| Security negligence | -30 | Preventable vulnerability introduced |
| False evidence submission | -50 | Bad-faith oversight report |
| Repeated low-quality PRs | -10 | 3+ rejected in 30 days |
| Harassment or targeting | -100 | Possible permanent action |

### Burn Protection

No burns for:
- Good-faith mistakes with quick fix
- Legitimate disagreement
- Edge cases not covered by tests
- Inherited problems from dependencies

---

## MIC Properties (v0)

### Current Status

| Property | v0 Value | Notes |
|----------|----------|-------|
| Transferable | No | Internal credits only |
| Tradeable | No | Not on any exchange |
| Redeemable | Limited | Governance weight only |
| Speculative | No | No market value |

### v0 Purpose

During v0, MIC functions as:
- Internal civic credit
- Governance participation weight
- Contribution recognition
- Historical record

MIC is explicitly **non-speculative** in v0.

---

## Earning Limits

To prevent gaming:

| Period | Maximum Earnable | Rationale |
|--------|------------------|-----------|
| Daily | 100 MIC | Prevents burst gaming |
| Weekly | 400 MIC | Encourages sustained work |
| Monthly | 1,000 MIC | Caps concentration |

### Exceptions

- Emergency security fixes: No cap
- Council-authorized work: Higher limits
- Major architectural contributions: Review-based

---

## MIC Governance Weight

MIC holdings influence governance participation:

| MIC Holdings | Governance Weight | Capabilities |
|--------------|-------------------|--------------|
| 0 - 99 | Observer | Read, comment |
| 100 - 499 | Participant | Vote on standard items |
| 500 - 999 | Delegate | Vote + propose amendments |
| 1,000+ | Steward eligible | Full governance rights |

### Weight Decay

Governance weight decays if:
- No contribution in 90 days: 10% decay
- No contribution in 180 days: 25% decay
- No contribution in 365 days: 50% decay

---

## Verification Requirements

MIC is only awarded after verification:

### Code Contributions

1. PR merged to main branch
2. CI passes (all tests green)
3. Review approval recorded
4. No post-merge reverts (7 day hold)

### Documentation

1. PR merged
2. Content verified for accuracy
3. No factual corrections needed (30 days)

### Civic Contributions

1. Report/analysis submitted
2. Reviewed by T2+ auditor or steward
3. Confirmed as legitimate
4. Recorded in oversight ledger

---

## MIC Ledger

All MIC transactions are recorded:

```json
{
  "transaction_id": "MIC-2026-001234",
  "type": "mint",
  "category": "build",
  "amount": 25,
  "recipient": "contributor-123",
  "reason": "Feature implementation - dashboard improvements",
  "pr_reference": "PR-456",
  "verified_by": "atlas-sentinel",
  "timestamp": "2026-01-27T10:00:00Z"
}
```

### Auditability

- All mint events are public
- All burn events are public
- Reasoning is recorded
- Appeals possible within 14 days

---

## Future Considerations (Post-v0)

These are **not commitments**, but potential directions:

| Feature | Status | Notes |
|---------|--------|-------|
| MIC transferability | Under discussion | Requires anti-gaming measures |
| MIC redemption | Exploring | For premium features or compute |
| External integration | Future | Bridge to other systems |
| Staking | Considering | For governance commitment |

Any changes require:
- RFC process
- Council approval
- Community comment period
- Gradual rollout

---

## Anti-Gaming Measures

### Sybil Resistance

- Account age requirements
- Contribution history checks
- Anomaly detection
- Pattern analysis

### Quality Filters

- Automated quality scoring
- Human review for high-value awards
- Post-award monitoring
- Clawback for discovered fraud

### Velocity Limits

- Rate limits on awards
- Cool-down periods
- Burst detection
- Cross-account analysis

---

## The Incentive Contract

By earning MIC:

1. **I understand** MIC reflects verified integrity work
2. **I accept** that gaming attempts will be detected and penalized
3. **I acknowledge** that MIC is non-speculative in v0
4. **I agree** that the system may evolve with community input
5. **I commit** to earning MIC through genuine contribution

---

## Related Documents

- [README.md](./README.md) - System overview
- [MICROCOPY.md](./MICROCOPY.md) - Dashboard language
- [TRUST_SCORES.md](./TRUST_SCORES.md) - Reputation system
- [../MIC_SPEC.md](../MIC_SPEC.md) - Technical specification

---

*"MIC rewards care, not volume."*
