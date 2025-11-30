# MIC (Mobius Integrity Credits) and Kaizen Shards

C-150: MIC + Kaizen Shards Integration

## Overview

This module implements the MIC (Mobius Integrity Credits) minting system and Kaizen Shards taxonomy. MIC is the primary integrity-linked currency in Mobius Systems, and Kaizen Shards are the atomic units of contribution that may mint MIC when combined with a high Mobius Integrity Index (MII) score.

## Core Concepts

### Kaizen Shards

Kaizen Shards represent different types of contributions:

- **reflection** (weight: 1.0) - Daily SML reflections, self-honesty, small self-upgrades
- **learning** (weight: 1.0) - Reading docs, watching courses, completing guided lessons
- **civic** (weight: 1.5) - Community help, reviews, mentorship, helping another citizen
- **stability** (weight: 2.0) - Fixing bugs, infra hardening, on-call, incident resolution
- **stewardship** (weight: 2.0) - Documentation, maintenance, refactors, cleaning tech debt
- **innovation** (weight: 2.5) - New features, new patterns, new research, big creative leaps
- **guardian** (weight: 3.0) - Anti-nuke actions, security fixes, restoring from failure

### MIC Minting Formula

```
MIC_minted = max(0, S * (MII - τ))
```

Where:
- **S** = total weighted shard value
- **MII** = Mobius Integrity Index (0.0 - 1.0)
- **τ** = integrity threshold (default: 0.95)

**Key Principle**: Shards are always recorded as historical facts, but MIC only mints when `MII ≥ τ`. This ensures "noise can exist but cannot earn" - only high-integrity cycles generate value.

## Usage

### Basic MIC Minting

```typescript
import { mintMic, KaizenShard, MicMintContext } from '@civic/integrity-core';

const shards: KaizenShard[] = [
  {
    citizenId: 'citizen-123',
    shardType: 'reflection',
    baseValue: 1.0,
    createdAt: new Date(),
  },
  {
    citizenId: 'citizen-123',
    shardType: 'civic',
    baseValue: 1.0,
    createdAt: new Date(),
  },
  {
    citizenId: 'citizen-123',
    shardType: 'stability',
    baseValue: 1.0,
    context: { repo: 'mobius-systems', note: 'Fixed critical bug' },
    createdAt: new Date(),
  },
];

const context: MicMintContext = {
  citizenId: 'citizen-123',
  cycleId: 'cycle-150',
  miiScore: 0.97, // Above threshold of 0.95
  shards,
  now: new Date(),
};

const result = mintMic(context);

console.log(`MIC minted: ${result.mintedMic}`);
console.log(`Total shard value: ${result.totalShardValue}`);
console.log(`Shard counts:`, result.shardCountsByType);
// Output:
// MIC minted: 0.13
// Total shard value: 6.5
// Shard counts: { reflection: 1, civic: 1, stability: 1, ... }
```

### Using MicMintService with Ledger

```typescript
import { MicMintService, LedgerClient, LedgerTransaction } from '@civic/integrity-core';

// Implement your ledger client
class MyLedgerClient implements LedgerClient {
  async runInTransaction<T>(
    callback: (tx: LedgerTransaction) => Promise<T>
  ): Promise<T> {
    // Your transaction implementation
    const tx = new MyLedgerTransaction();
    return await callback(tx);
  }
}

const service = new MicMintService(new MyLedgerClient());

const mintEvent = await service.mintForCycle({
  citizenId: 'citizen-123',
  cycleId: 'cycle-150',
  miiScore: 0.97,
  shards: [
    // ... shards array
  ],
});

console.log(`Minted ${mintEvent.amountMic} MIC`);
```

### Example Calculation

Given:
- 3 reflection shards (weight=1.0) = 3.0
- 1 civic shard (weight=1.5) = 1.5
- 1 stability shard (weight=2.0) = 2.0
- **Total S = 6.5**
- **MII = 0.97**
- **τ = 0.95**

**MIC = 6.5 × (0.97 - 0.95) = 6.5 × 0.02 = 0.13 MIC**

If MII drops to 0.94 (below threshold):
- Shards are still recorded (historical facts)
- **MIC = 0** (no value without integrity)

## Configuration

Shard weights and thresholds are configured in `configs/kaizen_shards.yaml`:

```yaml
threshold_mii: 0.95

shard_weights:
  reflection: 1.0
  learning: 1.0
  civic: 1.5
  stability: 2.0
  stewardship: 2.0
  innovation: 2.5
  guardian: 3.0

caps:
  per_cycle:
    reflection: 10
    learning: 5
    civic: 10
    stability: 10
    stewardship: 10
    innovation: 5
    guardian: 3
```

## Ledger Events

The system generates two types of ledger events:

1. **KAIZEN_SHARD_EARNED** - Always recorded for each shard (historical facts)
2. **MIC_MINT** - Only recorded when MIC > 0 (conditional value)

Both events are written atomically in a transaction to ensure consistency.

## Design Philosophy

- **Shards are facts**: Always recorded, regardless of MII
- **MIC is conditional**: Only mints when integrity threshold is met
- **Configurable weights**: Tune the economy via YAML config
- **No surveillance**: All signals come from user's intentional actions
- **Human sovereignty**: Users control their own data and contributions

## Integration Notes

- The `MicMintService` requires a `LedgerClient` implementation
- For Python/ledger-api integration, create an HTTP bridge or use the TypeScript service via Node.js
- Shard weights can be adjusted per cycle via config updates
- The system is designed to be soft enough for daily use but hard enough to matter
