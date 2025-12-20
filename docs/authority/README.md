# Authority Verification Documentation

This directory contains specifications for the Mobius Authority Verification system.

## Overview

Authority in Mobius is **proven, scoped, time-bounded, and witnessed — never narrated**.

The Authority Verification Module (AVM) ensures that all privileged operations require cryptographic proof of identity, economic stake, and epistemic verification through AI Companion attestation.

## Contents

| Document | Description |
|----------|-------------|
| [AVM.md](./AVM.md) | Authority Verification Module specification |
| [companion_attestation.schema.json](./companion_attestation.schema.json) | JSON Schema for Companion attestations |

## Core Principles

1. **No Narrative Authority**: Language claims have zero authority weight
2. **Cryptographic Proof**: All authority requires verifiable signatures
3. **Economic Stake**: Authority requires locked stake with slashing risk
4. **Epistemic Verification**: Companion attestation with EPICON-01 compliance
5. **Temporal Limits**: Maximum 90-day authority grants
6. **Automatic Expiration**: No permanent authority exists

## Related Documentation

- [Consensus Authority Flow](../03-GOVERNANCE-AND-POLICY/governance/CONSENSUS_AUTH_FLOW.md)
- [Roleplay Sandbox Rule](../03-GOVERNANCE-AND-POLICY/governance/ROLEPLAY_SANDBOX_RULE.md)
- [EPICON-01 Specification](../epicon/EPICON-01.md)
- [Epistemic Threat Model](../06-OPERATIONS/security/THREAT_MODEL_EPISTEMIC_ATTACKS.md)

## Security

For security concerns related to authority verification, see:
- [Threat Model: Epistemic Attacks](../06-OPERATIONS/security/THREAT_MODEL_EPISTEMIC_ATTACKS.md)

---

*"Authority is cryptographic + scoped + time-bounded — never inferred from language."*
