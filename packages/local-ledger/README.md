# @kaizen/local-ledger

> Local-first ledger for Mobius integrity tracking

**Cycle:** C-151 | **Version:** 1.0.0

## Overview

The Local Ledger package provides a complete local-first infrastructure for Mobius Systems, enabling true decentralization without blockchain mining. Every user maintains their own ledger, wallet, and integrity proofs locally, with optional synchronization to the Civic Ledger.

## Architecture

```
~/.mobius/
├── ledger.sqlite          # Personal immutable log
├── wallet.json            # Local wallet state
├── reflections.json       # SML reflection data
├── keypair.ed25519        # Device-specific identity
└── sync/
    ├── state.json         # Sync state
    └── pending/           # Unsynced entries
```

## Features

- **Local Ledger**: SQLite-based immutable transaction log
- **Wallet Manager**: MIC/KS balance management with Ed25519 signing
- **Sync Engine**: Bidirectional sync with Civic Ledger
- **MII Calculator**: Local integrity scoring
- **Offline-First**: Full functionality without network

## Installation

```bash
npm install @kaizen/local-ledger
```

## Quick Start

```typescript
import { LocalLedger, WalletManager, SyncEngine } from '@kaizen/local-ledger';

// Initialize components
const ledger = new LocalLedger('CIVIC_001');
await ledger.init();

const wallet = new WalletManager();
wallet.createWallet('CIVIC_001');

// Record a reflection and mint MIC
const entry = ledger.recordReflection({
  content: 'Today I focused on improving code quality...',
  quality: 0.85,
  mii: 0.97
});

console.log(`Minted: ${entry?.mic.toFixed(6)} MIC (${entry?.ks} KS)`);

// Get balance
const balance = ledger.getBalance();
console.log(`Balance: ${balance.mic} MIC (${balance.ks} KS)`);

// Start sync (optional)
const sync = new SyncEngine({
  ledger,
  wallet,
  syncUrl: 'https://ledger.mobius.sys'
});
sync.start();
```

## MIC/KS Denomination

```
1 MIC = 1,000,000 Kaizen Shards (KS)
```

All transactions settle in KS (integer) while MIC is used for display and economic modeling.

## Minting Formula

```
MIC_minted = α × max(0, MII - τ) × ShardValue
```

Where:
- α = 1.0 (base coefficient)
- τ = 0.95 (MII threshold)
- ShardValue = action-specific weight

## Sync Protocol

```
Local → Hash → Civic Ledger
Civic Ledger → Validation → Updated Global MII
```

Every 10 seconds (configurable):
1. Push unsynced local entries
2. Pull new remote entries
3. Verify state consistency
4. Update balance

## Security

- **Ed25519 Keypairs**: Cryptographic identity
- **Local-First**: No server can rewrite local ledger
- **Signed Entries**: All transactions include signatures
- **Hash Verification**: State consistency checks

## API Reference

### LocalLedger

```typescript
class LocalLedger {
  constructor(actorId: string);
  
  init(): Promise<void>;
  getBalance(): { mic: number; ks: number };
  
  mint(params: {
    action: LedgerAction;
    mii: number;
    shardValue?: number;
  }): LedgerEntry | null;
  
  burn(params: {
    reason: string;
    severity: number;
  }): LedgerEntry | null;
  
  recordReflection(params: {
    content: string;
    quality: number;
    mii: number;
  }): LedgerEntry | null;
  
  getEntries(options?: {
    unsynced?: boolean;
    limit?: number;
  }): LedgerEntry[];
  
  calculateMII(): MIIScore;
  getStats(): LedgerStats;
  close(): Promise<void>;
}
```

### WalletManager

```typescript
class WalletManager {
  createWallet(actorId: string): Wallet;
  loadWallet(data: Wallet): void;
  getBalance(): { mic: number; ks: number };
  addBalance(mic: number): void;
  subtractBalance(mic: number): boolean;
  sign(message: string): string | null;
  exportWallet(): WalletExport | null;
}
```

### SyncEngine

```typescript
class SyncEngine {
  constructor(params: {
    ledger: LocalLedger;
    wallet: WalletManager;
    syncUrl: string;
  });
  
  start(intervalMs?: number): void;
  stop(): void;
  sync(): Promise<SyncResult>;
  getStatus(): SyncStatus;
  verify(): Promise<VerifyResult>;
}
```

## Constants

```typescript
export const KS_PER_MIC = 1_000_000;
export const MII_THRESHOLD = 0.95;
export const MINT_COEFFICIENT = 1.0;
export const BURN_COEFFICIENT = 0.05;
export const SYNC_INTERVAL_MS = 10_000;
```

## Privacy

The Local Ledger is designed for privacy:
- All data stored locally by default
- Sync is optional and user-controlled
- Only hashes shared for verification
- No tracking or analytics

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

AGPL-3.0 - See [LICENSE](../../LICENSE)

---

*"We heal as we walk."* — Mobius Systems C-151
