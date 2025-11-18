# ADR-001: Integrity-First Architecture

**Status**: Accepted  
**Date**: 2025-11-09  
**Deciders**: Technical Steering Committee  
**Tags**: architecture, integrity, design-principle

---

## Context

Traditional systems architecture follows a "trust then verify" model where integrity is checked post-deployment through audits, monitoring, and incident response. This creates a gap between when issues are introduced and when they are detected.

Mobius Systems requires a fundamental shift to "verify then execute" where integrity gates are embedded at every architectural layer.

---

## Decision

We will implement **Integrity-Driven Architecture (IDA)** where:

1. **MII ≥ 0.95 is a hard gate** for all deployments
2. **Integrity checks occur at every layer** (ledger, API, service, agent)
3. **No operation proceeds** if integrity cannot be verified
4. **Self-healing mechanisms** automatically remediate integrity degradation

---

## Consequences

### Positive

- **Proactive Integrity**: Issues caught before deployment
- **Reduced Incidents**: Early detection prevents production failures
- **Audit Trail**: Every decision is cryptographically attested
- **Regulatory Compliance**: Meets requirements for auditable systems

### Negative

- **Deployment Latency**: Integrity checks add 1-5 seconds to deployment
- **Complexity**: Additional infrastructure for integrity verification
- **False Positives**: Legitimate changes may be blocked if MII calculation is conservative

### Risks

- **MII Calculation Errors**: If MII algorithm has bugs, system may incorrectly block/allow
- **Performance Impact**: Integrity checks add computational overhead
- **Key Management**: Cryptographic signatures require secure key storage

---

## Alternatives Considered

### Alternative 1: Post-Deployment Auditing

**Rejected**: Does not prevent issues, only detects them after the fact.

### Alternative 2: Optional Integrity Checks

**Rejected**: Optional checks are often skipped under time pressure.

### Alternative 3: Integrity as Advisory Metric

**Rejected**: Advisory metrics do not provide enforcement guarantees.

---

## Implementation Notes

- MII gates implemented in CI/CD pipeline
- Ledger enforces MII threshold before accepting attestations
- Sentinels monitor MII in real-time and trigger safe-stop if threshold breached

---

**Related ADRs**: ADR-002 (Model-Agnostic Sovereignty), ADR-003 (Four-Cortex Design)

