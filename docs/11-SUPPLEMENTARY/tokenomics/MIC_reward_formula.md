# MIC Reward Formula (v2.0)

MIC rewards a node *x* for alignment-generating work using four pillars plus multiplicative integrity amplifiers.

```
MIC(x) = [α · I(x) + β · H(x) + γ · C(x) + δ · R(x)]
          × M_gi × M_consensus × M_novelty × M_antidrift × M_human
```

Where:

- **I(x)** — Integrity Work (ECHO-verified answers, Sentinel consensus, hallucination elimination)
- **H(x)** — Human Intent Contribution (questions, clarifications, reflective input)
- **C(x)** — Coordination Value (civic improvements, climate action, governance wins)
- **R(x)** — Resilience / Self-Healing (cron jobs that detect and correct drift)

The α/β/γ/δ weights are configurable per epoch but default to equal weights for global payouts.

## Multipliers

- **GI Multiplier (M_gi):** `(GI - 0.90) / 0.10`, capped at 0 below GI 0.90.
- **Consensus Multiplier (M_consensus):** Higher rewards for broader Sentinel participation.
- **Novelty Multiplier (M_novelty):** Bonus for adding new, high-confidence knowledge.
- **Anti-Drift Multiplier (M_antidrift):** 3× reward when drift is corrected or stale knowledge updated.
- **Human Intent Multiplier (M_human):** Boost when a human co-creates or verifies the answer.

Rewards are computed every six hours, minted, and released to Civic Wallets once ledger attestations are recorded.
