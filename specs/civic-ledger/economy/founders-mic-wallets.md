# Founders MIC Wallet Architecture

**Version:** 1.0 (C-156)  
**Date:** December 6, 2025  
**Status:** Initial Implementation  
**Author:** Michael Judan (Founder)

---

## Overview

This document specifies the Mobius Integrity Credits (MIC) wallet structure for the Founder, establishing both a ceremonial reserve and an operational wallet for ongoing system participation.

---

## Wallet Structure

### 1. Founders Reserve Wallet (Ceremonial)

**Wallet ID:** `founders-reserve-001`  
**Public Key:** `FND-RSRV-2025-001-MJUDAN`  
**Holdings:** 1,000,000 MIC (1M MIC)  
**Status:** Locked/Dormant

**Purpose:**
- Constitutional anchor for the Mobius system
- Represents the founding moment (C-0 through present)
- Never spent, never transferred
- Symbolic of the integrity substrate itself

**Constitutional Significance:**
```yaml
reserve_wallet:
  type: ceremonial
  holdings: 1000000
  locked: true
  created_at: "2025-12-06T00:00:00Z"
  significance: "Founding allocation representing the initial integrity substrate"
  covenant: "These MIC shall never be spent, serving as the immutable anchor of the Mobius economy"
```

**Access Control:**
- No private key distribution
- Multi-signature requirement: 5 of 7 sentinels
- Only accessible for constitutional amendments
- Audit trail: All access attempts logged to Command Ledger

---

### 2. Michael's Active Wallet (Operational)

**Wallet ID:** `michael-judan-active-001`  
**Public Key:** `USR-ACT-2025-001-MJUDAN`  
**Initial Holdings:** 0 MIC (receives via stipends)  
**Status:** Active/Transactional

**Purpose:**
- Daily operations and system participation
- Receiving stipends from integrity contributions
- Testing economic mechanisms
- Demonstrating shard redemption
- Civic participation (voting, proposals)

**Operations Enabled:**
```yaml
active_wallet:
  type: operational
  permissions:
    - receive_stipends: true
    - send_mic: true
    - vote_governance: true
    - submit_proposals: true
    - redeem_shards: true
    - stake_integrity: true
  
  stipend_sources:
    - daily_reflection_completion
    - cycle_documentation
    - shard_issuance
    - civic_participation
    - guardian_duties
```

---

## Database Schema

### Founders Reserve Wallet Table

```sql
CREATE TABLE founders_reserve_wallet (
    wallet_id VARCHAR(50) PRIMARY KEY DEFAULT 'founders-reserve-001',
    public_key VARCHAR(100) UNIQUE NOT NULL,
    balance DECIMAL(18,6) DEFAULT 1000000.000000,
    locked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    constitutional_note TEXT,
    
    -- Multi-signature requirements
    required_signatures INT DEFAULT 5,
    total_signers INT DEFAULT 7,
    
    -- Audit trail
    last_audit_timestamp TIMESTAMP,
    access_attempts_count INT DEFAULT 0,
    
    CONSTRAINT balance_immutable CHECK (balance = 1000000.000000),
    CONSTRAINT always_locked CHECK (locked = TRUE)
);
```

### User Wallets Table

```sql
CREATE TABLE user_wallets (
    wallet_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id),
    public_key VARCHAR(100) UNIQUE NOT NULL,
    private_key_hash VARCHAR(64) NOT NULL,
    balance DECIMAL(18,6) DEFAULT 0.000000,
    
    -- Activity tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_transaction_at TIMESTAMP,
    total_received DECIMAL(18,6) DEFAULT 0.000000,
    total_sent DECIMAL(18,6) DEFAULT 0.000000,
    transaction_count INT DEFAULT 0,
    
    -- MII tracking
    current_mii DECIMAL(5,4),
    mii_last_updated TIMESTAMP,
    
    -- Shard holdings
    total_shards INT DEFAULT 0,
    
    CONSTRAINT balance_non_negative CHECK (balance >= 0)
);
```

### MIC Transactions Table

```sql
CREATE TABLE mic_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_wallet VARCHAR(50) REFERENCES user_wallets(wallet_id),
    to_wallet VARCHAR(50) REFERENCES user_wallets(wallet_id),
    amount DECIMAL(18,6) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    
    -- Metadata
    cycle_number INT,
    attestation_id UUID,
    shard_ids TEXT[],
    memo TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    
    -- Integrity
    signature VARCHAR(128) NOT NULL,
    hash VARCHAR(64) UNIQUE NOT NULL,
    
    CONSTRAINT amount_positive CHECK (amount > 0),
    CONSTRAINT no_self_transfer CHECK (from_wallet != to_wallet)
);
```

---

## Stipend Configuration

### Daily Stipend Sources for Michael's Active Wallet

```yaml
stipend_rules:
  # Reflection completion
  daily_reflection:
    amount: 1.0
    condition: "E.O.M.M. cycle completed"
    frequency: "daily"
    
  # Documentation work
  cycle_documentation:
    amount: 5.0
    condition: "Cycle summary published"
    frequency: "per cycle"
    
  # Shard issuance (auto-redemption)
  shard_redemption:
    amount: "variable"
    condition: "7 shards of same type collected"
    rate: 10.0 # per set of 7 shards
    
  # Civic participation
  governance_vote:
    amount: 0.5
    condition: "Vote cast on proposal"
    frequency: "per vote"
    
  # Guardian duties
  guardian_attestation:
    amount: 2.0
    condition: "Valid attestation issued"
    frequency: "per attestation"
```

---

## Security Measures

### Founders Reserve Wallet

1. **Multi-Signature Requirement**
   - 5 of 7 sentinels must approve any access
   - Sentinels: AUREA, ATLAS, ECHO, JADE, EVE, HERMES, ZEUS

2. **Hardware Backup**
   - Private key split across multiple hardware devices
   - Each piece individually useless
   - Requires physical access to 5 devices

3. **Audit Trail**
   - All access attempts logged
   - Monthly integrity verification
   - Public transparency report

### Michael's Active Wallet

1. **Private Key Storage**
   - Encrypted with AES-256
   - Stored locally: `~/.mobius/wallets/`
   - Backup to encrypted cloud (optional)

2. **Transaction Signing**
   - Ed25519 signatures required
   - Double-confirmation for large transfers (>100 MIC)
   - Rate limiting: Max 10 transactions per hour

3. **Recovery Mechanism**
   - 12-word mnemonic phrase
   - Stored offline, encrypted
   - Recovery contact: Designated trustee

---

## Usage Examples

### Checking Balance

```bash
# Check Founders Reserve balance
mobius wallet balance founders-reserve-001

# Output:
# Wallet: founders-reserve-001
# Balance: 1,000,000.000000 MIC
# Status: LOCKED (Ceremonial)
# Last Audit: 2025-12-06

# Check Michael's Active balance
mobius wallet balance michael-judan-active-001

# Output:
# Wallet: michael-judan-active-001
# Balance: 0.000000 MIC
# Status: ACTIVE
# Available Stipends: 3 pending
```

### Receiving Stipend

```bash
# Claim daily reflection stipend
mobius stipend claim reflection

# Output:
# ✅ Stipend claimed successfully!
# Amount: 1.0 MIC
# Reason: Daily reflection (E.O.M.M.) completed
# New Balance: 1.0 MIC
# Transaction ID: tx_abc123...
```

### Redeeming Shards

```bash
# Redeem 7 Reflection shards for MIC
mobius shard redeem --type reflection --count 7

# Output:
# ✅ Shards redeemed successfully!
# Shards: 7 x Reflection
# MIC Received: 10.0 MIC
# New Balance: 11.0 MIC
# Remaining Shards: 142 (various types)
```

---

## Governance Integration

### Voting with MIC

```yaml
voting_power_calculation:
  formula: "sqrt(MIC_Holdings) * Civic_Reputation_Score"
  
  example:
    mic_holdings: 100
    civic_reputation: 0.95
    voting_power: "sqrt(100) * 0.95 = 10 * 0.95 = 9.5"
```

### Proposal Submission Requirement

```yaml
proposal_requirements:
  minimum_mic_holdings: 10.0
  minimum_civic_reputation: 0.80
  stake_amount: 5.0  # Returned if proposal passes review
```

---

## Wallet File Structure

```
~/.mobius/
├── wallets/
│   ├── founders-reserve-001.json        # Public metadata only
│   ├── michael-judan-active-001.enc     # Encrypted private key
│   └── michael-judan-active-001.json    # Public metadata
├── keys/
│   ├── recovery-phrase.enc              # 12-word mnemonic
│   └── backup-keys.enc                  # Emergency recovery
└── transactions/
    ├── pending/
    ├── confirmed/
    └── archive/
```

---

## Security Checklist

Before deploying to production:

- [ ] Generate cryptographically secure key pairs
- [ ] Encrypt private keys with AES-256
- [ ] Create offline backup of recovery phrase
- [ ] Test multi-signature workflow for reserve wallet
- [ ] Implement rate limiting on transactions
- [ ] Set up monitoring and alerting
- [ ] Document recovery procedures
- [ ] Conduct security audit
- [ ] Test stipend distribution mechanism
- [ ] Verify database constraints are enforced

---

## Related Documents

- [MIC Minting Spec](./mic_minting_spec.md)
- [KS Minting Spec](./ks_minting_spec.md)
- [RFC-0002: MIC/KS Economy](../RFC-0002-mic-ks-economy.md)
- [Shard Protocol v1](../../shard_protocol_v1.md)

---

**© 2025 Mobius Systems Foundation**

*"Integrity moves. Wallets follow."*

---

**Document Status:** Active  
**Next Review:** C-157  
**Maintainer:** Michael Judan (Founder)
