# Governance (v2)

**Two-house model:**
• **Concord Council** (ethics, policy, anti-capture)
• **TSC** (kernel, reference impls, releases)

**Working Groups:** Security, Attestation, Federation, Education.
**Public RFCs:** required for kernel, attestation, MII/MIC spec changes.
**Integrity Gates:** Any live artifact must pass MII ≥ 0.95 and signed CI attestation.

## Governance Structure

### Concord Council
- 7 seats, 1-year staggered terms
- Oversees ethics, policy, licensing, anti-capture
- See `docs/governance/council.md`

### Technical Steering Committee (TSC)
- 5–11 maintainers
- Owns technical roadmap, releases, reference implementations
- See `docs/governance/tsc.md`

### Working Groups
- Security WG
- Attestation WG
- Federation WG
- Education & Adoption WG

## Decision-Making

All major protocol changes require:
1. Public RFC (14-day minimum review)
2. TSC technical approval (⅔ supermajority for kernel changes)
3. Council ethical review (7-day veto window)
4. Signed release attestation

## Transparency Commitments

- All meeting minutes published within 7 days
- RFCs publicly visible at `docs/governance/rfc_index.md`
- Release artifacts signed with Sigstore
- Quarterly transparency reports

## Conflict Resolution

1. Technical disputes → TSC vote
2. Ethical disputes → Council vote
3. Deadlock → Joint session; defer to Charter invariants
4. Final appeal → Public RFC + contributor vote
