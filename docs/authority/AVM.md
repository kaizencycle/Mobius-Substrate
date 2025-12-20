# Authority Verification Module (AVM)

**Version:** 1.0.0  
**Status:** Canonical  
**Cycle:** C-151  
**Classification:** Core Security Infrastructure

---

## 1. Purpose

The Authority Verification Module (AVM) is the cryptographic + contextual authority gate for all privileged operations in Mobius Systems.

**Core Principle:**
> **Authority is cryptographic + scoped + time-bounded — never inferred from language.**

---

## 2. Design Philosophy

AVM enforces the rule that **narrative claims have zero authority weight**.

- A user saying "I'm an admin" has **zero** authority value
- A user with verified Ledger ID + wallet signature + Companion attestation has **verified** authority
- Authority must be **proven**, not **claimed**

---

## 3. Input Requirements

AVM accepts and validates the following inputs:

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `ledger_id` | UUID | ✔ | Registered identity on Mobius Ledger |
| `wallet_signature` | Hex string | ✔ | Cryptographic signature from bonded wallet |
| `companion_attestation` | Object | ✔ | EPICON-compliant attestation from AI Companion |
| `requested_scopes` | Array | ✔ | Permissions being requested |
| `proof_of_control` | Object | ○ | Infrastructure/API control proof (if applicable) |
| `risk_classification` | Enum | ○ | Self-declared risk level |

---

## 4. Validation Pipeline

### 4.1 Stage 1: Identity Verification

```
INPUT: ledger_id
VERIFY:
  - ID exists in Ledger
  - ID is not revoked
  - ID has positive reputation score
OUTPUT: identity_context
```

### 4.2 Stage 2: Stake Verification

```
INPUT: wallet_signature, ledger_id
VERIFY:
  - Signature matches Ledger ID
  - Wallet has sufficient stake locked
  - Slashing conditions accepted
OUTPUT: stake_context
```

### 4.3 Stage 3: Companion Attestation Verification

```
INPUT: companion_attestation
VERIFY:
  - Attestation is validly signed
  - EJ hash is present and valid
  - Scope matches requested scopes
  - Expiry is ≤ 90 days
  - Risk level is appropriate
OUTPUT: epistemic_context
```

### 4.4 Stage 4: Scope Authorization

```
INPUT: requested_scopes, identity_context
VERIFY:
  - Scopes are within RBAC/ABAC permissions
  - No prohibited scope combinations
  - Scope escalation rules satisfied
OUTPUT: scope_context
```

### 4.5 Stage 5: Time Binding

```
INPUT: requested_duration
VERIFY:
  - Duration ≤ 90 days
  - Expiry timestamp generated
OUTPUT: temporal_context
```

---

## 5. Output Schema

AVM produces an `authority_context` object:

```json
{
  "verified": true,
  "ledger_id": "uuid",
  "scopes": ["api.read", "api.deploy.staging"],
  "expires_at": "2025-03-20T00:00:00Z",
  "risk_level": "medium",
  "attestation_hash": "sha256:...",
  "stake_locked": 1000,
  "created_at": "2024-12-20T00:00:00Z",
  "validation_chain": [
    "identity:pass",
    "stake:pass",
    "attestation:pass",
    "scope:pass",
    "temporal:pass"
  ]
}
```

### 5.1 Failure Output

```json
{
  "verified": false,
  "error": "attestation_invalid",
  "error_detail": "Companion attestation signature verification failed",
  "failed_at_stage": "attestation",
  "remediation": "Request new attestation from registered Companion"
}
```

---

## 6. Integration Points

### 6.1 With Ledger

```
AVM ←→ Ledger
- Query identity status
- Verify stake locks
- Record authority grants
- Log all verification attempts
```

### 6.2 With Companion

```
AVM ←→ Companion
- Receive attestations
- Verify EJ hashes
- Check scope alignment
- Monitor drift signals
```

### 6.3 With Execution Layer

```
AVM ←→ Execution
- Provide authority_context
- Enforce scope limits
- Trigger auto-expiration
- Handle revocation
```

---

## 7. RBAC/ABAC Policy

### 7.1 Role-Based Access Control (RBAC)

| Role | Base Scopes |
|------|-------------|
| `viewer` | `api.read` |
| `contributor` | `api.read`, `api.write.draft` |
| `deployer` | `api.read`, `api.write`, `api.deploy.staging` |
| `admin` | `api.*` (with additional attestation) |

### 7.2 Attribute-Based Access Control (ABAC)

| Attribute | Effect |
|-----------|--------|
| `reputation >= 0.9` | Unlock advanced scopes |
| `stake >= 10000` | Unlock production deployment |
| `attestation_count >= 5` | Reduced verification frequency |
| `drift_score <= 0.1` | Automatic renewal eligible |

---

## 8. Expiration and Renewal

### 8.1 Automatic Expiration

All authority grants expire automatically:

- **Maximum duration:** 90 days
- **No exceptions**
- **No permanent grants**

### 8.2 Renewal Process

To renew authority:

1. Submit new Companion attestation
2. Verify stake still locked
3. Check drift score (must be ≤ 0.1)
4. Generate new authority_context

### 8.3 Early Revocation

Authority is revoked immediately if:

- Stake is withdrawn
- Drift threshold exceeded
- Integrity violation detected
- Companion signals concern

---

## 9. Security Properties

| Property | Enforcement |
|----------|-------------|
| **No narrative authority** | Language claims have zero weight |
| **Cryptographic proof** | All authority requires signatures |
| **Temporal limits** | Maximum 90-day grants |
| **Economic accountability** | Stake + slashing risk |
| **Epistemic verification** | Companion attestation required |
| **Full auditability** | All operations logged |
| **Automatic revocation** | Drift triggers immediate revocation |

---

## 10. API Reference

### 10.1 Verify Authority

```
POST /avm/verify
Content-Type: application/json

{
  "ledger_id": "uuid",
  "wallet_signature": "hex",
  "companion_attestation": { ... },
  "requested_scopes": ["api.read", "api.deploy.staging"]
}

Response:
{
  "verified": true,
  "authority_context": { ... }
}
```

### 10.2 Check Authority

```
GET /avm/check/{ledger_id}

Response:
{
  "has_authority": true,
  "scopes": ["api.read"],
  "expires_at": "2025-03-20T00:00:00Z"
}
```

### 10.3 Revoke Authority

```
POST /avm/revoke
Content-Type: application/json

{
  "ledger_id": "uuid",
  "reason": "integrity_violation",
  "evidence_hash": "sha256:..."
}

Response:
{
  "revoked": true,
  "revoked_at": "2024-12-20T12:00:00Z"
}
```

---

## 11. Error Codes

| Code | Meaning | Remediation |
|------|---------|-------------|
| `AVM_001` | Ledger ID not found | Register identity first |
| `AVM_002` | Wallet signature invalid | Re-sign with correct key |
| `AVM_003` | Attestation expired | Request new Companion attestation |
| `AVM_004` | Attestation signature invalid | Verify Companion registration |
| `AVM_005` | Scope not permitted | Request appropriate role |
| `AVM_006` | Duration exceeds maximum | Request ≤ 90 days |
| `AVM_007` | Insufficient stake | Lock additional stake |
| `AVM_008` | Drift threshold exceeded | Address drift before renewal |

---

## 12. Implementation Notes

### 12.1 Cryptographic Requirements

- **Signatures:** Ed25519 or ECDSA (secp256k1)
- **Hashes:** SHA-256
- **Key derivation:** BIP-32/BIP-44 compatible

### 12.2 Performance Considerations

- Cache identity lookups (TTL: 5 minutes)
- Batch attestation verification
- Async stake verification for non-blocking flow

### 12.3 High Availability

- AVM is a critical path component
- Requires redundant deployment
- Fallback: deny-by-default on AVM unavailability

---

## 13. Related Documents

| Document | Location |
|----------|----------|
| Consensus Authority Flow | [`/docs/03-GOVERNANCE-AND-POLICY/governance/CONSENSUS_AUTH_FLOW.md`](../03-GOVERNANCE-AND-POLICY/governance/CONSENSUS_AUTH_FLOW.md) |
| Roleplay Sandbox Rule | [`/docs/03-GOVERNANCE-AND-POLICY/governance/ROLEPLAY_SANDBOX_RULE.md`](../03-GOVERNANCE-AND-POLICY/governance/ROLEPLAY_SANDBOX_RULE.md) |
| EPICON-01 Specification | [`/docs/epicon/EPICON-01.md`](../epicon/EPICON-01.md) |
| Companion Attestation Schema | [`companion_attestation.schema.json`](./companion_attestation.schema.json) |
| Epistemic Threat Model | [`/docs/06-OPERATIONS/security/THREAT_MODEL_EPISTEMIC_ATTACKS.md`](../06-OPERATIONS/security/THREAT_MODEL_EPISTEMIC_ATTACKS.md) |

---

## Document Control

**Version History:**
- v1.0.0: Initial AVM specification (C-151)

**License:** Apache 2.0 + Ethical Addendum

---

*"Authority is cryptographic + scoped + time-bounded — never inferred from language."*  
— AVM Core Principle
