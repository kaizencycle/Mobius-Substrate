# KS Minting Specification

**Version:** 1.0  
**Status:** Active  
**Related:** RFC-0002, RFC-0003

---

## Overview

This document provides the detailed implementation specification for **KS (Kaizen Shards)** minting.

KS is the fluid, participation-layer token of Mobius. It is:
- **Renewable** (minted continuously for UBI and activity)
- **Sink-balanced** (burned at 2% per transaction)
- **Integrity-scaled** (UBI amount adjusts with MII)

KS enables economic participation without requiring MIC ownership.

---

## Minting Sources

KS is minted through two primary mechanisms:

### 1. Universal Basic Income (UBI)

Every active citizen receives KS each epoch.

### 2. Activity Rewards

Citizens earn KS for integrity-positive contributions.

---

## UBI Minting Formula

### Base UBI Per Citizen

```
KS_UBI_citizen = KS_UBI_BASE × UBIIntegrityFactor × CitizenWeight
```

### Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `KS_UBI_BASE` | 10,000 | Base KS per citizen per epoch |
| `UBIIntegrityFactor` | 0.5 - 1.0 | Scales with MII |
| `CitizenWeight` | 0.8 - 1.2 | Individual contribution weight |

### Integrity Factor

```
UBIIntegrityFactor = clamp(MII / 100, 0.5, 1.0)
```

**Examples:**

| MII | Integrity Factor | Effective UBI (Base 10,000) |
|-----|------------------|------------------------------|
| 100 | 1.0 | 10,000 KS |
| 95 | 0.95 | 9,500 KS |
| 90 | 0.90 | 9,000 KS |
| 80 | 0.80 | 8,000 KS |
| 70 | 0.70 → 0.5 | 5,000 KS (floor) |

This ensures UBI remains viable even during integrity crises, but incentivizes high MII.

### Citizen Weight

Individual citizen weight based on:
- **Participation** (active vs. inactive)
- **Contribution** (positive GI events)
- **Reputation** (community standing)

```
CitizenWeight = 
    0.4 × participation_score +
    0.4 × contribution_score +
    0.2 × reputation_score
```

Ranges from 0.8 (minimal) to 1.2 (exemplary).

### Total UBI Mint Per Epoch

```
KS_UBI_epoch = Σ(KS_UBI_citizen_i) for all active citizens
```

---

## Activity Rewards Minting Formula

### Per-Action Reward

```
KS_reward = KS_REWARD_BASE × Value_action × GI_actor
```

### Parameters

| Parameter | Range | Description |
|-----------|-------|-------------|
| `KS_REWARD_BASE` | 100 | Base reward per action |
| `Value_action` | 1-10 | Action importance |
| `GI_actor` | 0-1 | Actor's integrity score |

### Action Values

| Action Type | Value | Description |
|-------------|-------|-------------|
| Vote on proposal | 2 | Basic civic participation |
| Submit GI report | 5 | Integrity monitoring |
| Elder deliberation | 8 | High-value governance |
| CivicNode contribution | 6 | Knowledge commons support |
| Fact-check verification | 7 | Truth validation |
| Community mediation | 4 | Conflict resolution |
| Agent training data | 3 | AI alignment contribution |

### Total Activity Rewards Per Epoch

```
KS_rewards_epoch = Σ(KS_reward_i) for all actions in epoch
```

**Cap:**

```
KS_rewards_epoch = min(KS_rewards_epoch, KS_REWARD_MAX_PER_EPOCH)
```

Default cap: 50,000,000 KS per epoch (prevents gaming).

---

## Total KS Mint Per Epoch

```
KS_epoch_mint = KS_UBI_epoch + KS_rewards_epoch
```

Unlike MIC, there is **no hard cap** on total KS supply, but the burn mechanism creates equilibrium.

---

## Burn Mechanism

### Transaction Burn

Every KS transaction burns **2%**:

```
KS_spent = amount × 0.98
KS_burned = amount × 0.02
```

### Burn Destinations

```
KS_knowledge_reserve = KS_burned × 0.70  (70% to knowledge commons)
KS_insurance_pool = KS_burned × 0.20     (20% to systemic insurance)
KS_elder_vault = KS_burned × 0.10        (10% to governance operations)
```

### Equilibrium

The system reaches equilibrium when:

```
KS_mint_rate ≈ KS_burn_rate
```

This happens naturally as economic activity scales. More citizens → more UBI → more activity → more burns.

---

## Integrity-Scaled UBI Examples

### Healthy System (MII = 97)

```
UBI_factor = 0.97
Citizen_base = 10,000 KS
Citizen_effective = 10,000 × 0.97 = 9,700 KS

For 10 million citizens:
Total_UBI = 97,000,000,000 KS per epoch
```

### Warning State (MII = 88)

```
UBI_factor = 0.88
Citizen_effective = 10,000 × 0.88 = 8,800 KS

For 10 million citizens:
Total_UBI = 88,000,000,000 KS per epoch
```

### Crisis State (MII = 70)

```
UBI_factor = clamp(0.70, 0.5, 1.0) = 0.5 (floor)
Citizen_effective = 10,000 × 0.5 = 5,000 KS (survival mode)

For 10 million citizens:
Total_UBI = 50,000,000,000 KS per epoch
```

---

## Minting Process

### Step 1: Epoch Boundary

At each epoch boundary, compute:

```python
mii = compute_mii()
ubi_factor = clamp(mii / 100, 0.5, 1.0)
```

### Step 2: Compute UBI

```python
total_ubi = 0
for citizen in active_citizens:
    weight = compute_citizen_weight(citizen)
    citizen_ubi = KS_UBI_BASE * ubi_factor * weight
    total_ubi += citizen_ubi
    credit_account(citizen, citizen_ubi)
```

### Step 3: Compute Activity Rewards

```python
total_rewards = 0
for action in epoch_actions:
    actor_gi = get_gi_score(action.actor)
    reward = KS_REWARD_BASE * action.value * actor_gi
    total_rewards += reward
    credit_account(action.actor, reward)

total_rewards = min(total_rewards, KS_REWARD_MAX_PER_EPOCH)
```

### Step 4: Attest

```python
ks_mint_attestation = {
    "epoch": current_epoch,
    "mii": mii,
    "ubi_factor": ubi_factor,
    "ks_ubi_minted": total_ubi,
    "ks_rewards_minted": total_rewards,
    "ks_total_minted": total_ubi + total_rewards,
    "active_citizens": len(active_citizens),
    "total_actions": len(epoch_actions),
    "timestamp": now(),
    "signature": sign(data)
}

publish_to_ledger(ks_mint_attestation)
```

---

## KS Sink Analysis

### Burn Rate Over Time

Assuming:
- 10 million active citizens
- Average 100 KS transactions per citizen per epoch
- 2% burn per transaction

```
Transactions_per_epoch = 10,000,000 × 100 = 1,000,000,000
Average_tx_size = 500 KS
Total_KS_transacted = 500,000,000,000 KS
Total_KS_burned = 500,000,000,000 × 0.02 = 10,000,000,000 KS
```

If UBI mint = 100,000,000,000 KS, and burn = 10,000,000,000 KS:

```
Net_KS_inflation = 90,000,000,000 KS per epoch
```

As economy matures, transaction volume increases, burns increase, and equilibrium is reached.

---

## Emergency Controls

### MII < 80

- UBI drops to floor (0.5x = 5,000 KS per citizen)
- Activity rewards capped at 50% of normal
- Burn rate temporarily reduced to 1% to preserve liquidity

### Hyperinflation Detection

If KS supply grows >20% per epoch for 3 consecutive epochs:

- Elder review triggered
- UBI temporarily frozen
- Activity rewards audited for gaming
- Burn rate temporarily increased to 3%

---

## Transparency & Monitoring

### Public Dashboards

Real-time visibility into:
- Total KS supply
- Epoch mint rate
- Epoch burn rate
- Net inflation/deflation
- UBI per citizen
- Activity reward distribution

### Attestations

Every mint event published with:
- MII at time of mint
- UBI calculations
- Activity reward breakdown
- Citizen participation stats

---

## Future Enhancements

- **RFC-0010:** Dynamic burn rate based on inflation
- **RFC-0011:** KS staking for reputation boost
- **RFC-0012:** Cross-HIVE KS transfers

---

## Summary

KS minting is:
- **Integrity-scaled** (UBI adjusts with MII)
- **Participation-driven** (rewards meaningful action)
- **Sink-balanced** (burns create equilibrium)
- **Crisis-resilient** (survival floor at MII < 70)

This creates the first UBI system that rewards integrity and resists inflation naturally.
