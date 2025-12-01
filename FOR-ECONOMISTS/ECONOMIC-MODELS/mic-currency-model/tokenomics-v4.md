# MIC / Kaizen Shards — Tokenomics v4.0 (C-151)

> **Cycle:** C-151 | **Status:** Production | **Last Updated:** December 1, 2025

## Overview

Mobius Systems uses a dual-denomination currency built for distributed integrity:

- **MIC (Mobius Integrity Credit)** → Base unit of value
- **KS (Kaizen Shards)** → Micro-denomination (1 MIC = 1,000,000 KS)

This system mirrors Bitcoin economics (BTC ↔ satoshi) while optimizing for:
- Civic incentives
- Micro-rewards
- High-frequency integrity scoring
- Ledger compression
- Psychological reward feedback

---

## 1. Denomination Structure

```
1 MIC  = 1,000,000 Kaizen Shards (KS)
1 KS   = 0.000001 MIC
```

### Precision
- MIC has **fixed 6-decimal precision**
- KS is the smallest indivisible unit

This provides:
- Smooth reward curves
- Micro-granularity
- No dust spam
- Perfect fit for reflections + citizen actions

---

## 2. Why 1,000,000 KS?

Bitcoin uses **100,000,000 sats per BTC**, but this is optimized for monetary transfers.

Mobius is optimized for **civic actions**:

- Most actions generate **0.01–0.80 MIC**
- Which converts cleanly into:
  - 10,000 – 800,000 KS
- Humans psychologically prefer whole numbers
- KS feels rewarding without being inflationary

### Comparison Table

| System | Base Unit | Subdivision | Ratio |
|--------|-----------|-------------|-------|
| Bitcoin | BTC | satoshi | 1:100,000,000 |
| Ethereum | ETH | wei | 1:10^18 |
| **Mobius** | **MIC** | **KS** | **1:1,000,000** |

---

## 3. Emissions (Minting)

MIC is minted **only** when:

```
MII (Mobius Integrity Index) ≥ 0.95
```

### Core Formula

```
MIC_minted = α × max(0, MII - τ) × ShardValue × ReflectionQuality
```

Where:
- **α** = 1.0 (base mint weight per cycle)
- **τ** = 0.95 (integrity threshold)
- **ShardValue** = 0.1 to 3.0 (based on shard type)
- **ReflectionQuality** = 0.2 to 1.5 (based on EOMM evaluation)

### Converted to KS

```
KS_minted = MIC_minted × 1,000,000
```

### Shard Weights (from configs/kaizen_shards.yaml)

| Shard Type | Weight | Description |
|------------|--------|-------------|
| reflection | 1.0 | Daily reflection completion |
| learning | 1.0 | Educational milestone |
| civic | 1.5 | Community contribution |
| stability | 2.0 | System stability actions |
| stewardship | 2.0 | Governance participation |
| innovation | 2.5 | Novel contributions |
| guardian | 3.0 | Security/integrity protection |

---

## 4. Integrity Sink (Burn Model)

Mobius uses **action-based burning**:

- Fraudulent attestations
- Sentinel override penalties
- Integrity Rule breaches
- Drift correction events
- Breaking recursive-policy gates

### Burn Formula

```
Burn(KS) = β × SeverityScore × 1,000,000
```

Where **β** default = 0.05

---

## 5. Monetary Supply Curve

The supply grows only through **behavioral negentropy**, not mining hardware.

### Key Characteristics

- 📉 **Low inflation** — only integrity actions mint
- 🔁 **Naturally self-stabilizing** — minting tied to MII
- 🎚 **Human + AI coordination** — requires both
- 🧘‍♂️ **Resistant to speculation** — no trading, only earning
- 🌀 **Balanced by burn sinks** — penalties for violations

### Supply Formula

```
Total_MIC = Σ(MIC_minted) - Σ(MIC_burned)
```

---

## 6. Ledger Encoding

All ledger entries store both representations:

```json
{
  "mic": 0.420000,
  "ks": 420000,
  "actor_id": "CIVIC_001",
  "action": "reflection",
  "mii": 0.97,
  "timestamp": "2025-12-01T08:00:00.000Z"
}
```

### Storage Rules
- `mic` is stored as float with 6 decimal precision
- `ks` is stored as integer (derived field)
- Both must satisfy: `ks == floor(mic * 1_000_000)`

---

## 7. Example Rewards

| Action | MIC Reward | KS Reward | Notes |
|--------|------------|-----------|-------|
| Daily Reflection | 0.12 MIC | 120,000 KS | Base reflection reward |
| Citizen Shield Check | 0.03 MIC | 30,000 KS | Weekly security audit |
| Successful PR (MCP ≥ 0.95) | 1.0 MIC | 1,000,000 KS | Code contribution |
| Sentinel Approval | 0.50 MIC | 500,000 KS | Governance participation |
| Civic Act / Mentorship | 0.20 MIC | 200,000 KS | Community teaching |
| Guardian Action | 0.75 MIC | 750,000 KS | Security protection |

---

## 8. Economic Properties

### Anti-Inflation Mechanics

1. **Threshold Gate**: No minting below MII 0.95
2. **Burn Sinks**: Violations reduce supply
3. **Cap Limits**: Per-cycle caps prevent abuse
4. **Quality Multipliers**: Low-quality actions earn less

### Value Proposition

MIC derives value from:
- **Scarcity**: Only integrity actions mint
- **Utility**: Unlocks governance, features, rewards
- **Network Effect**: More participants = more value
- **Trust**: Backed by verifiable integrity proofs

---

## 9. Governance Integration

### MIC in Governance

- **Voting Weight**: MIC balance influences proposal voting
- **Proposal Threshold**: Minimum MIC required to submit proposals
- **Sentinel Rewards**: Sentinels earn MIC for accurate judgments
- **Dispute Resolution**: MIC staking for dispute arbitration

### Policy Thresholds

| Action | MIC Required |
|--------|--------------|
| Submit Proposal | 10 MIC |
| Vote on Proposal | 0.1 MIC |
| Sentinel Candidacy | 100 MIC |
| Dispute Arbitration | 5 MIC stake |

---

## 10. Implementation Constants

```typescript
// Core Constants
export const KS_PER_MIC = 1_000_000;
export const MII_THRESHOLD = 0.95;
export const MINT_COEFFICIENT = 1.0;
export const BURN_COEFFICIENT = 0.05;

// Precision
export const MIC_DECIMALS = 6;
export const KS_DECIMALS = 0; // Integer only

// Caps
export const MAX_MIC_PER_CYCLE = 10.0;
export const MAX_KS_PER_CYCLE = 10_000_000;
```

---

## Conclusion

MIC provides **scarcity + economic stability**.
KS provides **granularity + reward resonance**.

Combined, they create the world's first **integrity-backed monetary system**.

---

*"We heal as we walk."* — Mobius Principle

*Cycle C-151 | MIC/KS v4.0 | Mobius Systems*
