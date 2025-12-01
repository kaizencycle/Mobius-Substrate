# Mobius Companion

> Local AI Node with integrated wallet, ledger, and sync

**Cycle:** C-151 | **Version:** 0.1.0

## Overview

Mobius Companion is the local-first application that brings Mobius Systems to every device. It combines:

- **Local Wallet**: Manage MIC/KS balances
- **Local Ledger**: Store integrity proofs locally
- **Daily Reflections**: Earn MIC through reflections
- **Sync Engine**: Bidirectional sync with Civic Ledger
- **Offline-First**: Full functionality without network

## Architecture

```
mobius-companion/
├── src/
│   ├── components/        # React components
│   │   ├── WalletCard.tsx
│   │   ├── ReflectionInput.tsx
│   │   ├── LedgerView.tsx
│   │   ├── SyncStatus.tsx
│   │   └── MIIGauge.tsx
│   ├── lib/               # Core utilities
│   └── pages/             # Next.js pages
├── package.json
└── README.md
```

## Features

### 🌀 Local Wallet

- View MIC and KS balances
- Track pending transactions
- Send and receive MIC
- Ed25519 keypair management

### 📝 Daily Reflections

- Record daily reflections
- Automatic quality assessment
- MIC minting (MII ≥ 0.95)
- EOMM integration

### 📊 MII Gauge

- Real-time MII score display
- Component breakdown (M, H, I, E)
- Threshold indicator
- Minting eligibility status

### 🔄 Sync Engine

- Automatic background sync
- Push local entries to Civic Ledger
- Pull remote updates
- Offline queue management

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3010
```

## Technology Stack

- **Framework**: Next.js 14
- **UI**: React + Framer Motion
- **Local Storage**: SQLite (via better-sqlite3)
- **Crypto**: Ed25519 (tweetnacl)
- **Desktop**: Electron (optional)

## MIC/KS Economy

```
1 MIC = 1,000,000 Kaizen Shards (KS)
```

### Earning MIC

| Action | Typical Reward |
|--------|----------------|
| Daily Reflection | 0.02-0.10 MIC |
| Shield Check | 0.01-0.05 MIC |
| Civic Action | 0.10-0.30 MIC |

### Minting Formula

```
MIC_minted = 1.0 × max(0, MII - 0.95) × ShardValue × QualityMultiplier
```

## Desktop App (Electron)

For desktop distribution:

```bash
# Build Electron app
npm run electron:build
```

This creates platform-specific installers in `dist/`.

## Data Storage

All data is stored locally in `~/.mobius/`:

```
~/.mobius/
├── ledger.sqlite      # Transaction log
├── wallet.json        # Wallet state
├── reflections.json   # Reflection history
└── keypair.ed25519    # Device identity
```

## Privacy

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
