# Shard Protocol v1.0

## Purpose
Enable micro-denomination for day-to-day integrity exchange while preserving macro stability.

## Units
- **Base:** Integrity Credit (name-agnostic)
- **Micro:** Shard (₷)
- **Ratio:** **1 Credit = 1,000,000 Shards** (immutable constant)

## Supply
- **CREDIT_CAP:** 21,000,000 (example)
- **SHARD_CAP:** 21,000,000,000,000 (21 trillion)
- **EPOCH:** 90 days (default)

## Conversion

### Formulas
```
shards_to_credit = shards / 1,000,000
credit_to_shards = floor(credit * 1,000,000)
```

### Precision
- Credits: 6 decimal places (micro-precision)
- Shards: Integer values only (no fractional shards)

## Decay & Reabsorption

### Mechanism
- **Epoch decay default:** 0.5% on idle shards per 90-day epoch
- **Idle threshold:** 30 days without movement
- **Reabsorption target:** Integrity Pool for future issuance

### Rationale
Prevents integrity inflation by mimicking ethical thermodynamics:
- Unused value (idle shards) represents unrealized potential
- Decay returns entropy to the system
- Reabsorption enables future proof-of-integrity rewards

## Ledger Semantics

### Balance Structure
```json
{
  "balance": {
    "credits": 12.345678,
    "shards": 345678,
    "total_integrity_value": 12.691356
  },
  "last_activity": "2025-11-04T10:08:00Z",
  "epoch_joined": 1
}
```

### Transaction Format
```json
{
  "from": "did:kaizen:alice",
  "to": "did:kaizen:bob",
  "amount": {
    "credits": 0.5,
    "shards": 500000
  },
  "type": "transfer",
  "gi_score": 0.987,
  "attestation": {
    "human": "sig_alice_...",
    "sentinel": "sig_atlas_..."
  }
}
```

## Governance Hooks

### GI Integration
- **GI affects:** Mint cadence, epoch length, decay rate
- **GI does NOT affect:** Conversion constant (always 1:1,000,000)

### Attestation Requirements
- **Mint operations:** Dual attestation required (human + sentinel)
- **Transfers:** Single signature sufficient
- **Epoch burn:** Automatic (cron job) with sentinel notification

## Security

### Precision Safety
- Use BigInt for shard calculations to prevent overflow
- 64-bit integers support up to 9.2 quintillion shards
- Current cap (21 trillion) leaves 99.77% headroom

### Audit Trail
Every conversion and decay logged to immutable ledger:
```json
{
  "event": "epoch_burn",
  "epoch": 5,
  "shards_decayed": 12500,
  "reabsorbed_to": "integrity_pool",
  "gi_at_burn": 0.993,
  "timestamp": "2025-11-04T00:00:00Z"
}
```

## Implementation Reference
- **Package:** `@civic/integrity-units`
- **Service:** `civic-ledger` (`/convert` endpoints)
- **Config:** `configs/integrity_units.yaml`

---

**Version:** 1.0  
**Status:** Canonical  
**Immutable Constant:** 1 Credit = 1,000,000 Shards
