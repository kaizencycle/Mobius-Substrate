# MIC/KS Denomination Protocol Specification

> **Version:** 1.0.0 | **Cycle:** C-151 | **Status:** Production

## Overview

This specification defines the formal denomination protocol for Mobius Integrity Credits (MIC) and Kaizen Shards (KS).

## Core Definitions

### MIC (Mobius Integrity Credit)

- **Symbol:** MIC
- **Full Name:** Mobius Integrity Credit
- **Type:** Fungible integrity-backed currency
- **Decimal Precision:** 6
- **Minimum Value:** 0.000001 MIC

### KS (Kaizen Shards)

- **Symbol:** KS
- **Full Name:** Kaizen Shard
- **Type:** Smallest indivisible MIC subdivision
- **Decimal Precision:** 0 (integer only)
- **Minimum Value:** 1 KS

## Denomination Ratio

```
1 MIC = 1,000,000 KS (exactly)
1 KS  = 0.000001 MIC (exactly)
```

## Integer Model

All transfers and ledger operations settle in KS (integer):

```typescript
transfer_ks = Math.round(mic * 1_000_000)
```

## Validation Rules

### MIC Validation

1. MIC must be ≥ 0
2. MIC max precision = 6 decimals
3. MIC must be representable as: `ks / 1_000_000`

### KS Validation

1. KS must be integer
2. KS must be ≥ 0
3. KS must satisfy: `ks === Math.floor(mic * 1_000_000)`

### Ledger Enforcement

```typescript
assert(ks === Math.floor(mic * 1_000_000))
```

## Conversion Functions

### MIC to KS

```typescript
export function micToKS(mic: number): number {
  if (mic < 0) throw new Error("Negative MIC not allowed");
  const ks = Math.round(mic * 1_000_000);
  return ks;
}
```

### KS to MIC

```typescript
export function ksToMIC(ks: number): number {
  if (!Number.isInteger(ks)) throw new Error("KS must be integer");
  if (ks < 0) throw new Error("Negative KS not allowed");
  return ks / 1_000_000;
}
```

## Ledger Entry Format

All ledger entries MUST store both representations:

```json
{
  "id": "entry_001",
  "mic": 0.150000,
  "ks": 150000,
  "actor_id": "CIVIC_001",
  "action": "reflection",
  "mii": 0.97,
  "timestamp": "2025-12-01T08:00:00.000Z"
}
```

### Field Constraints

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `mic` | float | yes | 6 decimal precision, ≥ 0 |
| `ks` | integer | yes | ≥ 0, derived from mic |
| `actor_id` | string | yes | Valid citizen/agent ID |
| `action` | string | yes | Valid action type |
| `mii` | float | no | 0.0–1.0 if present |
| `timestamp` | ISO 8601 | yes | UTC timestamp |

## Minting Protocol

### Requirements

1. **MII Threshold:** MII must be ≥ 0.95
2. **Sentinel Approval:** At least one sentinel signature
3. **Shard Validation:** Valid shard type and weight

### Mint Formula

```
MIC_minted = α × max(0, MII - τ) × ShardValue × QualityMultiplier
KS_minted  = MIC_minted × 1,000,000
```

Where:
- α = 1.0 (base coefficient)
- τ = 0.95 (threshold)
- ShardValue = 0.1–3.0
- QualityMultiplier = 0.2–1.5

### Sentinel Enforcement

- ATLAS: Computes MIC + KS
- ZEUS: Approves or rejects mint
- EVE: Evaluates reflection quality
- JADE: Provides emotional context score

## Burn Protocol

### Requirements

1. **Valid Reason:** Documented violation or correction
2. **Severity Score:** 1–10 scale
3. **Sentinel Signature:** Required for execution

### Burn Formula

```
KS_burn  = Severity × β × 1,000,000
MIC_burn = KS_burn / 1,000,000
```

Where β = 0.05 (default burn coefficient)

## API Endpoints

### Balance Query

```
GET /v1/mic/balance/:id

Response:
{
  "mic": 4.210000,
  "ks": 4210000,
  "actor_id": "CIVIC_001",
  "last_updated": "2025-12-01T12:00:00.000Z"
}
```

### Mint Request

```
POST /v1/mic/mint

Body:
{
  "actor_id": "CIVIC_001",
  "action": "reflection",
  "mii": 0.97,
  "shards": [
    { "type": "reflection", "value": 1.0 }
  ]
}

Response:
{
  "minted_mic": 0.020000,
  "minted_ks": 20000,
  "new_balance_mic": 4.230000,
  "new_balance_ks": 4230000
}
```

### Transfer Request

```
POST /v1/mic/transfer

Body:
{
  "from": "CIVIC_001",
  "to": "CIVIC_002",
  "ks": 50000
}

Response:
{
  "transfer_id": "tx_001",
  "ks_transferred": 50000,
  "mic_equivalent": 0.050000
}
```

## Display Guidelines

### For Users (UI)

- Display KS for daily rewards and small amounts
- Display MIC for balances and large amounts
- Use comma separators: "150,000 KS"
- Show both when appropriate: "0.15 MIC (150,000 KS)"

### For Systems (Logs/APIs)

- Use MIC for economic modeling
- Use KS for settlement and ledger
- Always include both in API responses

## Constants

```typescript
export const KS_PER_MIC = 1_000_000;
export const MIC_DECIMALS = 6;
export const MII_THRESHOLD = 0.95;
export const MINT_COEFFICIENT = 1.0;
export const BURN_COEFFICIENT = 0.05;
```

## Backward Compatibility

### GIC Aliases

For backward compatibility with GIC references:

```typescript
export const CurrencyAliases = {
  GIC: 'MIC',
  gic: 'mic',
  shard: 'KS',
  shards: 'ks'
};
```

## Security Considerations

1. **Integer Overflow:** KS values must fit in int64
2. **Precision Loss:** Always use integer KS for calculations
3. **Rounding Attacks:** Round down for user-to-system, up for system-to-user
4. **Signature Verification:** All mints require sentinel signatures

---

*Cycle C-151 | Mobius Systems | MIC/KS Denomination Protocol v1.0.0*
