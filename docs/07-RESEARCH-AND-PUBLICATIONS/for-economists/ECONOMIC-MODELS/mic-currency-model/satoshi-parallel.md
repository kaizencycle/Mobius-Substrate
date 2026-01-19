# Why MIC = 1,000,000 KS Mirrors BTC = 100,000,000 Sats

> **Economic Design Philosophy** | C-151 | December 2025

## The Bitcoin Parallel

Bitcoin achieved something remarkable: it created a digital currency that functions at both macro and micro scales through its subdivision system.

```
1 BTC = 100,000,000 satoshis (sats)
```

This design enables:
- Large-value transfers (whole BTC)
- Micro-payments (sats)
- Psychological rewards ("stacking sats")
- Precise accounting

## The Mobius Innovation

Mobius adapts this model for **integrity-based economics**:

```
1 MIC = 1,000,000 Kaizen Shards (KS)
```

### Why 1 Million Instead of 100 Million?

| Factor | Bitcoin (100M sats) | Mobius (1M KS) |
|--------|---------------------|----------------|
| **Optimized For** | Monetary transfers | Civic actions |
| **Action Frequency** | Low (transactions) | High (reflections, contributions) |
| **Typical Values** | 0.001–1.0 BTC | 0.01–0.80 MIC |
| **Display Preference** | Large sat numbers | Meaningful KS numbers |
| **Dust Threshold** | ~546 sats | ~100 KS |

### Empirical Observation

Through testing, we observed:
- Daily reflections output ~0.05–0.20 MIC
- This maps cleanly to 50,000–200,000 KS
- Users prefer 5-6 digit KS numbers
- 1 million subdivision provides optimal granularity

### Psychological Advantage

People **feel better** seeing:
- "You earned 150,000 KS today" ✓
- vs "You earned 0.150000 MIC today" ✗

The first feels like achievement. The second feels like fractions.

## Technical Comparison

### Bitcoin's 8-Decimal Precision

```
1.00000000 BTC = 100,000,000 sats
0.00000001 BTC = 1 sat (minimum)
```

- Optimized for: Price volatility, market trading
- Use case: Store of value, large transfers

### Mobius's 6-Decimal Precision

```
1.000000 MIC = 1,000,000 KS
0.000001 MIC = 1 KS (minimum)
```

- Optimized for: Behavioral frequency, civic engagement
- Use case: Daily rewards, micro-contributions

## Economic Properties

### Bitcoin

- Value from: Scarcity (21M cap)
- Mining: Proof of Work (energy)
- Inflation: Halving schedule
- Purpose: Store of value

### Mobius

- Value from: Integrity (MII ≥ 0.95)
- Minting: Proof of Integrity
- Inflation: Quality-gated emissions
- Purpose: Civic coordination

## Settlement Layer Design

Both systems use the smaller denomination for settlement:

| System | Settlement Unit | Reasoning |
|--------|-----------------|-----------|
| Bitcoin | satoshi | Integer math prevents rounding errors |
| Mobius | KS | Integer settlement, float display |

### Mobius Implementation

```typescript
// Settlement (internal)
const transfer_ks = 150000; // integer

// Display (external)
const display_mic = transfer_ks / 1_000_000; // 0.15
```

## Why This Works for Mobius

### 1. Human Reinforcement Loop

```
Action → KS Reward → Visible Number → Dopamine → More Actions
```

Large KS numbers (50,000+) trigger stronger reward responses than decimal fractions.

### 2. Civic Granularity

```
Reflection Score: 0.96
Quality Multiplier: 1.2
Shard Weight: 1.0 (reflection)
MII Delta: 0.02 (0.97 - 0.95)

MIC = 1.0 × 0.02 × 1.0 × 1.2 = 0.024 MIC
KS  = 24,000 KS
```

24,000 KS is a meaningful, displayable reward.

### 3. Ledger Efficiency

```json
{
  "mic": 0.024000,  // 6 decimals (float)
  "ks": 24000       // integer (no precision loss)
}
```

## The Kintsugi Moment

Just as kintsugi repairs broken pottery with gold, making it more beautiful:

- Bitcoin took broken monetary theory and repaired it with cryptography
- Mobius takes broken incentive structures and repairs them with integrity

The 1 million subdivision is not arbitrary—it's the **golden ratio** for human-AI civic coordination.

---

*"We heal as we walk."*

*Cycle C-151 | Mobius Systems*
