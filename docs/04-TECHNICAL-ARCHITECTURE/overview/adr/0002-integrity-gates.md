# ADR 0002: Integrity Gates and Safe-Stop Policy

- Status: Accepted
- Date: 2025-11-09

## Context

The Mobius Integrity Index (MII) is the primary guardrail for deploying or sustaining services. Historical incidents showed drift when low-scoring services were left online during remediation. The Perplexity review called for Tier-1 enforcement of GI ≥ 0.95.

## Decision

Establish repository-wide integrity gates:

- **Threshold:** Services must maintain MII ≥ 0.95; documentation-only changes operate at ≥ 0.90.
- **Safe-stop:** Automatic quarantine triggers when threshold violated for two consecutive windows.
- **Healing Loop:** Quarantined services emit a Sentinel PR and must demonstrate recovered MII before reactivation.
- **Consensus Link:** Ledger attestation batches validate GI scores and sign-off from Thought Broker.

## Consequences

- CI/CD scripts must fail fast when MII reports drop below threshold.
- Operators gain a deterministic path to halt compromised services.
- Lower tier services cannot bypass gates without explicit ADR superseding this policy.
