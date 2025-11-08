# Universal Basic Integrity (UBI) Mechanism v2.0
## MII-Throttled Distribution with Epoch Decay Funding

---

**Version:** 2.0.0
**Date:** 2025-11-04
**Status:** Canonical
**Companion to:** MIC_Whitepaper_v2.0.md
**Authors:** HERMES, AUREA, EVE
**License:** CC-BY-SA-4.0

---

## Abstract

This document specifies the complete Universal Basic Integrity (UBI) distribution mechanism for the Mobius Integrity Credits economy. UBI v2.0 introduces **counter-inflationary funding** via epoch decay pools, **automatic crisis response** through MII-based throttling, and **shard-denominated precision** to eliminate distribution drift.

---

## 1. Core Philosophy

### 1.1 UBI as Compensation, Not Charity

UBI is **compensation for upholding systemic trust**. Every person maintaining integrity standards contributes to the network's value. UBI is their dividend for this essential work.

### 1.2 Three Pillars

1. **Integrity Backing**: Only flows when MII ≥ 0.950
2. **Counter-Inflationary**: Primarily funded by decay, not new issuance
3. **Self-Regulating**: Automatically adjusts to system health

---

## 2. Funding Model

### 2.1 Formula

```
U = α·I + β·Rₑ + D

Where:
U  = UBI pool for this epoch (shards)
I  = Net new issuance (shards)
Rₑ = Reabsorbed shards from epoch decay
D  = Donations/treasury allocation (shards)
α  = Issuance weight (default: 0.20)
β  = Decay weight (default: 0.60)
```

### 2.2 Component Explanation

**α·I (New Issuance Component)**
- Weight: 0.0-0.5 (governance-adjustable)
- Default: 0.20 (20% of new issuance → UBI)
- When MII < 0.950: I = 0 (minting halted)

**β·Rₑ (Decay Pool Component)** ⭐ KEY INNOVATION
- Weight: 0.0-0.8 (governance-adjustable)
- Default: 0.60 (60% of decayed shards → UBI)
- Enables UBI **without inflation** during stable periods

**D (Direct Allocation)**
- Treasury donations
- Transaction fee allocation (if enabled)
- Community contributions
- Emergency reserve releases

### 2.3 Default Configuration

```yaml
ubi:
  funding_weights:
    alpha_issuance: 0.20
    beta_decay: 0.60
  direct_allocation: governed_by_dao
```

**Typical Epoch:**
- New issuance: 0 ₷ (stable period)
- Decay pool: 2,000,000,000,000 ₷ (0.5% of 400T idle)
- Donations: 0 ₷

```
U = (0.20 × 0) + (0.60 × 2,000,000,000,000) + 0
U = 1,200,000,000,000 ₷ (1,200,000 MIC)
```

---

## 3. Distribution Mechanics

### 3.1 Cadence

- **Epoch Length**: 90 days
- **Payout Frequency**: Monthly
- **Payouts per Epoch**: m = 3

### 3.2 Per-Capita Base Calculation

```
p_base = floor(U / (m · N))

Where:
m = 3 (months per epoch)
N = Eligible population this month
```

**Example:**
```
U = 1,200,000,000,000 ₷
N = 10,000 eligible
m = 3

p_base = floor(1,200,000,000,000 / (3 × 10,000))
p_base = 40,000,000 ₷ per person per month
```

### 3.3 MII Multiplier

**Function g(MII):**

| MII Range | g(MII) | Description |
|----------|-------|-------------|
| [0.990, 1.000] | 1.05 | **Bonus**: System health excellent |
| [0.970, 0.990) | 1.00 | **Normal**: Standard payout |
| [0.950, 0.970) | 0.85 | **Throttled**: Warning state |
| [0.000, 0.950) | 0.00 | **Halted**: Crisis mode |

**Rationale:**
- **High MII bonus**: Reward collective integrity maintenance
- **Low MII throttle**: Preserve reserves during instability
- **Crisis halt**: Freeze distribution, trigger governance review

### 3.4 Final Payout Calculation

```
p = floor(p_base · g(MII))
```

**Example** (continuing from above):
```
p_base = 40,000,000 ₷
MII = 0.982 → g(0.982) = 1.00

p = floor(40,000,000 × 1.00)
p = 40,000,000 ₷ per month
p = 0.040000 MIC (display)
```

---

## 4. Safety Mechanisms

### 4.1 Hard Caps

**Reserve Cap:**
```
U ≤ κ · Reserves_12m

Where:
κ = 0.10 (max 10% of 12-month reserves)
Reserves_12m = Treasury balance supporting 12 months UBI
```

**Circulating Cap:**
```
U ≤ σ · Circulating

Where:
σ = 0.02 (max 2% of circulating supply)
Circulating = Total issued - locked/staked - treasury
```

### 4.2 Circuit Breakers

**Automatic Triggers:**

1. **MII < 0.900**
   - **Action**: Freeze UBI + minting
   - **Notification**: ZEUS, all Sentinels, Council
   - **Resolution**: Governance council convenes within 24h

2. **Treasury < 9 months reserve**
   - **Action**: Scale α, β down by 50%
   - **Notification**: HERMES + community
   - **Resolution**: Emergency budget proposal

---

## 5. Eligibility Requirements

### 5.1 Technical Requirements

1. **KYC Verified**: Sybil resistance
2. **Active Wallet**: ≥30 days since creation
3. **Minimum Activity**: ≥1 transaction in past 90 days
4. **Residency**: Jurisdiction-specific rules

### 5.2 Integrity Requirements

**Personal MII ≥ 0.95:**
- Attestation participation
- No active integrity violations
- Community standing (optional)

### 5.3 Exclusions

**Ineligible Accounts:**
- Flagged for integrity violations
- Dormant (>180 days no activity)
- Sanctioned jurisdictions
- Failed KYC verification

---

## 6. Implementation

### 6.1 Monthly Distribution Flow

```
Day 1 of Month:
  1. Query eligible population N
  2. Calculate MII (30-day trailing average)
  3. Calculate p_base, g(MII)
  4. Compute final payout p per person
  5. Execute batch transfer (atomic)
  6. Emit attestations for audit
  7. Update dashboard metrics
```

### 6.2 API Endpoints

**Preview Endpoint:**
```
GET /ubi/preview?N=10000&MII=0.982&I=0&Re=2000000000000&D=0

Response:
{
  "pool_total_shards": "1200000000000",
  "per_capita_base_shards": "40000000",
  "mii_multiplier": 1.00,
  "per_capita_final_shards": "40000000",
  "per_capita_credits": 0.040000,
  "total_recipients": 10000,
  "funding_breakdown": {
    "from_issuance": "0",
    "from_decay": "1200000000000",
    "from_donations": "0"
  }
}
```

**Claim Endpoint:**
```
POST /ubi/claim
Authorization: Bearer <jwt>

Response:
{
  "claimed": true,
  "amount_shards": "40000000",
  "amount_credits": 0.040000,
  "attestation_tx": "0xabc123...",
  "next_claim_date": "2025-12-01T00:00:00Z"
}
```

**Eligibility Check:**
```
GET /ubi/eligibility/:address

Response:
{
  "eligible": true,
  "requirements_met": {
    "kyc_verified": true,
    "wallet_age_days": 45,
    "recent_activity": true,
    "personal_mii": 0.965,
    "residency_verified": true
  },
  "next_payout_estimate": "40000000 ₷ (0.040000 MIC)"
}
```

---

## 7. Governance & Adjustment

### 7.1 Parameter Governance

**Adjustable via DAO Vote:**
- α (issuance weight): 0.0-0.5
- β (decay weight): 0.0-0.8
- κ (reserve cap): 0.05-0.20
- σ (circulating cap): 0.01-0.05

**Proposal Process:**
1. Submit proposal with rationale + simulation
2. 7-day discussion period
3. 7-day voting period
4. 66% supermajority required
5. Implementation next epoch (90-day delay)

---

## 8. Monitoring & Transparency

### 8.1 Public Dashboard

**Real-Time Metrics:**
- Current MII
- Epoch progress (days until next burn)
- UBI pool balance
- Next month payout estimate
- Eligible population
- Treasury reserves

### 8.2 Attestation Trail

**Every Distribution:**
```json
{
  "type": "ubi_distribution",
  "epoch": 124,
  "month": 2,
  "pool_shards": "1200000000000",
  "recipients": 10000,
  "per_capita": "40000000",
  "mii": 0.982,
  "witness": "ZEUS",
  "signature": "0x...",
  "timestamp": "2025-11-01T00:00:00Z"
}
```

All attestations are:
- Immutable (blockchain or IPFS)
- Publicly auditable
- Cryptographically signed

---

## 9. FAQ

### Q1: What if I don't claim my UBI on time?

**A**: Unclaimed UBI expires after 90 days and returns to treasury. You must claim each month.

### Q2: Can UBI be revoked?

**A**: Yes, if:
- Personal MII falls below 0.95
- Integrity violation flagged
- Account goes dormant (>180 days)
- KYC expires

### Q3: How is "idle" defined for decay?

**A**: Shards with no outgoing transactions for >30 days.

### Q4: What happens if MII drops to 0.89?

**A**: UBI and minting freeze immediately. Governance council reviews root cause and proposes fixes. System resumes when MII > 0.95 for 48 hours.

---

## Appendix: Configuration Schema

```yaml
ubi:
  version: "2.0"
  enabled: true

  unit: "shards"
  cadence: "monthly"
  epoch_length_days: 90

  funding_weights:
    alpha_issuance: 0.20
    beta_decay: 0.60

  caps:
    max_share_of_reserves: 0.10   # κ
    max_share_of_circulating: 0.02 # σ

  mii_thresholds:
    bonus:   { min: 0.990, g: 1.05 }
    normal:  { min: 0.970, g: 1.00 }
    throttle:{ min: 0.950, g: 0.85 }
    halt:    { min: 0.000, g: 0.00 }

  eligibility:
    kyc_required: true
    active_wallet_days_min: 30
    min_activity_days: 90
    personal_mii_min: 0.95
```

---

*"Integrity maintained deserves integrity rewarded."*

---

**Last Updated**: November 4, 2025
**Version**: 2.0.0
**Status**: Canonical
**License**: CC-BY-SA-4.0
