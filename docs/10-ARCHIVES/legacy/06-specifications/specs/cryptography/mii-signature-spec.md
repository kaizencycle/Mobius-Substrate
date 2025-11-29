# MII Signature Specification v1.0

**Status**: Draft  
**Version**: 1.0.0  
**Date**: 2025-11-09

---

## Overview

This specification defines the cryptographic scheme for signing and verifying Mobius Integrity Index (MII) scores. MII signatures provide cryptographic proof that an integrity score was calculated correctly and has not been tampered with.

---

## Cryptographic Primitives

### Signature Scheme: Ed25519

**Rationale**: 
- Fast signature generation and verification
- Small signature size (64 bytes)
- Strong security guarantees (128-bit security level)
- Widely supported and audited

**Key Generation**:
```python
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

private_key = Ed25519PrivateKey.generate()
public_key = private_key.public_key()
```

**Key Format**:
- Private key: 32 bytes (RFC 8032 format)
- Public key: 32 bytes (RFC 8032 format)
- Signature: 64 bytes

---

## MII Calculation (Deterministic)

### Input Components

MII is calculated from four components with fixed weights:

```typescript
interface MIIComponents {
  modelIntegrity: number;    // α = 0.35
  epochStability: number;        // β = 0.25
  humanConsensus: number;        // γ = 0.25
  resilience: number;            // δ = 0.15
}

const MII = 
  0.35 * modelIntegrity +
  0.25 * epochStability +
  0.25 * humanConsensus +
  0.15 * resilience;
```

### Deterministic Requirements

1. **Fixed-Point Arithmetic**: All calculations use fixed-point decimal (4 decimal places)
2. **Deterministic Sources**: All input data must be from immutable sources (ledger, attestations)
3. **No Randomness**: MII calculation must be fully deterministic given inputs
4. **Reproducibility**: Any node can recalculate MII and get identical result

### Calculation Algorithm

```typescript
function calculateMII(components: MIIComponents, timestamp: string): number {
  // Round to 4 decimal places for determinism
  const mii = Math.round((
    0.35 * components.modelIntegrity +
    0.25 * components.epochStability +
    0.25 * components.humanConsensus +
    0.15 * components.resilience
  ) * 10000) / 10000;
  
  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, mii));
}
```

---

## Signature Generation

### Message Format

The message to be signed includes:
1. MII value (4 decimal places)
2. Timestamp (ISO 8601)
3. Component values (for verification)
4. Ledger state hash (commitment to input data)

```typescript
interface MIIMessage {
  mii: number;                    // 0.0000 to 1.0000
  timestamp: string;              // ISO 8601
  components: MIIComponents;
  ledgerStateHash: string;        // SHA-256 of ledger state
  epoch: number;                  // Epoch number
}

function serializeMIIMessage(msg: MIIMessage): Uint8Array {
  const canonical = JSON.stringify({
    mii: msg.mii.toFixed(4),
    timestamp: msg.timestamp,
    components: {
      modelIntegrity: msg.components.modelIntegrity.toFixed(4),
      epochStability: msg.components.epochStability.toFixed(4),
      humanConsensus: msg.components.humanConsensus.toFixed(4),
      resilience: msg.components.resilience.toFixed(4)
    },
    ledgerStateHash: msg.ledgerStateHash,
    epoch: msg.epoch
  }, Object.keys(msg).sort());
  
  return new TextEncoder().encode(canonical);
}
```

### Signature Process

```typescript
import { sign } from '@noble/ed25519';

async function signMII(
  message: MIIMessage,
  privateKey: Uint8Array
): Promise<MIISignature> {
  const serialized = serializeMIIMessage(message);
  const signature = await sign(serialized, privateKey);
  
  return {
    signature: Buffer.from(signature).toString('base64'),
    publicKey: getPublicKey(privateKey),
    timestamp: message.timestamp,
    mii: message.mii
  };
}
```

---

## Signature Verification

### Verification Process

```typescript
import { verify } from '@noble/ed25519';

async function verifyMII(
  signature: MIISignature,
  expectedMII: number,
  ledgerStateHash: string
): Promise<boolean> {
  // Reconstruct message
  const message: MIIMessage = {
    mii: signature.mii,
    timestamp: signature.timestamp,
    components: await reconstructComponents(signature.timestamp),
    ledgerStateHash: ledgerStateHash,
    epoch: await getEpoch(signature.timestamp)
  };
  
  // Verify signature
  const serialized = serializeMIIMessage(message);
  const sigBytes = Buffer.from(signature.signature, 'base64');
  const pubKeyBytes = Buffer.from(signature.publicKey, 'base64');
  
  return await verify(sigBytes, serialized, pubKeyBytes);
}
```

---

## Key Management

### Key Rotation Policy

1. **Rotation Frequency**: Every 90 days (or on security incident)
2. **Overlap Period**: 7 days (both keys valid during transition)
3. **Key Storage**: Hardware Security Module (HSM) or encrypted key vault
4. **Key Escrow**: Multi-party key escrow (3-of-5 threshold)

### Key Generation

```typescript
interface KeyRotation {
  oldPublicKey: string;
  newPublicKey: string;
  effectiveDate: string;
  expiryDate: string;
}
```

---

## Replay Prevention

### Nonce Mechanism

Each MII signature includes:
1. **Timestamp**: ISO 8601 with millisecond precision
2. **Epoch Number**: Incremental epoch counter
3. **Ledger State Hash**: Commitment to ledger state at time of calculation

### Validation Rules

```typescript
function validateMIISignature(
  signature: MIISignature,
  currentTime: Date,
  currentEpoch: number
): ValidationResult {
  const sigTime = new Date(signature.timestamp);
  const age = currentTime.getTime() - sigTime.getTime();
  
  // Reject signatures older than 5 minutes
  if (age > 5 * 60 * 1000) {
    return { valid: false, reason: 'signature_expired' };
  }
  
  // Reject signatures from future epochs
  if (signature.epoch > currentEpoch) {
    return { valid: false, reason: 'future_epoch' };
  }
  
  return { valid: true };
}
```

---

## Revocation Protocol

### Revocation Conditions

MII signatures can be revoked if:
1. Subsequent audit reveals calculation error
2. Cryptographic key compromise
3. Ledger state corruption detected
4. Integrity degradation discovered

### Revocation Process

```typescript
interface MIIRevocation {
  signatureHash: string;        // SHA-256 of revoked signature
  reason: string;               // Revocation reason code
  revokedBy: string;            // Revoking authority
  timestamp: string;
  revocationSignature: string;  // Signed by revoking authority
}

async function revokeMII(
  signatureHash: string,
  reason: string,
  revokingKey: Uint8Array
): Promise<MIIRevocation> {
  const revocation: MIIRevocation = {
    signatureHash,
    reason,
    revokedBy: getPublicKey(revokingKey),
    timestamp: new Date().toISOString(),
    revocationSignature: ''
  };
  
  const serialized = serializeRevocation(revocation);
  revocation.revocationSignature = await sign(serialized, revokingKey);
  
  // Post to ledger
  await ledger.postRevocation(revocation);
  
  return revocation;
}
```

---

## Security Properties

### Guarantees

1. **Authenticity**: Signature proves MII was calculated by holder of private key
2. **Integrity**: Any modification to MII value invalidates signature
3. **Non-repudiation**: Signer cannot deny creating signature
4. **Freshness**: Timestamp prevents replay attacks
5. **Binding**: Signature binds MII to specific ledger state

### Threat Model

**Adversary Capabilities**:
- Can read public keys and signatures
- Can attempt to forge signatures
- Can attempt replay attacks
- Cannot access private keys (HSM protected)

**Security Level**: 128 bits (Ed25519)

---

## Implementation Requirements

### Libraries

- **Node.js**: `@noble/ed25519` or `crypto` (Node 18+)
- **Python**: `cryptography` library (Ed25519 support)
- **Rust**: `ed25519-dalek`

### Performance Targets

- Signature generation: < 1ms
- Signature verification: < 1ms
- Key generation: < 10ms

---

## Compliance & Standards

- **RFC 8032**: Ed25519 signature scheme
- **FIPS 186-5**: Digital signature standards
- **NIST SP 800-57**: Key management guidelines

---

## References

- [RFC 8032: Ed25519](https://tools.ietf.org/html/rfc8032)
- [Ed25519: High-speed high-security signatures](https://ed25519.cr.yp.to/)
- [NIST SP 800-57: Key Management](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final)

---

**Status**: Draft v1.0  
**Next Review**: 2025-11-20  
**Owner**: Security Working Group

