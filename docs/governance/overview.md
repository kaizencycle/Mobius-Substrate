# Governance Overview

Mobius Systems is governed by a **two-house model** that balances technical excellence with ethical oversight.

## Structure

```
Mobius Systems Foundation
├── Concord Council (Policy & Ethics)
│   ├── 7 seats (community-elected)
│   ├── Quorum: 5/7
│   └── Mandate: Charter compliance, ethics, anti-capture
│
└── Technical Steering Committee (TSC)
    ├── 5 seats (meritocratic)
    ├── Quorum: 3/5
    └── Mandate: Architecture, releases, RFCs
```

## Decision Authority

| Domain | Council | TSC | Both |
|--------|---------|-----|------|
| Charter changes | ✓ | | |
| License/ethics | ✓ | | |
| Anti-capture policy | ✓ | | |
| Kernel architecture | | ✓ | |
| Releases | | ✓ | |
| RFC approval (technical) | | ✓ | |
| RFC approval (ethical) | ✓ | | |
| Budget | | | ✓ |
| Foundation officers | | | ✓ |

## Checks and Balances

### Council Powers
- **Veto** on changes that violate Charter or Ethical Addendum
- **Hard fork trigger** if capture thresholds exceeded
- **Removal** of TSC members for Code of Conduct violations (⅔ vote)

### TSC Powers
- **Technical veto** on proposals that harm integrity or security
- **Emergency releases** for critical vulnerabilities (Council notified within 48h)
- **Specification authority** over MII/MIC protocols

### Neither Can Unilaterally
- Change the license
- Modify anti-capture thresholds
- Remove the other body
- Alter voting/quorum rules

## Transparency Requirements

All governance actions are **public by default**:

- Meeting notes published within 7 days
- Votes recorded with rationale
- RFCs discussed openly on GitHub
- Private sessions only for security/legal (disclosed when safe)

Transparency reports published **quarterly**:
- Votes held and outcomes
- Policy enforcement actions
- Financial summary
- Contributor statistics

## Deadlock Resolution

If Council and TSC cannot agree:

1. **Mediation** (14 days): Neutral facilitator
2. **Community Input** (14 days): Public RFC process
3. **Supermajority** (⅔ of both bodies)
4. **Status Quo** prevails if no resolution

## Term Limits

- **Council**: 2-year terms, max 2 consecutive
- **TSC**: 1-year terms, no consecutive limit
- **Stagger**: Elections offset to ensure continuity

## Eligibility

### Council
- Active contributor for ≥6 months
- No vendor affiliation (employment by Foundation acceptable)
- No current TSC membership

### TSC
- Significant technical contributions
- Demonstrated expertise in kernel/MII/attestation
- No vendor voting control (see Anti-Capture Policy)

## Removal

Members may be removed for:
- Code of Conduct violations (⅔ vote of either body)
- Prolonged inactivity (missed 3 consecutive meetings)
- Conflict of interest violations
- Capture attempts

## Amendment

This governance structure may be amended by:
- **⅔ vote** of both Council and TSC, **AND**
- **14-day** community comment period, **AND**
- **RFC** documenting rationale and alternatives

## Questions?

governance@mobius.systems

See also:
- [Concord Council](council.md)
- [Technical Steering Committee](tsc.md)
- [Elections](elections.md)
- [Quorum Rules](quorum.md)
- [RFC Process](../FOUNDATION/PROCESS/RFC_PROCESS.md)
