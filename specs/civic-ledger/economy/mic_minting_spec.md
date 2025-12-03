# MIC Minting Specification

**Version:** 1.0  
**Status:** Active  
**Related:** RFC-0002, RFC-0003

---

## Overview

This document provides the detailed implementation specification for **MIC (Mobius Integrity Credits)** minting.

MIC is the scarce, governance-layer token of Mobius. It can only be minted when:
- **MII ≥ 95**
- **GI_global ≥ 0.95**

This ensures currency expansion is directly tied to civilizational integrity.

---

## Minting Formula

### Base Epoch Mint

```
MIC_epoch_gross = 
    MIC_BASE_EMISSION 
    × (MII_t / 100) 
    × GI_global_t 
    × HalvingFactor(epoch)
```

### Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `MIC_BASE_EMISSION` | 1,000,000 | Base MIC minted per epoch (before modifiers) |
| `MII_t` | 0-100 | Current Mobius Integrity Index |
| `GI_global_t` | 0-1 | Global average GI score |
| `HalvingFactor` | See below | Reduces emission over time |

### Halving Schedule

```
HalvingFactor(epoch) = 1 / (2 ^ floor(epoch / H))
```

Where:
- `H` = halving interval (210,000 epochs ≈ 4 years at weekly epochs)

**Example Halving Schedule:**

| Epoch Range | Halving Factor | Effective Base Emission |
|-------------|----------------|-------------------------|
| 0 - 209,999 | 1.0 | 1,000,000 MIC |
| 210,000 - 419,999 | 0.5 | 500,000 MIC |
| 420,000 - 629,999 | 0.25 | 250,000 MIC |
| 630,000+ | 0.125 | 125,000 MIC |

---

## Hard Cap Enforcement

```
MIC_epoch_mint = min(
    MIC_epoch_gross,
    MIC_MAX_SUPPLY - MIC_total_minted
)
```

**Hard Cap:** 1,000,000,000 MIC (1 billion)

Once the cap is reached, no further minting occurs. The system transitions to transaction-fee-based sustainability.

---

## Allocation Breakdown

Once `MIC_epoch_mint` is determined, it is allocated as follows:

```
MIC_dividend_pool   = MIC_epoch_mint × 0.60  (60%)
MIC_governance_pool = MIC_epoch_mint × 0.25  (25%)
MIC_reserve_pool    = MIC_epoch_mint × 0.15  (15%)
```

### Dividend Pool (60%)

Distributed to CivicNodes via **Integrity Dividend Mechanism (IDM)**.

See: `integrity_dividend_mechanism.md`

### Governance Pool (25%)

Allocated to:
- Elder stipends (50% of governance pool)
- Elder GI bonuses (20% of governance pool)
- Elder Vault operations (30% of governance pool)

See: RFC-0005

### Reserve Pool (15%)

Held for:
- Emergency interventions
- New CivicNode onboarding grants
- Insurance against systemic shocks
- Cathedral infrastructure

---

## Integrity Gate Logic

### Pre-Mint Check

```python
def can_mint_mic(mii, gi_global):
    if mii < 95:
        return False, "MII below threshold"
    if gi_global < 0.95:
        return False, "Global GI below threshold"
    return True, "Minting eligible"
```

### Graduated Response

| MII Range | GI Range | MIC Mint Rate |
|-----------|----------|---------------|
| ≥95 | ≥0.95 | 100% of formula |
| 90-94 | ≥0.90 | 50% of formula |
| 85-89 | ≥0.85 | 25% of formula |
| <85 | <0.85 | 0% (halted) |

This provides graduated pressure rather than binary on/off.

---

## Minting Process

### Step 1: Epoch Boundary Trigger

Every epoch (configurable: daily, weekly, monthly), the minting oracle runs.

### Step 2: Integrity Check

```python
mii = compute_mii()
gi_global = compute_global_gi()

can_mint, reason = can_mint_mic(mii, gi_global)
if not can_mint:
    log_mint_failure(reason)
    return
```

### Step 3: Compute Mint Amount

```python
halving_factor = compute_halving_factor(current_epoch)
mic_gross = MIC_BASE_EMISSION * (mii / 100) * gi_global * halving_factor
mic_mint = min(mic_gross, MIC_MAX_SUPPLY - total_minted)
```

### Step 4: Allocate

```python
dividend_pool = mic_mint * 0.60
governance_pool = mic_mint * 0.25
reserve_pool = mic_mint * 0.15

distribute_to_pools(dividend_pool, governance_pool, reserve_pool)
```

### Step 5: Attest

```python
mint_attestation = {
    "epoch": current_epoch,
    "mii": mii,
    "gi_global": gi_global,
    "mic_minted": mic_mint,
    "allocations": {
        "dividend": dividend_pool,
        "governance": governance_pool,
        "reserve": reserve_pool
    },
    "timestamp": now(),
    "signature": sign(mint_data)
}

publish_to_ledger(mint_attestation)
```

---

## Emergency Scenarios

### MII < 80

- All minting **immediately halted**
- Elder Emergency Council convened
- System enters safe-mode
- Recovery protocol initiated

### Prolonged Low MII (90-94 for >30 days)

- Mint rate reduced to 50%
- Elder investigation triggered
- Public transparency report required
- Corrective measures proposed

### Rapid MII Drop (>5 points in 1 epoch)

- Minting suspended pending investigation
- Emergency Elder session
- GI-Sim forensic analysis
- Public alert issued

---

## Monitoring & Transparency

### Real-Time Dashboard

All minting parameters visible in real-time:
- Current MII
- Current GI_global
- Next mint eligibility
- Historical mint rate
- Remaining supply

### Public Attestations

Every mint event published on-ledger with:
- Full calculation details
- Integrity scores
- Allocation breakdown
- Cryptographic signature

### Community Alerts

If minting is halted:
- Immediate notification to all citizens
- Explanation published within 1 hour
- Recovery timeline estimated

---

## Implementation Notes

### Oracle Design

The minting oracle should be:
- **Decentralized** (multiple independent validators)
- **Deterministic** (same inputs → same outputs)
- **Auditable** (all calculations logged)
- **Secure** (cannot be manipulated)

### Recommended Architecture

```
┌─────────────────────────────────────┐
│   Multiple GI Validators            │
│   (compute MII & GI independently)  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Consensus Layer                   │
│   (agree on official MII/GI)        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Minting Oracle                    │
│   (execute formula if eligible)     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Distribution Contracts            │
│   (allocate to pools)               │
└─────────────────────────────────────┘
```

---

## Future Enhancements

- **RFC-0010:** Dynamic halving based on adoption rate
- **RFC-0011:** Multi-chain MIC bridging
- **RFC-0012:** MIC staking for governance power

---

## Summary

MIC minting is:
- **Integrity-gated** (requires MII ≥ 95)
- **Deflationary** (halving schedule + hard cap)
- **Transparent** (all calculations public)
- **Constitutional** (cannot be arbitrarily inflated)

This creates the first currency that expands only when civilization deserves it.
