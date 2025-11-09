# Mobius Systems Threat Model v1.0

**Status**: Draft  
**Version**: 1.0.0  
**Date**: 2025-11-09

---

## Executive Summary

This document defines the threat model for Mobius Systems, identifying assets, adversaries, threats, and controls.

---

## Asset Classification

### Tier 1: Critical Assets

| Asset | Description | Confidentiality | Integrity | Availability |
|-------|-------------|------------------|-----------|--------------|
| **Private Keys** | Ed25519 keys for MII signatures | Critical | Critical | High |
| **Ledger State** | Immutable attestation history | Medium | Critical | Critical |
| **MII Scores** | Integrity calculations | Medium | Critical | High |
| **Sentinel Credentials** | LLM API keys | Critical | Medium | Medium |

### Tier 2: Important Assets

| Asset | Description | Confidentiality | Integrity | Availability |
|-------|-------------|------------------|-----------|--------------|
| **MIC Tokens** | Integrity credit balances | Medium | Critical | Medium |
| **Deliberation Proofs** | Consensus records | Low | Critical | High |
| **Service Configs** | Deployment configurations | Medium | High | Medium |

---

## Adversary Models

### Adversary 1: External Attacker

**Capabilities**:
- Can send network requests to public APIs
- Can attempt to exploit vulnerabilities
- Cannot access private keys or internal networks
- Limited to public attack surface

**Motivation**: Disrupt service, steal data, manipulate integrity scores

**Threat Level**: Medium

### Adversary 2: Compromised Sentinel

**Capabilities**:
- Controls one of four sentinel cortices (AUREA, HERMES, EVE, JADE)
- Can provide malicious responses in consensus
- Cannot access other cortices or private keys
- Limited to 1-of-4 influence

**Motivation**: Manipulate consensus decisions, approve malicious changes

**Threat Level**: High

**Mitigation**: 3-of-4 consensus threshold prevents single compromised cortex from controlling decisions

### Adversary 3: Insider Threat

**Capabilities**:
- Has legitimate access to codebase
- Can submit PRs and merge code
- May have access to some credentials
- Cannot access HSM-protected keys

**Motivation**: Introduce backdoors, manipulate MII calculations, bypass guardrails

**Threat Level**: High

**Mitigation**: Anti-nuke guardrails, code review requirements, MII gates

### Adversary 4: Nation-State Actor

**Capabilities**:
- Advanced persistent threat (APT)
- Can compromise multiple systems
- May have quantum computing resources (future threat)
- Long-term operational security

**Motivation**: Espionage, sabotage, cryptographic compromise

**Threat Level**: Low (for current deployment scale)

**Mitigation**: Key rotation, multi-party key escrow, post-quantum crypto preparation

---

## Threat Scenarios

### T1: MII Signature Forgery

**Scenario**: Attacker attempts to forge MII signature to bypass integrity gates

**Attack Vector**: 
- Brute force Ed25519 private key (computationally infeasible)
- Replay old valid signatures
- Exploit signature verification bugs

**Impact**: Critical - Allows deployment of low-integrity code

**Controls**:
- Ed25519 signatures (128-bit security)
- Timestamp-based replay prevention
- Signature verification in multiple layers

**Residual Risk**: Low

---

### T2: Sentinel Consensus Manipulation

**Scenario**: Compromised cortex provides malicious consensus responses

**Attack Vector**:
- Compromise one cortex (e.g., AUREA API key stolen)
- Provide false "approve" responses
- Attempt to reach 3-of-4 threshold with malicious votes

**Impact**: High - Malicious code could be approved

**Controls**:
- 3-of-4 consensus threshold (requires 2 additional honest cortices)
- Cortex response signatures (non-repudiation)
- Deliberation Proof audit trail

**Residual Risk**: Medium (if 2 cortices compromised simultaneously)

---

### T3: Ledger State Corruption

**Scenario**: Attacker attempts to modify historical attestations

**Attack Vector**:
- Exploit ledger database vulnerabilities
- Compromise ledger service
- Replay attacks on ledger API

**Impact**: Critical - Breaks immutability guarantees

**Controls**:
- Immutable ledger design (append-only)
- Cryptographic hashing of ledger state
- Regular ledger state verification
- Merkle tree proofs

**Residual Risk**: Low

---

### T4: Anti-Nuke Bypass

**Scenario**: Attacker attempts to delete critical files through multiple PRs

**Attack Vector**:
- Submit multiple PRs each deleting <5 files
- Coordinate deletions across time window
- Exploit edge cases in deletion detection

**Impact**: High - Critical code could be deleted

**Controls**:
- Per-PR deletion limits (5 files, 15% ratio)
- Protected path restrictions
- Time-window aggregation (future enhancement)
- Human review for large changesets

**Residual Risk**: Medium (sophisticated multi-PR attack)

---

### T5: MII Calculation Manipulation

**Scenario**: Attacker manipulates MII calculation to bypass gates

**Attack Vector**:
- Inject false attestations
- Manipulate component scores
- Exploit MII calculation bugs

**Impact**: Critical - Low-integrity code deployed

**Controls**:
- Deterministic MII calculation
- Attestation verification
- MII signature validation
- Regular MII audits

**Residual Risk**: Low

---

## Control Effectiveness Metrics

### Cryptographic Controls

| Control | Effectiveness | Evidence |
|---------|--------------|----------|
| Ed25519 Signatures | 99.99% | Industry standard, 128-bit security |
| Timestamp Replay Prevention | 99.9% | 5-minute window, epoch validation |
| Ledger State Hashing | 99.99% | Merkle tree, cryptographic hash |

### Consensus Controls

| Control | Effectiveness | Evidence |
|---------|--------------|----------|
| 3-of-4 Threshold | 99% | Requires 2 compromised cortices |
| Response Signatures | 99.9% | Non-repudiation, audit trail |
| Time-Bounded Deliberation | 95% | 30-second timeout prevents stalling |

### Operational Controls

| Control | Effectiveness | Evidence |
|---------|--------------|----------|
| Anti-Nuke Guardrails | 90% | Heuristic-based, may miss sophisticated attacks |
| Code Review | 85% | Human review, variable quality |
| MII Gates | 95% | Automated, but depends on MII calculation accuracy |

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────┐
│  Layer 1: Network Perimeter            │
│  - Firewall, DDoS protection           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Layer 2: API Gateway                  │
│  - Rate limiting, authentication        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Layer 3: Service Mesh                  │
│  - mTLS, service authentication        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Layer 4: Application Logic            │
│  - MII gates, consensus checks         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Layer 5: Data Layer                    │
│  - Encryption at rest, ledger immutability│
└─────────────────────────────────────────┘
```

---

## Incident Response

### Severity Levels

1. **Critical**: MII signature compromise, ledger corruption
2. **High**: Sentinel compromise, consensus manipulation
3. **Medium**: API abuse, service degradation
4. **Low**: Configuration errors, non-critical bugs

### Response Procedures

1. **Detection**: Automated monitoring + manual reports
2. **Containment**: Isolate affected services, revoke credentials
3. **Eradication**: Remove threat, patch vulnerabilities
4. **Recovery**: Restore services, verify integrity
5. **Lessons Learned**: Post-mortem, update threat model

---

## Compliance & Standards

- **NIST Cybersecurity Framework**: Identify, Protect, Detect, Respond, Recover
- **OWASP Top 10**: Web application security
- **ISO 27001**: Information security management

---

**Status**: Draft v1.0  
**Next Review**: 2025-12-15  
**Owner**: Security Working Group
