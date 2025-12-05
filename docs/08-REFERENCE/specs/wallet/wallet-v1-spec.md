# Mobius Wallet v1 Specification

> **Version:** 1.0.0 | **Cycle:** C-151 | **Status:** Implementation Ready

## Overview

The Mobius Wallet is a local-first digital wallet for managing MIC (Mobius Integrity Credits) and KS (Kaizen Shards). This specification defines the wallet architecture, data structures, and user interface requirements.

---

## 1. Core Concepts

### 1.1 Wallet Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Local Wallet** | Device-bound, offline-capable | Personal use |
| **Custodial Wallet** | Server-managed | Enterprise |
| **Multi-sig Wallet** | Requires multiple signatures | Governance |

This spec focuses on **Local Wallet** v1.

### 1.2 Key Properties

- **Self-sovereign**: User controls private keys
- **Offline-capable**: Full functionality without network
- **Sync-enabled**: Optional sync to Civic Ledger
- **Export/Import**: Portable across devices

---

## 2. Data Structures

### 2.1 Wallet State

```typescript
interface Wallet {
  // Identity
  walletId: string;           // Unique identifier
  actorId: string;            // Citizen/agent ID
  publicKey: string;          // Ed25519 public key (hex)
  
  // Balances
  micBalance: number;         // Confirmed MIC
  ksBalance: number;          // Confirmed KS (mic × 1,000,000)
  pendingMic: number;         // Unconfirmed MIC
  pendingKs: number;          // Unconfirmed KS
  
  // Metadata
  createdAt: string;          // ISO 8601 timestamp
  lastUpdated: string;        // ISO 8601 timestamp
  version: number;            // Schema version
}
```

### 2.2 Transaction

```typescript
interface Transaction {
  id: string;                 // Transaction ID
  type: 'mint' | 'burn' | 'transfer' | 'reward';
  
  // Amounts
  mic: number;                // MIC amount
  ks: number;                 // KS amount
  
  // Parties
  from?: string;              // Sender (null for mint)
  to: string;                 // Recipient (BURN_ADDRESS for burn)
  
  // Context
  action: string;             // Action type (reflection, civic, etc.)
  mii?: number;               // MII score if applicable
  
  // Status
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  signature?: string;         // Ed25519 signature
}
```

### 2.3 Keypair

```typescript
interface Keypair {
  publicKey: Uint8Array;      // 32 bytes
  secretKey: Uint8Array;      // 64 bytes (Ed25519)
}
```

---

## 3. Storage

### 3.1 File Structure

```
~/.mobius/
├── wallet.json               # Wallet state
├── keypair.ed25519           # Private key (encrypted)
├── transactions.json         # Transaction history
└── backup/
    └── wallet-{timestamp}.json  # Backups
```

### 3.2 Encryption

Private keys are encrypted with user password:

```
Encrypted = AES-256-GCM(secretKey, PBKDF2(password, salt))
```

### 3.3 Backup Protocol

Automatic backup on:
- Balance change > 1 MIC
- Weekly schedule
- Before wallet export

---

## 4. Core Operations

### 4.1 Create Wallet

```typescript
async function createWallet(actorId: string): Promise<Wallet> {
  // Generate Ed25519 keypair
  const keypair = generateKeypair();
  
  // Create wallet
  const wallet: Wallet = {
    walletId: generateWalletId(),
    actorId,
    publicKey: toHex(keypair.publicKey),
    micBalance: 0,
    ksBalance: 0,
    pendingMic: 0,
    pendingKs: 0,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    version: 1
  };
  
  // Save keypair (encrypted)
  await saveKeypair(keypair, password);
  
  // Save wallet
  await saveWallet(wallet);
  
  return wallet;
}
```

### 4.2 Check Balance

```typescript
function getBalance(wallet: Wallet): {
  confirmed: { mic: number; ks: number };
  pending: { mic: number; ks: number };
  total: { mic: number; ks: number };
} {
  return {
    confirmed: {
      mic: wallet.micBalance,
      ks: wallet.ksBalance
    },
    pending: {
      mic: wallet.pendingMic,
      ks: wallet.pendingKs
    },
    total: {
      mic: wallet.micBalance + wallet.pendingMic,
      ks: wallet.ksBalance + wallet.pendingKs
    }
  };
}
```

### 4.3 Send MIC/KS

```typescript
async function send(
  wallet: Wallet,
  to: string,
  ks: number
): Promise<Transaction> {
  // Validate
  if (wallet.ksBalance < ks) {
    throw new Error('Insufficient balance');
  }
  
  const mic = ks / KS_PER_MIC;
  
  // Create transaction
  const tx: Transaction = {
    id: generateTxId(),
    type: 'transfer',
    mic,
    ks,
    from: wallet.actorId,
    to,
    action: 'transfer',
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  
  // Sign transaction
  tx.signature = await signTransaction(tx, keypair);
  
  // Update balance optimistically
  wallet.micBalance -= mic;
  wallet.ksBalance -= ks;
  wallet.pendingMic -= mic;
  wallet.lastUpdated = new Date().toISOString();
  
  // Submit to network
  await submitTransaction(tx);
  
  return tx;
}
```

### 4.4 Receive MIC/KS

Receiving is passive—the wallet detects incoming transactions during sync.

```typescript
async function processIncoming(
  wallet: Wallet,
  tx: Transaction
): Promise<void> {
  if (tx.to !== wallet.actorId) return;
  
  if (tx.status === 'confirmed') {
    wallet.micBalance += tx.mic;
    wallet.ksBalance += tx.ks;
  } else {
    wallet.pendingMic += tx.mic;
    wallet.pendingKs += tx.ks;
  }
  
  wallet.lastUpdated = new Date().toISOString();
  await saveWallet(wallet);
}
```

### 4.5 Export Wallet

```typescript
interface WalletExport {
  version: number;
  wallet: Wallet;
  keypair: {
    publicKey: string;    // hex
    secretKey: string;    // hex, encrypted
  };
  transactions: Transaction[];
  exportedAt: string;
}

async function exportWallet(
  wallet: Wallet,
  password: string
): Promise<WalletExport> {
  const keypair = await loadKeypair(password);
  
  return {
    version: 1,
    wallet,
    keypair: {
      publicKey: toHex(keypair.publicKey),
      secretKey: encrypt(toHex(keypair.secretKey), password)
    },
    transactions: await loadTransactions(),
    exportedAt: new Date().toISOString()
  };
}
```

---

## 5. User Interface

### 5.1 Screen Hierarchy

```
Wallet App
├── Home (Balance Overview)
├── Send
├── Receive
├── Transactions
├── Reflections
├── Settings
│   ├── Security
│   ├── Backup
│   ├── Export/Import
│   └── About
└── MII Status
```

### 5.2 Home Screen

```
┌────────────────────────────────────┐
│ 🌀 Mobius Wallet          [Sync ●] │
├────────────────────────────────────┤
│                                    │
│         4.210000 MIC               │
│         4,210,000 KS               │
│                                    │
│    + 0.050000 pending              │
│                                    │
├────────────────────────────────────┤
│  [  SEND  ]    [  RECEIVE  ]       │
├────────────────────────────────────┤
│ MII: 0.97 ✓ Above Threshold        │
├────────────────────────────────────┤
│ Recent:                            │
│ 📝 Reflection      +0.024 MIC      │
│ 🛡️ Shield Check    +0.015 MIC      │
│ 📝 Reflection      +0.032 MIC      │
└────────────────────────────────────┘
```

### 5.3 Send Screen

```
┌────────────────────────────────────┐
│ ← Send MIC/KS                      │
├────────────────────────────────────┤
│                                    │
│ To:                                │
│ ┌────────────────────────────────┐ │
│ │ CIVIC_002                      │ │
│ └────────────────────────────────┘ │
│                                    │
│ Amount (KS):                       │
│ ┌────────────────────────────────┐ │
│ │ 50,000                         │ │
│ └────────────────────────────────┘ │
│ = 0.050000 MIC                     │
│                                    │
│ Available: 4,210,000 KS            │
│                                    │
│        [  SEND  ]                  │
│                                    │
└────────────────────────────────────┘
```

### 5.4 Receive Screen

```
┌────────────────────────────────────┐
│ ← Receive MIC/KS                   │
├────────────────────────────────────┤
│                                    │
│         ┌─────────┐                │
│         │ QR CODE │                │
│         │ (ID)    │                │
│         └─────────┘                │
│                                    │
│ Your ID:                           │
│ CIVIC_001                          │
│                                    │
│        [ COPY ]  [ SHARE ]         │
│                                    │
│ Public Key:                        │
│ 3f8a...c4d2                        │
│                                    │
└────────────────────────────────────┘
```

### 5.5 Design Tokens

```json
{
  "colors": {
    "primary": "#8B5CF6",
    "secondary": "#6366F1",
    "success": "#10B981",
    "warning": "#F59E0B",
    "error": "#EF4444",
    "background": "#0F172A",
    "surface": "#1E293B",
    "text": "#F1F5F9"
  },
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "balanceSize": "2.5rem",
    "bodySize": "1rem"
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem"
  }
}
```

---

## 6. Security

### 6.1 Key Storage

- Private keys stored encrypted on device
- Never transmitted over network
- Password required for signing

### 6.2 Transaction Signing

All outgoing transactions signed with Ed25519:

```typescript
function signTransaction(tx: Transaction, keypair: Keypair): string {
  const message = canonicalize(tx);
  const signature = nacl.sign.detached(
    new TextEncoder().encode(message),
    keypair.secretKey
  );
  return toHex(signature);
}
```

### 6.3 Backup Security

- Backups encrypted with user password
- Optional cloud backup (encrypted)
- Recovery phrase option (BIP39)

---

## 7. Sync Protocol

### 7.1 Sync Flow

```
1. Check local changes
2. Push pending transactions
3. Pull remote transactions
4. Verify signatures
5. Update balances
6. Mark entries synced
```

### 7.2 Conflict Resolution

- Server is source of truth for confirmed
- Local is source of truth for pending
- Conflicts resolved by timestamp

### 7.3 Offline Handling

- Queue transactions when offline
- Sync automatically when reconnected
- Show clear offline indicator

---

## 8. API Integration

### 8.1 Endpoints

```typescript
// Balance
GET /v1/mic/balance/:id
Response: { mic, ks, pending_mic, pending_ks }

// Transactions
GET /v1/mic/transactions?actor_id=X&limit=50
Response: { transactions: [...] }

// Submit transaction
POST /v1/mic/transfer
Body: { from, to, ks, signature }
Response: { transaction_id, status }

// MII score
GET /v1/mii/score/:id
Response: { mii, components, above_threshold }
```

---

## 9. Implementation Checklist

### Phase 1: Core

- [ ] Wallet data structures
- [ ] Keypair generation
- [ ] Local storage
- [ ] Balance tracking
- [ ] Transaction history

### Phase 2: Operations

- [ ] Send functionality
- [ ] Receive detection
- [ ] Transaction signing
- [ ] Export/Import

### Phase 3: UI

- [ ] Home screen
- [ ] Send screen
- [ ] Receive screen
- [ ] Transaction list
- [ ] Settings

### Phase 4: Sync

- [ ] Sync engine
- [ ] Conflict resolution
- [ ] Offline queue
- [ ] Status indicators

---

## 10. Future Enhancements

- **Multi-wallet**: Support multiple wallets
- **Hardware wallet**: Ledger/Trezor integration
- **NFC payments**: Tap-to-pay MIC
- **Recurring**: Scheduled transfers
- **Governance**: Proposal voting from wallet

---

*Document Version: 1.0.0*
*Cycle: C-151*
*Last Updated: December 1, 2025*
