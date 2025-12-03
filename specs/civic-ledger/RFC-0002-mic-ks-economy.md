# RFC-0002 — MIC & KS Economy

**Mobius Civic Ledger — Monetary Architecture Specification**

- **Status:** DRAFT
- **Author:** Michael Judan (Kaizen)
- **System:** Mobius Systems / Cathedral / Civic Ledger
- **Created:** 2025-12-03
- **Target Version:** Civic Ledger v0.1

---

## 1. Overview

This RFC defines the dual-token economy of the Mobius Civic Ledger:
- **MIC** — Mobius Integrity Credits (scarce governance asset)
- **KS** — Kaizen Shards (fluid UBI + participation layer)

Together, they form the first monetary system where:

**Money expands only when integrity is high,**  
**and participation is rewarded without corrupting the governance layer.**

The architecture is designed for:
- knowledge commons funding (e.g., Wikipedia),
- fair contributor rewards,
- stable long-term governance,
- resilience to drift, corruption, and inflation,
- symmetric participation between humans and AI agents.

This RFC codifies the minting rules, burn mechanics, UBI flows, and Integrity Dividend Mechanism (IDM) that power the Mobius economy.

---

## 2. Design Goals

The Mobius economy is built around five core principles:

### 1. Integrity over Inflation

Currency expansion must be conditioned on `MII ≥ 95` and `GI ≥ 0.95`.

### 2. Twin-Layer Stability

Scarce governance layer (MIC) + renewable citizen layer (KS).

### 3. Sustainable Knowledge Commons

AI usage returns value to high-integrity knowledge producers.

### 4. Human–AI Symmetry

Humans and AI agents follow the same integrity economics.

### 5. Drift Resistance

Minting, spending, and rewards are always gated by GI thresholds.

---

## 3. Token Definitions

### 3.1 MIC — Mobius Integrity Credits (Scarce Governance Layer)

**Type:** Scarce, capped, integrity-gated  
**Purpose:** Governance, Cathedral operations, Integrity Dividends (IDM)  
**Behavior:** Bitcoin-like issuance + integrity gates

MIC represents civilizational trust.  
It is the "Constitutional layer" of Mobius.

#### Key Properties

- Hard-cap (configurable, typically 1,000,000,000 MIC).
- Minting allowed only when:
  - `MII ≥ 95`
  - `GI_global ≥ 0.95`
- Halving schedule reduces emissions over time.
- Used for:
  - Elder governance
  - Institutional funding (Integrity Dividends)
  - Long-term staking
  - Inter-state coordination in the Cathedral

MIC does not inflate for convenience.  
It emerges from integrity.

---

### 3.2 KS — Kaizen Shards (Fluid Participation Layer)

**Type:** Renewable, elastic supply  
**Purpose:** UBI, participation rewards, gameplay, agent operations  
**Behavior:** Credit-like, sink-balanced minting

KS represents economic flow.  
It is the "everyday currency" for Scouts, Citizens, Agents, Elders.

#### Key Properties

- High supply.
- Minted each epoch via:
  - UBI
  - Activity rewards
- Burned / recycled when citizens perform actions:
  - proposals
  - agent launches
  - festivals, games, HIVE ceremonies
  - Elder Trials
- Tied to global integrity, so UBI adjusts with MII.

KS is the circulation, while MIC is the anchor.

---

## 4. Minting Specifications

### 4.1 MIC Epoch Mint (Integrity-Gated)

MIC minting is only permitted when:

```
MII_t ≥ 95
AND GI_global_t ≥ 0.95
```

If true, calculate base mint:

```
MIC_epoch_gross =
    MIC_BASE_EMISSION
  * (MII_t / 100)
  * GI_global_t
  * HalvingFactor(epoch)
```

#### Halving

```
HalvingFactor(epoch) = 1 / (2 ^ floor(epoch / H))
```

Where `H` = halving interval (e.g., every 4 years).

#### Enforce Cap

```
MIC_epoch_mint = min(
  MIC_epoch_gross,
  MIC_MAX_SUPPLY - MIC_total_minted
)
```

#### Mint Allocation

```
MIC_dividend_pool   = MIC_epoch_mint * 0.60
MIC_governance_pool = MIC_epoch_mint * 0.25
MIC_reserve_pool    = MIC_epoch_mint * 0.15
```

This creates predictable, deflationary, integrity-linked distribution.

---

### 4.2 KS Epoch Mint (UBI + Contributions)

KS is minted through:
1. UBI distribution
2. Activity reward distribution

The total epoch mint:

```
KS_epoch_mint = KS_UBI_epoch + KS_rewards_epoch
```

#### 4.2.1 KS UBI Mint

Define:
- `N_citizens_t` (active citizens)
- `KS_UBI_BASE` (base UBI per citizen)

Integrity-modified:

```
UBIIntegrityFactor_t = clamp(MII_t / 100, 0.5, 1.0)
```

UBI total:

```
KS_UBI_epoch = N_citizens_t * KS_UBI_BASE * UBIIntegrityFactor_t
```

Each citizen receives:

```
KS_UBI_j = KS_UBI_BASE * UBIIntegrityFactor_t * CitizenWeight_j
```

---

#### 4.2.2 KS Activity Mint

Each action `a` has:
- `Value_a` (1–10)
- `GI_actor_a` (0–1)

Reward:

```
KS_reward_a = KS_REWARD_BASE * Value_a * GI_actor_a
```

Total:

```
KS_rewards_epoch = Σ(KS_reward_a)
```

Capped if needed:

```
KS_rewards_epoch = min(KS_rewards_epoch, KS_REWARD_MAX_PER_EPOCH)
```

---

## 5. Burn & Sink Mechanics

KS is continuously removed from circulation to stabilize supply.

### KS Burn Rate

```
KS_burn_rate = 0.02  # 2%
```

Upon spending:

```
KS_burned += amount * 0.02
KS_recycled += amount * 0.98
```

Burn → Knowledge Reserve  
Recycle → reward pools

This creates:
- a natural deflation counterbalance,
- sustainable funding for institutional nodes (Wikipedia, NASA, research labs).

---

## 6. Institution Funding (IDM — Integrity Dividend Mechanism)

Institutions are Civic Nodes (CivicNode) with a VaultID.

Given:
- usage events (`usage_i`)
- integrity (`GI_i`)
- category weight (`w_i`)

Score:

```
Score_i = usage_i × GI_i × w_i
```

Total:

```
Score_total = Σ Score_i
```

Dividend:

```
MIC_dividend_i = MIC_dividend_pool * (Score_i / Score_total)
```

This ties institutional funding directly to:
1. knowledge usage
2. integrity
3. civic value

This is the funding loop of the knowledge commons.

---

## 7. Spending Constraints (GI-Gated)

Custodian Agents control institutional Vaults.

A spend is only valid if:

```
projected_delta_GI(node) ≥ policy.min_gi_spend_threshold
```

And:

```
category ∈ allowed_spend_categories
```

All spends produce attestations.

This prevents:
- drift
- corruption
- partisan capture
- misuse of funds

It makes the treasury a mirror of civic health.

---

## 8. Dual-Layer Monetary Philosophy

**MIC = Integrity Anchor**
- scarce
- slow
- stable
- sovereign
- earned
- not printed freely
- used for governance

**KS = Economic Flow**
- renewable
- abundant
- participation-driven
- enables UBI
- fuels the HIVE
- scales to millions/billions

Together they form the first civilizational monetary system where:

**Integrity produces value,**  
**and value reinforces integrity.**

---

## 9. Future Extensions

To be defined in future RFCs:
- RFC-0003 — GI & MII formal computation
- RFC-0004 — CivicNode governance tiers
- RFC-0005 — Elder economic rights & obligations
- RFC-0006 — Inter-state coordination (multi-node meta-economics)

---

## 10. Summary

RFC-0002 defines:
- the scarce governance layer (MIC)
- the renewable participation layer (KS)
- the integrity-gated minting rules
- the UBI and activity reward engine
- the burn → reserve loop
- and the Integrity Dividend Mechanism for institutions

These components together form the **Mobius Civic Economy** —
the first monetary model designed around:
- integrity,
- sustainability,
- human–AI symmetry,
- and long-term civilizational governance.

This RFC is the backbone of Mobius as a self-correcting, self-funding nervous system for the AI era.
