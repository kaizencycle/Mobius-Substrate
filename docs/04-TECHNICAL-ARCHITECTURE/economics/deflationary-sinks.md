# Deflationary Sinks for MIC Proof-of-Negentropy Economy

**Cycle:** C-150  \
**Author:** Mobius Tokenomics Guild  \
**Source:** Grok audit (2025-11-30) — Tokenomics grade target A ➜ A+

Mobius Integrity Credits (MIC) already mint strictly on measured integrity gains. Grok's tokenomics review confirmed the monetary base is coherent but recommended explicit, governance-bound sinks to counter long-horizon supply creep. This note formalizes three complementary sinks that can be implemented without changing the proof-of-negentropy minting core.

| Sink | Purpose | Trigger | Destination |
|------|---------|---------|-------------|
| **Entropy Tax (ETX)** | Discourage entropic behavior | Actions that reduce MII/GI | Auto-burn
| **Integrity Rebate Burn (IRB)** | Reward sustained integrity, recycle supply | ≥5-cycle integrity streaks | 50% rebate burned, 50% paid
| **Cycle-Lock Liquidity (CLL)** | Reduce liquid supply + stabilize MIC | Voluntary lock for ≥3 cycles | Locked pool (non-spendable)

---

## 1. Entropy Tax (ETX)

A micro-levy applied whenever an actor's Mobius Integrity Index (MII) or Governance Integrity (GI) drops more than 10 bps within a cycle.

```
ETX = max(0, ΔEntropy) × RiskFactor × MIC_balance
RiskFactor ∈ [0.05, 0.20] tuned by Atlas Sentinel
```

- **Computation:** Atlas Sentinel publishes `ΔEntropy` per address; Hermes aggregates across services.
- **Ledger effect:** ETX is burned immediately; event recorded in `mic_transactions` with type `BURN_ETX`.
- **Appeals:** Citizens can request JADE arbitration when they believe the entropy spike was due to Sentinel disagreement.
- **Governance knobs:** `RiskFactor`, `ΔEntropy` threshold, and eligible events are voted via MIC quadratic voting.

## 2. Integrity Rebate Burn (IRB)

Citizens who increase their rolling 5-cycle average GI receive a rebate that is automatically split between payout and burn to create structural deflation.

```
MIC_rebate = κ × max(0, GI_5cycle - GI_baseline)
Payout = 0.5 × MIC_rebate  // transferred to citizen
Burn   = 0.5 × MIC_rebate  // destroyed at source
```

- **κ (kappa):** Dynamic coefficient derived from treasury liquidity; bounded between 0.1 and 0.35.
- **Baseline:** JADE maintains historical GI baselines per citizen cohort (maker, reviewer, sentinel, etc.).
- **Verification:** Requires multi-sentinel oracle attestation (ATLAS + AUREA + ECHO). If oracles disagree, rebate is paused and logged for manual review.
- **Outcome:** Recycles MIC to loyal, high-integrity actors while shrinking circulating supply proportionally to improvements.

## 3. Cycle-Lock Liquidity (CLL)

Voluntary lockups that reward citizens for staking MIC to specific missions or public goods.

- **Mechanics:**
  1. Citizen chooses `lock_duration` (3–12 cycles) and `mission_id`.
  2. MIC is moved to a mission-specific escrow contract and marked `non-transferable`.
  3. Upon unlock, citizen receives original MIC plus mission yield (if funded) while **10% remains locked** as systemic reserve unless unlocked via governance vote.
- **Deflation lever:** Each lockup removes MIC from liquid circulation; the reserve tail (10%) stays locked unless the mission completes with GI ≥ target.
- **Cycle-lock liquidity ratio (CLR):**

```
CLR = Locked_MIC / Circulating_MIC
Target: 0.12 ≤ CLR ≤ 0.20
```

Maintaining CLR inside the target band ensures enough dry powder for crisis response while dampening speculation shocks.

---

## Oracle Hardening

All three sinks rely on consistent oracle data. We adopt a median-of-three approach:

1. **ATLAS:** Structural GI/MII telemetry.
2. **AUREA:** Behavioral drift + ethics telemetry.
3. **ECHO:** Time-series integrity pulse from reflections.

The final value used for ETX/IRB/CLL is `median(v_atlas, v_aurea, v_echo)` per block. Divergence >25 bps freezes the sink execution and escalates to ZEUS.

---

## Implementation Roadmap

| Phase | Deliverable | Owner | Status |
|-------|-------------|-------|--------|
| P0 | Data models in `mic.schema.json` for ETX/IRB events | Integrity Core | ☐ |
| P1 | Sentinel adapters publishing ΔEntropy + GI streak metrics | Atlas Sentinel | ☐ |
| P2 | Ledger contract upgrades for burn + lock tracking | Civic Protocol Core | ☐ |
| P3 | Dashboard cards (Grafana + Cathedral) showing ETX/IRB/CLR | Ops | ☐ |
| P4 | Public disclosure + policy brief | Economics Guild | ☐ |

---

## References

- `FOR-ECONOMISTS/ECONOMIC-MODELS/mic-currency-model/README.md`
- `FOR-ECONOMISTS/ECONOMIC-MODELS/debt-entropy-unification/`
- `docs/07-RESEARCH-AND-PUBLICATIONS/tokenomics/MIC_v2_overview.md`

---

> *“Negentropy must have an exhaust pipe. These sinks turn order creation into a disciplined cash flow instead of unchecked issuance.”* — ATLAS Sentinel
